import { ExternalLink, Info } from "lucide-react";

export default function SourceAttribution({
  source = null,
  externalUrl = null
}) {
  if (!source && !externalUrl) return null;

  return (
    <div className="editorial-card p-4 text-xs text-[#5C645E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Info size={14} className="text-[#203E2D] shrink-0" />
        <div>
          <span className="font-semibold text-[#252B26]">Sources and further information:</span>{" "}
          <span>{source || "Documented through regional field archives."}</span>
        </div>
      </div>

      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#203E2D] hover:text-[#A45E45] font-semibold inline-flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Official reference</span>
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}
