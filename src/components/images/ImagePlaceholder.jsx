import { MapPin, Compass, Utensils, Trees, Landmark, Camera } from "lucide-react";

function renderCategoryIcon(category) {
  const cat = (category || "").toLowerCase();
  const props = { size: 18, className: "text-[#1E3A2B]/80" };
  if (cat.includes("village")) return <Compass {...props} />;
  if (cat.includes("food") || cat.includes("cuisine")) return <Utensils {...props} />;
  if (cat.includes("wildlife") || cat.includes("flora") || cat.includes("fauna")) return <Trees {...props} />;
  if (cat.includes("heritage")) return <Landmark {...props} />;
  if (cat.includes("district")) return <MapPin {...props} />;
  return <Camera {...props} />;
}

export default function ImagePlaceholder({
  category = "destination",
  aspectRatio = "aspect-video",
  className = "",
  label = null
}) {
  return (
    <div
      className={`w-full ${aspectRatio} bg-gradient-to-br from-[#FAF7F2] via-[#F3EFE6] to-[#EAE5D9] border border-[#EAE5D9] rounded-2xl flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden ${className}`}
      role="img"
      aria-label={label || `${category} image pending verified community documentation`}
    >
      {/* Decorative Naga Weave Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E3A2B]/20" />

      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-[#EAE5D9] flex items-center justify-center text-[#1E3A2B] mb-2">
        {renderCategoryIcon(category)}
      </div>

      <span className="text-xs font-bold text-neutral-800 tracking-tight">
        {label || "Image Pending Documentation"}
      </span>

      <span className="text-[10px] text-neutral-500 max-w-xs mt-0.5 line-clamp-1">
        Awaiting verified community & elder approval
      </span>
    </div>
  );
}
