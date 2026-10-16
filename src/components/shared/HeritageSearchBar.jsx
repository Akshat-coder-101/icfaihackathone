import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import ResponseMetaBadge from "../ResponseMetaBadge";

export default function HeritageSearchBar({
  value,
  onChange,
  onClear,
  suggestions = [],
  onSelectSuggestion,
  placeholder = "Search heritage objects, shawls, places... (Press / to focus)",
  className = ""
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus with "/" hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowSuggestions(val.trim().length >= 2);
  };

  const handleKeyDownInput = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && suggestions.length > 0 && onSelectSuggestion) {
      e.preventDefault();
      onSelectSuggestion(suggestions[0]);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <label htmlFor="heritage-search-input" className="sr-only">
          Search archive entries
        </label>
        <Search
          size={16}
          className="absolute left-3.5 text-neutral-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="heritage-search-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(value.trim().length >= 2 && suggestions.length > 0)}
          onKeyDown={handleKeyDownInput}
          placeholder={placeholder}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-autocomplete="list"
          className="input input-sm md:input-md w-full pl-10 pr-10 bg-[#FAF7F2] border-[#EAE5D9] rounded-2xl text-xs md:text-sm font-medium text-[#1C1917] focus:border-[#DC143C] focus:bg-white focus:outline-none transition-all shadow-inner"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
            className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Type-ahead suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#EAE5D9] shadow-xl overflow-hidden z-50 divide-y divide-[#FAF7F2] animate-fadeIn"
        >
          <div className="px-3 py-1.5 bg-[#FAF7F2] text-[10px] font-black uppercase tracking-wider text-neutral-500 flex justify-between items-center">
            <span>Suggestions (Press Enter to open top result)</span>
            <span className="text-[10px] text-neutral-400">Esc to close</span>
          </div>
          {suggestions.slice(0, 6).map((item, idx) => (
            <div
              key={item.id || item.objectId || item.entryId || idx}
              role="option"
              aria-selected={idx === 0}
              onClick={() => {
                if (onSelectSuggestion) onSelectSuggestion(item);
                setShowSuggestions(false);
              }}
              className="px-4 py-2.5 hover:bg-[#FAF7F2] cursor-pointer flex items-center justify-between gap-3 group transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#DC143C] truncate">
                  {item.title || item.originalExpression}
                  {item.localName && (
                    <span className="text-neutral-400 font-normal ml-1">({item.localName})</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-[#1E3A2B]">{item.tribe || item.tribeName || item.languageVariety}</span>
                  <span>•</span>
                  <span className="capitalize">{item.type || item.category}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <ResponseMetaBadge dataStatus={item.dataStatus} />
                <ArrowRight size={13} className="text-neutral-300 group-hover:text-[#DC143C] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
