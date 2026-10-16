import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Languages,
  Volume2,
  Sparkles,
  Download,
  AlertTriangle,
  PlusCircle,
  Check,
  Heart,
  RotateCcw,
  BookOpen,
  Copy,
  ArrowRightLeft,
  ChevronRight,
  Flame,
  Award,
  RefreshCw,
  X
} from "lucide-react";
import archiveStore from "../services/archiveStore";
import offlineLibrary from "../services/offlineLibrary";
import GeminiService from "../services/GeminiService";
import NagaWeavingDivider from "./NagaWeavingDivider";
import ResponseMetaBadge from "./ResponseMetaBadge";
import HeritageSearchBar from "./shared/HeritageSearchBar";
import HeritageEmptyState from "./shared/HeritageEmptyState";
import ActiveFilterBar from "./shared/ActiveFilterBar";
import {
  THEME_TAXONOMY,
  normalizeTheme,
  RECOGNIZED_TRIBES,
  createPhraseFuse
} from "../utils/heritageSearch";

const ALL_LANGUAGES_LIST = [
  "All",
  "Nagamese (Creole)",
  ...RECOGNIZED_TRIBES
];

const LOCAL_STORAGE_KEYS = {
  LAST_LANG: "nagaquest_langstudio_last_lang",
  FAVORITES: "nagaquest_langstudio_favorites_v2",
  SRS_BOXES: "nagaquest_langstudio_srs_boxes_v2"
};

export default function LanguageStudio() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core archive phrases & coverage state
  const [phrases, setPhrases] = useState([]);
  const [coverage, setCoverage] = useState({});
  const [offlineStatus, setOfflineStatus] = useState({});
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES)) || [];
    } catch {
      return [];
    }
  });

  // URL state
  const activeSubTab = searchParams.get("tab") || "browse"; // 'browse' | 'flashcards' | 'quiz' | 'mywords' | 'translate'
  const selectedLangParam = searchParams.get("lang") || localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_LANG) || "All";
  const selectedThemeParam = searchParams.get("theme") || "All";
  const searchQuery = searchParams.get("q") || "";

  const [copiedId, setCopiedId] = useState(null);
  const [audioNotice, setAudioNotice] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPhraseOfDay, setShowPhraseOfDay] = useState(true);

  // AI Translation Studio state
  const [aiSourceLang, setAiSourceLang] = useState("English");
  const [aiTargetLanguage, setAiTargetLanguage] = useState("Nagamese (Creole)");
  const [aiInputText, setAiInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiMeta, setAiMeta] = useState(null);
  const [aiError, setAiError] = useState("");
  const [aiHistory, setAiHistory] = useState([]);

  // Learning Tools: Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [srsBoxes, setSrsBoxes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SRS_BOXES)) || { box1: [], box2: [], box3: [] };
    } catch {
      return { box1: [], box2: [], box3: [] };
    }
  });

  // Learning Tools: Quiz state
  const [quizState, setQuizState] = useState({
    active: false,
    questions: [],
    currentIndex: 0,
    score: 0,
    selectedOption: null,
    isAnswered: false,
    weakWords: []
  });

  // Helper to update search params
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };
    Object.keys(merged).forEach((k) => {
      if (!merged[k] || merged[k] === "All" || merged[k] === "browse") {
        delete merged[k];
      }
    });
    setSearchParams(merged, { replace: true });
  };

  const handleSelectLanguage = (lang) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_LANG, lang);
    updateParams({ lang });
  };

  // 1. Load data from store and restore saved offline status
  useEffect(() => {
    const loadPhrases = async () => {
      const all = archiveStore.getAllPhrases();
      setPhrases(all);
      setCoverage(archiveStore.getLanguageCoverage());

      try {
        const savedOffline = await offlineLibrary.getAllItems();
        const statusMap = {};
        savedOffline.forEach((item) => {
          statusMap[item.id] = true;
          if (item.data?.entryId) statusMap[item.data.entryId] = true;
        });
        setOfflineStatus(statusMap);
      } catch (err) {
        console.error("Offline restore error:", err);
      }
    };

    loadPhrases();
    const unsubStore = archiveStore.subscribe(loadPhrases);
    const unsubOffline = offlineLibrary.subscribe(loadPhrases);

    return () => {
      unsubStore();
      unsubOffline();
    };
  }, []);

  // Pre-index Fuse for phrases
  const phraseFuse = useMemo(() => {
    return createPhraseFuse(phrases);
  }, [phrases]);

  // Counts by theme and language
  const themeCounts = useMemo(() => {
    const counts = {};
    THEME_TAXONOMY.forEach((th) => (counts[th] = 0));

    phrases.forEach((p) => {
      const langMatches =
        selectedLangParam === "All" ||
        (p.languageVariety || "").toLowerCase().includes(selectedLangParam.toLowerCase());
      if (langMatches) {
        const normalized = normalizeTheme(p.theme || p.category);
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    });
    return counts;
  }, [phrases, selectedLangParam]);

  // Filtered phrase list (Null-safe B1, U1, U4, U5)
  const filteredPhrases = useMemo(() => {
    let result = [...phrases];

    // Language filter (always allows 'All')
    if (selectedLangParam !== "All") {
      result = result.filter((p) =>
        (p.languageVariety || "").toLowerCase().includes(selectedLangParam.toLowerCase())
      );
    }

    // Theme filter
    if (selectedThemeParam !== "All") {
      result = result.filter(
        (p) => normalizeTheme(p.theme || p.category) === selectedThemeParam
      );
    }

    // Search filter (English to Naga, Naga to English)
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const fuseResults = phraseFuse.search(q);
      const matchedIds = new Set(fuseResults.map((r) => r.item.entryId));

      // Also simple substring match as fallback
      result = result.filter((p) => {
        if (matchedIds.has(p.entryId)) return true;
        const expr = (p.originalExpression || "").toLowerCase();
        const meaning = (p.meaning || "").toLowerCase();
        const pron = (p.pronunciationGuide || "").toLowerCase();
        const ctx = (p.context || "").toLowerCase();
        const qLower = q.toLowerCase();
        return expr.includes(qLower) || meaning.includes(qLower) || pron.includes(qLower) || ctx.includes(qLower);
      });
    }

    return result;
  }, [phrases, selectedLangParam, selectedThemeParam, searchQuery, phraseFuse]);

  // Eligible learning phrases (Section 8.4: only verified_real and published_reference)
  const eligibleLearningPhrases = useMemo(() => {
    return phrases.filter(
      (p) => p.dataStatus === "verified_real" || p.dataStatus === "published_reference"
    );
  }, [phrases]);

  // Phrase of the Day: stable daily pick based on date
  const phraseOfTheDay = useMemo(() => {
    const pool = eligibleLearningPhrases.length > 0 ? eligibleLearningPhrases : phrases;
    if (pool.length === 0) return null;
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    return pool[dayOfYear % pool.length];
  }, [eligibleLearningPhrases, phrases]);

  // Save / Toggle Favorites
  const toggleFavorite = (phrase, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.some((p) => p.entryId === phrase.entryId);
      const updated = exists
        ? prev.filter((p) => p.entryId !== phrase.entryId)
        : [...prev, phrase];
      localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    });
  };

  // Export Favorites as CSV or Text
  const exportFavorites = (format = "text") => {
    if (favorites.length === 0) return;
    let content;
    if (format === "csv") {
      content = "Language,Original Expression,Pronunciation,Meaning,Theme\n" +
        favorites
          .map(
            (f) =>
              `"${f.languageVariety}","${f.originalExpression}","${f.pronunciationGuide || ""}","${f.meaning}","${f.theme || f.category || ""}"`
          )
          .join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "nagaquest_my_words.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      content = favorites
        .map(
          (f, idx) =>
            `${idx + 1}. [${f.languageVariety}] ${f.originalExpression} (${f.pronunciationGuide || ""}) — "${f.meaning}"`
        )
        .join("\n");
      navigator.clipboard.writeText(content);
      setCopiedId("export-favs");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Audio Playback Handler with Honesty Safeguard (H7)
  const playPronunciation = (phrase) => {
    if (phrase.audioUrl) {
      const audio = new Audio(phrase.audioUrl);
      audio.play().catch((err) => console.error("Audio playback error:", err));
      return;
    }

    // Honest machine voice approximate with warning notice
    setAudioNotice(
      "Machine voice (approximate): Browser synthesis is an acoustic estimation and does not represent authentic tribal phonetics."
    );
    setTimeout(() => setAudioNotice(null), 6000);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase.originalExpression);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save Offline Handler (U9)
  const handleSaveOffline = async (phrase, e) => {
    if (e) e.stopPropagation();
    try {
      const isSaved = offlineStatus[phrase.entryId];
      if (isSaved) {
        await offlineLibrary.removeItem(phrase.entryId);
        setOfflineStatus((prev) => ({ ...prev, [phrase.entryId]: false }));
      } else {
        await offlineLibrary.saveItem(phrase, "phrase");
        setOfflineStatus((prev) => ({ ...prev, [phrase.entryId]: true }));
      }
    } catch (err) {
      console.error("Offline toggle failed:", err);
    }
  };

  // Copy phrase text
  const handleCopyPhrase = (phrase, e) => {
    if (e) e.stopPropagation();
    const text = `${phrase.originalExpression} — "${phrase.meaning}" (${phrase.languageVariety})`;
    navigator.clipboard.writeText(text);
    setCopiedId(phrase.entryId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // AI Translation Handler (B2, B4, B5, Section 8.5)
  const handleAiTranslate = async (e) => {
    if (e) e.preventDefault();
    if (!aiInputText.trim()) return;

    setAiLoading(true);
    setAiError("");
    setAiResult("");
    setAiMeta(null); // Clear stale engine info immediately (B5)

    const textToTranslate = aiInputText.trim();
    const sourceLang = aiSourceLang;
    const targetLang = aiTargetLanguage;

    try {
      let translatedText = null;
      let engineMeta = null;

      // 1. Try configured backend API first (if VITE_API_URL is configured, avoiding hardcoded localhost delay B2)
      const apiBase = import.meta.env.VITE_API_URL;
      if (apiBase) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

          const pyRes = await fetch(`${apiBase}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: textToTranslate,
              sourceLang, // sends true source language (B4)
              targetLang
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (pyRes.ok) {
            const pyData = await pyRes.json();
            translatedText = pyData.translation;
            engineMeta = { source: "api", provider: pyData.provider, model: pyData.model };
          }
        } catch {
          // Backend call timed out or failed; fallback cleanly
        }
      }

      // 2. Client Gemini service fallback
      if (!translatedText) {
        translatedText = await GeminiService.translateLanguage(textToTranslate, targetLang, sourceLang);
        engineMeta = GeminiService.getLastMeta();
      }

      setAiResult(translatedText);
      setAiMeta(engineMeta);

      // Session history (last 5)
      setAiHistory((prev) => [
        {
          id: Date.now(),
          text: textToTranslate,
          sourceLang,
          targetLang,
          result: translatedText,
          meta: engineMeta
        },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      setAiError(err.message || "Translation service unavailable. Please check API key or retry.");
    } finally {
      setAiLoading(false);
    }
  };

  // Start Quiz (Section 8.4)
  const startQuiz = () => {
    const pool = eligibleLearningPhrases;
    if (pool.length < 4) return;

    // Pick 5 random questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    const questions = shuffled.map((target) => {
      const mode = Math.random() > 0.5 ? "meaningToExpr" : "exprToMeaning";
      const wrongOptions = pool
        .filter((p) => p.entryId !== target.entryId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const allOptions = [...wrongOptions, target].sort(() => 0.5 - Math.random());

      return {
        target,
        mode,
        questionText:
          mode === "meaningToExpr"
            ? `Which ${target.languageVariety} phrase translates to "${target.meaning}"?`
            : `What does the ${target.languageVariety} expression "${target.originalExpression}" mean?`,
        options: allOptions.map((opt) =>
          mode === "meaningToExpr" ? opt.originalExpression : opt.meaning
        ),
        correctAnswer: mode === "meaningToExpr" ? target.originalExpression : target.meaning
      };
    });

    setQuizState({
      active: true,
      questions,
      currentIndex: 0,
      score: 0,
      selectedOption: null,
      isAnswered: false,
      weakWords: []
    });
  };

  const handleQuizAnswer = (option) => {
    if (quizState.isAnswered) return;
    const currentQ = quizState.questions[quizState.currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    setQuizState((prev) => ({
      ...prev,
      selectedOption: option,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      weakWords: isCorrect ? prev.weakWords : [...prev.weakWords, currentQ.target]
    }));
  };

  const nextQuizQuestion = () => {
    setQuizState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      selectedOption: null,
      isAnswered: false
    }));
  };

  // Spaced repetition flashcard box helper
  const handleFlashcardReview = (passed) => {
    const currentPhrase = eligibleLearningPhrases[flashcardIndex];
    if (!currentPhrase) return;

    setSrsBoxes((prev) => {
      const id = currentPhrase.entryId;
      let nextBoxes = {
        box1: prev.box1.filter((i) => i !== id),
        box2: prev.box2.filter((i) => i !== id),
        box3: prev.box3.filter((i) => i !== id)
      };

      if (passed) {
        if (prev.box1.includes(id)) nextBoxes.box2.push(id);
        else nextBoxes.box3.push(id);
      } else {
        nextBoxes.box1.push(id);
      }

      localStorage.setItem(LOCAL_STORAGE_KEYS.SRS_BOXES, JSON.stringify(nextBoxes));
      return nextBoxes;
    });

    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % eligibleLearningPhrases.length);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Header Banner */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A45E45] text-white mb-4 shadow-2xs">
            <Languages size={14} /> Language Preservation Studio
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Phrasebook & Dialect Living Archive
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Language learning and dialect preservation with honest provenance metrics. Check the status badge on each
            phrase to see whether it is community-verified, from a published corpus, or an illustrative demo.
          </p>
          {/* Honest Coverage Summary & Contribute CTA */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{phrases.length} phrases across {Object.keys(coverage).length} varieties</span>
              <span className="text-white/70">
                ({(coverage["Nagamese (Creole)"]?.verified || 0) + (coverage["Nagamese (Creole)"]?.published || 0)} published/verified)
              </span>
            </div>

            <button
              onClick={() => navigate("/community-portal", { state: { preselectType: "phrase" } })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#A45E45] hover:bg-[#8F513B] text-white transition-all shadow-xs cursor-pointer min-h-[38px]"
            >
              <PlusCircle size={14} /> Contribute a Word
            </button>
          </div>
        </div>
      </div>

      <NagaWeavingDivider />

      {/* Acoustic Notice Alert (H7 machine voice safeguard) */}
      {audioNotice && (
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl text-xs text-[#252B26] flex items-center justify-between gap-3 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} className="text-[#A45E45] shrink-0" />
            <span>{audioNotice}</span>
          </div>
          <button onClick={() => setAudioNotice(null)} className="text-[#78716C] hover:text-[#252B26] font-semibold cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Sub-Tabs Navigation (Section 8.4 Learning Tools) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E6E1D6]">
        <button
          role="tab"
          aria-selected={activeSubTab === "browse"}
          onClick={() => updateParams({ tab: "browse" })}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer min-h-[40px] ${
            activeSubTab === "browse"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <BookOpen size={15} /> Phrasebook ({filteredPhrases.length})
        </button>

        <button
          role="tab"
          aria-selected={activeSubTab === "flashcards"}
          onClick={() => updateParams({ tab: "flashcards" })}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer min-h-[40px] ${
            activeSubTab === "flashcards"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <Flame size={15} className="text-[#C68A36]" /> Flashcards
        </button>

        <button
          role="tab"
          aria-selected={activeSubTab === "quiz"}
          onClick={() => updateParams({ tab: "quiz" })}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer min-h-[40px] ${
            activeSubTab === "quiz"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <Award size={15} className="text-amber-500" /> Practice Quiz
        </button>

        <button
          role="tab"
          aria-selected={activeSubTab === "mywords"}
          onClick={() => updateParams({ tab: "mywords" })}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeSubTab === "mywords"
              ? "bg-[#1E3A2B] text-white shadow-xs"
              : "bg-white text-neutral-600 hover:bg-[#FAF7F2] border border-[#EAE5D9]"
          }`}
        >
          <Heart size={15} className="text-[#DC143C]" /> My Words ({favorites.length})
        </button>

        <button
          role="tab"
          aria-selected={activeSubTab === "translate"}
          onClick={() => updateParams({ tab: "translate" })}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeSubTab === "translate"
              ? "bg-[#DC143C] text-white shadow-xs"
              : "bg-white text-neutral-600 hover:bg-[#FAF7F2] border border-[#EAE5D9]"
          }`}
        >
          <Sparkles size={15} /> AI Translate Studio
        </button>
      </div>

      {/* =============================================================== */}
      {/* TAB 1: PHRASEBOOK (BROWSE & SEARCH) */}
      {/* =============================================================== */}
      {activeSubTab === "browse" && (
        <div className="space-y-6">
          {/* Phrase of the Day Highlight Banner */}
          {/* Phrase of the Day Highlight Banner (Dismissible) */}
          {showPhraseOfDay && phraseOfTheDay && (
            <div className="relative bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <button
                onClick={() => setShowPhraseOfDay(false)}
                className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
                title="Dismiss Phrase of the Day"
                aria-label="Dismiss Phrase of the Day"
              >
                <X size={15} />
              </button>

              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="badge bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                    Phrase of the Day
                  </span>
                  <span className="text-xs font-bold text-[#1E3A2B]">
                    {phraseOfTheDay.languageVariety}
                  </span>
                  <ResponseMetaBadge dataStatus={phraseOfTheDay.dataStatus} />
                </div>
                <div className="text-xl md:text-2xl font-black text-[#1C1917] tracking-tight">
                  {phraseOfTheDay.originalExpression}
                </div>
                {phraseOfTheDay.pronunciationGuide && (
                  <div className="text-xs font-mono text-amber-900">
                    🗣️ {phraseOfTheDay.pronunciationGuide}
                  </div>
                )}
                <div className="text-sm font-semibold text-neutral-700 italic">
                  "{phraseOfTheDay.meaning}"
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => playPronunciation(phraseOfTheDay)}
                  className="btn btn-sm rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-0 font-bold gap-1 min-h-[40px]"
                  title="Listen to pronunciation approximation"
                >
                  <Volume2 size={15} /> Listen
                </button>
                <button
                  onClick={(e) => toggleFavorite(phraseOfTheDay, e)}
                  className={`btn btn-sm rounded-xl font-bold gap-1 min-h-[40px] ${
                    favorites.some((f) => f.entryId === phraseOfTheDay.entryId)
                      ? "bg-[#DC143C] text-white border-0"
                      : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <Heart size={14} /> Favorite
                </button>
              </div>
            </div>
          )}

          {/* Clean, Unified Search & Filter Toolbar */}
          <div className="space-y-3">
            <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#EAE5D9] shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Left: Autocomplete Search Bar */}
              <div className="w-full md:max-w-md">
                <HeritageSearchBar
                  value={searchQuery}
                  onChange={(q) => updateParams({ q })}
                  onClear={() => updateParams({ q: "" })}
                  suggestions={filteredPhrases}
                  onSelectSuggestion={(p) => {
                    updateParams({ q: p.originalExpression });
                  }}
                  placeholder="Search phrase, English meaning, context..."
                  className="w-full"
                />
              </div>

              {/* Right: Language & Theme Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                {/* Language Select Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Language:</span>
                  <select
                    value={selectedLangParam}
                    onChange={(e) => handleSelectLanguage(e.target.value)}
                    className="select select-sm bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[40px]"
                    aria-label="Filter by language variety"
                  >
                    <option value="All">All Languages ({phrases.length})</option>
                    {ALL_LANGUAGES_LIST.filter((l) => l !== "All").map((lang) => {
                      const count = coverage[lang]?.total || 0;
                      return (
                        <option key={lang} value={lang} disabled={count === 0}>
                          {lang} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Theme Select Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Theme:</span>
                  <select
                    value={selectedThemeParam}
                    onChange={(e) => updateParams({ theme: e.target.value })}
                    className="select select-sm bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[40px]"
                    aria-label="Filter by theme"
                  >
                    <option value="All">All Themes ({filteredPhrases.length})</option>
                    {THEME_TAXONOMY.map((theme) => {
                      const count = themeCounts[theme] || 0;
                      return (
                        <option key={theme} value={theme} disabled={count === 0}>
                          {theme} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Bar */}
            <ActiveFilterBar
              filters={[
                { key: "q", label: "Search", value: searchQuery },
                { key: "lang", label: "Language", value: selectedLangParam },
                { key: "theme", label: "Theme", value: selectedThemeParam }
              ]}
              onRemoveFilter={(k) => {
                if (k === "q") updateParams({ q: "" });
                if (k === "lang") handleSelectLanguage("All");
                if (k === "theme") updateParams({ theme: "All" });
              }}
              onClearAll={() => {
                localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_LANG, "All");
                setSearchParams({}, { replace: true });
              }}
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPhrases.map((phrase) => {
              const isSaved = offlineStatus[phrase.entryId];
              const isFav = favorites.some((f) => f.entryId === phrase.entryId);
              const isRealSpeaker = phrase.dataStatus === "verified_real";

              return (
                <div
                  key={phrase.entryId}
                  className="bg-white rounded-3xl p-5 border border-[#EAE5D9] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group focus-within:ring-2 focus-within:ring-[#DC143C]"
                >
                  <div className="space-y-3">
                    {/* Header Chips */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1E3A2B] text-white">
                        {phrase.languageVariety}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-neutral-600 border border-[#EAE5D9]">
                        {normalizeTheme(phrase.theme || phrase.category)}
                      </span>
                      <ResponseMetaBadge dataStatus={phrase.dataStatus} />
                    </div>

                    {/* Expression & Speaker Audio */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-black text-[#1C1917] tracking-tight group-hover:text-[#DC143C] transition-colors leading-tight">
                          {phrase.originalExpression}
                        </h3>

                        <button
                          type="button"
                          onClick={() => playPronunciation(phrase)}
                          className="w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-all shrink-0 active:scale-95"
                          title={
                            phrase.audioUrl
                              ? "Listen to authentic speaker recording"
                              : "Listen to machine voice (approximate)"
                          }
                          aria-label="Listen to pronunciation"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      {phrase.pronunciationGuide && (
                        <div className="text-xs font-mono text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/50 mt-1.5 inline-block">
                          🗣️ {phrase.pronunciationGuide}
                        </div>
                      )}
                    </div>

                    {/* Meaning & Context */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9]/80 space-y-1.5">
                      <div className="text-sm font-bold text-[#1C1917]">
                        "{phrase.meaning}"
                      </div>
                      {phrase.context && (
                        <p className="text-xs text-neutral-600 leading-snug">
                          {phrase.context}
                        </p>
                      )}
                    </div>

                    {/* Sources (for published_reference) */}
                    {phrase.sources && phrase.sources.length > 0 && (
                      <div className="text-[10px] text-neutral-400 italic flex items-center gap-1">
                        <BookOpen size={10} />
                        <span>Source: {phrase.sources[0].title}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Speaker honesty line (H8) & actions */}
                  <div className="pt-3.5 mt-3.5 border-t border-[#EAE5D9]/70 flex items-center justify-between text-xs text-neutral-500 flex-wrap gap-2">
                    <span className="text-[11px]">
                      {isRealSpeaker ? (
                        <>Speaker: <strong>{phrase.contributedBy}</strong></>
                      ) : (
                        <span className="italic text-neutral-400">Demo entry</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(phrase, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFav ? "text-[#DC143C] bg-red-50" : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                        }`}
                        title={isFav ? "Remove from My Words" : "Save to My Words"}
                        aria-label="Favorite phrase"
                      >
                        <Heart size={15} fill={isFav ? "currentColor" : "none"} />
                      </button>

                      {/* Copy button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhrase(phrase, e)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Copy phrase"
                        aria-label="Copy phrase"
                      >
                        {copiedId === phrase.entryId ? (
                          <Check size={14} className="text-emerald-700" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      {/* Save Offline */}
                      <button
                        type="button"
                        onClick={(e) => handleSaveOffline(phrase, e)}
                        className={`btn btn-xs rounded-lg font-bold gap-1 min-h-[32px] ${
                          isSaved
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0"
                        }`}
                        title={isSaved ? "Saved offline" : "Save offline"}
                        aria-label={isSaved ? "Remove from offline" : "Save offline"}
                      >
                        {isSaved ? <Check size={12} /> : <Download size={12} />}
                        {isSaved ? "Saved" : "Offline"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPhrases.length === 0 && (
            <HeritageEmptyState
              query={searchQuery}
              suggestType="phrase"
              onClearFilters={() => {
                localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_LANG, "All");
                setSearchParams({}, { replace: true });
              }}
              customMessage={`No phrases match your current filter (${selectedLangParam} / ${selectedThemeParam}). You can clear filters or contribute a word.`}
            />
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: FLASHCARDS (LEARNING TOOL - Section 8.4) */}
      {/* =============================================================== */}
      {activeSubTab === "flashcards" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#1C1917] flex items-center justify-center gap-2">
              <Flame size={24} className="text-orange-500" /> Indigenous Language Flashcards
            </h2>
            <p className="text-xs text-neutral-500">
              Only verified and documented phrases are used for learning. Tap the card to flip between translation and meaning.
            </p>
          </div>

          {eligibleLearningPhrases.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE5D9] space-y-3">
              <AlertTriangle size={32} className="mx-auto text-amber-600" />
              <div className="text-base font-bold text-[#1C1917]">
                Not enough reviewed phrases to practice yet
              </div>
              <p className="text-xs text-neutral-500">
                To preserve linguistic authenticity, learning tools require community-verified or published corpus phrases.
              </p>
              <button
                onClick={() => navigate("/community-portal", { state: { preselectType: "phrase" } })}
                className="btn btn-sm bg-[#DC143C] text-white rounded-xl font-bold"
              >
                Contribute Verified Words →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-neutral-500 font-bold px-1">
                <span>
                  Card {flashcardIndex + 1} of {eligibleLearningPhrases.length}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-orange-600">Box 1: {srsBoxes.box1.length}</span>
                  <span className="text-amber-600">Box 2: {srsBoxes.box2.length}</span>
                  <span className="text-emerald-700">Mastered: {srsBoxes.box3.length}</span>
                </span>
              </div>

              {/* The Flip Card */}
              {(() => {
                const card = eligibleLearningPhrases[flashcardIndex];
                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[260px] bg-white rounded-3xl p-8 border-2 border-[#1E3A2B]/20 shadow-lg cursor-pointer flex flex-col justify-between text-center transition-all hover:scale-101 active:scale-99 select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-bold">
                      <span className="badge bg-[#1E3A2B] text-white text-[10px]">
                        {card.languageVariety}
                      </span>
                      <span>Tap to flip ↺</span>
                    </div>

                    <div className="my-auto py-6 space-y-3">
                      {!isFlipped ? (
                        <>
                          <div className="text-3xl font-black text-[#1C1917] tracking-tight">
                            {card.originalExpression}
                          </div>
                          {card.pronunciationGuide && (
                            <div className="text-xs font-mono text-amber-900 bg-amber-50 px-3 py-1 rounded-full inline-block">
                              🗣️ {card.pronunciationGuide}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-black text-[#DC143C] tracking-tight">
                            "{card.meaning}"
                          </div>
                          {card.context && (
                            <div className="text-xs text-neutral-500 max-w-sm mx-auto">
                              {card.context}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-400">
                      {isFlipped ? "Showing English Meaning" : "Showing Indigenous Expression"}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons: Again vs Got It */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleFlashcardReview(false)}
                  className="btn btn-md rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-0 font-bold min-h-[48px]"
                >
                  <RotateCcw size={16} /> Need Practice (Again)
                </button>
                <button
                  onClick={() => handleFlashcardReview(true)}
                  className="btn btn-md rounded-2xl bg-[#1E3A2B] hover:bg-[#162C20] text-white border-0 font-bold min-h-[48px]"
                >
                  <Check size={16} className="text-emerald-400" /> Got It! (Advance)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 3: PRACTICE QUIZ (Section 8.4) */}
      {/* =============================================================== */}
      {activeSubTab === "quiz" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#1C1917] flex items-center justify-center gap-2">
              <Award size={24} className="text-amber-500" /> Interactive Language Quiz
            </h2>
            <p className="text-xs text-neutral-500">
              Test your recall on 5 verified words and phrases.
            </p>
          </div>

          {!quizState.active ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE5D9] space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-black">
                🎯
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black text-[#1C1917]">
                  Ready to test your vocabulary?
                </div>
                <p className="text-xs text-neutral-500">
                  {eligibleLearningPhrases.length} verified phrases currently available to quiz.
                </p>
              </div>

              <button
                onClick={startQuiz}
                disabled={eligibleLearningPhrases.length < 4}
                className="btn btn-md bg-[#DC143C] hover:bg-[#B91C1C] text-white rounded-2xl font-bold px-8 shadow-xs min-h-[48px]"
              >
                Start 5-Question Quiz
              </button>
            </div>
          ) : quizState.currentIndex < quizState.questions.length ? (
            /* Active Question Card */
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE5D9] shadow-md space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
                <span>
                  Question {quizState.currentIndex + 1} of {quizState.questions.length}
                </span>
                <span className="text-[#DC143C]">Score: {quizState.score}</span>
              </div>

              <div className="text-lg md:text-xl font-black text-[#1C1917]">
                {quizState.questions[quizState.currentIndex].questionText}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quizState.questions[quizState.currentIndex].options.map((opt, i) => {
                  const currentQ = quizState.questions[quizState.currentIndex];
                  const isSelected = quizState.selectedOption === opt;
                  const isCorrect = opt === currentQ.correctAnswer;

                  let optClass = "bg-[#FAF7F2] hover:bg-neutral-200 border-[#EAE5D9] text-[#1C1917]";
                  if (quizState.isAnswered) {
                    if (isCorrect) optClass = "bg-emerald-100 border-emerald-400 text-emerald-950 font-black";
                    else if (isSelected) optClass = "bg-red-100 border-red-400 text-red-950 font-black";
                    else optClass = "opacity-50 border-[#EAE5D9]";
                  }

                  return (
                    <button
                      key={i}
                      disabled={quizState.isAnswered}
                      onClick={() => handleQuizAnswer(opt)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm font-bold transition-all min-h-[48px] flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {quizState.isAnswered && isCorrect && <Check size={16} className="text-emerald-700" />}
                    </button>
                  );
                })}
              </div>

              {quizState.isAnswered && (
                <div className="pt-2 flex justify-end animate-fadeIn">
                  <button
                    onClick={nextQuizQuestion}
                    className="btn btn-sm bg-[#1E3A2B] hover:bg-[#162C20] text-white rounded-xl font-bold gap-1 min-h-[40px] px-5"
                  >
                    Next Question <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Summary */
            <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE5D9] shadow-md space-y-5 animate-fadeIn">
              <div className="text-4xl">🎉</div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#1C1917]">Quiz Complete!</h3>
                <p className="text-sm text-neutral-600">
                  You scored <strong>{quizState.score}</strong> out of{" "}
                  <strong>{quizState.questions.length}</strong>!
                </p>
              </div>

              {quizState.weakWords.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 text-left space-y-2 border border-amber-200">
                  <div className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    Words to Review:
                  </div>
                  <div className="space-y-1">
                    {quizState.weakWords.map((w, idx) => (
                      <div key={idx} className="text-xs text-amber-950 flex justify-between">
                        <span className="font-bold">{w.originalExpression}</span>
                        <span>"{w.meaning}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={startQuiz}
                className="btn btn-md bg-[#1E3A2B] text-white rounded-2xl font-bold px-8 shadow-xs min-h-[48px]"
              >
                Practice Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 4: MY WORDS (FAVORITES & EXPORT - Section 8.4) */}
      {/* =============================================================== */}
      {activeSubTab === "mywords" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAE5D9] shadow-xs">
            <div>
              <h2 className="text-xl font-black text-[#1C1917] flex items-center gap-2">
                <Heart size={20} className="text-[#DC143C]" fill="currentColor" /> My Saved Words ({favorites.length})
              </h2>
              <p className="text-xs text-neutral-500">
                Personal collection stored on this device for offline reference and language study.
              </p>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportFavorites("text")}
                  className="btn btn-sm bg-[#FAF7F2] hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold border border-[#EAE5D9] min-h-[40px]"
                >
                  {copiedId === "export-favs" ? (
                    <>
                      <Check size={14} className="text-emerald-700" /> Copied Text!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy as Text
                    </>
                  )}
                </button>
                <button
                  onClick={() => exportFavorites("csv")}
                  className="btn btn-sm bg-[#1E3A2B] hover:bg-[#162C20] text-white rounded-xl font-bold min-h-[40px]"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#EAE5D9] space-y-3">
              <Heart size={36} className="mx-auto text-neutral-300" />
              <div className="text-base font-bold text-[#1C1917]">No saved words yet</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Tap the heart icon ♥ on any phrase card in the Phrasebook to add it to your personal study notebook.
              </p>
              <button
                onClick={() => updateParams({ tab: "browse" })}
                className="btn btn-sm bg-[#DC143C] text-white rounded-xl font-bold mt-2"
              >
                Browse Phrasebook →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((phrase) => (
                <div
                  key={phrase.entryId}
                  className="bg-white rounded-3xl p-5 border border-[#EAE5D9] shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge bg-[#1E3A2B] text-white text-[10px] font-bold">
                        {phrase.languageVariety}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(phrase, e)}
                        className="text-[#DC143C] p-1"
                        title="Remove from favorites"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>

                    <div className="text-lg font-black text-[#1C1917]">
                      {phrase.originalExpression}
                    </div>
                    {phrase.pronunciationGuide && (
                      <div className="text-xs font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        🗣️ {phrase.pronunciationGuide}
                      </div>
                    )}
                    <div className="text-xs font-bold text-neutral-700">
                      "{phrase.meaning}"
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#EAE5D9] flex items-center justify-between text-xs">
                    <button
                      onClick={() => playPronunciation(phrase)}
                      className="text-amber-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <Volume2 size={13} /> Listen
                    </button>
                    <button
                      onClick={(e) => handleCopyPhrase(phrase, e)}
                      className="text-neutral-500 hover:text-neutral-800"
                    >
                      {copiedId === phrase.entryId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 5: AI TRANSLATION STUDIO (Section 8.5) */}
      {/* =============================================================== */}
      {activeSubTab === "translate" && (
        <div className="bg-amber-50/40 rounded-3xl p-6 md:p-8 border-2 border-dashed border-amber-300 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 text-amber-950 border border-amber-400">
              <AlertTriangle size={13} className="text-amber-800" /> AI Translation Drafts — Not Checked by Native Speakers
            </div>
            <h2 className="text-2xl font-black text-[#1C1917]">
              Exploratory AI Translation Assistant
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Translations generated below are automated AI approximations. They have not been reviewed by native speakers
              or literature boards. AI output is never saved into the official archive automatically.
            </p>
          </div>

          {/* Tier Notice for low-resource tribal languages (PRD 8.5) */}
          {aiTargetLanguage !== "Nagamese (Creole)" && aiTargetLanguage !== "English" && (
            <div className="p-3.5 bg-amber-100/80 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Language Alert ({aiTargetLanguage}):</strong> General AI models have low resource coverage for indigenous
                Naga languages and frequently hallucinate vocabulary. Please treat this output as a rough guess and verify with a native speaker.
              </div>
            </div>
          )}

          {/* Translation Form */}
          <form
            onSubmit={handleAiTranslate}
            className="space-y-4 bg-white p-5 md:p-6 rounded-3xl border border-amber-200 shadow-sm"
          >
            {/* Language Direction Controls */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
              {/* Source Lang */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-black text-neutral-600 uppercase tracking-wider block">
                  Source Language:
                </label>
                <select
                  value={aiSourceLang}
                  onChange={(e) => setAiSourceLang(e.target.value)}
                  className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[44px]"
                >
                  <option value="English">English</option>
                  <option value="Nagamese (Creole)">Nagamese (Creole)</option>
                  <option value="Ao">Ao</option>
                  <option value="Angami">Angami</option>
                </select>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    const temp = aiSourceLang;
                    setAiSourceLang(aiTargetLanguage);
                    setAiTargetLanguage(temp);
                  }}
                  className="btn btn-sm btn-circle bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0"
                  title="Swap languages"
                  aria-label="Swap source and target language"
                >
                  <ArrowRightLeft size={14} />
                </button>
              </div>

              {/* Target Lang */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-black text-neutral-600 uppercase tracking-wider block">
                  Target Language Variety:
                </label>
                <select
                  value={aiTargetLanguage}
                  onChange={(e) => setAiTargetLanguage(e.target.value)}
                  className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[44px]"
                >
                  <option value="Nagamese (Creole)">Nagamese (Creole) — Lingua Franca</option>
                  <option value="Chang">Chang (Tuensang)</option>
                  <option value="Ao">Ao (Chungli / Mokokchung)</option>
                  <option value="Angami">Angami (Tenyidie / Kohima)</option>
                  <option value="Konyak">Konyak (Mon)</option>
                  <option value="Lotha">Lotha (Wokha)</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* Input Phrase with 300 char counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-bold">
                <label htmlFor="ai-translate-input">Enter phrase to translate:</label>
                <span className={aiInputText.length > 280 ? "text-[#DC143C]" : "text-neutral-400"}>
                  {aiInputText.length} / 300
                </span>
              </div>
              <textarea
                id="ai-translate-input"
                maxLength={300}
                rows={3}
                placeholder="e.g., Where can I find the clan elders of the Morung?"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                className="textarea textarea-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-2xl text-xs md:text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Quick Example Chips (PRD 8.5) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-neutral-500">Quick examples:</span>
              {[
                "How much does this traditional shawl cost?",
                "Where is the Hornbill Festival being held?",
                "Please sit by the hearth and have some tea."
              ].map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAiInputText(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-amber-100 text-neutral-700 font-medium border border-[#EAE5D9] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Submit / Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE5D9]">
              <span className="text-[11px] text-neutral-500 italic">
                AI outputs will carry the "AI draft — unverified" status badge.
              </span>

              <button
                type="submit"
                disabled={aiLoading || !aiInputText.trim()}
                className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white border-0 font-bold rounded-xl gap-2 shadow-xs min-h-[44px] px-6"
              >
                {aiLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span> Translating...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Generate AI Draft
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error with Retry */}
          {aiError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>{aiError}</span>
              </div>
              <button
                onClick={handleAiTranslate}
                className="btn btn-xs rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-bold border border-red-300"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="p-6 rounded-3xl bg-white border border-amber-300 shadow-md space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="badge bg-amber-100 text-amber-950 border border-amber-400 text-xs font-bold gap-1">
                  <AlertTriangle size={12} /> AI Generated Draft (Unverified)
                </span>
                <ResponseMetaBadge meta={aiMeta} />
              </div>

              <div className="text-base md:text-lg text-[#1C1917] font-serif leading-relaxed whitespace-pre-line bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80">
                {aiResult}
              </div>

              {/* Actions on AI Result: Copy, Community Verification, Report Wrong */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    setCopiedId("ai-res");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="btn btn-xs bg-[#FAF7F2] hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold border border-[#EAE5D9] gap-1 min-h-[36px]"
                >
                  {copiedId === "ai-res" ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                  {copiedId === "ai-res" ? "Copied" : "Copy Translation"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate("/community-portal", {
                        state: {
                          preselectType: "phrase",
                          tribeName: aiTargetLanguage,
                          title: aiResult,
                          meaning: aiInputText
                        }
                      })
                    }
                    className="btn btn-xs bg-[#DC143C] hover:bg-[#B91C1C] text-white border-0 font-bold rounded-xl gap-1 min-h-[36px]"
                  >
                    Send to Community Portal for Verification →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Session Translations (PRD 8.5) */}
          {aiHistory.length > 1 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-black uppercase text-neutral-500 tracking-wider">
                Recent Drafts in this Session:
              </div>
              <div className="space-y-2">
                {aiHistory.slice(1).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-white rounded-2xl border border-amber-200/60 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <span className="text-neutral-400">[{h.targetLang}]</span>{" "}
                      <span className="font-bold text-[#1C1917]">{h.text}</span> →{" "}
                      <span className="italic text-amber-900">{h.result}</span>
                    </div>
                    <button
                      onClick={() => {
                        setAiInputText(h.text);
                        setAiTargetLanguage(h.targetLang);
                        setAiSourceLang(h.sourceLang);
                      }}
                      className="text-[#DC143C] font-bold shrink-0 hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Theme Filter Bottom Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-[#EAE5D9] pb-3">
              <h3 className="font-black text-lg text-[#1C1917]">Filter by Theme</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-sm btn-circle btn-ghost text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => {
                  updateParams({ theme: "All" });
                  setShowMobileFilters(false);
                }}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold ${
                  selectedThemeParam === "All" ? "bg-[#DC143C] text-white" : "bg-[#FAF7F2]"
                }`}
              >
                All Themes
              </button>
              {THEME_TAXONOMY.map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    updateParams({ theme });
                    setShowMobileFilters(false);
                  }}
                  className={`w-full p-3 rounded-xl text-left text-xs font-bold flex justify-between ${
                    selectedThemeParam === theme ? "bg-[#DC143C] text-white" : "bg-[#FAF7F2] text-neutral-800"
                  }`}
                >
                  <span>{theme}</span>
                  <span className="opacity-75">({themeCounts[theme] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
