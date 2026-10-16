import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Download,
  CheckCircle,
  Sparkles,
  UserCheck,
  AlertCircle,
  Search,
  PlusCircle,
  FileText,
  Languages,
  ExternalLink
} from "lucide-react";
import archiveStore from "../services/archiveStore";
import offlineLibrary from "../services/offlineLibrary";
import NagaWeavingDivider from "./NagaWeavingDivider";
import ResponseMetaBadge from "./ResponseMetaBadge";

export default function OralArchive() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [selectedTribe, setSelectedTribe] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStory, setActiveStory] = useState(null);
  const [transcriptTab, setTranscriptTab] = useState("translation"); // 'translation' | 'original'
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioObj, setAudioObj] = useState(null);
  const [offlineStatus, setOfflineStatus] = useState({});

  const tribes = ["All", "Chang", "Ao", "Angami", "Konyak", "Lotha", "Sumi"];

  useEffect(() => {
    const loadStories = () => {
      const all = archiveStore.getAllStories();
      setStories(all);
      if (all.length > 0) {
        setActiveStory((prev) => prev || all[0]);
      }
    };
    loadStories();

    const unsubscribe = archiveStore.subscribe(() => {
      loadStories();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check offline status of active story
    if (activeStory) {
      offlineLibrary.isItemSaved(activeStory.storyId).then((saved) => {
        setOfflineStatus((prev) => ({ ...prev, [activeStory.storyId]: saved }));
      });
    }
  }, [activeStory]);

  const toggleAudio = (story) => {
    if (!story) return;

    if (isPlaying) {
      if (audioObj) {
        audioObj.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // If real audio recording exists on verified entry
    if (story.dataStatus === "verified_real" && story.audioUrl) {
      const audio = new Audio(story.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().then(() => {
        setAudioObj(audio);
        setIsPlaying(true);
      }).catch(() => setIsPlaying(false));
      return;
    }

    // Illustrative entries: use clearly labeled Web Speech Synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToRead = story.transcriptTranslated || story.transcriptOriginal;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      alert("Audio field recording pending onboarding. Speech synthesis not supported in this browser.");
    }
  };

  const handleDownloadOffline = async (story) => {
    try {
      await offlineLibrary.saveItem(story, "story");
      setOfflineStatus((prev) => ({ ...prev, [story.storyId]: true }));
    } catch (err) {
      console.error("Offline save failed:", err);
    }
  };

  const filteredStories = stories.filter((story) => {
    const matchesTribe =
      selectedTribe === "All" ||
      story.tribeName.toLowerCase() === selectedTribe.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.culturalContext.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.storyteller?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTribe && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module Header */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A45E45] text-white mb-4 shadow-2xs">
            Oral Traditions
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Living Oral Traditions
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Explore spoken histories, clan narratives, and oral lore preserved in native dialects across Nagaland's communities.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/community-portal", { state: { preselectType: "story" } })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#A45E45] hover:bg-[#8F513B] text-white transition-all shadow-xs cursor-pointer min-h-[44px]"
            >
              <PlusCircle size={16} /> Contribute an Oral Tradition
            </button>
          </div>
        </div>

        {/* Decorative tribal pattern background element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#FAF7F2_2px,transparent_2px)] [background-size:16px_16px]"></div>
      </div>

      <NagaWeavingDivider />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E6E1D6] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider mr-1">
            Tribe Archive:
          </span>
          {tribes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTribe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedTribe === t
                  ? "bg-[#203E2D] text-white shadow-2xs"
                  : "bg-[#FAF7F2] text-[#57534E] hover:bg-[#E6E1D6]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search stories, elders, rites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E6E1D6] rounded-lg text-xs text-[#252B26] placeholder-[#78716C] focus:border-[#203E2D] focus:outline-none"
          />
        </div>
      </div>

      {/* Two Column Layout: Story Directory + Selected Story Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Story List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-base font-bold text-[#252B26]">
              Oral Narratives ({filteredStories.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1 scrollbar-custom">
            {filteredStories.map((story) => {
              const isSelected = activeStory?.storyId === story.storyId;
              const isOffline = offlineStatus[story.storyId];

              return (
                <div
                  key={story.storyId}
                  onClick={() => setActiveStory(story)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#203E2D] shadow-sm ring-1 ring-[#203E2D]"
                      : "bg-white hover:bg-[#FAF7F2] border-[#E6E1D6] shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20">
                      {story.tribeName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {isOffline && (
                        <span className="editorial-tag text-[#203E2D] bg-emerald-50 border-emerald-200">
                          Offline
                        </span>
                      )}
                      <ResponseMetaBadge dataStatus={story.dataStatus} />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#252B26] line-clamp-1 mb-1">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#57534E] line-clamp-2 mb-3 leading-relaxed">
                    {story.transcriptTranslated}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-2 border-t border-[#E6E1D6]">
                    <span className="flex items-center gap-1 font-medium">
                      <UserCheck size={12} className="text-[#A45E45]" />
                      {story.storyteller?.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#78716C]">
                      {story.audioDuration}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredStories.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#E6E1D6]">
                <AlertCircle size={28} className="mx-auto text-[#A45E45] mb-2" />
                <p className="text-sm font-semibold text-[#252B26]">No matching oral stories found</p>
                <p className="text-xs text-[#78716C] mt-1">
                  Try adjusting your tribe filter or contribute a new oral record.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Story Document Viewer (7 cols) */}
        {activeStory ? (
          <div className="lg:col-span-7 editorial-card p-6 md:p-8 space-y-6">
            {/* Header Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20">
                    {activeStory.tribeName} Tribe
                  </span>
                  <span className="editorial-tag text-[#57534E] bg-[#FAF7F2] border-[#E6E1D6] font-mono">
                    {activeStory.originalLanguage}
                  </span>
                  <ResponseMetaBadge dataStatus={activeStory.dataStatus} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadOffline(activeStory)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold gap-1 border transition-colors cursor-pointer ${
                      offlineStatus[activeStory.storyId]
                        ? "bg-[#203E2D]/10 border-[#203E2D]/30 text-[#203E2D]"
                        : "bg-[#FAF7F2] border-[#E6E1D6] text-[#57534E] hover:bg-[#E6E1D6]"
                    }`}
                  >
                    {offlineStatus[activeStory.storyId] ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle size={12} /> Offline Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Download size={12} /> Save Offline
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/companion", { state: { selectedStory: activeStory } })}
                    className="px-3 py-1.5 bg-[#203E2D] text-white hover:bg-[#2C523C] rounded-lg text-xs font-semibold gap-1 inline-flex items-center cursor-pointer shadow-xs"
                    title="Ask AI Companion about this story"
                  >
                    <Sparkles size={12} className="text-[#C68A36]" /> Ask AI
                  </button>
                </div>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#252B26] tracking-tight">
                {activeStory.title}
              </h2>
            </div>

            {/* Audio Player Strip */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAudio(activeStory)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white transition-transform active:scale-95 shadow-xs cursor-pointer ${
                    isPlaying ? "bg-[#A45E45] animate-pulse" : "bg-[#203E2D] hover:bg-[#2C523C]"
                  }`}
                  title={isPlaying ? "Pause narration" : "Play oral narration"}
                >
                  {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div>
                  <div className="text-xs font-semibold text-[#252B26] flex items-center gap-1.5">
                    Oral Recitation & Narration
                    <span className="w-2 h-2 rounded-full bg-[#203E2D] animate-ping"></span>
                  </div>
                  <div className="text-[11px] text-[#78716C]">
                    Duration: {activeStory.audioDuration} • Click to listen to the oral reading
                  </div>
                </div>
              </div>

              <span className="editorial-tag text-[#57534E] bg-white border-[#E6E1D6]">
                Audio Narration
              </span>
            </div>

            {/* Storyteller Banner */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#203E2D] flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#A45E45]" />
                  Knowledge Keeper: <span className="text-[#252B26] font-bold">{activeStory.storyteller?.name}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-[#203E2D]/10 text-[#203E2D] px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-[#203E2D]/20">
                  <CheckCircle size={10} /> Preserved Oral Heritage
                </span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed italic font-serif">
                "{activeStory.storyteller?.bio}"
              </p>
            </div>

            {/* Transcript Tabs: Translation vs Original Dialect */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-2">
                <button
                  onClick={() => setTranscriptTab("translation")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    transcriptTab === "translation"
                      ? "bg-[#203E2D] text-white"
                      : "bg-[#FAF7F2] text-[#57534E] hover:bg-[#E6E1D6]"
                  }`}
                >
                  <FileText size={14} /> Reviewed Translation (English)
                </button>
                <button
                  onClick={() => setTranscriptTab("original")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    transcriptTab === "original"
                      ? "bg-[#203E2D] text-white"
                      : "bg-[#FAF7F2] text-[#57534E] hover:bg-[#E6E1D6]"
                  }`}
                >
                  <Languages size={14} /> Original Indigenous Dialect ({activeStory.originalLanguage})
                </button>
              </div>

              {transcriptTab === "translation" ? (
                <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-4">
                  <div className="text-xs font-semibold text-[#78716C] uppercase tracking-wider flex items-center justify-between">
                    <span>Verified Oral English Text</span>
                    <span className="text-[11px] text-[#203E2D] font-medium">
                      Reviewed by: {activeStory.translationReviewedBy}
                    </span>
                  </div>
                  <div className="text-sm text-[#252B26] leading-relaxed whitespace-pre-line font-serif">
                    {activeStory.transcriptTranslated}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#252B26] text-neutral-100 border border-[#252B26] space-y-4">
                  <div className="text-xs font-mono font-semibold text-[#C68A36] uppercase tracking-wider flex items-center justify-between">
                    <span>Verbatim Phonetic Transliteration</span>
                    <span className="text-[10px] text-neutral-400">
                      Preserved directly from recitation
                    </span>
                  </div>
                  <div className="text-sm font-mono text-neutral-200 leading-relaxed whitespace-pre-line">
                    {activeStory.transcriptOriginal}
                  </div>
                </div>
              )}
            </div>

            {/* Cultural Context & Ritual Meaning */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A45E45] flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#A45E45]" />
                Cultural Context & Ritual Significance
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {activeStory.culturalContext}
              </p>
            </div>

            {/* Review Status & Audit Trail Reference */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6] text-xs text-[#78716C]">
              <span>
                <strong>Approved by:</strong> {activeStory.reviewedBy} (
                {new Date(activeStory.reviewedAt).toLocaleDateString()})
              </span>
              <button
                onClick={() => navigate("/community-portal")}
                className="text-[#203E2D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Inspect Audit Ledger <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
