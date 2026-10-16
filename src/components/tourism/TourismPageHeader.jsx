import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function TourismPageHeader({
  badgeText = "Cultural Tourism & Discovery",
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  breadcrumbs = [],
  showBack = false,
  actions = null
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#203E2D] text-[#FAF7F2] p-6 sm:p-8 rounded-xl shadow-xs relative overflow-hidden border border-[#203E2D]">
      <div className="relative z-10 max-w-4xl space-y-3">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70 overflow-x-auto pb-1 scrollbar-custom">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0 text-white/40" />
          <Link to="/tourism" className="hover:text-white transition-colors">
            Explore Nagaland
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight size={12} className="shrink-0 text-white/40" />
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white font-semibold">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Back Button & Category Badge */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              aria-label="Go back"
            >
              <ArrowLeft size={13} /> Back
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#A45E45] text-white">
            {BadgeIcon && <BadgeIcon size={12} />}
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Title & Subtitle with Serif Display */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}

        {/* Optional Actions Slot */}
        {actions && <div className="pt-2">{actions}</div>}
      </div>
    </div>
  );
}
