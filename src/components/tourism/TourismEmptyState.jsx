import { Inbox, ShieldAlert, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TourismEmptyState({
  icon: Icon = Inbox,
  title = "Information Coming Soon",
  description = "This section is being prepared for future verified content. In accordance with NagaQuest's data integrity policy, records are only published once approved through community stewardship or verified sources.",
  actionText = "Contribute via Community Portal",
  actionTo = "/community-portal",
  showContribute = true,
  categoryLabel = "Tourism Archive"
}) {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-[#CBD5E1] p-8 md:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9] text-[#1E3A2B] flex items-center justify-center mx-auto shadow-2xs">
        <Icon size={26} className="text-[#1E3A2B]/80" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
          <ShieldAlert size={11} /> {categoryLabel} • Pending Verification
        </div>
        <h3 className="text-lg font-black text-neutral-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
          {description}
        </p>
      </div>

      {showContribute && (
        <div className="pt-2">
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A2B] hover:bg-[#244735] text-white transition-all shadow-xs"
          >
            <PlusCircle size={14} />
            <span>{actionText}</span>
          </Link>
          <p className="text-[10px] text-neutral-400 mt-2 font-medium">
            Submissions undergo a 6-stage elder and community review process before publication.
          </p>
        </div>
      )}
    </div>
  );
}
