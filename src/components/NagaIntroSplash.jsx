import { useEffect, useState, useCallback } from "react";
import { Sparkles, Flame, Feather } from "lucide-react";

export default function NagaIntroSplash({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleClose = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#203E2D] text-white transition-opacity duration-500 select-none overflow-hidden ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Dynamic Background Pattern: Naga Diamond Grid Accent */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#DC143C_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      {/* Floating Hearth Fire Embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ember-particle w-2.5 h-2.5 left-[18%] bottom-[8%]" style={{ animationDelay: "0s" }}></div>
        <div className="ember-particle w-1.5 h-1.5 left-[32%] bottom-[14%]" style={{ animationDelay: "0.8s" }}></div>
        <div className="ember-particle w-3 h-3 left-[50%] bottom-[5%]" style={{ animationDelay: "1.5s" }}></div>
        <div className="ember-particle w-2 h-2 left-[68%] bottom-[12%]" style={{ animationDelay: "0.4s" }}></div>
        <div className="ember-particle w-1.5 h-1.5 left-[84%] bottom-[10%]" style={{ animationDelay: "2.1s" }}></div>
      </div>

      {/* Top & Bottom Traditional Naga Tribal Weaving Motifs */}
      <div className="naga-weave-strip absolute top-0 left-0 right-0 h-2.5"></div>
      <div className="naga-weave-strip absolute bottom-0 left-0 right-0 h-2.5"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto space-y-6 animate-splash-fade-in">
        
        {/* Animated Naga Tribal Shield & Hornbill Feather Crest */}
        <div className="relative flex items-center justify-center my-2">
          {/* Glowing Aura Ring */}
          <div className="absolute w-40 h-40 rounded-full bg-[#DC143C]/30 blur-2xl animate-glow-pulse-deep"></div>

          {/* Interweaving SVG Tribal Diamond Loom Threads */}
          <svg className="w-40 h-40 absolute" viewBox="0 0 100 100">
            <polygon
              points="50,5 95,50 50,95 5,50"
              fill="none"
              stroke="#DC143C"
              strokeWidth="2.2"
              strokeDasharray="8,5"
              className="animate-[spin_18s_linear_infinite]"
            />
            <polygon
              points="50,12 88,50 50,88 12,50"
              fill="none"
              stroke="#FAF7F2"
              strokeWidth="1.6"
              strokeOpacity="0.7"
              strokeDasharray="5,4"
              className="animate-[spin_12s_linear_infinite_reverse]"
            />
          </svg>

          {/* Central Warrior Shield / Feather Emblem Card */}
          <div className="w-24 h-24 rounded-2xl bg-[#162E22] border-2 border-[#DC143C] flex items-center justify-center shadow-2xl relative transform rotate-45 transition-transform duration-700 hover:rotate-90">
            <div className="w-16 h-16 border border-white/20 rounded-xl flex items-center justify-center transform -rotate-45">
              <div className="p-3 bg-[#DC143C] rounded-2xl shadow-lg border border-white/40 animate-hornbill-sway">
                <Feather size={32} className="text-[#FAF7F2]" />
              </div>
            </div>
          </div>
        </div>

        {/* Title, Badge & Tagline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold tracking-widest text-[#FAF7F2] uppercase shadow-sm">
            <Sparkles size={13} className="text-[#DC143C]" />
            <span>17 Naga Tribes • Oral Heritage Hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            Naga<span className="text-[#DC143C]">Quest</span>
          </h1>

          <p className="text-sm sm:text-base text-[#FAF7F2]/90 max-w-md font-medium leading-relaxed font-sans">
            Preserving indigenous Nagaland folklore, warrior textile symbolism, and 17 tribal languages in an interactive cultural archive.
          </p>
        </div>

        {/* Traditional Geometric Progress Bar Animation */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-[#FAF7F2]/80 tracking-wider">
            <span className="flex items-center gap-1.5">
              <Flame size={13} className="text-[#DC143C]" /> Weaving Heritage Tapestry...
            </span>
            <span className="text-[#DC143C] font-black">Digital Archive</span>
          </div>
          <div className="h-2.5 w-full bg-[#162E22] rounded-full overflow-hidden border border-white/20 p-0.5 shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#DC143C] via-[#FAF7F2] to-[#DC143C] rounded-full animate-weave-flow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
