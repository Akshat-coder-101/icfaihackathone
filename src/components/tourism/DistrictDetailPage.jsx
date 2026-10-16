import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Compass,
  Trees,
  Landmark,
  Calendar,
  Plane,
  Navigation,
  ArrowRight,
  AlertCircle,
  Map,
  Hotel,
  UtensilsCrossed,
  Share2,
  Check
} from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import VillageCard from "./VillageCard";
import DestinationCard from "./DestinationCard";
import AccommodationCard from "./AccommodationCard";
import CuisineCard from "./CuisineCard";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import {
  DISTRICTS_REGISTRY,
  ACCOMMODATION_REGISTRY,
  CUISINE_REGISTRY
} from "../../data/tourismData";
import { CURATED_DESTINATIONS } from "../../data/tourismDestinations";
import { ManagedImage } from "../images";

export default function DistrictDetailPage() {
  const { districtId } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);

  const district = useMemo(() => {
    return DISTRICTS_REGISTRY.find(
      d => d.id.toLowerCase() === districtId?.toLowerCase()
    );
  }, [districtId]);

  // Merge destinations for this district from CURATED_DESTINATIONS and direct district.destinations
  const destinations = useMemo(() => {
    if (!district) return [];
    const curated = CURATED_DESTINATIONS.filter(
      d => d.districtId?.toLowerCase() === district.id.toLowerCase()
    );
    const direct = district.destinations || [];
    return [
      ...curated,
      ...direct.filter(
        d => !curated.some(c => c.id === d.id || (d.placeId && c.id === d.placeId))
      )
    ];
  }, [district]);

  // Filter accommodations for this district
  const districtStays = useMemo(() => {
    if (!district) return [];
    return ACCOMMODATION_REGISTRY.filter(
      s => s.districtId?.toLowerCase() === district.id.toLowerCase()
    );
  }, [district]);

  // Filter cuisine entries for this district
  const districtCuisines = useMemo(() => {
    if (!district) return [];
    return CUISINE_REGISTRY.filter(
      c =>
        c.districtId?.toLowerCase() === district.id.toLowerCase() ||
        c.associatedDistricts?.includes(district.id)
    );
  }, [district]);

  // Lookup nearby districts from registry
  const nearbyDistricts = useMemo(() => {
    if (!district?.nearbyDistrictIds) return [];
    return district.nearbyDistrictIds
      .map(id => DISTRICTS_REGISTRY.find(d => d.id.toLowerCase() === id.toLowerCase()))
      .filter(Boolean);
  }, [district]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Unknown District ID -> Accessible not-found state
  if (!district) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <TourismNavTabs />
        <TourismEmptyState
          icon={AlertCircle}
          title={`District "${districtId}" Not Found`}
          description="The requested district ID is not currently registered in the NagaQuest tourism database. You can return to the district directory to explore supported districts."
          actionText="Back to District Explorer"
          actionTo="/tourism/districts"
          categoryLabel="District Directory"
        />
      </div>
    );
  }

  const villages = district.villages || [];
  const festivals = district.festivals || [];
  const heritageSites = district.heritageSites || [];
  const natureAttractions = district.natureAttractions || [];
  const travelInfo = district.travelInfo || {};
  const relatedLinks = district.relatedArchiveLinks || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Header */}
      <TourismPageHeader
        badgeText={`${district.name} District`}
        badgeIcon={MapPin}
        title={`${district.name} Explorer`}
        subtitle={district.tagline || district.description}
        showBack={true}
        breadcrumbs={[
          { to: "/tourism/districts", label: "Districts" },
          { label: district.name }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="editorial-tag bg-white/10 text-white border-white/20 text-[10px]">
              HQ: {district.headquarters}
            </span>
            <span className="editorial-tag bg-white/10 text-white border-white/20 text-[10px]">
              Region: {district.region}
            </span>
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1 cursor-pointer"
              title="Share this district page"
            >
              {copiedLink ? <Check size={11} className="text-emerald-300" /> : <Share2 size={11} />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        }
      />

      {/* District Hero Banner with ManagedImage */}
      <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6] shadow-xs bg-[#203E2D]">
        <ManagedImage
          imageId={district.imageId}
          alt={`${district.name} District Landscape and Cultural Heritage, Nagaland`}
          category="district"
          priority={true}
          aspectRatio="aspect-21/9 max-h-[380px]"
          showAttribution={true}
          sizes="(max-width: 768px) 100vw, 1200px"
          imgClassName="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />
        
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white drop-shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="editorial-tag bg-black/60 text-[#FAF7F2] border-white/20 text-[10px]">
              {district.region} Region Heritage
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold">
              {district.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl font-medium line-clamp-2">
              {district.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to={`/tourism/map?district=${district.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF7F2] text-[#203E2D] hover:bg-white text-xs font-semibold shadow-xs"
            >
              <Map size={13} />
              <span>Explore on Map</span>
            </Link>

            {villages.length > 0 && (
              <Link
                to={`/tourism/districts/${district.id}/villages`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs text-xs font-semibold"
              >
                <Compass size={13} />
                <span>Villages ({villages.length})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="editorial-hairline"></div>

      {/* Quick Section Anchor / Filter Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-custom border-b border-[#E6E1D6]">
        {[
          { id: "all", label: "All Sections" },
          { id: "villages", label: `Villages (${villages.length})` },
          { id: "destinations", label: `Destinations (${destinations.length})` },
          { id: "map", label: "Interactive Map" },
          { id: "festivals", label: `Festivals (${festivals.length})` },
          { id: "heritage", label: `Heritage (${heritageSites.length})` },
          { id: "nature", label: `Nature (${natureAttractions.length})` },
          { id: "stays", label: `Stays (${districtStays.length})` },
          { id: "cuisine", label: `Cuisine (${districtCuisines.length})` },
          { id: "travel", label: "Travel Info" },
          ...(nearbyDistricts.length > 0 ? [{ id: "nearby", label: `Nearby (${nearbyDistricts.length})` }] : []),
          { id: "archive", label: "Archive Records" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#203E2D] text-white shadow-xs"
                : "bg-white text-[#5C645E] hover:text-[#203E2D] hover:bg-[#F7F5EF] border border-[#E6E1D6]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. District Overview Card */}
      {(activeTab === "all" || activeTab === "overview") && (
        <section className="editorial-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="font-serif text-xl font-bold text-[#252B26]">
              About {district.name} District
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed max-w-4xl">
            {district.description ||
              `Documentation for ${district.name} District is being compiled through community field records.`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#E6E1D6] text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6]">
              <span className="font-semibold text-[#848E86] uppercase text-[10px] block">
                Administrative HQ
              </span>
              <span className="text-sm font-bold text-[#203E2D]">
                {district.headquarters}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6]">
              <span className="font-semibold text-[#848E86] uppercase text-[10px] block">
                Geographic Region
              </span>
              <span className="text-sm font-bold text-[#203E2D]">
                {district.region}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6]">
              <span className="font-semibold text-[#848E86] uppercase text-[10px] block">
                Villages & Settlements
              </span>
              <span className="text-sm font-bold text-[#203E2D]">
                {district.villages?.length || 0} documented
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6]">
              <span className="font-semibold text-[#848E86] uppercase text-[10px] block">
                Featured Destinations
              </span>
              <span className="text-sm font-bold text-[#203E2D]">
                {destinations.length} places to visit
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Village Explorer Section */}
      {(activeTab === "all" || activeTab === "villages") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#252B26]">
                  Village Explorer
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Documented settlements, traditional Dormitories (Morungs), and community trails in {district.name}
                </p>
              </div>
            </div>

            {villages.length > 0 && (
              <Link
                to={`/tourism/districts/${district.id}/villages`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
              >
                <span>Full Village Directory</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {villages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {villages.map(village => (
                <VillageCard
                  key={village.id}
                  village={village}
                  districtName={district.name}
                />
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={Compass}
              title={`No Villages Documented Yet for ${district.name}`}
              description={`Village profiles for ${district.name} District will be added via verified elder records and community submissions.`}
              categoryLabel={`${district.name} Villages`}
            />
          )}
        </section>
      )}

      {/* 3. Destination Directory Section */}
      {(activeTab === "all" || activeTab === "destinations") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#252B26]">
                  Destination Directory
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Landmarks, viewpoints, and cultural spots in {district.name} District ({destinations.length})
                </p>
              </div>
            </div>

            <Link
              to={`/tourism/map?district=${district.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
            >
              <Map size={12} />
              <span>View All on Map</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations.map(dest => (
                <DestinationCard
                  key={dest.id || dest.placeId}
                  destination={dest}
                  districtId={district.id}
                  districtName={district.name}
                />
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={MapPin}
              title={`Destination Directory for ${district.name} Coming Soon`}
              description={`Detailed geographic destinations for ${district.name} are being verified with local guides and tourism councils.`}
              categoryLabel={`${district.name} Destinations`}
            />
          )}
        </section>
      )}

      {/* 4. Interactive Map Section */}
      {(activeTab === "all" || activeTab === "map") && (
        <section className="bg-[#203E2D] rounded-xl p-6 sm:p-8 text-white shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                <Map size={11} className="text-[#C68A36]" /> OpenStreetMap Cartography
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Explore {district.name} on the Interactive Tourism Map
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                View geographic locations, high-altitude ridgelines, hiking trailheads, and coordinates for all verified destinations in {district.name} using open cartography.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to={`/tourism/map?district=${district.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FAF7F2] text-[#203E2D] hover:bg-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Map size={14} />
                <span>Open {district.name} Map</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Cultural Festivals Section */}
      {(activeTab === "all" || activeTab === "festivals") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              5
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Cultural Festivals & Ceremonies
              </h2>
              <p className="text-xs text-[#5C645E]">
                Traditional seasonal rites, purification rituals, and community celebrations in {district.name}
              </p>
            </div>
          </div>

          {festivals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {festivals.map(fest => (
                <div
                  key={fest.id}
                  className="editorial-card p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="editorial-tag text-[9px]">
                        {fest.associatedCommunity || "Traditional Festival"}
                      </span>
                      <span className="text-xs font-medium text-[#5C645E] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E6E1D6]">
                        {fest.period}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-[#252B26]">
                      {fest.name}
                    </h3>

                    <p className="text-xs text-[#5C645E] leading-relaxed">
                      {fest.description}
                    </p>
                  </div>

                  {fest.significance && (
                    <div className="pt-3 border-t border-[#E6E1D6] text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#848E86] block mb-0.5">
                        Cultural Significance:
                      </span>
                      <p className="text-[#5C645E] italic">
                        {fest.significance}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={Calendar}
              title={`Festivals Pending Documentation for ${district.name}`}
              description={`Traditional festival records and dates for ${district.name} will appear once validated.`}
              categoryLabel="Cultural Festivals"
            />
          )}
        </section>
      )}

      {/* 6. Heritage & Historical Sites */}
      {(activeTab === "all" || activeTab === "heritage") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              6
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Historical & Heritage Sites
              </h2>
              <p className="text-xs text-[#5C645E]">
                Ancestral architecture, ceremonial monoliths, and sacred landmarks in {district.name}
              </p>
            </div>
          </div>

          {heritageSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {heritageSites.map((site, idx) => (
                <div
                  key={idx}
                  className="editorial-card p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="editorial-tag text-[9px]">
                      {site.type}
                    </span>
                    {site.nagaQuestArchiveLink && (
                      <Link
                        to={site.nagaQuestArchiveLink}
                        className="text-[11px] font-semibold text-[#203E2D] hover:text-[#A45E45] inline-flex items-center gap-1 transition-colors"
                      >
                        Atlas Link <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#252B26]">
                    {site.name}
                  </h3>

                  <p className="text-xs text-[#5C645E] leading-relaxed">
                    {site.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={Landmark}
              title={`Heritage Sites Pending for ${district.name}`}
              description={`Historical monuments and ancestral landmarks for ${district.name} will be added via heritage atlas integration.`}
              categoryLabel="Heritage Sites"
            />
          )}
        </section>
      )}

      {/* 7. Nature & Outdoor Attractions */}
      {(activeTab === "all" || activeTab === "nature") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              7
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Nature & Outdoor Attractions
              </h2>
              <p className="text-xs text-[#5C645E]">
                Peaks, valleys, wildlife sanctuaries, and scenic ridgeline viewpoints in {district.name}
              </p>
            </div>
          </div>

          {natureAttractions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {natureAttractions.map((nat, idx) => (
                <div
                  key={idx}
                  className="editorial-card p-5 space-y-2"
                >
                  <span className="editorial-tag text-[9px]">
                    {nat.type}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#252B26]">
                    {nat.name}
                  </h3>
                  <p className="text-xs text-[#5C645E] leading-relaxed">
                    {nat.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={Trees}
              title={`Nature Attractions Pending for ${district.name}`}
              description={`Verified outdoor and ecotourism sites for ${district.name} will be published following sanctuary protocol verification.`}
              categoryLabel="Nature & Outdoors"
            />
          )}
        </section>
      )}

      {/* 8. Accommodations & Stays Section */}
      {(activeTab === "all" || activeTab === "stays") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
                8
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#252B26]">
                  Accommodations & Homestays
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Village homestays, eco-camps, and verified lodging in {district.name}
                </p>
              </div>
            </div>

            <Link
              to="/tourism/stays"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
            >
              <span>State-wide Stays Guide</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {districtStays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {districtStays.map(stay => (
                <AccommodationCard key={stay.id} stay={stay} />
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={Hotel}
              title={`Verified Accommodations for ${district.name} Being Compiled`}
              description={`In compliance with NagaQuest integrity guidelines, commercial hotel names, rates, and addresses are never fabricated. Homestays and eco-lodges in ${district.name} will be listed as community approvals are completed.`}
              actionText="Explore State-wide Stays"
              actionTo="/tourism/stays"
              categoryLabel="Accommodations & Homestays"
            />
          )}
        </section>
      )}

      {/* 9. Food & Cuisine Section */}
      {(activeTab === "all" || activeTab === "cuisine") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
                9
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#252B26]">
                  Traditional Cuisine & Food
                </h2>
                <p className="text-xs text-[#5C645E]">
                  Indigenous culinary specialties, slow-fermented delicacies, and organic produce in {district.name}
                </p>
              </div>
            </div>

            <Link
              to="/tourism/food"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors"
            >
              <span>Naga Food & Cuisine Guide</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {districtCuisines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {districtCuisines.map(item => (
                <CuisineCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <TourismEmptyState
              icon={UtensilsCrossed}
              title={`Culinary Heritage Documentation for ${district.name}`}
              description={`District-specific recipes, indigenous herb lore, and verified eateries in ${district.name} are being compiled with local community cooks and elders.`}
              actionText="Explore Naga Cuisine Directory"
              actionTo="/tourism/food"
              categoryLabel="Food & Culinary Heritage"
            />
          )}
        </section>
      )}

      {/* 10. Travel & Connectivity Information */}
      {(activeTab === "all" || activeTab === "travel") && (
        <section className="editorial-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              10
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Travel & Access Information
              </h2>
              <p className="text-xs text-[#5C645E]">
                Road connectivity, transit junctions, and entry guidelines for {district.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
              <span className="text-[10px] font-bold text-[#848E86] uppercase tracking-wider flex items-center gap-1">
                <Navigation size={12} className="text-[#A45E45]" /> Road Connectivity
              </span>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                {travelInfo.connectivity || "Road access data being checked against official transit routes."}
              </p>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
              <span className="text-[10px] font-bold text-[#848E86] uppercase tracking-wider flex items-center gap-1">
                <Plane size={12} className="text-[#203E2D]" /> Nearest Airport
              </span>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                {travelInfo.nearestAirport || "Dimapur Airport (DMU)"}
              </p>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
              <span className="text-[10px] font-bold text-[#848E86] uppercase tracking-wider flex items-center gap-1">
                <Plane size={12} className="text-[#203E2D]" /> Nearest Railway
              </span>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                {travelInfo.nearestRailway || "Dimapur Railway Station (DMR)"}
              </p>
            </div>
          </div>

          {travelInfo.roadConditions && (
            <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold uppercase text-[10px] tracking-wider block text-amber-800 mb-0.5">
                Seasonal Road Advisory
              </span>
              {travelInfo.roadConditions}
            </div>
          )}

          <div className="pt-3 border-t border-[#E6E1D6] flex flex-wrap items-center justify-between text-xs text-[#5C645E] gap-2">
            <Link
              to={`/tourism/map?district=${district.id}`}
              className="text-[#203E2D] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore on Interactive Map</span> <ArrowRight size={11} />
            </Link>
            <Link
              to="/tourism/ilp"
              className="text-[#A45E45] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Inner Line Permit (ILP) Requirements</span> <ArrowRight size={11} />
            </Link>
          </div>
        </section>
      )}

      {/* 11. Nearby Districts Section */}
      {(activeTab === "all" || activeTab === "nearby") && nearbyDistricts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#F7F5EF] border border-[#E6E1D6] text-[#203E2D] flex items-center justify-center font-bold text-xs">
              11
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Nearby Districts & Neighboring Territories
              </h2>
              <p className="text-xs text-[#5C645E]">
                Continue your journey across adjacent administrative and cultural regions of Nagaland
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nearbyDistricts.map(adj => (
              <Link
                key={adj.id}
                to={`/tourism/districts/${adj.id}`}
                className="editorial-card p-4 hover:border-[#203E2D] transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#848E86] font-semibold uppercase tracking-wider">
                    <span>{adj.region}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors">
                    {adj.name} District
                  </h4>
                  <p className="text-xs text-[#5C645E] line-clamp-2 leading-relaxed">
                    {adj.tagline || adj.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6E1D6] flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45]">
                  <span>Explore District</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 12. Related NagaQuest Living Archive Records */}
      {(activeTab === "all" || activeTab === "archive") && (
        <section className="editorial-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6E1D6] pb-3">
            <span className="w-7 h-7 rounded-md bg-[#203E2D] text-white flex items-center justify-center font-bold text-xs">
              12
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#252B26]">
                Related Living Archive Records
              </h2>
              <p className="text-xs text-[#5C645E]">
                Oral recordings, phrasebook vocabularies, and verified artifact records linked to {district.name}
              </p>
            </div>
          </div>

          {relatedLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {relatedLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] hover:border-[#203E2D] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <span className="editorial-tag text-[9px]">
                      {item.module}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors mt-1">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-[#203E2D] group-hover:text-[#A45E45] inline-flex items-center gap-1 mt-3 transition-colors">
                    Explore Record <ArrowRight size={11} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5C645E] italic">
              No cross-archive records have been linked to this district profile yet.
            </p>
          )}
        </section>
      )}

      {/* Source Attribution Footer */}
      <SourceAttribution
        source={`${district.name} District Cultural Survey & Field Documentation`}
        provider="NagaQuest Heritage Preservation Project"
        lastReviewed="October 2026"
      />
    </div>
  );
}
