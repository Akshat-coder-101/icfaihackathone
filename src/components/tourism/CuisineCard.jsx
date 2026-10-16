import { MapPin, Users } from "lucide-react";
import { ManagedImage } from "../images";

export default function CuisineCard({ item, onSelect }) {
  return (
    <div className="editorial-card overflow-hidden flex flex-col justify-between group">
      {/* Cuisine Image / Food Placeholder */}
      <div className="w-full relative aspect-16/10 bg-[#F2EFE8] overflow-hidden">
        <ManagedImage
          imageId={item.imageId}
          alt={item.imageAlt || `${item.name}, traditional cuisine`}
          category="food"
          aspectRatioClass="aspect-16/10"
          showAttribution={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Top Badges */}
          <div className="flex items-start justify-between gap-2">
            <span className="editorial-tag text-[9px]">
              {item.category || "Culinary Heritage"}
            </span>
          </div>

          {/* Title */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
              {item.name}
            </h4>

            {/* Associated Community & District */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C645E] font-medium mt-1">
              {item.community && (
                <span className="inline-flex items-center gap-1 text-[#203E2D] font-semibold">
                  <Users size={11} /> {item.community}
                </span>
              )}
              {item.district && (
                <span className="inline-flex items-center gap-1 text-[#5C645E]">
                  <MapPin size={11} className="text-[#A45E45]" /> {item.district} District
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-[#5C645E] line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Ingredients preview if documented */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-[#848E86] uppercase tracking-wider">
                Documented Ingredients:
              </span>
              <div className="flex flex-wrap gap-1">
                {item.ingredients.slice(0, 4).map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-[#FAF7F2] text-[#252B26] border border-[#E6E1D6]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between text-xs">
          <span className="text-[10px] text-[#848E86]">
            Source: {item.source || "Community Field Records"}
          </span>

          {onSelect && (
            <button
              onClick={() => onSelect(item)}
              className="text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors cursor-pointer"
            >
              Recipe & Context →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
