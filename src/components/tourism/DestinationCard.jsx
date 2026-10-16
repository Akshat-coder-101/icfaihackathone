import { Link } from "react-router-dom";
import { MapPin, Navigation, ArrowRight } from "lucide-react";
import { ManagedImage } from "../images";

export default function DestinationCard({
  destination,
  districtId = "district",
  districtName = "Nagaland"
}) {
  const destId = destination.id || destination.placeId;

  return (
    <div className="editorial-card overflow-hidden flex flex-col justify-between group">
      {/* Destination Image Banner */}
      <div className="w-full relative aspect-16/9 bg-[#F2EFE8] overflow-hidden">
        <ManagedImage
          imageId={destination.imageId}
          alt={`${destination.name}, ${districtName}`}
          category={destination.category?.toLowerCase() || "destination"}
          aspectRatioClass="aspect-16/9"
          showAttribution={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="editorial-tag text-[9px]">
              {destination.category || "Heritage Site"}
            </span>
          </div>

          <h4 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
            {destination.name}
          </h4>

          <div className="text-xs text-[#5C645E] flex items-center gap-1 font-medium">
            <MapPin size={11} className="text-[#A45E45] shrink-0" />
            <span>{districtName}</span>
          </div>

          {destination.description && (
            <p className="text-xs text-[#5C645E] line-clamp-3 leading-relaxed">
              {destination.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between">
          {destination.latitude && destination.longitude ? (
            <span className="text-[10px] font-mono text-[#848E86] flex items-center gap-1">
              <Navigation size={10} className="text-[#203E2D]" />
              {destination.latitude.toFixed(2)}, {destination.longitude.toFixed(2)}
            </span>
          ) : destination.coordinates ? (
            <span className="text-[10px] font-mono text-[#848E86] flex items-center gap-1">
              <Navigation size={10} className="text-[#203E2D]" />
              {destination.coordinates.lat?.toFixed(2)}, {destination.coordinates.lng?.toFixed(2)}
            </span>
          ) : (
            <span className="text-[10px] text-[#848E86]">Coordinates pending</span>
          )}

          <Link
            to={`/tourism/districts/${districtId}/destinations/${destId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
          >
            <span>Details</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
