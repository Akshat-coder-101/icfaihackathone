import { X, RotateCcw } from "lucide-react";

export default function ActiveFilterBar({ filters = [], onRemoveFilter, onClearAll }) {
  const activeFilters = filters.filter((f) => f.value && f.value !== "All" && f.value !== "all");

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE5D9] text-xs">
      <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
        Active Filters ({activeFilters.length}):
      </span>

      {activeFilters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#EAE5D9] font-bold text-[#1C1917] shadow-2xs text-[11px]"
        >
          <span className="text-neutral-400 font-normal">{f.label}:</span>
          <span>{f.displayValue || f.value}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(f.key)}
            aria-label={`Remove filter ${f.label}`}
            className="p-0.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {onClearAll && activeFilters.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-bold text-[#DC143C] hover:text-[#B91C1C] hover:underline ml-auto flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={11} /> Clear all
        </button>
      )}
    </div>
  );
}
