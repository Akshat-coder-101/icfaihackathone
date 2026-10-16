import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import DistrictCard from "./DistrictCard";
import TourismEmptyState from "./TourismEmptyState";
import { DISTRICTS_REGISTRY } from "../../data/tourismData";

export default function DistrictExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const regions = [
    { id: "all", label: "All Regions" },
    { id: "South-Western Hills", label: "South-Western Hills" },
    { id: "Southern Hills", label: "Southern Hills" },
    { id: "Western Plains & Foothills", label: "Western Plains" },
    { id: "Central Hills", label: "Central Hills" },
    { id: "Eastern Hills", label: "Eastern Hills" },
    { id: "North-Central Hills", label: "North-Central Hills" },
    { id: "Northern Frontier Hills", label: "Northern Frontier" }
  ];

  const filteredDistricts = DISTRICTS_REGISTRY.filter(d => {
    const matchSearch =
      searchQuery === "" ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.headquarters.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRegion =
      selectedRegion === "all" || d.region === selectedRegion;

    return matchSearch && matchRegion;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-Navigation Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="District Explorer"
        badgeIcon={MapPin}
        title="16 Districts of Nagaland"
        subtitle="Explore Nagaland district by district. Each district profile features heritage institutions, indigenous villages, traditional festivals, and travel access info."
        breadcrumbs={[{ label: "Districts" }]}
      />

      {/* Filter and Search Bar */}
      <div className="editorial-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E86]"
            />
            <input
              type="text"
              placeholder="Search district name, tribe, or HQ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-sm w-full pl-8 pr-3 rounded-md border-[#E6E1D6] bg-[#F7F5EF] text-xs focus:border-[#203E2D] focus:outline-hidden"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="select select-sm bg-[#F7F5EF] border-[#E6E1D6] rounded-md text-xs font-medium text-[#252B26] focus:border-[#203E2D] focus:outline-hidden"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-[#5C645E] px-1">
          <span>
            Showing {filteredDistricts.length} of {DISTRICTS_REGISTRY.length} registered districts
          </span>
          <span className="editorial-tag text-[9px]">
            District Topology
          </span>
        </div>

        {filteredDistricts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDistricts.map(district => (
              <DistrictCard key={district.id} district={district} />
            ))}
          </div>
        ) : (
          <TourismEmptyState
            title="No Districts Match Your Criteria"
            description="Try loosening your search query or selecting a different geographic region."
            onReset={() => {
              setSearchQuery("");
              setSelectedRegion("all");
            }}
          />
        )}
      </div>
    </div>
  );
}
