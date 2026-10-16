import { Hotel, MapPin, ExternalLink, Phone } from "lucide-react";
import { ManagedImage } from "../images";

export default function AccommodationCard({ stay, onSelect }) {
  return (
    <div className="editorial-card overflow-hidden flex flex-col justify-between group">
      {/* Accommodation Image */}
      <div className="w-full relative aspect-16/10 bg-[#F2EFE8] overflow-hidden">
        <ManagedImage
          imageId={stay.imageId}
          alt={`${stay.name}, ${stay.type || "accommodation"}`}
          category="destination"
          aspectRatioClass="aspect-16/10"
          showAttribution={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Meta */}
          <div className="flex items-start justify-between gap-2">
            <span className="editorial-tag text-[9px]">
              <Hotel size={10} className="text-[#A45E45]" />
              <span>{stay.type || "Stay"}</span>
            </span>
          </div>

          {/* Name & District */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
              {stay.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-[#5C645E] font-medium mt-1">
              <MapPin size={11} className="text-[#A45E45] shrink-0" />
              <span className="capitalize">{stay.districtId || "Nagaland"} District</span>
              {stay.address && <span>• {stay.address}</span>}
            </div>
          </div>

          {/* Description */}
          {stay.description && (
            <p className="text-xs text-[#5C645E] line-clamp-3 leading-relaxed">
              {stay.description}
            </p>
          )}

          {/* Contact info placeholder if documented */}
          {stay.contact && (
            <div className="text-xs text-[#5C645E] flex items-center gap-1.5 pt-1">
              <Phone size={11} className="text-[#848E86]" />
              <span>{stay.contact}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between text-xs">
          {stay.externalUrl ? (
            <a
              href={stay.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
            >
              <span>Official Listing</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="text-[11px] text-[#848E86] italic">
              Verified community stay
            </span>
          )}

          {onSelect && (
            <button
              onClick={() => onSelect(stay)}
              className="text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
            >
              Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
