import { Map, Loader2 } from "lucide-react";

export default function MapLoadingState({ message = "Initializing Nagaland Tourism Map..." }) {
  return (
    <div className="w-full h-full min-h-[460px] bg-[#FAF7F2] border border-[#EAE5D9] rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE5D9] shadow-xs flex items-center justify-center text-[#1E3A2B]">
        <Map size={28} className="text-[#1E3A2B]" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-black text-[#1C1917]">
          {message}
        </h4>
        <p className="text-xs text-neutral-500 max-w-sm">
          Loading OpenStreetMap tiles and verified cultural heritage coordinates across Nagaland.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 text-xs font-bold text-[#DC143C]">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading map data</span>
      </div>
    </div>
  );
}
