export default function VerificationBadge({
  status = "illustrative",
  label = null,
  size = "sm"
}) {
  const sizeClasses = size === "xs" 
    ? "px-2 py-0.5 text-[9px]" 
    : "px-2.5 py-1 text-[10px]";

  // Public verified records speak for themselves — do not stamp with decorative badges
  if (status === "verified_real" || status === "api_sourced" || status === "illustrative") {
    return null;
  }

  if (status === "draft") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        title="Record under community compilation"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {label || "Under review"}
      </span>
    );
  }

  if (status === "unverified_ai") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200 ${sizeClasses}`}
        title="Draft awaiting community elder review"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        {label || "Draft"}
      </span>
    );
  }

  return null;
}
