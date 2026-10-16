import { Camera, ExternalLink } from "lucide-react";

export default function ImageAttribution({
  credit,
  license,
  sourceUrl,
  className = "",
  inline = false
}) {
  if (!credit && !license) return null;

  if (inline) {
    return (
      <div className={`flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 font-medium ${className}`}>
        {credit && (
          <span className="inline-flex items-center gap-1">
            <Camera size={11} className="text-neutral-400" />
            <span>Photo: {credit}</span>
          </span>
        )}
        {license && (
          <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200">
            {license}
          </span>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#DC143C] hover:underline inline-flex items-center gap-0.5"
            aria-label="View source reference"
          >
            Source <ExternalLink size={9} />
          </a>
        )}
      </div>
    );
  }

  // Floating overlay style for card corners
  return (
    <div
      className={`absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[9px] font-medium flex items-center gap-1.5 shadow-xs max-w-[85%] truncate z-10 ${className}`}
      title={`${credit ? `Photo: ${credit}` : ""} ${license ? `(${license})` : ""}`}
    >
      <Camera size={10} className="shrink-0 text-white/80" />
      <span className="truncate">{credit || "Documented Community Archive"}</span>
      {license && <span className="text-white/60">• {license}</span>}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:text-white shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}
