import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Send,
  User,
  Bot,
  RefreshCw,
  BookOpen,
  Compass
} from "lucide-react";
import RetrievalGroundingService from "../services/RetrievalGroundingService";
import archiveStore from "../services/archiveStore";
import ResponseMetaBadge from "./ResponseMetaBadge";
import MarkdownRenderer from "./MarkdownRenderer";

const PYTHON_API_BASE = "http://localhost:8000";

const QUICK_STARTERS = [
  {
    label: "🔥 Naknyulem Fire Rites",
    query: "Explain the sacred fire protocol during Naknyulem festival among the Chang Naga."
  },
  {
    label: "🥁 Sacred Tung Log Drum",
    query: "How is the Tung log drum carved and what acoustic messages does it send?"
  },
  {
    label: "🦅 Tsüngkotepsü Warrior Shawl",
    query: "What animals are painted on the Ao Tsüngkotepsü shawl and who was permitted to wear it?"
  },
  {
    label: "💧 Khonoma Green Sanctuaries",
    query: "How did the Angami people of Khonoma establish community forest conservation?"
  }
];

export default function CulturalCompanion() {
  const location = useLocation();
  const chatContainerRef = useRef(null);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: "Hello! I am your **NagaQuest Cultural Assistant**. I can help you explore cultural topics, traditions, crafts, and oral histories from the archive. Some questions may not have enough documented information in the archive to answer reliably.",
      citations: [],
      groundingLevel: "grounded_archive"
    }
  ]);

  const sendMessage = useCallback(async (queryText, tribeContext = "General") => {
    const q = queryText.trim();
    if (!q || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      sender: "user",
      text: q
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setLoading(true);

    try {
      let replyData = null;

      // 1. Try Python FastAPI backend
      try {
        const pyRes = await fetch(`${PYTHON_API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            tribeContext: tribeContext
          })
        });

        if (pyRes.ok) {
          replyData = await pyRes.json();
        }
      } catch {
        // Python server not reachable; fall back gracefully to client grounding
      }

      // 2. Client-side Grounding Service fallback if Python backend is offline
      if (!replyData) {
        const clientResult = await RetrievalGroundingService.generateCompanionAnswer({
          query: q,
          tribeContext: tribeContext,
          mode: "strict_archive"
        });
        replyData = {
          reply: clientResult.answer,
          citations: clientResult.citations || [],
          groundingLevel: clientResult.groundingLevel || "grounded_archive",
          provider: clientResult.meta?.provider || "Client Grounded Engine",
          model: clientResult.meta?.model || "Browser Service"
        };
      }

      // Track explored items
      if (replyData.citations?.length > 0) {
        replyData.citations.forEach((c) => {
          if (c.type === "story") archiveStore.markStoryExplored(c.id);
          if (c.type === "phrase") archiveStore.markPhraseMastered(c.id);
        });
      }

      const assistantMessage = {
        id: `asst-${Date.now()}`,
        sender: "assistant",
        text: replyData.reply,
        citations: replyData.citations || [],
        groundingLevel: replyData.groundingLevel,
        provider: replyData.provider,
        model: replyData.model
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: "assistant",
          text: "I was unable to retrieve a verified response right now. Please check your connection or try again.",
          citations: [],
          groundingLevel: "archive_gap"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);



  // Auto-scroll chat within container only
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handledNavKeyRef = useRef("");

  // Handle incoming navigation from Oral Archive, Heritage Atlas, or Dashboard (Auto-ask)
  useEffect(() => {
    if (!location.state) return;
    const navKey = location.state.prefillQuery || location.state.selectedStory?.storyId || location.state.selectedObject?.objectId;
    if (!navKey || handledNavKeyRef.current === navKey) return;
    handledNavKeyRef.current = navKey;

    const timer = setTimeout(() => {
      if (location.state.prefillQuery) {
        sendMessage(location.state.prefillQuery, location.state.prefillTribe || "General");
      } else if (location.state.selectedStory) {
        const s = location.state.selectedStory;
        const initialPrompt = `Explain the cultural teachings, rituals, and significance of the story "${s.title}" (${s.tribeName} tribe).`;
        sendMessage(initialPrompt, s.tribeName);
      } else if (location.state.selectedObject) {
        const o = location.state.selectedObject;
        const initialPrompt = `Explain the traditional usage, customary protocol, and community symbolism of "${o.title}" (${o.tribeName} tribe).`;
        sendMessage(initialPrompt, o.tribeName);
      }
      window.history.replaceState({}, document.title);
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state, sendMessage]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputQuery);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-msg",
        sender: "assistant",
        text: "What aspects of Naga cultural traditions, folklore, or history would you like to explore? Some questions may not have enough documented information in the archive to answer reliably.",
        citations: [],
        groundingLevel: "grounded_archive"
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn pb-8">
      {/* Clean Header Bar */}
      <div className="editorial-card p-4 md:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#203E2D] text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#252B26] tracking-tight">
              FolkWeaver Cultural Learning Tool
            </h1>
            <p className="text-xs text-[#5C645E] font-normal">
              Explore cultural topics and discover relevant material from the archive. Some questions may not have enough documented information to answer reliably.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E6E1D6] text-[#57534E] border border-[#E6E1D6] rounded-lg text-xs font-semibold gap-1 inline-flex items-center cursor-pointer transition-colors"
            title="Reset conversation"
          >
            <RefreshCw size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div ref={chatContainerRef} className="bg-[#FAF7F2]/60 rounded-xl border border-[#E6E1D6] p-4 md:p-6 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-2xs ${
                  isUser ? "bg-[#203E2D]" : "bg-[#A45E45]"
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl p-4 shadow-2xs text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#203E2D] text-white rounded-tr-none font-normal"
                    : "bg-white text-[#252B26] rounded-tl-none border border-[#E6E1D6]"
                }`}
              >
                {!isUser ? (
                  <div className="space-y-3">
                    {/* Status Badge */}
                    {msg.groundingLevel && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E6E1D6] text-[10px]">
                        <ResponseMetaBadge groundingLevel={msg.groundingLevel} citations={msg.citations} />
                      </div>
                    )}

                    {/* Markdown Body */}
                    <div className="prose prose-xs max-w-none text-[#252B26] leading-relaxed">
                      <MarkdownRenderer text={msg.text} content={msg.text} />
                    </div>

                    {/* Citations Footer */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-[#E6E1D6] space-y-1.5">
                        <span className="text-[10px] font-semibold uppercase text-[#203E2D] tracking-wider flex items-center gap-1">
                          <ShieldCheck size={12} /> Approved Archive Citations ({msg.citations.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-[#FAF7F2] text-[#57534E] border border-[#E6E1D6]"
                            >
                              {c.type === "story" ? <BookOpen size={10} className="text-[#A45E45]" /> : <Compass size={10} className="text-[#203E2D]" />}
                              {c.title} ({c.tribeName})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A45E45] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-[#E6E1D6] rounded-xl rounded-tl-none p-3.5 shadow-2xs flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#203E2D] animate-ping"></span>
              <span>Grounding answer in verified Naga records...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips (Only if fresh chat) */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-[11px] font-medium text-[#78716C] mr-1">Suggested Inquiries:</span>
          {QUICK_STARTERS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(s.query)}
              disabled={loading}
              className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#57534E] border border-[#E6E1D6] rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about Naga heritage, traditions, folklore, or rituals..."
          disabled={loading}
          className="w-full bg-white border border-[#E6E1D6] focus:border-[#203E2D] rounded-xl text-xs md:text-sm pl-4 pr-12 py-3 shadow-2xs focus:outline-none placeholder-[#78716C]"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-5 py-3 bg-[#203E2D] hover:bg-[#2C523C] disabled:bg-[#E6E1D6] text-white rounded-xl text-xs font-semibold shadow-xs shrink-0 cursor-pointer transition-all"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
