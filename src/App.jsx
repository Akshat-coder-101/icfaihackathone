import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import {
  Compass,
  BookOpen,
  Languages,
  Users,
  Sparkles,
  Download,
  Key,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Utensils,
  Calendar,
  Home as HomeIcon,
  ShieldCheck,
  Leaf
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import OralArchive from "./components/OralArchive";
import LanguageStudio from "./components/LanguageStudio";
import HeritageAtlas from "./components/HeritageAtlas";
import TourismGuide from "./components/TourismGuide";
import CulturalCompanion from "./components/CulturalCompanion";
import CommunityPortal from "./components/CommunityPortal";
import OfflineLibraryView from "./components/OfflineLibraryView";
import DistrictExplorer from "./components/tourism/DistrictExplorer";
import DistrictDetailPage from "./components/tourism/DistrictDetailPage";
import DistrictVillagesPage from "./components/tourism/DistrictVillagesPage";
import DestinationDetailPage from "./components/tourism/DestinationDetailPage";
import FoodCuisineView from "./components/tourism/FoodCuisineView";
import SeasonalTravelView from "./components/tourism/SeasonalTravelView";
import AccommodationsView from "./components/tourism/AccommodationsView";
import ILPRequirementsView from "./components/tourism/ILPRequirementsView";
import FloraFaunaView from "./components/tourism/FloraFaunaView";
import TourismMapPage from "./components/tourism/TourismMapPage";
import NagaIntroSplash from "./components/NagaIntroSplash";
import ApiKeyModal from "./components/ApiKeyModal";
import GeminiService from "./services/GeminiService";
import archiveStore from "./services/archiveStore";
import offlineLibrary from "./services/offlineLibrary";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(GeminiService.hasApiKey());
  const [currentRole, setCurrentRole] = useState(archiveStore.getCurrentRole());
  const [offlineCount, setOfflineCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeaderMeta = async () => {
      setCurrentRole(archiveStore.getCurrentRole());
      const items = await offlineLibrary.getAllItems();
      setOfflineCount(items.length);
    };

    updateHeaderMeta();
    const unsubStore = archiveStore.subscribe(updateHeaderMeta);
    const unsubOffline = offlineLibrary.subscribe(updateHeaderMeta);

    return () => {
      unsubStore();
      unsubOffline();
    };
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
    setExploreMenuOpen(false);
  }

  const isExploreActive = location.pathname.startsWith("/tourism") || location.pathname.startsWith("/travel");
  const isArchiveActive = location.pathname.startsWith("/oral-archive") || location.pathname.startsWith("/heritage-atlas");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F5EF] text-[#252B26] font-sans antialiased selection:bg-[#A45E45]/20 selection:text-[#252B26]">
      {/* Optional Splash Animation */}
      {showSplash && <NagaIntroSplash onComplete={() => setShowSplash(false)} />}

      {/* Elegant Hairline Accent */}
      <div className="editorial-hairline w-full"></div>

      {/* Global Header */}
      <header className="bg-[#203E2D] text-[#FAF7F2] sticky top-0 z-40 border-b border-[#203E2D]/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo & Editorial Title */}
            <div 
              className="flex items-center gap-3.5 cursor-pointer select-none group shrink-0" 
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 rounded-md bg-[#FAF7F2] text-[#203E2D] flex items-center justify-center font-serif font-bold text-base shadow-xs group-hover:bg-[#A45E45] group-hover:text-white transition-colors duration-200">
                NQ
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-tight font-bold text-white group-hover:text-[#FAF7F2] transition-colors leading-tight">
                  NagaQuest
                </span>
                <span className="text-[10px] text-[#FAF7F2]/70 uppercase tracking-widest font-sans font-medium leading-tight">
                  Living Heritage & Discovery
                </span>
              </div>
            </div>

            {/* Desktop 4 Primary Navigation Destinations */}
            <nav className="hidden lg:flex items-center gap-1">
              
              {/* Home */}
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                Home
              </NavLink>

              {/* 1. Explore Nagaland with Dropdown */}
              <div className="relative group" onMouseLeave={() => setExploreMenuOpen(false)}>
                <button
                  type="button"
                  onClick={() => navigate("/tourism")}
                  onMouseEnter={() => setExploreMenuOpen(true)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isExploreActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>Explore Nagaland</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${exploreMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Submenu Dropdown */}
                {exploreMenuOpen && (
                  <div 
                    className="absolute left-0 mt-1 w-64 rounded-lg bg-[#FFFFFF] text-[#252B26] shadow-xl border border-[#E6E1D6] py-2 z-50 animate-fade-in"
                    onMouseEnter={() => setExploreMenuOpen(true)}
                  >
                    <div className="px-3 py-1.5 border-b border-[#E6E1D6]/60 mb-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#848E86]">Discovery Directory</p>
                    </div>
                    <NavLink to="/tourism" end className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <Compass size={14} className="text-[#A45E45]" />
                      <span>Tourism Hub Overview</span>
                    </NavLink>
                    <NavLink to="/tourism/districts" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <MapPin size={14} className="text-[#203E2D]" />
                      <span>16 Districts & Villages</span>
                    </NavLink>
                    <NavLink to="/tourism/map" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <Compass size={14} className="text-[#203E2D]" />
                      <span>Interactive Cartography</span>
                    </NavLink>
                    <NavLink to="/tourism/food" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <Utensils size={14} className="text-[#A45E45]" />
                      <span>Culinary Traditions & Axone</span>
                    </NavLink>
                    <NavLink to="/tourism/best-time-to-visit" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <Calendar size={14} className="text-[#203E2D]" />
                      <span>Seasonal Guide & Festivals</span>
                    </NavLink>
                    <NavLink to="/tourism/stays" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <HomeIcon size={14} className="text-[#203E2D]" />
                      <span>Homestays & Lodging</span>
                    </NavLink>
                    <NavLink to="/tourism/flora-fauna" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <Leaf size={14} className="text-[#203E2D]" />
                      <span>Biodiversity & Avifauna</span>
                    </NavLink>
                    <NavLink to="/tourism/ilp" className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#252B26] hover:bg-[#F7F5EF] hover:text-[#203E2D]">
                      <ShieldCheck size={14} className="text-[#A45E45]" />
                      <span>Inner Line Permit (ILP)</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* 2. Cultural Archive */}
              <NavLink
                to="/oral-archive"
                className={() =>
                  `px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isArchiveActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                Cultural Archive
              </NavLink>

              {/* 3. Language Studio */}
              <NavLink
                to="/language-studio"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                Language Studio
              </NavLink>

              {/* 4. Community Portal */}
              <NavLink
                to="/community-portal"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                Community
              </NavLink>
            </nav>

            {/* Right Tools: AI Companion, Offline, Role, API Key */}
            <div className="flex items-center gap-2">
              
              {/* Contextual AI Companion Link */}
              <NavLink
                to="/companion"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#A45E45] text-white"
                      : "bg-white/10 text-white/90 hover:bg-white/20"
                  }`
                }
                title="Open AI Cultural Companion"
              >
                <Sparkles size={13} className="text-[#C68A36]" />
                <span className="hidden sm:inline">AI Companion</span>
              </NavLink>

              {/* Offline Library Icon & Count */}
              <NavLink
                to="/offline-library"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
                title="Saved Offline Records"
              >
                <Download size={13} />
                {offlineCount > 0 && (
                  <span className="bg-[#A45E45] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {offlineCount}
                  </span>
                )}
              </NavLink>

              {/* Active Role Indicator */}
              <button
                type="button"
                onClick={() => navigate("/community-portal")}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white/10 text-white/90 hover:bg-white/20 border border-white/10 transition-colors"
                title="Community Governance Role"
              >
                <UserCheck size={12} className="text-[#C68A36]" />
                <span className="capitalize">{currentRole === "public" ? "Learner" : currentRole}</span>
              </button>

              {/* API Key Modal Button */}
              <button
                type="button"
                onClick={() => setShowApiModal(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  hasApiKey
                    ? "bg-[#2A4D39] border-emerald-500/40 text-emerald-200 hover:bg-[#345E46]"
                    : "bg-[#A45E45] border-[#A45E45] text-white hover:bg-[#8D4F39]"
                }`}
                title={hasApiKey ? "Gemini API connected" : "Add Gemini API Key"}
              >
                <Key size={12} />
                <span className="hidden sm:inline">{hasApiKey ? "API Ready" : "Set API Key"}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-md text-white/90 hover:bg-white/10 focus:outline-hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1E3A2B] border-t border-[#2A4D39] px-4 pt-3 pb-6 animate-fade-in">
            <div className="space-y-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-white/15 text-white font-semibold" : "text-white/80 hover:bg-white/10"
                  }`
                }
              >
                Home
              </NavLink>

              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/50">Explore Nagaland</p>
              </div>
              <NavLink to="/tourism" end className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Tourism Hub Overview
              </NavLink>
              <NavLink to="/tourism/districts" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • 16 Districts & Villages
              </NavLink>
              <NavLink to="/tourism/map" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Interactive Map
              </NavLink>
              <NavLink to="/tourism/food" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Culinary Traditions
              </NavLink>
              <NavLink to="/tourism/best-time-to-visit" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Seasonal Travel Calendar
              </NavLink>
              <NavLink to="/tourism/stays" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Verified Homestays & Lodging
              </NavLink>
              <NavLink to="/tourism/flora-fauna" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Wildlife & Biodiversity
              </NavLink>
              <NavLink to="/tourism/ilp" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Inner Line Permit Advisory
              </NavLink>

              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/50">Heritage & Language</p>
              </div>
              <NavLink to="/oral-archive" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Oral Archive & Stories
              </NavLink>
              <NavLink to="/heritage-atlas" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Living Heritage Atlas
              </NavLink>
              <NavLink to="/language-studio" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Language Studio
              </NavLink>
              <NavLink to="/community-portal" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Community Governance
              </NavLink>
              <NavLink to="/companion" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • AI Cultural Companion
              </NavLink>
              <NavLink to="/offline-library" className="block px-3 py-1.5 rounded-md text-xs text-white/80 hover:bg-white/10">
                • Offline Library ({offlineCount})
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 mb-16 lg:mb-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/oral-archive" element={<OralArchive />} />
          <Route path="/language-studio" element={<LanguageStudio />} />
          <Route path="/heritage-atlas" element={<HeritageAtlas />} />
          <Route path="/heritage-atlas/:id" element={<HeritageAtlas />} />
          <Route path="/tourism" element={<TourismGuide />} />
          <Route path="/tourism/districts" element={<DistrictExplorer />} />
          <Route path="/tourism/map" element={<TourismMapPage />} />
          <Route path="/tourism/districts/:districtId" element={<DistrictDetailPage />} />
          <Route path="/tourism/districts/:districtId/villages" element={<DistrictVillagesPage />} />
          <Route path="/tourism/districts/:districtId/destinations/:destinationId" element={<DestinationDetailPage />} />
          <Route path="/tourism/food" element={<FoodCuisineView />} />
          <Route path="/tourism/best-time-to-visit" element={<SeasonalTravelView />} />
          <Route path="/tourism/stays" element={<AccommodationsView />} />
          <Route path="/tourism/ilp" element={<ILPRequirementsView />} />
          <Route path="/tourism/flora-fauna" element={<FloraFaunaView />} />
          <Route path="/travel" element={<Navigate to="/tourism" replace />} />
          <Route path="/companion" element={<CulturalCompanion />} />
          <Route path="/community-portal" element={<CommunityPortal />} />
          <Route path="/community" element={<Navigate to="/community-portal" replace />} />
          <Route path="/offline-library" element={<OfflineLibraryView />} />

          {/* Legacy route aliases for backward compatibility */}
          <Route path="/weaver" element={<Navigate to="/oral-archive" replace />} />
          <Route path="/interpreter" element={<Navigate to="/heritage-atlas" replace />} />
          <Route path="/tutor" element={<Navigate to="/language-studio" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar: Clean 4 Primary Pillars + AI */}
      <nav aria-label="Mobile Bottom Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#203E2D] border-t border-[#2A4D39] z-40 px-2 py-1 flex items-center justify-around shadow-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
            }`
          }
        >
          <HomeIcon size={16} />
          <span className="mt-0.5">Home</span>
        </NavLink>

        <NavLink
          to="/tourism"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
            }`
          }
        >
          <Compass size={16} />
          <span className="mt-0.5">Explore</span>
        </NavLink>

        <NavLink
          to="/oral-archive"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
            }`
          }
        >
          <BookOpen size={16} />
          <span className="mt-0.5">Archive</span>
        </NavLink>

        <NavLink
          to="/language-studio"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
            }`
          }
        >
          <Languages size={16} />
          <span className="mt-0.5">Languages</span>
        </NavLink>

        <NavLink
          to="/community-portal"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
            }`
          }
        >
          <Users size={16} />
          <span className="mt-0.5">Community</span>
        </NavLink>
      </nav>

      {/* Compact Editorial Footer */}
      <footer className="bg-[#203E2D] text-[#FAF7F2] border-t border-[#203E2D]/90 pt-10 pb-16 lg:pb-10 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-8 border-b border-white/10">
            
            {/* Column 1: Brand */}
            <div className="col-span-2 md:col-span-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#FAF7F2] text-[#203E2D] flex items-center justify-center font-serif font-bold text-xs">
                  NQ
                </div>
                <span className="font-serif text-sm font-bold text-white tracking-tight">NagaQuest</span>
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Exploring the landscapes, traditions, and living heritage of Nagaland.
              </p>
            </div>

            {/* Column 2: Explore */}
            <div className="space-y-2">
              <h4 className="font-serif font-semibold text-white text-xs tracking-wider uppercase">Explore</h4>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                <li><NavLink to="/tourism" className="hover:text-white transition-colors">Destinations</NavLink></li>
                <li><NavLink to="/tourism/districts" className="hover:text-white transition-colors">Districts</NavLink></li>
                <li><NavLink to="/tourism/map" className="hover:text-white transition-colors">Interactive Map</NavLink></li>
                <li><NavLink to="/tourism/food" className="hover:text-white transition-colors">Food & Cuisine</NavLink></li>
                <li><NavLink to="/tourism/stays" className="hover:text-white transition-colors">Stays & Lodging</NavLink></li>
                <li><NavLink to="/tourism/ilp" className="hover:text-white transition-colors">Travel Guidelines</NavLink></li>
              </ul>
            </div>

            {/* Column 3: Cultural Archive */}
            <div className="space-y-2">
              <h4 className="font-serif font-semibold text-white text-xs tracking-wider uppercase">Cultural Archive</h4>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                <li><NavLink to="/oral-archive" className="hover:text-white transition-colors">Oral Traditions</NavLink></li>
                <li><NavLink to="/heritage-atlas" className="hover:text-white transition-colors">Heritage Atlas</NavLink></li>
                <li><NavLink to="/companion" className="hover:text-white transition-colors">AI Learning Tool</NavLink></li>
                <li><NavLink to="/offline-library" className="hover:text-white transition-colors">Offline Library</NavLink></li>
              </ul>
            </div>

            {/* Column 4: Language Studio & Community */}
            <div className="space-y-2">
              <h4 className="font-serif font-semibold text-white text-xs tracking-wider uppercase">Community</h4>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                <li><NavLink to="/language-studio" className="hover:text-white transition-colors">Language Studio</NavLink></li>
                <li><NavLink to="/community-portal" className="hover:text-white transition-colors">Community Portal</NavLink></li>
                <li><NavLink to="/community-portal" className="hover:text-white transition-colors">Contributor Workflow</NavLink></li>
              </ul>
            </div>

            {/* Column 5: About & Policies */}
            <div className="space-y-2">
              <h4 className="font-serif font-semibold text-white text-xs tracking-wider uppercase">About & Policies</h4>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                <li><NavLink to="/community-portal" className="hover:text-white transition-colors">Preservation Approach</NavLink></li>
                <li>
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Cartography Credits
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Attribution Bar */}
          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60">
            <p>&copy; {new Date().getFullYear()} NagaQuest. Living heritage & discovery.</p>
            <p>Cartography &copy; OpenStreetMap contributors.</p>
          </div>
        </div>
      </footer>

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={() => {
          setHasApiKey(GeminiService.hasApiKey());
          GeminiService.clearCache();
        }}
      />
    </div>
  );
}

export default App;
