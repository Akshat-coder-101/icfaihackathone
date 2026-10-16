import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import ManagedImage from "../images/ManagedImage";

export default function DistrictCard({ district }) {
  const villageCount = district.villages?.length || 0;
  const festivalCount = district.festivals?.length || 0;

  return (
    <div className="editorial-card flex flex-col justify-between overflow-hidden group">
      {/* Top Managed Image Banner */}
      <div className="relative aspect-16/9 bg-[#F2EFE8] overflow-hidden">
        <ManagedImage
          imageId={district.imageId}
          category="district"
          aspectRatio="aspect-16/9"
          alt={`${district.name} District overview`}
          showAttribution={false}
          imgClassName="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FAF7F2] drop-shadow-xs">
            <MapPin size={12} className="text-[#C68A36]" />
            <span>{district.region}</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
          <h3 className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-[#FAF7F2] transition-colors leading-tight drop-shadow-xs">
            {district.name} District
          </h3>
          <p className="text-[11px] text-white/80 font-medium">
            HQ: {district.headquarters}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#A45E45]">
            {district.tagline || "District Explorer Profile"}
          </p>
          <p className="text-xs text-[#5C645E] line-clamp-3 leading-relaxed">
            {district.description || "District records are being curated for this directory."}
          </p>
        </div>

        {/* Counts & Sections Metadata */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E6E1D6] text-center">
          <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#E6E1D6]/80">
            <span className="block text-xs font-bold text-[#203E2D]">
              {villageCount}
            </span>
            <span className="text-[10px] text-[#848E86]">Villages</span>
          </div>

          <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#E6E1D6]/80">
            <span className="block text-xs font-bold text-[#203E2D]">
              {festivalCount}
            </span>
            <span className="text-[10px] text-[#848E86]">Festivals</span>
          </div>

          <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#E6E1D6]/80">
            <span className="block text-xs font-bold text-[#203E2D]">
              {district.contentSections?.length || 0}
            </span>
            <span className="text-[10px] text-[#848E86]">Sections</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-2 flex items-center justify-end border-t border-[#E6E1D6]/60">
          <Link
            to={`/tourism/districts/${district.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#203E2D] hover:bg-[#A45E45] text-white transition-colors"
          >
            <span>Explore District</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
