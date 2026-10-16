import { useState, useEffect } from "react";
import {
  MapPin,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Download,
  PlusCircle,
  X,
  Navigation,
  Utensils,
  Hotel,
  Trees,
  Map
} from "lucide-react";
import TourismApiService, { REGIONAL_DIRECTORIES } from "../services/TourismApiService";
import offlineLibrary from "../services/offlineLibrary";
import ResponseMetaBadge from "./ResponseMetaBadge";
import TourismNavTabs from "./tourism/TourismNavTabs";
import TourismCategoryCard from "./tourism/TourismCategoryCard";

export default function TourismGuide() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchMeta, setFetchMeta] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityTips, setCommunityTips] = useState({});
  const [activeTipModalPlace, setActiveTipModalPlace] = useState(null);
  const [offlineSaved, setOfflineSaved] = useState({});
  const [tipFormData, setTipFormData] = useState({
    contributorRole: "Local Resident / Community Member",
    bestSeason: "",
    visitationProtocol: "",
    guideRecommendation: ""
  });
  const [tipSuccessMessage, setTipSuccessMessage] = useState(false);

  const categories = [
    { id: "all", label: "All Experiences" },
    { id: "village", label: "Heritage Villages" },
    { id: "viewpoint", label: "Sanctuaries & Peaks" },
    { id: "market", label: "Local Craft Markets" }
  ];

  const loadData = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await TourismApiService.fetchLiveTourismPlaces(force);
      if (result.error) {
        setError(result.error);
        setPlaces([]);
      } else {
        setPlaces(result.places || []);
        setFetchMeta({
          isCached: result.isCached,
          fetchedAt: result.fetchedAt,
          provider: result.provider,
          attribution: result.attribution,
          warning: result.networkWarning
        });
      }
      setCommunityTips(TourismApiService.getCommunityTips());
    } catch {
      setError("Unable to connect to live geographic service. NagaQuest never falls back to fabricated place names.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await TourismApiService.fetchLiveTourismPlaces(false);
        if (!active) return;
        if (result.error) {
          setError(result.error);
          setPlaces([]);
        } else {
          setPlaces(result.places || []);
          setFetchMeta({
            isCached: result.isCached,
            fetchedAt: result.fetchedAt,
            provider: result.provider,
            attribution: result.attribution,
            warning: result.networkWarning
          });
        }
        setCommunityTips(TourismApiService.getCommunityTips());
      } catch {
        if (active) {
          setError("Unable to connect to live geographic service. NagaQuest never falls back to fabricated place names.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveOffline = async (place, e) => {
    if (e) e.stopPropagation();
    try {
      await offlineLibrary.saveItem(place, "tourism");
      setOfflineSaved(prev => ({ ...prev, [place.placeId]: true }));
    } catch (err) {
      console.error("Failed to save offline:", err);
    }
  };

  const handleAddTipSubmit = e => {
    e.preventDefault();
    if (!activeTipModalPlace) return;

    TourismApiService.addCommunityTip(activeTipModalPlace.placeId, tipFormData);
    setCommunityTips(TourismApiService.getCommunityTips());
    setTipSuccessMessage(true);
    setTimeout(() => {
      setTipSuccessMessage(false);
      setActiveTipModalPlace(null);
      setTipFormData({
        contributorRole: "Local Resident / Community Member",
        bestSeason: "",
        visitationProtocol: "",
        guideRecommendation: ""
      });
    }, 1200);
  };

  const filteredPlaces = places.filter(place => {
    const matchRegion =
      selectedRegion === "all" ||
      place.regionTribeId?.toLowerCase() === selectedRegion.toLowerCase();
    const matchCategory =
      selectedCategory === "all" ||
      place.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      searchQuery === "" ||
      place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchRegion && matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Sub-Navigation Tabs */}
      <TourismNavTabs />

      {/* Top Editorial Banner */}
      <div className="bg-[#203E2D] text-[#FAF7F2] p-6 sm:p-8 rounded-xl shadow-xs relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#E6E1D6]">
            Explore Nagaland
          </p>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Discover Destinations Across Nagaland
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            A comprehensive travel directory covering destinations, heritage villages, seasonal festivals, local accommodations, and community travel guidelines across all 16 districts.
          </p>
        </div>

        {/* Subtle Attribution */}
        <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-white/60">
          <span>Cartography &copy; OpenStreetMap contributors.</span>
        </div>
      </div>

      <div className="editorial-hairline"></div>

      {/* Tourism Categories Navigation Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45E45]">
              State-Wide Framework
            </span>
            <h2 className="font-serif text-xl font-bold text-[#252B26] mt-0.5">
              Explore Nagaland by Category
            </h2>
          </div>
          <span className="text-xs text-[#5C645E]">
            Structured directories & district portals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TourismCategoryCard
            to="/tourism/districts"
            icon={MapPin}
            title="District Explorer"
            tagline="16 districts with village directories, Morungs, and travel access info."
            badgeText="Districts"
            meta="Peren, Kohima, Mon & more"
          />

          <TourismCategoryCard
            to="/tourism/map"
            icon={Map}
            title="Interactive Cartography"
            tagline="Explore destinations, Morungs, and wildlife sanctuaries on an interactive map layer."
            badgeText="Geographic"
            meta="OpenStreetMap Cartography"
          />

          <TourismCategoryCard
            to="/tourism/food"
            icon={Utensils}
            title="Culinary Heritage"
            tagline="Indigenous gastronomy, Axone, smoked delicacies, and culinary traditions."
            badgeText="Gastronomy"
            meta="18 Verified Dishes"
          />

          <TourismCategoryCard
            to="/tourism/best-time-to-visit"
            icon={Calendar}
            title="Seasons & Festivals"
            tagline="Seasonal travel planning across Spring, Summer, Monsoon, and Winter."
            badgeText="4 Seasons"
            meta="Festival Calendars"
          />

          <TourismCategoryCard
            to="/tourism/stays"
            icon={Hotel}
            title="Homestays & Lodging"
            tagline="Village homestays, eco-camps, circuit houses, and accommodation discovery."
            badgeText="Lodging"
            meta="Community Eco-Stays"
          />

          <TourismCategoryCard
            to="/tourism/ilp"
            icon={ShieldCheck}
            title="ILP & Travel Rules"
            tagline="Inner Line Permit guidelines, FAQs, and link to official government portal."
            badgeText="Official BEFR"
            meta="ilp.nagaland.gov.in"
          />

          <TourismCategoryCard
            to="/tourism/flora-fauna"
            icon={Trees}
            title="Flora & Fauna"
            tagline="Biodiversity catalog covering avifauna, state species, and conservation rules."
            badgeText="Biodiversity"
            meta="Verified Species Guide"
          />
        </div>
      </div>

      <div className="editorial-hairline"></div>

      {/* Live Geospatial Discovery Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45E45]">
              Live OpenStreetMap Cartography
            </span>
            <h2 className="font-serif text-xl font-bold text-[#252B26] mt-0.5">
              Verified Destinations & Community Protocols
            </h2>
          </div>
          <span className="text-xs text-[#5C645E]">
            Real coordinates • Community-layered guidance
          </span>
        </div>

        {/* Network Warning Alert if any */}
        {fetchMeta?.warning && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>{fetchMeta.warning}</span>
          </div>
        )}

        {/* Consolidated Filter & Search Toolbar */}
        <div className="editorial-card p-4 space-y-3">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#203E2D] text-white shadow-xs"
                    : "bg-[#F7F5EF] text-[#5C645E] hover:text-[#203E2D] hover:bg-[#EAE5D9]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Region & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E6E1D6]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin size={13} className="text-[#A45E45] shrink-0" />
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="select select-sm bg-[#F7F5EF] border-[#E6E1D6] rounded-md text-xs font-medium text-[#252B26] focus:border-[#203E2D] focus:outline-hidden w-full sm:w-64"
              >
                {REGIONAL_DIRECTORIES.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[#848E86] font-mono hidden md:inline">
                ({filteredPlaces.length} places)
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E86]" />
              <input
                type="text"
                placeholder="Search destination, village, or district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-8 pr-3 rounded-md border-[#E6E1D6] bg-[#F7F5EF] text-xs focus:border-[#203E2D] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="editorial-card p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-serif text-base font-bold text-[#252B26]">Live Data Unavailable</h3>
            <p className="text-xs text-[#5C645E] max-w-md mx-auto leading-relaxed">{error}</p>
            <button
              onClick={() => loadData(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw size={12} /> Retry Live Fetch
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-xl bg-white border border-[#E6E1D6] animate-pulse p-4" />
            ))}
          </div>
        )}

        {/* Places Grid */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between text-xs font-medium text-[#5C645E] px-1">
              <span>
                Showing {filteredPlaces.length} verified destination{filteredPlaces.length !== 1 ? "s" : ""}
              </span>
              <span className="editorial-tag text-[9px]">
                OpenStreetMap Sourced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlaces.map(place => {
                const tipsForPlace = communityTips[place.placeId] || [];
                const isSavedOffline = offlineSaved[place.placeId];

                return (
                  <div
                    key={place.placeId}
                    className="editorial-card flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Photo Banner with Category Pill */}
                    <div className="relative aspect-16/10 bg-[#F2EFE8] overflow-hidden">
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        onError={e => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <ResponseMetaBadge dataStatus={place.dataStatus} providerName={place.sourceProvider} />
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-black/60 text-white uppercase tracking-wider backdrop-blur-xs">
                          {place.category}
                        </span>
                      </div>

                      {/* District & Name on Photo */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <div className="text-[10px] font-medium text-[#FAF7F2]/80 uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10} className="text-[#C68A36]" /> {place.district} District • {place.regionTribeId.toUpperCase()}
                        </div>
                        <h3 className="font-serif text-base font-bold leading-tight text-white drop-shadow-xs">
                          {place.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-xs text-[#5C645E] line-clamp-2 leading-relaxed">
                          {place.address}
                        </p>

                        {/* Coordinates */}
                        <div className="flex items-center gap-2 text-[10px] text-[#848E86] font-mono bg-[#FAF7F2] px-2 py-1 rounded-md border border-[#E6E1D6]">
                          <Navigation size={10} className="text-[#203E2D]" />
                          <span>Lat: {place.coordinates.lat.toFixed(4)}</span>
                          <span>•</span>
                          <span>Lng: {place.coordinates.lng.toFixed(4)}</span>
                        </div>
                      </div>

                      {/* Community Etiquette Layer */}
                      <div className="pt-2 border-t border-[#E6E1D6] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#252B26]">
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={12} className="text-[#203E2D]" />
                            Community Etiquette
                          </span>
                          <span className="text-[10px] text-[#203E2D] bg-[#203E2D]/8 px-1.5 py-0.2 rounded-md">
                            {tipsForPlace.length} note{tipsForPlace.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {tipsForPlace.length > 0 ? (
                          <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-md p-2 text-[11px] space-y-1 text-[#252B26]">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#A45E45]">
                              <Calendar size={10} /> Season: {tipsForPlace[0].bestSeason}
                            </div>
                            <p className="text-[11px] leading-tight text-[#5C645E]">
                              {tipsForPlace[0].visitationProtocol}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#848E86] italic">
                            No community travel notes added yet.
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-[#E6E1D6] flex items-center justify-between gap-2">
                        <a
                          href={place.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#FAF7F2] hover:bg-white text-[#252B26] border border-[#E6E1D6] transition-colors"
                          title="View official place record on OpenStreetMap"
                        >
                          <ExternalLink size={11} /> Map
                        </a>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveTipModalPlace(place)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#203E2D] hover:bg-[#A45E45] text-white transition-colors"
                            title="Contribute community guidance"
                          >
                            <PlusCircle size={11} /> Protocol
                          </button>

                          <button
                            type="button"
                            onClick={e => handleSaveOffline(place, e)}
                            disabled={isSavedOffline}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                              isSavedOffline
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-white text-[#5C645E] border-[#E6E1D6] hover:text-[#203E2D]"
                            }`}
                            title="Save for offline access"
                          >
                            <Download size={11} />
                            <span>{isSavedOffline ? "Saved" : "Offline"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Community Tip Contribution Modal */}
      {activeTipModalPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card max-w-lg w-full p-6 shadow-xl border border-[#E6E1D6] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="editorial-tag text-[9px]">
                  Community Etiquette Layer
                </span>
                <h3 className="font-serif text-lg font-bold text-[#252B26] mt-1">
                  Add Guidance for {activeTipModalPlace.name}
                </h3>
                <p className="text-xs text-[#5C645E]">
                  {activeTipModalPlace.district} District
                </p>
              </div>
              <button
                onClick={() => setActiveTipModalPlace(null)}
                className="p-1 rounded-md text-[#848E86] hover:text-[#252B26] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {tipSuccessMessage ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-center font-medium">
                Protocol saved successfully to local community state.
              </div>
            ) : (
              <form onSubmit={handleAddTipSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252B26] mb-1">
                    Your Contributor Role
                  </label>
                  <select
                    value={tipFormData.contributorRole}
                    onChange={e => setTipFormData({ ...tipFormData, contributorRole: e.target.value })}
                    className="select select-sm w-full bg-[#FAF7F2] border-[#E6E1D6] rounded-md text-xs"
                  >
                    <option>Local Resident / Community Member</option>
                    <option>Village Council Representative</option>
                    <option>Indigenous Cultural Guide</option>
                    <option>Verified Visitor / Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252B26] mb-1">
                    Recommended Season & Timing
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October to April, avoid monsoon flash floods"
                    value={tipFormData.bestSeason}
                    onChange={e => setTipFormData({ ...tipFormData, bestSeason: e.target.value })}
                    className="input input-sm w-full bg-[#FAF7F2] border-[#E6E1D6] rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252B26] mb-1">
                    Customary Protocol & Sacred Etiquette
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Ask permission before entering morungs or sacred clan stones..."
                    value={tipFormData.visitationProtocol}
                    onChange={e => setTipFormData({ ...tipFormData, visitationProtocol: e.target.value })}
                    className="textarea textarea-sm w-full bg-[#FAF7F2] border-[#E6E1D6] rounded-md text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTipModalPlace(null)}
                    className="px-3 py-1.5 rounded-md text-xs text-[#5C645E] hover:text-[#252B26]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-md bg-[#203E2D] hover:bg-[#A45E45] text-white text-xs font-semibold transition-colors"
                  >
                    Submit Guidance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
