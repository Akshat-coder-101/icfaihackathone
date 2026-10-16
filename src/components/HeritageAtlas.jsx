import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  Download,
  Camera,
  MapPin,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Map as MapIcon,
  Grid,
  List,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Copy,
  Info,
  SlidersHorizontal,
  X
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import archiveStore from "../services/archiveStore";
import offlineLibrary from "../services/offlineLibrary";
import NagaWeavingDivider from "./NagaWeavingDivider";
import ResponseMetaBadge from "./ResponseMetaBadge";
import HeritageSearchBar from "./shared/HeritageSearchBar";
import HeritageEmptyState from "./shared/HeritageEmptyState";
import ActiveFilterBar from "./shared/ActiveFilterBar";
import {
  HERITAGE_TYPES,
  RECOGNIZED_TRIBES,
  createHeritageFuse,
  expandQueryWithSynonyms
} from "../utils/heritageSearch";

// Fix standard Leaflet default marker icons for Webpack/Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const PLACEHOLDER_IMG = "/images/placeholders/heritage-placeholder.svg";

export default function HeritageAtlas() {
  const navigate = useNavigate();
  const { id: routeObjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Storage data
  const [allObjects, setAllObjects] = useState([]);
  const [offlineStatus, setOfflineStatus] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  // URL State initialization
  const searchQuery = searchParams.get("q") || "";
  const selectedType = searchParams.get("type") || "All";
  const selectedTribe = searchParams.get("tribe") || "All";
  const selectedSource = searchParams.get("source") || "All"; // All | published | community | demo
  const includeAiDrafts = searchParams.get("ai") === "true";
  const sortBy = searchParams.get("sort") || "relevance"; // relevance | a-z | tribe | recent
  const viewMode = searchParams.get("view") || "grid"; // grid | list | map

  // Helper to update search params preserving state
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };
    Object.keys(merged).forEach((k) => {
      if (!merged[k] || merged[k] === "All" || merged[k] === "false" || merged[k] === "relevance") {
        delete merged[k];
      }
    });
    setSearchParams(merged, { replace: true });
  };

  // 1. Load objects from archive store & restore offline state
  useEffect(() => {
    const loadData = async () => {
      const items = archiveStore.getAllHeritageObjects();
      setAllObjects(items);

      try {
        const savedOffline = await offlineLibrary.getAllItems();
        const statusMap = {};
        savedOffline.forEach((item) => {
          statusMap[item.id] = true;
          if (item.data?.objectId) statusMap[item.data.objectId] = true;
        });
        setOfflineStatus(statusMap);
      } catch (err) {
        console.error("Failed to restore offline items:", err);
      }
    };

    loadData();
    const unsubStore = archiveStore.subscribe(loadData);
    const unsubOffline = offlineLibrary.subscribe(loadData);

    return () => {
      unsubStore();
      unsubOffline();
    };
  }, []);

  // 2. Pre-index Fuse for fuzzy searching
  const fuse = useMemo(() => {
    return createHeritageFuse(allObjects);
  }, [allObjects]);

  // 3. Count helpers for types, tribes, and statuses
  const counts = useMemo(() => {
    const typeCounts = {};
    const tribeCounts = {};
    const statusCounts = { verified_real: 0, published_reference: 0, illustrative: 0, ai_generated: 0 };

    allObjects.forEach((obj) => {
      // Type
      const t = (obj.type || obj.category || "").toLowerCase();
      typeCounts[t] = (typeCounts[t] || 0) + 1;

      // Tribe
      const tr = obj.tribe || obj.tribeName || "";
      RECOGNIZED_TRIBES.forEach((regTribe) => {
        if (tr.toLowerCase().includes(regTribe.toLowerCase())) {
          tribeCounts[regTribe] = (tribeCounts[regTribe] || 0) + 1;
        }
      });

      // Status
      if (statusCounts[obj.dataStatus] !== undefined) {
        statusCounts[obj.dataStatus]++;
      }
    });

    return { typeCounts, tribeCounts, statusCounts };
  }, [allObjects]);

  // 4. Filtering and sorting pipeline
  const filteredObjects = useMemo(() => {
    let result = [...allObjects];

    // Filter AI drafts visibility (default hidden)
    if (!includeAiDrafts) {
      result = result.filter((obj) => obj.dataStatus !== "ai_generated");
    }

    // Source status filter
    if (selectedSource === "published") {
      result = result.filter((obj) => obj.dataStatus === "published_reference");
    } else if (selectedSource === "community") {
      result = result.filter((obj) => obj.dataStatus === "verified_real");
    } else if (selectedSource === "demo") {
      result = result.filter((obj) => obj.dataStatus === "illustrative");
    } else if (selectedSource === "ai") {
      result = result.filter((obj) => obj.dataStatus === "ai_generated");
    }

    // Type filter
    if (selectedType !== "All") {
      result = result.filter(
        (obj) =>
          (obj.type && obj.type.toLowerCase() === selectedType.toLowerCase()) ||
          (obj.category && obj.category.toLowerCase() === selectedType.toLowerCase())
      );
    }

    // Tribe filter (null-safe)
    if (selectedTribe !== "All") {
      result = result.filter((obj) => {
        const tribeText = `${obj.tribe || ""} ${obj.tribeName || ""}`.toLowerCase();
        return tribeText.includes(selectedTribe.toLowerCase());
      });
    }

    // Search query with Fuse fuzzy tolerance + synonym expansion
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const fuseResults = fuse.search(q);
      const matchedIds = new Set(fuseResults.map((r) => r.item.id || r.item.objectId));

      // Also expand with synonyms
      const synonymTokens = expandQueryWithSynonyms(q);
      synonymTokens.forEach((token) => {
        fuse.search(token).forEach((r) => matchedIds.add(r.item.id || r.item.objectId));
      });

      result = result.filter((obj) => matchedIds.has(obj.id || obj.objectId));
    }

    // Sort order
    if (sortBy === "a-z") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "tribe") {
      result.sort((a, b) => (a.tribe || a.tribeName || "").localeCompare(b.tribe || b.tribeName || ""));
    } else if (sortBy === "recent") {
      result.reverse();
    }

    return result;
  }, [allObjects, searchQuery, selectedType, selectedTribe, selectedSource, includeAiDrafts, sortBy, fuse]);

  // 5. Active selected item for Detail Page route / modal
  const activeDetailObject = useMemo(() => {
    if (!routeObjectId) return null;
    return allObjects.find((o) => (o.id || o.objectId) === routeObjectId) || null;
  }, [routeObjectId, allObjects]);

  // Previous / Next in current filtered result set
  const { prevItem, nextItem } = useMemo(() => {
    if (!activeDetailObject) return { prevItem: null, nextItem: null };
    const idx = filteredObjects.findIndex(
      (o) => (o.id || o.objectId) === (activeDetailObject.id || activeDetailObject.objectId)
    );
    if (idx === -1) return { prevItem: null, nextItem: null };
    return {
      prevItem: idx > 0 ? filteredObjects[idx - 1] : null,
      nextItem: idx < filteredObjects.length - 1 ? filteredObjects[idx + 1] : null
    };
  }, [activeDetailObject, filteredObjects]);

  // Handle Esc key to close detail or modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeDetailObject) {
        navigate(`/heritage-atlas${window.location.search}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDetailObject, navigate]);

  // Actions
  const handleSaveOffline = async (obj, e) => {
    if (e) e.stopPropagation();
    try {
      const objId = obj.id || obj.objectId;
      const isSaved = offlineStatus[objId];
      if (isSaved) {
        await offlineLibrary.removeItem(objId);
        setOfflineStatus((prev) => ({ ...prev, [objId]: false }));
      } else {
        await offlineLibrary.saveItem(obj, "object");
        setOfflineStatus((prev) => ({ ...prev, [objId]: true }));
      }
    } catch (err) {
      console.error("Offline toggle failed:", err);
    }
  };

  const handleShareLink = (obj, e) => {
    if (e) e.stopPropagation();
    const id = obj.id || obj.objectId;
    const url = `${window.location.origin}/heritage-atlas/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCitation = (obj, e) => {
    if (e) e.stopPropagation();
    const primarySource = obj.sources?.[0]?.title || "NagaQuest Heritage Living Archive";
    const year = new Date().getFullYear();
    const citation = `"${obj.title}." ${obj.tribe || obj.tribeName} Heritage. ${primarySource}, ${year}. [NagaQuest Atlas]`;
    navigator.clipboard.writeText(citation);
    setCopiedId(`cite-${obj.id || obj.objectId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Type-specific highlight render helper
  const renderCardHighlight = (obj) => {
    const type = (obj.type || obj.category || "").toLowerCase();

    if (type === "textile") {
      return (
        <div className="text-[11px] text-neutral-600 bg-neutral-100/80 px-2 py-1 rounded-lg truncate">
          <span className="font-bold text-[#1E3A2B]">Occasion:</span>{" "}
          {obj.details?.primaryOccasion || obj.usage || "Ceremonial wear"}
        </div>
      );
    }
    if (type === "instrument") {
      return (
        <div className="text-[11px] text-neutral-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50 truncate">
          <span className="font-bold text-amber-900">Sound:</span>{" "}
          {obj.details?.playingMethod || "Communal signal rhythm"}
        </div>
      );
    }
    if (type === "place") {
      return (
        <div className="text-[11px] text-sky-900 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200/60 truncate flex items-center gap-1">
          <MapPin size={11} className="text-sky-700 shrink-0" />
          <span>{obj.district ? `${obj.district} District` : "Sacred Sanctuary"}</span>
        </div>
      );
    }
    if (type === "festival") {
      return (
        <div className="text-[11px] text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 truncate">
          <span className="font-bold">Season:</span> {obj.details?.month || obj.details?.season || "Annual festive calendar"}
        </div>
      );
    }
    if (type === "food") {
      return (
        <div className="text-[11px] text-orange-950 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200/50 truncate">
          <span className="font-bold text-orange-900">Flavor:</span> {obj.details?.flavorProfile || "Traditional preparation"}
        </div>
      );
    }
    if (type === "architecture") {
      return (
        <div className="text-[11px] text-emerald-950 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50 truncate">
          <span className="font-bold text-emerald-900">Structure:</span> {obj.details?.function || "Community institution"}
        </div>
      );
    }
    if (type === "ritual") {
      return (
        <div className="text-[11px] text-purple-950 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200/50 truncate">
          <span className="font-bold text-purple-900">Visitors:</span>{" "}
          {obj.details?.openToVisitors || "Respectful observation"}
        </div>
      );
    }

    // Default tag highlight
    if (obj.tags && obj.tags.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {obj.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      );
    }

    return null;
  };

  // -------------------------------------------------------------------
  // DETAIL VIEW (replaces modal or renders directly when route /:id matches)
  // -------------------------------------------------------------------
  if (activeDetailObject) {
    const isSaved = offlineStatus[activeDetailObject.id || activeDetailObject.objectId];
    const imageSrc =
      activeDetailObject.image?.url || activeDetailObject.photos?.[0]?.url || PLACEHOLDER_IMG;
    const imageCredit =
      activeDetailObject.image?.credit ||
      (activeDetailObject.dataStatus === "verified_real"
        ? activeDetailObject.photos?.[0]?.credit
        : null);
    const hasCoordinates =
      activeDetailObject.coordinates &&
      Array.isArray(activeDetailObject.coordinates) &&
      activeDetailObject.coordinates.length === 2;

    const relatedCards = allObjects
      .filter(
        (o) =>
          (o.id || o.objectId) !== (activeDetailObject.id || activeDetailObject.objectId) &&
          (o.tribe === activeDetailObject.tribe ||
            o.type === activeDetailObject.type ||
            o.category === activeDetailObject.category)
      )
      .slice(0, 3);

    return (
      <div className="space-y-6 animate-fadeIn pb-16">
        {/* Navigation Bar & Back Button */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 md:p-4 rounded-2xl border border-[#EAE5D9] shadow-xs">
          <Link
            to={`/heritage-atlas${window.location.search}`}
            className="btn btn-sm bg-neutral-100 hover:bg-neutral-200 text-[#1C1917] border-0 rounded-xl font-bold gap-1 min-h-[44px]"
          >
            <ChevronLeft size={16} /> Back to Atlas
          </Link>

          {/* Previous / Next within current filter set */}
          <div className="flex items-center gap-2">
            {prevItem ? (
              <Link
                to={`/heritage-atlas/${prevItem.id || prevItem.objectId}${window.location.search}`}
                className="btn btn-sm btn-ghost rounded-xl text-neutral-700 hover:bg-[#FAF7F2] font-bold gap-1 text-xs min-h-[44px]"
                title={`Previous: ${prevItem.title}`}
              >
                <ChevronLeft size={14} /> Prev Record
              </Link>
            ) : (
              <button disabled className="btn btn-sm btn-ghost rounded-xl text-neutral-300 text-xs min-h-[44px]">
                <ChevronLeft size={14} /> Prev Record
              </button>
            )}

            {nextItem ? (
              <Link
                to={`/heritage-atlas/${nextItem.id || nextItem.objectId}${window.location.search}`}
                className="btn btn-sm btn-ghost rounded-xl text-neutral-700 hover:bg-[#FAF7F2] font-bold gap-1 text-xs min-h-[44px]"
                title={`Next: ${nextItem.title}`}
              >
                Next Record <ChevronRight size={14} />
              </Link>
            ) : (
              <button disabled className="btn btn-sm btn-ghost rounded-xl text-neutral-300 text-xs min-h-[44px]">
                Next Record <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Main Detail Header Card */}
        <div className="editorial-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Photo / Neutral Placeholder Column */}
          <div className="lg:col-span-5 bg-neutral-900 relative min-h-[280px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
            <img
              src={imageSrc}
              alt={activeDetailObject.title}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMG;
              }}
              className="w-full h-full object-cover"
            />
            {imageCredit && (
              <div className="absolute bottom-3 left-3 right-3 text-[11px] text-white/95 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Camera size={12} />
                <span className="truncate">{imageCredit}</span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20">
                  {activeDetailObject.tribe || activeDetailObject.tribeName}
                </span>
                <span className="editorial-tag text-[#57534E] bg-[#FAF7F2] border-[#E6E1D6]">
                  {activeDetailObject.type || activeDetailObject.category}
                </span>
                <ResponseMetaBadge dataStatus={activeDetailObject.dataStatus} />
              </div>

              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#252B26] tracking-tight leading-tight">
                  {activeDetailObject.title}
                </h1>
                {activeDetailObject.localName && (
                  <div className="text-sm font-semibold text-[#A45E45] mt-1 font-serif italic">
                    Indigenous Designation: {activeDetailObject.localName}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-[#78716C] mt-2">
                  <MapPin size={14} className="text-[#A45E45]" />
                  <span>{activeDetailObject.communityName || activeDetailObject.district || "Nagaland"}</span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm md:text-base text-neutral-700 leading-relaxed font-normal">
                {activeDetailObject.summary || activeDetailObject.explanation}
              </p>

              {/* Type-specific details table */}
              {activeDetailObject.details && Object.keys(activeDetailObject.details).length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9] space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#1E3A2B]">
                    Heritage Specifications
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(activeDetailObject.details).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-neutral-400 capitalize text-[10px] font-bold">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-semibold text-[#1C1917]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[#EAE5D9] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveOffline(activeDetailObject)}
                  className={`btn btn-sm rounded-xl font-bold gap-1.5 border min-h-[44px] ${
                    isSaved
                      ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                      : "bg-[#FAF7F2] border-neutral-300 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  <Download size={14} /> {isSaved ? "Saved Offline" : "Save Offline"}
                </button>

                <button
                  onClick={(e) => handleShareLink(activeDetailObject, e)}
                  className="btn btn-sm rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0 font-bold gap-1 min-h-[44px]"
                  title="Copy deep link to this entry"
                >
                  {copiedId === (activeDetailObject.id || activeDetailObject.objectId) ? (
                    <>
                      <Check size={14} className="text-emerald-700" /> Copied!
                    </>
                  ) : (
                    <>
                      <Share2 size={14} /> Share
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => handleCopyCitation(activeDetailObject, e)}
                  className="btn btn-sm rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0 font-bold gap-1 min-h-[44px]"
                  title="Copy academic/catalog citation"
                >
                  {copiedId === `cite-${activeDetailObject.id || activeDetailObject.objectId}` ? (
                    <>
                      <Check size={14} className="text-emerald-700" /> Citation Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Citation
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate("/companion", {
                      state: {
                        selectedObject: activeDetailObject,
                        prefillPrompt: `Explain the cultural background and craftsmanship of the ${activeDetailObject.title} from the ${activeDetailObject.tribe || activeDetailObject.tribeName} tradition.`
                      }
                    })
                  }
                  className="btn btn-sm bg-[#1E3A2B] hover:bg-[#162C20] text-white font-bold rounded-xl gap-1.5 shadow-xs min-h-[44px]"
                >
                  <Sparkles size={14} className="text-amber-300" /> Ask AI Companion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Usage, Significance & Cultural Protocol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#EAE5D9] shadow-xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1E3A2B]">
              Traditional Community Usage & Protocol
            </h3>
            <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
              {activeDetailObject.usage || "Used in customary village ceremonies and daily domestic life."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/60 shadow-xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
              Symbolism, History & Sacred Meaning
            </h3>
            <p className="text-xs md:text-sm text-amber-950 leading-relaxed font-serif">
              {activeDetailObject.significance ||
                activeDetailObject.explanation ||
                "Deep ancestral emblem of identity, clan solidarity, and ecological harmony."}
            </p>
          </div>
        </div>

        {/* Section 3: Interactive Leaflet Map (for places with coordinates) */}
        {hasCoordinates && (
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#1C1917] flex items-center gap-2">
                <MapPin size={16} className="text-[#DC143C]" /> Geographic Coordinates & Location Map
              </h3>
              <span className="text-xs text-neutral-500 font-mono">
                {activeDetailObject.coordinates[0].toFixed(3)}° N, {activeDetailObject.coordinates[1].toFixed(3)}° E
              </span>
            </div>

            <div className="h-64 w-full rounded-2xl overflow-hidden border border-[#EAE5D9] z-0">
              <MapContainer
                center={activeDetailObject.coordinates}
                zoom={11}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={activeDetailObject.coordinates}>
                  <Popup>
                    <div className="text-xs font-bold text-[#1C1917]">
                      {activeDetailObject.title}
                      <div className="text-[10px] text-neutral-500">{activeDetailObject.communityName}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Section 4: Documented Sources & Integrity Provenance */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE5D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5D9] pb-3">
            <h3 className="text-sm font-black text-[#1C1917] flex items-center gap-2">
              <BookOpen size={16} className="text-[#1E3A2B]" /> Documented Provenance & Sources
            </h3>
            <span className="text-[11px] text-neutral-500">
              Reviewer: <strong>{activeDetailObject.reviewedBy || "Not yet reviewed"}</strong>
            </span>
          </div>

          {activeDetailObject.sources && activeDetailObject.sources.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-neutral-600 font-medium">
                Facts on this record are cited from the following published authorities:
              </div>
              <ul className="divide-y divide-[#FAF7F2]">
                {activeDetailObject.sources.map((src, i) => (
                  <li key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#1C1917]">{src.title}</span>
                      {src.license && (
                        <span className="text-[11px] text-neutral-500 ml-2">({src.license})</span>
                      )}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs rounded-lg bg-[#FAF7F2] text-[#1E3A2B] hover:bg-[#1E3A2B] hover:text-white border border-[#EAE5D9] font-bold gap-1 shrink-0"
                      >
                        Source Link <ExternalLink size={11} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 italic bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE5D9]">
              This record is illustrative demo data. Independent field documentation and clan review are in progress.
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-[#EAE5D9]">
            <span>Notice a historical discrepancy?</span>
            <button
              onClick={() =>
                navigate("/community-portal", {
                  state: {
                    preselectType: "object",
                    suggestedTitle: `Correction for: ${activeDetailObject.title} (ID: ${activeDetailObject.id || activeDetailObject.objectId})`
                  }
                })
              }
              className="text-[#DC143C] font-bold hover:underline"
            >
              Report a correction in Community Portal →
            </button>
          </div>
        </div>

        {/* Section 5: Related Cards */}
        {relatedCards.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-black text-[#1C1917]">
              Related {activeDetailObject.tribe || activeDetailObject.tribeName} &{" "}
              <span className="capitalize">{activeDetailObject.type || activeDetailObject.category}</span> Records
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedCards.map((rel) => {
                const relImg = rel.image?.url || rel.photos?.[0]?.url || PLACEHOLDER_IMG;
                return (
                  <Link
                    key={rel.id || rel.objectId}
                    to={`/heritage-atlas/${rel.id || rel.objectId}${window.location.search}`}
                    className="bg-white rounded-2xl p-4 border border-[#EAE5D9] hover:shadow-md transition-all group block"
                  >
                    <div className="h-32 rounded-xl overflow-hidden bg-neutral-900 mb-3">
                      <img
                        src={relImg}
                        alt={rel.title}
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#DC143C] truncate">
                      {rel.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      {rel.tribe || rel.tribeName} • <span className="capitalize">{rel.type || rel.category}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // MAIN ATLAS BROWSE VIEW
  // -------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Header Banner */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A45E45] text-white mb-4 shadow-2xs">
            <ShieldCheck size={14} /> Community Heritage Atlas
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Living Heritage Objects, Sacred Places & Traditions
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Heritage objects, places and practices, with their sources shown. Check the badge on each card to see
            whether it is community-verified, from a published source, or a demo entry.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/community-portal", { state: { preselectType: "object" } })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#A45E45] hover:bg-[#8F513B] text-white transition-all shadow-xs cursor-pointer min-h-[44px]"
            >
              <PlusCircle size={16} /> Document a Cultural Object
            </button>

            {/* Honest Count Badge with breakdown tooltip */}
            <div
              className="text-xs text-white/90 bg-white/10 px-3.5 py-2 rounded-lg border border-white/20 font-medium flex items-center gap-2 cursor-help"
              title={`${counts.statusCounts.verified_real} community-verified · ${counts.statusCounts.published_reference} from published sources · ${counts.statusCounts.illustrative} illustrative demo records`}
            >
              <span>{filteredObjects.length} entries displayed</span>
              <Info size={13} className="text-white/70" />
            </div>
          </div>
        </div>
      </div>

      <NagaWeavingDivider />

      {/* 2. Top Search & Filter Bar */}
      <div className="space-y-4">
        {/* Sticky Search on mobile with "/" keybinding */}
        <div className="sticky top-14 z-30 bg-[#F7F5EF]/95 backdrop-blur-xs py-2">
          <HeritageSearchBar
            value={searchQuery}
            onChange={(q) => updateParams({ q })}
            onClear={() => updateParams({ q: "" })}
            suggestions={filteredObjects}
            onSelectSuggestion={(item) => navigate(`/heritage-atlas/${item.id || item.objectId}${window.location.search}`)}
            placeholder="Search shawls, log drums, rites, morungs, places... (Press / to focus)"
          />
        </div>

        {/* Category / Type Chips with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => updateParams({ type: "All" })}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer min-h-[40px] ${
              selectedType === "All"
                ? "bg-[#203E2D] text-white shadow-xs"
                : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
            }`}
          >
            All Types ({allObjects.length})
          </button>

          {HERITAGE_TYPES.map((t) => {
            const count = counts.typeCounts[t.id.toLowerCase()] || 0;
            const isSelected = selectedType.toLowerCase() === t.id.toLowerCase();
            const isZero = count === 0;

            if (isZero) {
              return (
                <button
                  key={t.id}
                  disabled
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-[#FAF7F2] text-[#78716C] border border-[#E6E1D6] cursor-not-allowed shrink-0 opacity-60 min-h-[40px]"
                  title="Coming soon — zero documented entries yet"
                >
                  {t.label} (Coming soon)
                </button>
              );
            }

            return (
              <button
                key={t.id}
                onClick={() => updateParams({ type: t.id })}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer min-h-[40px] ${
                  isSelected
                    ? "bg-[#203E2D] text-white shadow-xs"
                    : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Clean, Streamlined Filter Toolbar */}
        <div className="bg-white p-3.5 md:p-4 rounded-xl border border-[#E6E1D6] shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Left: Tribe & Source Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tribe Dropdown Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Tribe:</span>
              <select
                value={selectedTribe}
                onChange={(e) => updateParams({ tribe: e.target.value })}
                className="select select-sm bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[40px]"
                aria-label="Filter by tribe"
              >
                <option value="All">All 17 Tribes ({allObjects.length})</option>
                {RECOGNIZED_TRIBES.map((tr) => (
                  <option key={tr} value={tr} disabled={counts.tribeCounts[tr] === 0}>
                    {tr} ({counts.tribeCounts[tr] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => updateParams({ source: e.target.value })}
                className="select select-sm bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[40px]"
                aria-label="Filter by data provenance source"
              >
                <option value="All">All Sources ({allObjects.length})</option>
                <option value="published">From Published Sources ({counts.statusCounts.published_reference || 0})</option>
                <option value="community">Community-Verified ({counts.statusCounts.verified_real || 0})</option>
                <option value="demo">Illustrative Demo ({counts.statusCounts.illustrative || 0})</option>
                {includeAiDrafts && <option value="ai">AI Drafts Only ({counts.statusCounts.ai_generated || 0})</option>}
              </select>
            </div>
          </div>

          {/* Right: Sort, View Toggle, and AI Drafts */}
          <div className="flex flex-wrap items-center gap-2.5 ml-auto">
            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="select select-sm bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold text-neutral-800 min-h-[40px]"
              aria-label="Sort records"
            >
              <option value="relevance">Best Match</option>
              <option value="a-z">Title (A to Z)</option>
              <option value="tribe">By Tribe</option>
              <option value="recent">Recently Added</option>
            </select>

            {/* View Mode: Grid / List / Map */}
            <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE5D9]">
              <button
                onClick={() => updateParams({ view: "grid" })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid" ? "bg-white text-[#1C1917] shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => updateParams({ view: "list" })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" ? "bg-white text-[#1C1917] shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => updateParams({ view: "map" })}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "map" ? "bg-white text-[#1C1917] shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Map view"
                aria-label="Map view"
              >
                <MapIcon size={15} />
              </button>
            </div>

            {/* AI Drafts Toggle (PRD 5.1 & 6.2) */}
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 cursor-pointer pl-1">
              <input
                type="checkbox"
                checked={includeAiDrafts}
                onChange={(e) => updateParams({ ai: String(e.target.checked) })}
                className="checkbox checkbox-xs checkbox-primary"
              />
              <span>Include AI drafts</span>
            </label>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        <ActiveFilterBar
          filters={[
            { key: "q", label: "Search", value: searchQuery },
            { key: "type", label: "Type", value: selectedType },
            { key: "tribe", label: "Tribe", value: selectedTribe },
            { key: "source", label: "Source", value: selectedSource },
            { key: "ai", label: "AI Drafts", value: includeAiDrafts ? "Included" : null }
          ]}
          onRemoveFilter={(key) => {
            if (key === "q") updateParams({ q: "" });
            if (key === "type") updateParams({ type: "All" });
            if (key === "tribe") updateParams({ tribe: "All" });
            if (key === "source") updateParams({ source: "All" });
            if (key === "ai") updateParams({ ai: "false" });
          }}
          onClearAll={() => {
            setSearchParams({}, { replace: true });
          }}
        />
      </div>

      {/* 3. MAP VIEW (when selected) */}
      {viewMode === "map" && (
        <div className="bg-white rounded-3xl p-4 md:p-6 border border-[#EAE5D9] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1C1917] flex items-center gap-2">
              <MapIcon size={16} className="text-[#DC143C]" /> Geographic Distribution Map
            </h3>
            <span className="text-xs text-neutral-500">
              Showing places with documented coordinates in current results
            </span>
          </div>

          <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-[#EAE5D9]">
            <MapContainer
              center={[25.8, 94.4]}
              zoom={8}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredObjects
                .filter((o) => o.coordinates && Array.isArray(o.coordinates))
                .map((obj) => (
                  <Marker key={obj.id || obj.objectId} position={obj.coordinates}>
                    <Popup>
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-[#1C1917]">{obj.title}</div>
                        <div className="text-[10px] text-neutral-500">{obj.communityName}</div>
                        <div className="text-[10px] font-bold text-[#DC143C]">{obj.tribe || obj.tribeName}</div>
                        <Link
                          to={`/heritage-atlas/${obj.id || obj.objectId}${window.location.search}`}
                          className="btn btn-xs bg-[#1E3A2B] text-white font-bold rounded-md block mt-1 text-center"
                        >
                          View Record
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* 4. CARDS GRID / LIST */}
      {viewMode !== "map" && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col space-y-4"
          }
        >
          {filteredObjects.slice(0, visibleCount).map((obj) => {
            const objId = obj.id || obj.objectId;
            const isSaved = offlineStatus[objId];
            const imageSrc = obj.image?.url || obj.photos?.[0]?.url || PLACEHOLDER_IMG;
            const creditText =
              obj.image?.credit || (obj.dataStatus === "verified_real" ? obj.photos?.[0]?.credit : null);

            return (
              <div
                key={objId}
                className={`editorial-card overflow-hidden flex flex-col justify-between group ${
                  viewMode === "list" ? "md:flex-row md:items-center" : ""
                }`}
              >
                <Link
                  to={`/heritage-atlas/${objId}${window.location.search}`}
                  className={`block outline-none ${viewMode === "list" ? "md:flex md:items-center md:gap-5 flex-grow" : ""}`}
                >
                  {/* Photo area with neutral fallback */}
                  <div
                    className={`relative overflow-hidden bg-neutral-900 ${
                      viewMode === "list" ? "h-48 md:h-36 md:w-56 shrink-0" : "h-48 w-full"
                    }`}
                  >
                    <img
                      src={imageSrc}
                      alt={obj.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Top Chips */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="editorial-tag text-[#203E2D] bg-[#FAF7F2] border-[#203E2D]/20 shadow-2xs">
                        {obj.tribe || obj.tribeName}
                      </span>
                      <span className="editorial-tag text-[#57534E] bg-white/95 border-[#E6E1D6] shadow-2xs">
                        {obj.type || obj.category}
                      </span>
                    </div>

                    {/* Credit only if real credit exists */}
                    {creditText && (
                      <div className="absolute bottom-2 left-3 right-3 text-[10px] text-white/90 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-md truncate flex items-center gap-1">
                        <Camera size={10} />
                        <span className="truncate">{creditText}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2 flex-grow">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors leading-snug">
                        {obj.title}
                      </h2>
                      {obj.localName && (
                        <div className="text-[11px] font-semibold text-[#A45E45] font-serif italic">
                          {obj.localName}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                      <MapPin size={13} className="text-[#A45E45] shrink-0" />
                      <span className="truncate">{obj.communityName || obj.district || "Nagaland"}</span>
                    </div>

                    <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">
                      {obj.summary || obj.explanation}
                    </p>

                    {/* Type-specific highlight chip */}
                    <div className="pt-1">{renderCardHighlight(obj)}</div>
                  </div>
                </Link>

                {/* Bottom Actions */}
                <div
                  className={`p-5 pt-0 ${
                    viewMode === "list" ? "md:p-5 md:pl-0 shrink-0 md:flex md:flex-col md:items-end md:justify-center" : ""
                  }`}
                >
                  <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between flex-wrap gap-2 w-full">
                    <ResponseMetaBadge dataStatus={obj.dataStatus} />

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleSaveOffline(obj, e)}
                        className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          isSaved
                            ? "bg-[#203E2D]/10 border-[#203E2D]/30 text-[#203E2D]"
                            : "bg-[#FAF7F2] border-[#E6E1D6] text-[#57534E] hover:bg-[#E6E1D6]"
                        }`}
                        title={isSaved ? "Saved for offline viewing" : "Save record for offline use"}
                        aria-label={isSaved ? "Remove from offline library" : "Save for offline"}
                      >
                        <Download size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareLink(obj, e)}
                        className="p-1.5 text-[#78716C] hover:text-[#252B26] rounded-lg cursor-pointer"
                        title="Copy share link"
                        aria-label="Share record link"
                      >
                        {copiedId === objId ? <Check size={13} className="text-[#203E2D]" /> : <Share2 size={13} />}
                      </button>

                      <Link
                        to={`/heritage-atlas/${objId}${window.location.search}`}
                        className="px-3 py-1.5 bg-[#203E2D] hover:bg-[#2C523C] text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        View Record &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button (PRD 6.2) */}
      {filteredObjects.length > visibleCount && viewMode !== "map" && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="btn btn-md bg-white hover:bg-[#FAF7F2] border border-[#EAE5D9] text-[#1C1917] font-bold rounded-2xl px-8 shadow-xs"
          >
            Load More Records ({filteredObjects.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredObjects.length === 0 && (
        <HeritageEmptyState
          query={searchQuery}
          suggestType="object"
          onClearFilters={() => setSearchParams({}, { replace: true })}
          suggestions={allObjects.slice(0, 3)}
          onSelectSuggestion={(item) => navigate(`/heritage-atlas/${item.id || item.objectId}`)}
        />
      )}

      {/* Mobile Filters Bottom Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-slideUp">
            <div className="flex items-center justify-between border-b border-[#EAE5D9] pb-3">
              <h3 className="font-black text-lg text-[#1C1917] flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters & Refinements
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-sm btn-circle btn-ghost text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Tribe Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-600 uppercase tracking-wider block">
                Tribe Scoping
              </label>
              <select
                value={selectedTribe}
                onChange={(e) => updateParams({ tribe: e.target.value })}
                className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold"
              >
                <option value="All">All 17 Tribes</option>
                {RECOGNIZED_TRIBES.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr} ({counts.tribeCounts[tr] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Provenance Source */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-600 uppercase tracking-wider block">
                Provenance Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => updateParams({ source: e.target.value })}
                className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold"
              >
                <option value="All">All Sources</option>
                <option value="published">From Published Sources</option>
                <option value="community">Community-Verified</option>
                <option value="demo">Illustrative Demo Records</option>
              </select>
            </div>

            {/* Mobile Sort */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-600 uppercase tracking-wider block">
                Sort Records
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold"
              >
                <option value="relevance">Best Match</option>
                <option value="a-z">Title (A to Z)</option>
                <option value="tribe">By Tribe</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSearchParams({}, { replace: true });
                  setShowMobileFilters(false);
                }}
                className="btn btn-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl flex-1"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-sm bg-[#1E3A2B] text-white font-bold rounded-xl flex-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
