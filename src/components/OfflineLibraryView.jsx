import { useState, useEffect } from "react";
import {
  Download,
  ShieldCheck,
  Trash2,
  BookOpen,
  Languages,
  Compass,
  AlertCircle,
  Map
} from "lucide-react";
import offlineLibrary from "../services/offlineLibrary";
import archiveStore from "../services/archiveStore";
import NagaWeavingDivider from "./NagaWeavingDivider";
import ResponseMetaBadge from "./ResponseMetaBadge";

export default function OfflineLibraryView() {
  const [offlineItems, setOfflineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const items = await offlineLibrary.getAllItems();
        if (isMounted) {
          setOfflineItems(items);
          setActiveItem(prev => (prev || (items.length > 0 ? items[0] : null)));
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    const unsub = offlineLibrary.subscribe(() => {
      fetchItems();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleRemove = async (id, e) => {
    if (e) e.stopPropagation();
    await offlineLibrary.removeItem(id);
    if (activeItem?.id === id) {
      setActiveItem(null);
    }
  };

  const handleDownloadAllPilot = async () => {
    setDownloadingAll(true);
    const stories = archiveStore.getAllStories();
    const phrases = archiveStore.getAllPhrases();
    const objects = archiveStore.getAllHeritageObjects();

    await offlineLibrary.downloadEntirePilotCollection(stories, phrases, objects);
    setDownloadingAll(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A45E45] text-white mb-4 shadow-2xs">
            <ShieldCheck size={14} /> Offline Cultural Library
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Downloaded Offline Archive
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Cultural records stored directly on your local device. Designed for travelers, researchers, and community members in remote areas with low or intermittent internet connectivity.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadAllPilot}
              disabled={downloadingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#A45E45] hover:bg-[#8F513B] text-white transition-all shadow-xs cursor-pointer min-h-[44px]"
            >
              {downloadingAll ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Download size={15} />
              )}
              Download Full Collection for Offline Access
            </button>
            <span className="text-xs text-white/90 bg-white/10 px-3.5 py-2 rounded-lg border border-white/20 font-medium">
              {offlineItems.length} Items Stored Locally
            </span>
          </div>
        </div>
      </div>

      <NagaWeavingDivider />

      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] text-xs text-[#252B26] flex items-start gap-3 shadow-2xs">
        <ShieldCheck size={18} className="text-[#203E2D] shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[#57534E]">
          Saved records are stored directly in your browser's local storage for reference without an active internet connection.
        </div>
      </div>

      {/* Directory & Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Offline Items Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-[#252B26]">
              Cached Verified Entries ({offlineItems.length})
            </h3>
            <span className="text-[11px] font-mono text-[#78716C]">
              Storage: IndexedDB
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-custom">
            {offlineItems.map((item) => {
              const isSelected = activeItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#203E2D] shadow-sm ring-1 ring-[#203E2D]"
                      : "bg-white hover:bg-[#FAF7F2] border-[#E6E1D6] shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-center shrink-0 text-[#203E2D] mt-0.5">
                      {item.itemType === "story" && <BookOpen size={15} className="text-[#A45E45]" />}
                      {item.itemType === "phrase" && <Languages size={15} className="text-[#C68A36]" />}
                      {item.itemType === "object" && <Compass size={15} className="text-[#203E2D]" />}
                      {item.itemType === "tourism" && <Map size={15} className="text-[#203E2D]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20 text-[9px] py-0">
                          {item.tribeName}
                        </span>
                        <span className="text-[10px] text-[#78716C] capitalize">
                          {item.itemType}
                        </span>
                      </div>
                      <div className="font-serif font-bold text-xs text-[#252B26] line-clamp-1">
                        {item.title}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="p-1.5 text-[#78716C] hover:text-[#A45E45] rounded-md transition-colors cursor-pointer"
                    title="Remove from offline cache"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            {offlineItems.length === 0 && !loading && (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#E6E1D6]">
                <AlertCircle size={28} className="mx-auto text-[#78716C] mb-2" />
                <p className="text-xs font-semibold text-[#252B26]">No records downloaded yet</p>
                <p className="text-[11px] text-[#78716C] mt-1">
                  Click "Download Full Pilot Archive" above or save items individually from the Oral Archive and Language Studio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Offline Item Viewer (7 cols) */}
        {activeItem ? (
          <div className="lg:col-span-7 editorial-card p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20">
                  {activeItem.tribeName}
                </span>
                <ResponseMetaBadge dataStatus={activeItem.data?.dataStatus} />
                <span className="editorial-tag text-[#203E2D] bg-emerald-50 border-emerald-200">
                  Offline Stored
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#78716C]">
                Cached: {new Date(activeItem.downloadedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#252B26]">
                {activeItem.title}
              </h2>
            </div>

            {/* Story Details */}
            {activeItem.itemType === "story" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
                  <div className="text-xs font-semibold text-[#203E2D] uppercase tracking-wider">
                    Reviewed Translation
                  </div>
                  <p className="text-xs text-[#252B26] leading-relaxed font-serif whitespace-pre-line">
                    {activeItem.data?.transcriptTranslated}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#252B26] text-neutral-200 border border-[#252B26] space-y-2">
                  <div className="text-xs font-mono font-semibold text-[#C68A36] uppercase tracking-wider">
                    Original Dialect Transcript ({activeItem.data?.originalLanguage})
                  </div>
                  <p className="text-xs font-mono leading-relaxed whitespace-pre-line">
                    {activeItem.data?.transcriptOriginal}
                  </p>
                </div>

                <div className="text-xs text-[#78716C]">
                  <strong>Storyteller:</strong> {activeItem.data?.storyteller?.name} • <strong>Attribution:</strong> {activeItem.data?.attributionRequirement}
                </div>
              </div>
            )}

            {/* Phrase Details */}
            {activeItem.itemType === "phrase" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
                  <div className="text-xs font-mono text-[#A45E45]">
                    Phonetic Guide: {activeItem.data?.pronunciationGuide}
                  </div>
                  <div className="text-base font-serif font-bold text-[#252B26]">
                    "{activeItem.data?.meaning}"
                  </div>
                  <p className="text-xs text-[#57534E]">
                    {activeItem.data?.context}
                  </p>
                </div>
                <div className="text-xs text-[#78716C]">
                  <strong>Contributed By:</strong> {activeItem.data?.contributedBy}
                </div>
              </div>
            )}

            {/* Object Details */}
            {activeItem.itemType === "object" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
                  <div className="text-xs font-semibold text-[#203E2D] uppercase tracking-wider">Traditional Usage</div>
                  <p className="text-xs text-[#57534E]">{activeItem.data?.usage}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
                  <div className="text-xs font-semibold text-[#A45E45] uppercase tracking-wider">Cultural Explanation</div>
                  <p className="text-xs text-[#252B26] font-serif leading-relaxed">{activeItem.data?.explanation}</p>
                </div>

                <div className="text-xs text-[#78716C]">
                  <strong>Community:</strong> {activeItem.data?.communityName} • <strong>Provided by:</strong> {activeItem.data?.providedBy}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
