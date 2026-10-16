import { useParams, Link } from "react-router-dom";
import { MapPin, Navigation, ExternalLink, AlertCircle, Map } from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import { DISTRICTS_REGISTRY } from "../../data/tourismData";
import { CURATED_DESTINATIONS } from "../../data/tourismDestinations";
import { ManagedImage } from "../images";

export default function DestinationDetailPage() {
  const { districtId, destinationId } = useParams();

  const district = DISTRICTS_REGISTRY.find(
    d => d.id.toLowerCase() === districtId?.toLowerCase()
  );

  if (!district) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <TourismNavTabs />
        <TourismEmptyState
          icon={AlertCircle}
          title={`District "${districtId}" Not Found`}
          description="The requested district ID is not registered."
          actionText="Back to District Explorer"
          actionTo="/tourism/districts"
        />
      </div>
    );
  }

  // Find destination in district or curated destinations
  const destination =
    district.destinations?.find(
      dest => dest.id?.toLowerCase() === destinationId?.toLowerCase()
    ) ||
    CURATED_DESTINATIONS.find(
      dest =>
        dest.id?.toLowerCase() === destinationId?.toLowerCase() &&
        dest.districtId?.toLowerCase() === district.id.toLowerCase()
    );

  const lat = destination?.latitude || destination?.coordinates?.lat;
  const lng = destination?.longitude || destination?.coordinates?.lng;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <TourismNavTabs />

      <TourismPageHeader
        badgeText={`${district.name} Destination`}
        badgeIcon={MapPin}
        title={destination ? destination.name : `Destination: ${destinationId}`}
        subtitle={`Detailed heritage profile and visitor etiquette for ${destination?.name || destinationId} in ${district.name} District.`}
        showBack={true}
        breadcrumbs={[
          { to: "/tourism/districts", label: "Districts" },
          { to: `/tourism/districts/${district.id}`, label: district.name },
          { label: destination?.name || destinationId }
        ]}
      />

      {destination ? (
        <div className="space-y-6">
          {/* Main Destination Hero Image */}
          <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6] shadow-xs bg-[#203E2D]">
            <ManagedImage
              imageId={destination.imageId}
              alt={`${destination.name}, ${district.name} District`}
              category={destination.category?.toLowerCase() || "destination"}
              priority={true}
              aspectRatio="aspect-21/9 max-h-[420px]"
              showAttribution={true}
              sizes="(max-width: 768px) 100vw, 1200px"
              imgClassName="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-white drop-shadow-xs flex items-end justify-between">
              <div>
                <span className="editorial-tag bg-white/90 text-[#252B26] shadow-xs">
                  {destination.category || "Heritage Site"} • {district.name}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
                  {destination.name}
                </h3>
              </div>
            </div>
          </div>

          <div className="editorial-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
              <span className="editorial-tag text-[10px]">
                {destination.category || "Heritage Landmark"}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#252B26]">
              {destination.name}
            </h2>

            <p className="text-sm text-[#5C645E] leading-relaxed">
              {destination.description}
            </p>

            {destination.address && (
              <div className="text-xs text-[#5C645E] flex items-center gap-1.5 font-medium">
                <MapPin size={13} className="text-[#A45E45] shrink-0" />
                <span>{destination.address}</span>
              </div>
            )}

            {lat && lng && (
              <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-mono text-[#5C645E] flex items-center gap-1.5">
                  <Navigation size={13} className="text-[#203E2D]" />
                  Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/tourism/map?district=${district.id}`}
                    className="text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] flex items-center gap-1 transition-colors"
                  >
                    <Map size={12} />
                    <span>View on Map</span>
                  </Link>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#A45E45] hover:underline flex items-center gap-1"
                  >
                    <span>OSM Details</span> <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <TourismEmptyState
          icon={MapPin}
          title={`Destination Profile Pending Verification`}
          description={`The destination record for "${destinationId}" in ${district.name} District is being compiled through field documentation. In compliance with NagaQuest data integrity rules, unverified coordinates and descriptions are withheld until elder or local authority review.`}
          actionText="Contribute via Community Portal"
          actionTo="/community-portal"
          categoryLabel="Destination Registry"
        />
      )}

      <SourceAttribution
        source={`${district.name} Cultural Mapping`}
        provider="NagaQuest Heritage Preservation Project"
      />
    </div>
  );
}
