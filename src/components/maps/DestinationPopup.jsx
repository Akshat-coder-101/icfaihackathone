import { Link } from "react-router-dom";
import { Navigation, ExternalLink, ArrowRight, MapPin } from "lucide-react";
import { ManagedImage } from "../images";
import { getExternalNavigationUrl } from "../../data/tourismDestinations";

export default function DestinationPopup({ destination }) {
  if (!destination) return null;

  const googleDirectionsUrl = getExternalNavigationUrl(
    destination.latitude,
    destination.longitude,
    "google"
  );

  const osmDirectionsUrl = getExternalNavigationUrl(
    destination.latitude,
    destination.longitude,
    "osm"
  );

  return (
    <div className="p-1 space-y-2.5 max-w-[280px] text-[#252B26]">
      {/* Thumbnail Banner */}
      <div className="w-full rounded-xl overflow-hidden border border-[#E6E1D6]">
        <ManagedImage
          imageId={destination.imageId}
          alt={destination.name}
          category={destination.category}
          aspectRatioClass="aspect-16/9"
          showAttribution={false}
          sizes="280px"
        />
      </div>

      {/* Meta Tag */}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        <span className="editorial-tag text-[9px] text-[#A45E45]">
          {destination.category}
        </span>
      </div>

      {/* Title & District */}
      <div>
        <h4 className="text-sm font-extrabold text-[#1C1917] leading-tight">
          {destination.name}
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mt-0.5">
          <MapPin size={11} className="text-[#DC143C] shrink-0" />
          <span>{destination.districtName || "Nagaland"}</span>
        </div>
      </div>

      {/* Short Description */}
      {destination.description && (
        <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>
      )}

      {/* Coordinates / Address info */}
      <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1 border-t border-[#EAE5D9]/70">
        <span className="font-mono text-[9px] text-neutral-400">
          {destination.latitude?.toFixed(4)}, {destination.longitude?.toFixed(4)}
        </span>
        <span className="text-[9px] text-neutral-400 truncate max-w-[140px]">
          {destination.sourceProvider || "OpenStreetMap"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1.5">
        <div className="flex items-center gap-1.5">
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs rounded-lg bg-[#FAF7F2] text-[#1E3A2B] hover:bg-[#1E3A2B] hover:text-white border border-[#EAE5D9] text-[10px] font-bold gap-1 px-2 transition-colors"
            title="Open in Google Maps for directions"
          >
            <Navigation size={10} />
            <span>Maps</span>
          </a>

          <a
            href={osmDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs rounded-lg bg-[#FAF7F2] text-neutral-600 hover:text-neutral-900 border border-[#EAE5D9] text-[10px] p-1.5"
            title="Open in OpenStreetMap"
          >
            <ExternalLink size={10} />
          </a>
        </div>

        {destination.detailPath ? (
          <Link
            to={destination.detailPath}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#DC143C] hover:underline"
          >
            <span>Explore</span>
            <ArrowRight size={11} />
          </Link>
        ) : (
          <span className="text-[10px] text-neutral-400 italic">Field Record</span>
        )}
      </div>
    </div>
  );
}
