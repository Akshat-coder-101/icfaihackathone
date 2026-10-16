import { useState } from "react";
import { useParams } from "react-router-dom";
import { Compass, Search, AlertCircle } from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import VillageCard from "./VillageCard";
import TourismEmptyState from "./TourismEmptyState";
import { DISTRICTS_REGISTRY } from "../../data/tourismData";

export default function DistrictVillagesPage() {
  const { districtId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

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
          description="The requested district ID is not currently registered in the database."
          actionText="Back to District Explorer"
          actionTo="/tourism/districts"
        />
      </div>
    );
  }

  const villages = district.villages || [];

  const filteredVillages = villages.filter(v => {
    return (
      searchQuery === "" ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.highlights?.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText={`${district.name} Villages`}
        badgeIcon={Compass}
        title={`${district.name} Village Directory`}
        subtitle={`Discover historic settlements, traditional dormitory houses (Morungs), community conservation areas, and indigenous cultural life in ${district.name} District.`}
        showBack={true}
        breadcrumbs={[
          { to: "/tourism/districts", label: "Districts" },
          { to: `/tourism/districts/${district.id}`, label: district.name },
          { label: "Villages" }
        ]}
      />

      {/* Search Bar */}
      <div className="editorial-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E86]"
          />
          <input
            type="text"
            placeholder="Search village name or highlight..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-8 pr-3 rounded-md border-[#E6E1D6] bg-[#F7F5EF] text-xs focus:border-[#203E2D] focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-[#5C645E]">
          Showing <strong className="text-[#252B26]">{filteredVillages.length}</strong> of{" "}
          {villages.length} documented villages
        </div>
      </div>

      {/* Grid of Villages or Empty State */}
      {filteredVillages.length === 0 ? (
        <TourismEmptyState
          icon={Compass}
          title={
            villages.length === 0
              ? `No Villages Yet for ${district.name} District`
              : "No Villages Match Your Search"
          }
          description={
            villages.length === 0
              ? `Village records for ${district.name} are pending community documentation and verification.`
              : "Try clearing your search query to see all documented villages."
          }
          actionText={villages.length === 0 ? "Explore Other Districts" : "Clear Search"}
          actionTo={villages.length === 0 ? "/tourism/districts" : undefined}
          onReset={villages.length > 0 ? () => setSearchQuery("") : undefined}
          categoryLabel={`${district.name} Villages`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVillages.map(village => (
            <VillageCard
              key={village.id}
              village={village}
              districtName={district.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
