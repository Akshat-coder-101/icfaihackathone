import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Map,
  Search,
  MapPin,
  X,
  Navigation,
  ArrowRight,
  Filter,
  CheckCircle2,
  Bookmark,
  Info
} from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import SourceAttribution from "./SourceAttribution";
import NagaWeavingDivider from "../NagaWeavingDivider";
import { TourismMap } from "../maps";
import { ManagedImage } from "../images";
import {
  CURATED_DESTINATIONS,
  MAP_CATEGORIES,
  DISTRICT_CENTERS,
  filterDestinations,
  getExternalNavigationUrl
} from "../../data/tourismDestinations";
import { DISTRICTS_REGISTRY } from "../../data/tourismData";
import offlineLibrary from "../../services/offlineLibrary";

export default function TourismMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const districtParam = searchParams.get("district")?.toLowerCase();

  const [fallbackDistrict, setFallbackDistrict] = useState("all");

  const selectedDistrict = useMemo(() => {
    if (districtParam && (DISTRICTS_REGISTRY.some(d => d.id === districtParam) || DISTRICT_CENTERS[districtParam])) {
      return districtParam;
    }
    return fallbackDistrict;
  }, [districtParam, fallbackDistrict]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'map' | 'list' (on mobile)
  const [offlineStatus, setOfflineStatus] = useState({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Update URL search parameters when user selects a district
  const handleDistrictChange = (distId) => {
    setFallbackDistrict(distId);
    setSelectedDestination(null);
    const newParams = new URLSearchParams(searchParams);
    if (distId === "all") {
      newParams.delete("district");
    } else {
      newParams.set("district", distId);
    }
    setSearchParams(newParams);
  };

  // Filter destinations based on state
  const filteredDestinations = useMemo(() => {
    return filterDestinations({
      destinations: CURATED_DESTINATIONS,
      category: selectedCategory,
      districtId: selectedDistrict,
      searchQuery: searchQuery
    });
  }, [selectedCategory, selectedDistrict, searchQuery]);

  // Handle saving destination to offline library
  const handleSaveOffline = async (dest, e) => {
    if (e) e.stopPropagation();
    try {
      await offlineLibrary.saveItem(
        {
          id: dest.id,
          name: dest.name,
          category: dest.category,
          district: dest.districtName,
          coordinates: { lat: dest.latitude, lng: dest.longitude },
          description: dest.description,
          address: dest.address,
          imageId: dest.imageId
        },
        "destination"
      );
      setOfflineStatus(prev => ({ ...prev, [dest.id]: true }));
      setSaveSuccessMsg(`Saved "${dest.name}" to Offline Library`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Offline save failed:", err);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFallbackDistrict("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedDestination(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("district");
    setSearchParams(newParams);
  };

  // Derive active destination cleanly without setState in effect
  const activeDestination =
    selectedDestination && filteredDestinations.some(d => d.id === selectedDestination.id)
      ? selectedDestination
      : null;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Header */}
      <TourismPageHeader
        badgeText="Geographic Discovery"
        badgeIcon={Map}
        title="Interactive Tourism Map of Nagaland"
        subtitle="Explore verified cultural destinations, historic morungs, highland settlements, and wildlife sanctuaries across Nagaland using open-source OpenStreetMap cartography."
        breadcrumbs={[{ label: "Interactive Map" }]}
      />

      <NagaWeavingDivider />

      {/* Main Filter & Search Control Bar */}
      <div className="editorial-card p-4 md:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]"
            />
            <input
              type="text"
              placeholder="Search destination, village, district, or landmark..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] text-xs text-[#252B26] placeholder-[#78716C] focus:border-[#203E2D] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#252B26] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* District Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#78716C] shrink-0 hidden sm:inline-flex items-center gap-1">
              <MapPin size={13} className="text-[#A45E45]" /> District:
            </span>
            <select
              value={selectedDistrict}
              onChange={e => handleDistrictChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] text-xs font-medium text-[#252B26] focus:border-[#203E2D] focus:outline-none w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Nagaland Districts</option>
              {DISTRICTS_REGISTRY.map(dist => (
                <option key={dist.id} value={dist.id}>
                  {dist.name} District
                </option>
              ))}
              <option value="tuensang">Tuensang District</option>
            </select>
          </div>

          {/* Mobile View Toggle Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] shrink-0 lg:hidden self-end">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "map" || viewMode === "split"
                  ? "bg-[#203E2D] text-white shadow-2xs"
                  : "text-[#57534E] hover:text-[#252B26]"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#203E2D] text-white shadow-2xs"
                  : "text-[#57534E] hover:text-[#252B26]"
              }`}
            >
              List ({filteredDestinations.length})
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-custom border-t border-[#E6E1D6] pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] mr-1 shrink-0 flex items-center gap-1">
            <Filter size={11} /> Filter:
          </span>
          {MAP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#203E2D] text-white shadow-2xs"
                  : "bg-[#FAF7F2] text-[#57534E] hover:bg-[#E6E1D6] border border-[#E6E1D6]"
              }`}
            >
              {cat.id !== "all" && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Summary & Active Constraints */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#78716C] pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#252B26] font-semibold">{filteredDestinations.length}</strong> of{" "}
              {CURATED_DESTINATIONS.length} verified destinations
            </span>
            {(selectedDistrict !== "all" ||
              selectedCategory !== "all" ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#A45E45] hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <X size={12} /> Reset Filters
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#78716C]">
            <span>Map data &copy; OpenStreetMap contributors</span>
          </div>
        </div>
      </div>

      {/* Offline Save Feedback Toast */}
      {saveSuccessMsg && (
        <div className="p-3 bg-[#203E2D]/10 border border-[#203E2D]/20 text-[#203E2D] rounded-lg text-xs font-medium flex items-center justify-between animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#203E2D] shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <Link
            to="/offline-library"
            className="text-xs text-[#203E2D] underline font-semibold hover:text-[#2C523C]"
          >
            Open Offline Library
          </Link>
        </div>
      )}

      {/* Main Interactive Map & Destination Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container Column */}
        <div
          className={`lg:col-span-7 xl:col-span-8 sticky top-24 ${
            viewMode === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="relative h-[500px] sm:h-[580px] lg:h-[640px] w-full">
            <TourismMap
              destinations={filteredDestinations}
              selectedDestination={activeDestination}
              selectedDistrict={selectedDistrict}
              onSelectDestination={dest => setSelectedDestination(dest)}
            />
          </div>

          {/* Map Info Bar */}
          <div className="mt-2.5 px-4 py-2.5 bg-white rounded-lg border border-[#E6E1D6] flex flex-wrap items-center justify-between text-[11px] text-[#78716C] gap-2">
            <span className="flex items-center gap-1.5 font-medium text-[#57534E]">
              <Info size={13} className="text-[#203E2D] shrink-0" />
              Click any marker to view details and launch navigation directions.
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716C]">
              <span>Center: {DISTRICT_CENTERS[selectedDistrict]?.name || "Nagaland"}</span>
            </div>
          </div>
        </div>

        {/* Destination List Column */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-4 ${
            viewMode === "map" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-serif text-lg font-bold text-[#252B26] flex items-center gap-1.5">
              <span>Destinations</span>
              <span className="text-xs font-sans font-normal text-[#78716C]">
                ({filteredDestinations.length})
              </span>
            </h3>

            <span className="text-[11px] text-[#78716C]">
              Click card to locate on map
            </span>
          </div>

          {/* Destination Cards List */}
          {filteredDestinations.length === 0 ? (
            <div className="p-8 editorial-card text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] mx-auto flex items-center justify-center text-[#78716C]">
                <MapPin size={22} />
              </div>
              <h4 className="font-serif text-base font-bold text-[#252B26]">
                No Destinations Found
              </h4>
              <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                No verified sites match your current filters. Try resetting your district, category, or search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 rounded-lg bg-[#203E2D] hover:bg-[#2C523C] text-white font-semibold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-custom">
              {filteredDestinations.map(dest => {
                const isSelected = activeDestination?.id === dest.id;
                const isSaved = offlineStatus[dest.id];
                const googleUrl = getExternalNavigationUrl(dest.latitude, dest.longitude, "google");

                return (
                  <div
                    key={dest.id}
                    onClick={() => {
                      setSelectedDestination(dest);
                      if (window.innerWidth < 1024) {
                        setViewMode("map");
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group space-y-3 ${
                      isSelected
                        ? "bg-[#FAF7F2] border-[#203E2D] shadow-sm ring-1 ring-[#203E2D]"
                        : "bg-white border-[#E6E1D6] hover:border-[#203E2D]/40 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        {/* Compact Image Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#E6E1D6] bg-[#FAF7F2]">
                          <ManagedImage
                            imageId={dest.imageId}
                            alt={dest.name}
                            category={dest.category}
                            aspectRatioClass="aspect-square"
                            showAttribution={false}
                            sizes="64px"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Top Badges */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="editorial-tag text-[#A45E45] bg-[#A45E45]/10 border-[#A45E45]/20">
                              {dest.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={e => handleSaveOffline(dest, e)}
                                className={`p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                                  isSaved
                                    ? "bg-[#203E2D]/10 text-[#203E2D] border-[#203E2D]/30"
                                    : "bg-white text-[#78716C] hover:text-[#252B26] border-[#E6E1D6]"
                                }`}
                                title={isSaved ? "Saved for offline access" : "Save offline"}
                              >
                                <Bookmark size={12} className={isSaved ? "fill-[#203E2D]" : ""} />
                              </button>
                            </div>
                          </div>

                          {/* Title & District */}
                          <div>
                            <h4 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug truncate">
                              {dest.name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-[#78716C]">
                              <MapPin size={11} className="text-[#A45E45] shrink-0" />
                              <span>{dest.districtName} District</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {dest.description && (
                        <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2.5 border-t border-[#E6E1D6] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#57534E] hover:text-[#203E2D] bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#E6E1D6]"
                          title="Open Google Maps directions"
                        >
                          <Navigation size={11} className="text-[#A45E45]" />
                          <span>Directions</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {dest.detailPath && (
                          <Link
                            to={dest.detailPath}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:underline"
                          >
                            <span>Details</span>
                            <ArrowRight size={11} />
                          </Link>
                        )}
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                            isSelected
                              ? "bg-[#203E2D] text-white"
                              : "bg-[#FAF7F2] text-[#57534E] group-hover:bg-[#E6E1D6]"
                          }`}
                        >
                          {isSelected ? "Active on Map" : "Pin Location"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cartographic Attribution */}
      <SourceAttribution
        source="OpenStreetMap geospatial data and regional field coordinates."
      />
    </div>
  );
}
