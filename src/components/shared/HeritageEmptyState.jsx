import { AlertCircle, RotateCcw, Sparkles, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeritageEmptyState({
  query = "",
  onClearFilters,
  suggestType = "object", // 'object' | 'phrase'
  suggestions = [],
  onSelectSuggestion,
  customMessage = null
}) {
  const navigate = useNavigate();

  return (
    <div className="p-8 md:p-12 text-center bg-white rounded-3xl border border-dashed border-[#EAE5D9] shadow-xs space-y-4 max-w-xl mx-auto my-6 animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
        <AlertCircle size={24} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base md:text-lg font-black text-[#1C1917]">
          {query ? `Nothing matches "${query}"` : "No records match your selected filters"}
        </h3>
        <p className="text-xs md:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          {customMessage ||
            "Try checking for spelling variations, clearing active tribe/theme filters, or contributing this missing item to the living archive."}
        </p>
      </div>

      {/* Suggested close matches */}
      {suggestions && suggestions.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
            Did you mean one of these?
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.slice(0, 3).map((item) => (
              <button
                key={item.id || item.objectId || item.entryId}
                onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
                className="btn btn-xs rounded-xl bg-[#FAF7F2] hover:bg-[#1E3A2B] hover:text-white border border-[#EAE5D9] text-[#1C1917] font-bold transition-colors"
              >
                {item.title || item.originalExpression}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons — Never a dead end */}
      <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-sm rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-0 font-bold gap-1.5 min-h-[44px]"
          >
            <RotateCcw size={14} /> Clear Filters
          </button>
        )}

        <button
          onClick={() =>
            navigate("/companion", {
              state: { prefillPrompt: query ? `Tell me about the cultural significance of ${query} in Nagaland` : "Explore living Naga cultural traditions" }
            })
          }
          className="btn btn-sm rounded-xl bg-[#1E3A2B] hover:bg-[#162C20] text-white border-0 font-bold gap-1.5 shadow-xs min-h-[44px]"
        >
          <Sparkles size={14} className="text-amber-300" /> Ask AI Companion
        </button>

        <button
          onClick={() =>
            navigate("/community-portal", {
              state: {
                preselectType: suggestType,
                suggestedTitle: query
              }
            })
          }
          className="btn btn-sm rounded-xl bg-[#DC143C] hover:bg-[#B91C1C] text-white border-0 font-bold gap-1.5 shadow-xs min-h-[44px]"
        >
          <PlusCircle size={14} /> Suggest This Entry
        </button>
      </div>
    </div>
  );
}
