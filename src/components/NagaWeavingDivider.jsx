/**
 * Reusable Naga Heritage Editorial Divider Component
 * Subtle geometric lozenge motif inspired by customary weaving geometry.
 */
export default function NagaWeavingDivider({ className = "" }) {
  return (
    <div className={`w-full flex items-center justify-center my-6 ${className}`} aria-hidden="true">
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#E6E1D6] to-[#A45E45]/40" />
      <div className="mx-4 flex items-center gap-1.5 opacity-60">
        <span className="w-1.5 h-1.5 rotate-45 bg-[#A45E45]" />
        <span className="w-2 h-2 rotate-45 border border-[#203E2D]" />
        <span className="w-1.5 h-1.5 rotate-45 bg-[#A45E45]" />
      </div>
      <div className="flex-grow h-px bg-gradient-to-l from-transparent via-[#E6E1D6] to-[#A45E45]/40" />
    </div>
  );
}
