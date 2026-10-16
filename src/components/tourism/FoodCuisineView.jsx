import { useState } from "react";
import {
  Utensils,
  Search,
  PlusCircle,
  X,
  Flame,
  Sparkles,
  Users,
  Leaf,
  Camera,
  ExternalLink,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import CuisineCard from "./CuisineCard";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import { ManagedImage } from "../images";
import { CUISINE_CATEGORIES, CUISINE_REGISTRY } from "../../data/tourismData";

export default function FoodCuisineView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const filteredItems = CUISINE_REGISTRY.filter(item => {
    const matchCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.community?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ingredients?.some(ing =>
        ing.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="Gastronomic Heritage"
        badgeIcon={Utensils}
        title="Taste of Nagaland: Exploring Naga Cuisine"
        subtitle="A cultural immersion into highland agriculture, sacred domestic hearths, ancient fermentation, and shared kinship meals across Nagaland's indigenous communities."
        breadcrumbs={[{ label: "Food & Cuisine" }]}
      />

      {/* SECTION 1: AN INTRODUCTION TO NAGA FOOD */}
      <section className="editorial-card p-6 sm:p-10 space-y-6">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A45E45] bg-[#A45E45]/8 px-2.5 py-0.5 rounded-full border border-[#A45E45]/20">
            <Sparkles size={11} /> Culinary Foundations & Agrarian Roots
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#252B26] tracking-tight">
            An Introduction to Naga Food
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm text-[#5C645E] leading-relaxed">
            <p>
              Nagaland’s culinary landscape is an authentic reflection of the state’s rugged mountain topography, extraordinary biodiversity, and centuries-old agricultural traditions. Rooted in terrace cultivation, jhum farming, and forest foraging, meals are intimately woven into the rhythms of seasonal weather, household labor, and village fellowship.
            </p>
            <p>
              Highland rice forms the nourishing foundation of virtually every meal, eaten in generous helpings alongside boiled, smoked, or roasted meats, freshwater river fish, vibrant mountain greens, and fermented seasonings. Flavours are characterized by deep wood smoke from kitchen hearths, the natural tang of fermented bamboo shoots (<em>bastenga</em>), the intense savory umami of fermented soybeans (<em>axone</em>), and an astonishing variety of native chillies.
            </p>
            <p>
              Traditional Naga cookery relies predominantly on boiling, hearth-smoking, roasting over coals, and steaming inside freshly cut green bamboo cylinders. Rather than masking ingredients with heavy commercial cooking oils or artificial spices, dishes celebrate the pure, unadorned flavours of fresh produce, mountain spring water, and indigenous herbs.
            </p>
            
            <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-xs text-[#252B26] space-y-1">
              <strong className="block text-[#203E2D] font-bold uppercase tracking-wider text-[11px]">
                A Living Mosaic of Diverse Communities
              </strong>
              <p className="text-[#5C645E]">
                Naga cuisine is never a single, uniform culinary monolith. Each of Nagaland’s 16+ recognized indigenous communities—such as the Angami, Ao, Sümi, Lotha, Chakhesang, Zeliang, Konyak, and Yimkhiung—maintains its own specific recipes, preservation techniques, and ingredient pairings.
              </p>
            </div>
          </div>

          {/* Core Pillars Quick-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-center space-y-1">
              <span className="text-xl">🌾</span>
              <h4 className="text-xs font-bold text-[#252B26]">Highland Rice</h4>
              <p className="text-[10px] text-[#848E86]">Staple nourishment foundation</p>
            </div>
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-center space-y-1">
              <span className="text-xl">🪵</span>
              <h4 className="text-xs font-bold text-[#252B26]">Hearth Smoke</h4>
              <p className="text-[10px] text-[#848E86]">Ancient curing & drying</p>
            </div>
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-center space-y-1">
              <span className="text-xl">🎍</span>
              <h4 className="text-xs font-bold text-[#252B26]">Bamboo Vessels</h4>
              <p className="text-[10px] text-[#848E86]">Natural steaming & fermentation</p>
            </div>
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-center space-y-1">
              <span className="text-xl">🌶️</span>
              <h4 className="text-xs font-bold text-[#252B26]">King Chillies</h4>
              <p className="text-[10px] text-[#848E86]">GI-tagged Raja Mircha</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRADITIONAL COOKING AND FOOD CULTURE */}
      <section className="space-y-4">
        <div className="border-b border-[#E6E1D6] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45E45]">
            Hearth, Heritage & Fellowship
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#252B26] mt-0.5">
            Traditional Cooking and Food Culture
          </h2>
          <p className="text-xs text-[#5C645E]">
            The practical wisdom developed around mountain environments, domestic gathering spaces, and kinship bonds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: The Traditional Hearth */}
          <div className="editorial-card p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-center text-[#A45E45]">
                <Flame size={18} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#252B26]">
                The Traditional Hearth
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                The hearth is the beating heart of the Naga home. Suspended above the constant wood fire are multi-tiered bamboo racks where meats, fish, and seeds are cured over weeks and months.
              </p>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                This continuous smoke provides natural dehydration against monsoonal humidity, eliminating the need for refrigeration while infusing proteins with a deep rustic aroma.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#E6E1D6] text-[10px] font-semibold text-[#A45E45]">
              Focus: Ancient food preservation & domestic sanctuary
            </div>
          </div>

          {/* Pillar 2: Rice, Meat, Vegetables & Chilli */}
          <div className="editorial-card p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-center text-[#203E2D]">
                <Leaf size={18} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#252B26]">
                Rice, Meat, Greens & Chilli
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                A classic Naga meal achieves harmony through balance. The comforting neutrality of steaming highland rice balances both ends of the flavor spectrum: clean, oil-free boiled greens and intense smoked meat gravies.
              </p>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Pounded chilli relishes provide customizable heat and acidity, incorporating wild garlic, fermented shoots, or roasted mountain tomatoes.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#E6E1D6] text-[10px] font-semibold text-[#203E2D]">
              Focus: Balance between clean boiling & fiery condiments
            </div>
          </div>

          {/* Pillar 3: Food, Family & Community */}
          <div className="editorial-card p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-center text-[#C68A36]">
                <Users size={18} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#252B26]">
                Food, Family & Community
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                In Naga tradition, food is an expression of hospitality, kinship, and community solidarity. During agricultural work bees (<em>penna</em>) and harvest festivals, large communal cauldrons are shared among neighbors.
              </p>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                The most authentic culinary experiences happen around home hearths rather than commercial dining halls.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#E6E1D6] text-[10px] font-semibold text-[#C68A36]">
              Focus: Hospitality, reciprocal labor & social fellowship
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DISHES AND INGREDIENTS TO DISCOVER */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45E45]">
              Gastronomic Archive
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#252B26] mt-0.5">
              Dishes & Heirloom Ingredients
            </h2>
            <p className="text-xs text-[#5C645E]">
              Explore {CUISINE_REGISTRY.length} documented dishes, slow-fermented specialties, and mountain relishes.
            </p>
          </div>
          <span className="editorial-tag text-[10px] self-start sm:self-auto">
            Showing {filteredItems.length} of {CUISINE_REGISTRY.length} dishes
          </span>
        </div>

        {/* Category Filter Pills & Search Toolbar */}
        <div className="editorial-card p-4 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-custom">
            {CUISINE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-[#203E2D] text-white shadow-xs"
                    : "bg-[#F7F5EF] text-[#5C645E] hover:text-[#203E2D] hover:bg-[#EAE5D9]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E6E1D6]">
            <div className="relative w-full sm:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E86]"
              />
              <input
                type="text"
                placeholder="Search dish, ingredient, or community..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-8 pr-3 rounded-md border-[#E6E1D6] bg-[#F7F5EF] text-xs focus:border-[#203E2D] focus:outline-hidden"
              />
            </div>

            <div className="text-xs text-[#848E86]">
              Category: <strong className="text-[#252B26]">{CUISINE_CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong>
            </div>
          </div>
        </div>

        {/* Responsive Grid of Dishes */}
        {filteredItems.length === 0 ? (
          <TourismEmptyState
            icon={Utensils}
            title="No Culinary Entries Found"
            description={`No dishes match your search query "${searchQuery}" in category "${CUISINE_CATEGORIES.find(c => c.id === selectedCategory)?.label}". Try clearing your search or browsing all categories.`}
            actionText="View All Dishes"
            actionTo="/tourism/food"
            categoryLabel="Food & Cuisine"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <CuisineCard
                key={item.id}
                item={item}
                onSelect={selected => setActiveItem(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CUISINE DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="editorial-card max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header & Badges */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E1D6] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="editorial-tag text-[9px]">
                    {activeItem.category}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#252B26] leading-snug">
                  {activeItem.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C645E] font-medium mt-1">
                  {activeItem.community && (
                    <span className="inline-flex items-center gap-1 text-[#203E2D] font-semibold">
                      <Users size={11} /> {activeItem.community}
                    </span>
                  )}
                  {activeItem.district && (
                    <span className="inline-flex items-center gap-1 text-[#5C645E]">
                      <MapPin size={11} className="text-[#A45E45]" /> {activeItem.district} District
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-md text-[#848E86] hover:text-[#252B26] transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Food Image */}
            <div className="rounded-lg overflow-hidden border border-[#E6E1D6]">
              <ManagedImage
                imageId={activeItem.imageId}
                alt={activeItem.imageAlt || `${activeItem.name}, traditional cuisine`}
                category="food"
                aspectRatioClass="aspect-16/9"
                showAttribution={false}
              />
            </div>

            {/* Descriptions */}
            <div className="space-y-3 text-xs text-[#5C645E] leading-relaxed">
              <div>
                <span className="font-bold text-[#252B26] block mb-0.5 uppercase tracking-wider text-[10px]">
                  Culinary Summary:
                </span>
                <p>{activeItem.description}</p>
              </div>

              {activeItem.detailedDescription && (
                <div>
                  <span className="font-bold text-[#252B26] block mb-0.5 uppercase tracking-wider text-[10px]">
                    Detailed Preparation & Technique:
                  </span>
                  <p>{activeItem.detailedDescription}</p>
                </div>
              )}

              {/* Documented Ingredients */}
              {activeItem.ingredients && activeItem.ingredients.length > 0 && (
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1.5">
                  <span className="font-bold text-[#252B26] block text-[10px] uppercase tracking-wider">
                    Documented Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeItem.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white text-[#252B26] border border-[#E6E1D6] font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Context */}
              {activeItem.culturalContext && (
                <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
                  <span className="font-bold text-[#203E2D] block text-[10px] uppercase tracking-wider">
                    Cultural & Hearth Significance:
                  </span>
                  <p className="italic text-[#5C645E] text-xs">
                    {activeItem.culturalContext}
                  </p>
                </div>
              )}

              {/* Provenance Metadata */}
              <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] text-[11px] space-y-1 text-[#848E86]">
                <div>
                  <strong className="text-[#252B26]">Verification Status: </strong>
                  <span>{activeItem.verificationStatus || "Verified community entry"}</span>
                </div>
                <div>
                  <strong className="text-[#252B26]">Documentation Source: </strong>
                  <span>{activeItem.source || "Department of Tourism Records"}</span>
                </div>
                {activeItem.sourceUrl && (
                  <div>
                    <a
                      href={activeItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#203E2D] font-semibold hover:underline"
                    >
                      <span>Official Source Link</span> <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#E6E1D6] flex justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white text-xs font-semibold transition-colors"
              >
                Close Dish Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DISCOVERING NAGA CUISINE RESPONSIBLY */}
      <section className="editorial-card p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#E6E1D6] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45E45]">
            Cultural Stewardship & Dining Etiquette
          </span>
          <h2 className="font-serif text-xl font-bold text-[#252B26] mt-0.5">
            Discovering Naga Cuisine Responsibly
          </h2>
          <p className="text-xs text-[#5C645E]">
            Nagaland’s culinary traditions are living heritage, deeply tied to land, ancestors, and domestic sacred spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#252B26]">
              <CheckCircle2 size={14} className="text-[#203E2D] shrink-0" />
              <span>Inquire About Community Context</span>
            </div>
            <p className="text-xs text-[#5C645E] leading-relaxed pl-5">
              Ask about the specific village, clan, or tribe associated with a dish rather than assuming it is universal across all Naga communities.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#252B26]">
              <Camera size={14} className="text-[#A45E45] shrink-0" />
              <span>Respect Private Kitchens & Hearths</span>
            </div>
            <p className="text-xs text-[#5C645E] leading-relaxed pl-5">
              Always ask explicit permission before photographing people, family kitchens, or preparation areas.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#252B26]">
              <Users size={14} className="text-[#203E2D] shrink-0" />
              <span>Credit Local Cooks & Stewards</span>
            </div>
            <p className="text-xs text-[#5C645E] leading-relaxed pl-5">
              When documenting or sharing recipes, acknowledge the local home cooks and elders who share their knowledge.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#252B26]">
              <Leaf size={14} className="text-[#203E2D] shrink-0" />
              <span>Honor Dietary Customs & Seasonal Ecology</span>
            </div>
            <p className="text-xs text-[#5C645E] leading-relaxed pl-5">
              Respect seasonal foraging limits, wildlife conservation rules, and community taboos.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E6E1D6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="text-[#5C645E]">
            Are you a local cook, researcher, or community elder with authentic recipe documentation?
          </div>
          <Link
            to="/community-portal"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white font-semibold transition-colors shrink-0"
          >
            <PlusCircle size={12} /> Submit Authentic Recipe
          </Link>
        </div>
      </section>

      {/* Source Attribution */}
      <SourceAttribution
        source="Nagaland Traditional Gastronomy Survey & Culinary Heritage Archive"
        provider="Department of Tourism & Indigenous Community Kitchens"
      />
    </div>
  );
}
