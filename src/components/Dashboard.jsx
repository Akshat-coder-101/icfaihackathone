import { useNavigate } from "react-router-dom";
import {
  Compass,
  BookOpen,
  ArrowRight,
  MapPin,
  Utensils,
  Trees,
  Home as HomeIcon,
  ChevronRight
} from "lucide-react";
import ResponsiveImage from "./images/ResponsiveImage";
import { getImageAsset } from "../data/images/imageHelpers";

export default function Dashboard() {
  const navigate = useNavigate();

  const heroImage = getImageAsset("peren-overview");
  const benreuImage = getImageAsset("benreu-village");
  const poilwaImage = getImageAsset("poilwa-sheep-farm");
  const morungImage = getImageAsset("rehangki-morung");
  const foodPlaceholder = getImageAsset("placeholder-food");
  const districtPlaceholder = getImageAsset("placeholder-district");

  // Section 2: Explore Nagaland 4 Discovery Cards
  const discoveryCards = [
    {
      id: "destinations",
      title: "Destinations",
      description: "From misty ridge sanctuaries to historic heritage landmarks across the hills.",
      asset: heroImage,
      icon: <Compass size={18} className="text-[#203E2D]" />,
      path: "/tourism",
      actionText: "Explore destinations"
    },
    {
      id: "villages",
      title: "Villages and Communities",
      description: "Experience traditional Morungs, terraced hill farming, and indigenous village life.",
      asset: benreuImage,
      icon: <HomeIcon size={18} className="text-[#203E2D]" />,
      path: "/tourism/districts/peren/villages",
      actionText: "Discover villages"
    },
    {
      id: "food",
      title: "Food and Cuisine",
      description: "Centuries of hearth cooking, smoked delicacies, and natural forest fermentation.",
      asset: foodPlaceholder,
      icon: <Utensils size={18} className="text-[#203E2D]" />,
      path: "/tourism/food",
      actionText: "Taste of Nagaland"
    },
    {
      id: "wildlife",
      title: "Nature and Wildlife",
      description: "Highland ecosystems, sacred biodiversity corridors, and endemic mountain flora.",
      asset: poilwaImage,
      icon: <Trees size={18} className="text-[#203E2D]" />,
      path: "/tourism/flora-fauna",
      actionText: "Explore wildlife"
    }
  ];

  // Section 4: Currently Supported Districts
  const supportedDistricts = [
    {
      id: "kohima",
      name: "Kohima",
      headquarters: "Kohima",
      region: "Southern Hills",
      description: "The capital of Nagaland and heartland of the Angami people, home to Khonoma Green Village and the Dzukou Valley.",
      asset: districtPlaceholder,
      path: "/tourism/districts/kohima"
    },
    {
      id: "peren",
      name: "Peren",
      headquarters: "Peren",
      region: "South-Western Highlands",
      description: "Heartland of the Zeliang community, characterized by Mt. Pauna, high-altitude conservation villages, and pristine Barail ridgelines.",
      asset: heroImage,
      path: "/tourism/districts/peren"
    },
    {
      id: "dimapur",
      name: "Dimapur",
      headquarters: "Dimapur",
      region: "Western Plains & Foothills",
      description: "The historic commercial gateway to Nagaland, known for the medieval Kachari monolith ruins and rich craft traditions.",
      asset: districtPlaceholder,
      path: "/tourism/districts/dimapur"
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-20 pb-8">
      
      {/* SECTION 1 — HERO: LEAD WITH EXPLORATION */}
      <section className="relative rounded-2xl overflow-hidden bg-[#203E2D] text-white shadow-sm border border-[#203E2D]">
        {/* Authentic Photograph with Subtle Gradient */}
        <div className="absolute inset-0 opacity-45 mix-blend-overlay">
          {heroImage && (
            <ResponsiveImage
              asset={heroImage}
              priority={true}
              imgClassName="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#172E21] via-[#203E2D]/85 to-transparent"></div>

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-16 space-y-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#E6E1D6]">
            Discover Nagaland
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            A land of extraordinary stories.
          </h1>

          <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xl">
            Explore the landscapes, traditions, communities, and living heritage of Nagaland.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/tourism")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FAF7F2] text-[#203E2D] text-xs font-semibold tracking-wide hover:bg-white hover:shadow-md transition-all cursor-pointer"
            >
              <Compass size={15} />
              <span>Explore Nagaland</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={() => navigate("/oral-archive")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 text-white text-xs font-semibold tracking-wide hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen size={15} />
              <span>Discover its culture</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2 — EXPLORE NAGALAND (4 DISCOVERY CARDS) */}
      <section className="space-y-6">
        <div className="border-b border-[#E6E1D6] pb-3">
          <h2 className="font-serif text-2xl font-bold text-[#252B26] tracking-tight">
            Explore Nagaland
          </h2>
          <p className="text-xs text-[#5C645E] mt-1">
            Browse destinations, settlements, culinary practices, and natural habitats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {discoveryCards.map((card) => (
            <article
              key={card.id}
              onClick={() => navigate(card.path)}
              className="editorial-card group cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden bg-[#F2EFE8] relative flex items-center justify-center">
                  {card.asset ? (
                    <ResponsiveImage
                      asset={card.asset}
                      imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#EDE8DE] text-[#203E2D]">
                      {card.icon}
                      <span className="text-xs font-semibold mt-2">{card.title}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#5C645E] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-[#E6E1D6]/60 flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45] transition-colors">
                <span>{card.actionText}</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3 — STORIES FROM NAGALAND */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E6E1D6] pb-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#252B26] tracking-tight">
              Stories from Nagaland
            </h2>
            <p className="text-xs text-[#5C645E] mt-1">
              Selected accounts of cultural traditions, food, craftsmanship, and community life.
            </p>
          </div>
          <button
            onClick={() => navigate("/oral-archive")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Browse archive</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Large Story Card */}
          <article
            onClick={() => navigate("/tourism/districts/peren")}
            className="editorial-card lg:col-span-7 group cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/10 overflow-hidden bg-[#F2EFE8] relative">
                {benreuImage && (
                  <ResponsiveImage
                    asset={benreuImage}
                    imgClassName="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-6 space-y-2.5">
                <div className="text-[11px] font-semibold text-[#A45E45] flex items-center gap-1">
                  <MapPin size={11} />
                  <span>Peren District</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                  Highland Sanctuary of Benreu & Mt. Pauna
                </h3>
                <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
                  Perched along the cloudline of Mt. Pauna, Benreu preserves centuries-old stone pathways, Zeliang Morung traditions, and community-led conservation forests.
                </p>
              </div>
            </div>

            <div className="px-6 pb-5 pt-2 border-t border-[#E6E1D6]/60 flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45] transition-colors">
              <span>Read article</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </article>

          {/* Two Smaller Story Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <article
              onClick={() => navigate("/heritage-atlas")}
              className="editorial-card flex-1 group cursor-pointer overflow-hidden flex flex-col sm:flex-row justify-between"
            >
              {morungImage?.src && (
                <div className="sm:w-44 h-40 sm:h-auto shrink-0 overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={morungImage.src}
                    alt={morungImage.alt || "Rehangki Morung"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#A45E45]">
                    Customary Architecture
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                    The Architecture of the Rehangki Morung
                  </h3>
                  <p className="text-xs text-[#5C645E] leading-relaxed line-clamp-2">
                    Steep hand-thatched eaves and massive carved timber pillars that historically served as community academies and ceremonial centers.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E1D6]/60 flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45] transition-colors mt-2">
                  <span>View heritage record</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>

            <article
              onClick={() => navigate("/tourism/districts/peren")}
              className="editorial-card flex-1 group cursor-pointer overflow-hidden flex flex-col sm:flex-row justify-between"
            >
              {poilwaImage?.src && (
                <div className="sm:w-44 h-40 sm:h-auto shrink-0 overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={poilwaImage.src}
                    alt={poilwaImage.alt || "Poilwa Terraces"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#A45E45]">
                    Highland Pastures
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                    High Pastures and Sustainable Agriculture in Poilwa
                  </h3>
                  <p className="text-xs text-[#5C645E] leading-relaxed line-clamp-2">
                    Terraced farming and community livestock management demonstrating harmonious living along pristine Barail mountain ridgelines.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E1D6]/60 flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45] transition-colors mt-2">
                  <span>Read article</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 4 — DISCOVER THE DISTRICTS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E6E1D6] pb-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#252B26] tracking-tight">
              Discover the Districts
            </h2>
            <p className="text-xs text-[#5C645E] mt-1">
              Explore documented districts across Nagaland's unique geographical regions.
            </p>
          </div>
          <button
            onClick={() => navigate("/tourism/districts")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#203E2D] hover:text-[#A45E45] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View all districts</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportedDistricts.map((district) => (
            <article
              key={district.id}
              onClick={() => navigate(district.path)}
              className="editorial-card group cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/9 bg-[#F2EFE8] relative overflow-hidden flex items-center justify-center">
                  {district.asset ? (
                    <ResponsiveImage
                      asset={district.asset}
                      imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAE5D9] text-[#252B26] p-4 text-center">
                      <span className="font-serif text-lg font-bold">{district.name}</span>
                      <span className="text-[11px] text-[#5C645E] mt-1">{district.region}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5C645E]">
                    <span className="font-medium text-[#A45E45]">{district.region}</span>
                    <span>HQ: {district.headquarters}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                    {district.name} District
                  </h3>
                  <p className="text-xs text-[#5C645E] line-clamp-3 leading-relaxed">
                    {district.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-[#E6E1D6]/60 flex items-center justify-between text-xs font-semibold text-[#203E2D] group-hover:text-[#A45E45] transition-colors">
                <span>Explore district</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 5 — LIVING CULTURAL HERITAGE */}
      <section className="editorial-card p-8 sm:p-10 lg:p-12 space-y-5 bg-[#FAF7F2] border border-[#E6E1D6]">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#252B26] tracking-tight">
            Discover the stories that shape Nagaland.
          </h2>
          <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
            Explore oral traditions, languages, crafts, and cultural knowledge shared by communities across Nagaland.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate("/oral-archive")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#203E2D] text-white text-xs font-semibold tracking-wide hover:bg-[#A45E45] transition-colors cursor-pointer"
          >
            <BookOpen size={15} />
            <span>Explore the cultural archive</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* SECTION 6 — COMMUNITY AND PRESERVATION */}
      <section className="editorial-card p-8 sm:p-10 lg:p-12 space-y-5 bg-white border border-[#E6E1D6]">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#252B26] tracking-tight">
            Heritage is preserved together.
          </h2>
          <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed">
            Learn how NagaQuest supports the documentation and preservation of cultural knowledge while respecting community permissions and access requirements.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate("/community-portal")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FAF7F2] text-[#203E2D] border border-[#E6E1D6] text-xs font-semibold tracking-wide hover:bg-[#EDE8DE] transition-colors cursor-pointer"
          >
            <span>Learn about our community approach</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

    </div>
  );
}
