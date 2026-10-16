import { BookOpen, Sparkles, AlertCircle } from "lucide-react";

export default function ResponseMetaBadge({ dataStatus, groundingLevel, citations = [] }) {
  // 1. Data Integrity Status: Quiet, informative contextual labels
  if (dataStatus === "verified_real") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#203E2D]/8 text-[#203E2D] border border-[#203E2D]/20">
        Community contribution
      </span>
    );
  }

  if (dataStatus === "published_reference") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-[#5C645E] border border-stone-200">
        <BookOpen size={10} className="text-[#5C645E]" />
        Published reference
      </span>
    );
  }

  if (dataStatus === "ai_generated") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <Sparkles size={10} />
        Draft — unreviewed
      </span>
    );
  }

  // 2. AI Companion Retrieval Context
  if (groundingLevel === "grounded_archive" && citations.length > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#203E2D]/8 text-[#203E2D] border border-[#203E2D]/20">
        <BookOpen size={12} />
        <span>Based on {citations.length} archive {citations.length === 1 ? "record" : "records"}</span>
      </div>
    );
  }

  if (groundingLevel === "archive_gap") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <AlertCircle size={12} />
        <span>Limited documented material</span>
      </div>
    );
  }

  return null;
}
