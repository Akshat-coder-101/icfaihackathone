import { useState } from "react";
import { MapPin, Calendar, Sparkles, ChevronDown, ChevronUp, Compass } from "lucide-react";
import { ManagedImage } from "../images";

export default function VillageCard({ village, districtName = "District" }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="editorial-card overflow-hidden flex flex-col justify-between group">
      {/* Village Image */}
      <div className="w-full relative aspect-16/9 bg-[#F2EFE8] overflow-hidden">
        <ManagedImage
          imageId={village.imageId}
          alt={`${village.name} village landscape, ${districtName}`}
          category="village"
          aspectRatioClass="aspect-16/9"
          showAttribution={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="editorial-tag text-[9px]">
                {districtName} Village
              </span>
              <h4 className="font-serif text-lg font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors mt-1">
                {village.name}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center shrink-0">
              <Compass size={15} />
            </div>
          </div>

          {/* Distance & Season Pills */}
          <div className="space-y-1.5 text-xs">
            {village.distance && (
              <div className="flex items-start gap-1.5 text-[#5C645E]">
                <MapPin size={12} className="text-[#A45E45] shrink-0 mt-0.5" />
                <span className="font-medium">{village.distance}</span>
              </div>
            )}

            {village.bestSeason && (
              <div className="flex items-start gap-1.5 text-[#5C645E]">
                <Calendar size={12} className="text-[#203E2D] shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-[#203E2D] bg-[#203E2D]/8 px-2 py-0.5 rounded-md border border-[#203E2D]/15">
                  Best Season: {village.bestSeason}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {village.description && (
            <p className="text-xs text-[#5C645E] leading-relaxed">
              {village.description}
            </p>
          )}

          {/* Highlights */}
          {village.highlights && village.highlights.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#E6E1D6]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#848E86]">
                Key Highlights
              </span>
              <ul className="space-y-1 text-xs text-[#5C645E]">
                {village.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Sparkles size={11} className="text-[#C68A36] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expandable Attractions */}
          {village.attractions && village.attractions.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] inline-flex items-center gap-1 transition-colors"
              >
                <span>{expanded ? "Hide Attractions" : `View ${village.attractions.length} Attractions`}</span>
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {expanded && (
                <div className="mt-2 p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1.5 animate-fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#848E86] block">
                    Documented Attractions
                  </span>
                  <ul className="space-y-1 text-xs text-[#5C645E] list-disc list-inside">
                    {village.attractions.map((att, idx) => (
                      <li key={idx} className="leading-snug">
                        {att}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
