import { useState } from "react";
import {
  Trees,
  Search,
  ShieldAlert,
  PlusCircle,
  X,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import SpeciesCard from "./SpeciesCard";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import NagaWeavingDivider from "../NagaWeavingDivider";
import {
  FAUNA_FLORA_CATEGORIES,
  SPECIES_REGISTRY,
  DISTRICTS_REGISTRY
} from "../../data/tourismData";

export default function FloraFaunaView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecies, setActiveSpecies] = useState(null);

  const filteredSpecies = SPECIES_REGISTRY.filter(sp => {
    const matchCat =
      selectedCategory === "all" || sp.category === selectedCategory;
    const matchDistrict =
      selectedDistrict === "all" ||
      sp.districtIds?.includes(selectedDistrict);
    const matchSearch =
      searchQuery === "" ||
      sp.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.scientificName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.habitat?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchDistrict && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="Biodiversity & Ecology"
        badgeIcon={Trees}
        title="Flora & Fauna of Nagaland"
        subtitle="A conservation-first directory of Nagaland's rich biodiversity — from Blyth's Tragopan and Amur Falcons to virgin subtropical rainforests and mountain rhododendron groves."
        breadcrumbs={[{ label: "Flora & Fauna" }]}
      />

      <NagaWeavingDivider />

      {/* Conservation & Anti-Poaching Sensitivity Banner */}
      <div className="editorial-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-white via-white to-[#203E2D]/5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#203E2D] bg-[#203E2D]/10 px-2.5 py-1 rounded-full border border-[#203E2D]/20">
            <ShieldAlert size={13} /> Ecological Sensitivity & Conservation Protocol
          </div>
          <h2 className="font-serif text-xl font-bold text-[#252B26]">
            Protection of Endangered & Endemic Wildlife Habitats
          </h2>
          <p className="text-xs text-[#57534E] leading-relaxed max-w-2xl">
            To prevent poaching and habitat destruction, NagaQuest strictly follows IUCN ethical guidelines. Precise nesting locations and GPS coordinates of vulnerable or endemic species are never published publicly. Species entries require validation from forestry and botanical authorities.
          </p>
        </div>

        <Link
          to="/community-portal"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#203E2D] hover:bg-[#2C523C] text-white transition-all shadow-xs shrink-0"
        >
          <PlusCircle size={14} /> Submit Flora / Fauna Record
        </Link>
      </div>

      {/* Category Pills & Filters */}
      <div className="editorial-card p-5 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-custom">
          {FAUNA_FLORA_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#203E2D] text-white shadow-xs"
                  : "bg-[#FAF7F2] text-[#57534E] hover:bg-[#E6E1D6] hover:text-[#252B26]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* District & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E6E1D6]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin size={15} className="text-[#A45E45] shrink-0" />
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E6E1D6] rounded-lg text-xs font-medium text-[#252B26] focus:border-[#203E2D] focus:outline-none w-full sm:w-60"
            >
              <option value="all">All Districts</option>
              {DISTRICTS_REGISTRY.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]"
            />
            <input
              type="text"
              placeholder="Search common name, genus, or habitat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] text-xs text-[#252B26] placeholder-[#78716C] focus:border-[#203E2D] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Species or Empty State */}
      {filteredSpecies.length === 0 ? (
        <TourismEmptyState
          icon={Trees}
          title="Biodiversity Catalog in Peer Review"
          description="The Flora & Fauna directory is in boilerplate initialization. In compliance with NagaQuest integrity guidelines, botanical and zoological records will only be published after verified field documentation from accredited surveys or community sanctuary councils."
          actionText="Contribute Biodiversity Record"
          actionTo="/community-portal"
          categoryLabel="Flora & Fauna"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map(sp => (
            <SpeciesCard
              key={sp.id}
              species={sp}
              onSelect={item => setActiveSpecies(item)}
            />
          ))}
        </div>
      )}

      {/* Species Detail Modal */}
      {activeSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E6E1D6] shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20 mb-1 inline-block">
                  {activeSpecies.category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#252B26]">
                  {activeSpecies.commonName}
                </h3>
                {activeSpecies.scientificName && (
                  <p className="text-xs italic text-[#78716C] font-serif mt-0.5">
                    {activeSpecies.scientificName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveSpecies(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#E6E1D6] flex items-center justify-center text-[#57534E] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#57534E] leading-relaxed">
              <p>{activeSpecies.description}</p>

              {activeSpecies.habitat && (
                <div className="p-3.5 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6]">
                  <span className="font-semibold text-[#252B26] block mb-1">
                    Habitat & Ecosystem:
                  </span>
                  <p>{activeSpecies.habitat}</p>
                </div>
              )}

              {activeSpecies.conservationStatus && (
                <div className="p-3.5 bg-[#A45E45]/10 rounded-lg border border-[#A45E45]/20 text-[#A45E45]">
                  <span className="font-semibold block mb-1">
                    Conservation Status:
                  </span>
                  <p>{activeSpecies.conservationStatus}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E1D6] flex justify-end">
              <button
                onClick={() => setActiveSpecies(null)}
                className="px-4 py-2 bg-[#203E2D] hover:bg-[#2C523C] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      <SourceAttribution
        source="Nagaland Biodiversity Strategy & Community Conservation Records"
        provider="Forest & Botanical Stewards"
      />
    </div>
  );
}
