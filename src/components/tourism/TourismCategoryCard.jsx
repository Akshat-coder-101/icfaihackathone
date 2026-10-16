import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function TourismCategoryCard({
  to,
  icon: Icon,
  title,
  tagline,
  meta,
  badgeText
}) {
  return (
    <Link
      to={to}
      className="editorial-card p-5 flex flex-col justify-between group transition-all"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-[#F7F5EF] text-[#203E2D] flex items-center justify-center border border-[#E6E1D6] group-hover:bg-[#203E2D] group-hover:text-white transition-colors">
            {Icon && <Icon size={18} />}
          </div>
          {badgeText && (
            <span className="editorial-tag text-[10px]">
              {badgeText}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-serif text-base font-bold text-[#252B26] group-hover:text-[#203E2D] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[#5C645E] mt-1 leading-relaxed">
            {tagline}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-[#E6E1D6] flex items-center justify-between text-xs font-semibold">
        <span className="text-[11px] text-[#848E86]">
          {meta || "Structured Directory"}
        </span>
        <span className="inline-flex items-center gap-1 text-[#203E2D] group-hover:text-[#A45E45] group-hover:translate-x-1 transition-all">
          Explore <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
