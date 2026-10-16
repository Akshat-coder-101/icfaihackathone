import { useState } from "react";
import { Hotel, Search, MapPin, PlusCircle, X, ShieldAlert, ExternalLink, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import AccommodationCard from "./AccommodationCard";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import {
  STAY_CATEGORIES,
  ACCOMMODATION_REGISTRY,
  DISTRICTS_REGISTRY
} from "../../data/tourismData";

export default function AccommodationsView() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStay, setActiveStay] = useState(null);

  const filteredStays = ACCOMMODATION_REGISTRY.filter(stay => {
    const matchType = selectedType === "all" || stay.type === selectedType;
    const matchDistrict =
      selectedDistrict === "all" ||
      stay.districtId?.toLowerCase() === selectedDistrict.toLowerCase();
    const matchSearch =
      searchQuery === "" ||
      stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchType && matchDistrict && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-Navigation Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="Accommodation Directory"
        badgeIcon={Hotel}
        title="Hotels, Homestays & Lodging"
        subtitle="Discover verified village homestays, eco-camps, government circuit houses, and hotels across the districts of Nagaland."
        breadcrumbs={[{ label: "Hotels & Stays" }]}
      />

      {/* Policy Notice: Direct Host Connection */}
      <div className="editorial-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A45E45] bg-[#A45E45]/8 px-2.5 py-0.5 rounded-full border border-[#A45E45]/20">
            <ShieldAlert size={12} /> Verified Lodging Directory
          </div>
          <h2 className="font-serif text-lg font-bold text-[#252B26]">
            Direct Host Connection & No Commercial Commission
          </h2>
          <p className="text-xs text-[#5C645E] leading-relaxed max-w-2xl">
            NagaQuest supports community-run village homestays and registered hotels. We do not act as an online travel agency (OTA), collect booking fees, or fabricate guest ratings. Listings include direct contact details and official external links.
          </p>
        </div>

        <Link
          to="/community-portal"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white text-xs font-semibold transition-colors shrink-0"
        >
          <PlusCircle size={13} /> Register Homestay / Stay
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="editorial-card p-4 space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-custom">
          {STAY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                selectedType === cat.id
                  ? "bg-[#203E2D] text-white shadow-xs"
                  : "bg-[#F7F5EF] text-[#5C645E] hover:text-[#203E2D] hover:bg-[#EAE5D9]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* District and Search Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E6E1D6]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin size={13} className="text-[#A45E45] shrink-0" />
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="select select-sm bg-[#F7F5EF] border-[#E6E1D6] rounded-md text-xs font-medium text-[#252B26] focus:border-[#203E2D] focus:outline-hidden w-full sm:w-60"
            >
              <option value="all">All 16 Districts</option>
              {DISTRICTS_REGISTRY.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E86]"
            />
            <input
              type="text"
              placeholder="Search stay name or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-sm w-full pl-8 pr-3 rounded-md border-[#E6E1D6] bg-[#F7F5EF] text-xs focus:border-[#203E2D] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-[#5C645E] px-1">
          <span>
            Showing {filteredStays.length} of {ACCOMMODATION_REGISTRY.length} registered stays
          </span>
          <span className="editorial-tag text-[9px]">
            Direct Host Listings
          </span>
        </div>

        {filteredStays.length === 0 ? (
          <TourismEmptyState
            icon={Hotel}
            title="No Accommodations Found"
            description="Try selecting a different district, category, or clearing your search query."
            actionText="View All Stays"
            actionTo="/tourism/stays"
            onReset={() => {
              setSelectedType("all");
              setSelectedDistrict("all");
              setSearchQuery("");
            }}
            categoryLabel="Accommodations Directory"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStays.map(stay => (
              <AccommodationCard
                key={stay.id}
                stay={stay}
                onSelect={s => setActiveStay(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail for Stay */}
      {activeStay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="editorial-card max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E6E1D6] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="editorial-tag text-[9px]">
                    {activeStay.type}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#252B26]">
                  {activeStay.name}
                </h3>
                <p className="text-xs text-[#5C645E]">
                  {activeStay.address}
                </p>
              </div>

              <button
                onClick={() => setActiveStay(null)}
                className="p-1 rounded-md text-[#848E86] hover:text-[#252B26] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5C645E] leading-relaxed">
              {activeStay.description}
            </p>

            {activeStay.contact && (
              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-xs flex items-center gap-2 text-[#252B26]">
                <Phone size={13} className="text-[#203E2D]" />
                <span>Contact: {activeStay.contact}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#E6E1D6] flex items-center justify-between">
              {activeStay.externalUrl ? (
                <a
                  href={activeStay.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45]"
                >
                  <span>Official Website</span>
                  <ExternalLink size={11} />
                </a>
              ) : <div />}

              <button
                onClick={() => setActiveStay(null)}
                className="px-4 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Attribution */}
      <SourceAttribution
        source="Nagaland Tourism Department Accommodation Directory"
        provider="Nagaland Tourism Development Corporation (NTDC) & Village Councils"
      />
    </div>
  );
}
