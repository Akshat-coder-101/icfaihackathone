import { AlertCircle } from "lucide-react";
import { ManagedImage } from "../images";

export default function SpeciesCard({ species, onSelect }) {
  return (
    <div className="editorial-card overflow-hidden flex flex-col justify-between group">
      {/* Species Image / Wildlife Placeholder */}
      <div className="w-full">
        <ManagedImage
          imageId={species.imageId}
          alt={`${species.commonName || "Nagaland wildlife"}, ${species.scientificName || ""}`}
          category="wildlife"
          aspectRatioClass="aspect-[16/10]"
          showAttribution={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Badges */}
          <div className="flex items-start justify-between gap-2">
            <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20">
              {species.category || "Wildlife"}
            </span>
          </div>

          {/* Names */}
          <div>
            <h4 className="font-serif text-lg font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
              {species.commonName || "Unrecorded Species Name"}
            </h4>
            {species.scientificName && (
              <p className="text-xs italic font-serif text-[#78716C] mt-0.5">
                {species.scientificName}
              </p>
            )}
          </div>

          {/* Habitat & Conservation Status */}
          <div className="space-y-2 text-xs text-[#57534E]">
            {species.conservationStatus && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#A45E45]/10 text-[#A45E45] border border-[#A45E45]/20">
                <AlertCircle size={12} /> {species.conservationStatus}
              </div>
            )}

            {species.habitat && (
              <p className="text-xs text-[#57534E] leading-relaxed">
                <strong className="text-[#252B26] font-medium">Habitat:</strong> {species.habitat}
              </p>
            )}

            {species.description && (
              <p className="text-xs text-[#78716C] line-clamp-3 leading-relaxed">
                {species.description}
              </p>
            )}
          </div>

          {/* Associated Districts */}
          {species.districtIds && species.districtIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider mr-1">
                Districts:
              </span>
              {species.districtIds.map(dId => (
                <span
                  key={dId}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-[#FAF7F2] text-[#57534E] border border-[#E6E1D6] capitalize"
                >
                  {dId}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#78716C]">
            Source: {species.source || "Biodiversity Field Survey"}
          </span>

          {onSelect && (
            <button
              onClick={() => onSelect(species)}
              className="text-xs font-semibold text-[#203E2D] hover:underline cursor-pointer"
            >
              View Record &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
