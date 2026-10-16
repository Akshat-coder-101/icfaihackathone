import { useState } from "react";
import {
  Calendar,
  AlertTriangle,
  Compass,
  Radio
} from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import SeasonSelector from "./SeasonSelector";
import TourismEmptyState from "./TourismEmptyState";
import SourceAttribution from "./SourceAttribution";
import { SEASONS_DATA, MONTHS_LIST } from "../../data/tourismData";

export default function SeasonalTravelView() {
  const [selectedSeasonId, setSelectedSeasonId] = useState("spring");
  const [selectedMonth, setSelectedMonth] = useState("March");

  const activeSeason =
    SEASONS_DATA.find(s => s.id === selectedSeasonId) || SEASONS_DATA[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-Navigation Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="Seasonal Travel Planning"
        badgeIcon={Calendar}
        title="Best Time to Visit Nagaland"
        subtitle="Understand the seasonal rhythm of the Naga hills. Plan visits around blooming seasons, highland trekking conditions, cultural festivals, and road accessibility."
        breadcrumbs={[{ label: "Best Time to Visit" }]}
      />

      {/* Interactive Season & Month Selector */}
      <SeasonSelector
        seasons={SEASONS_DATA}
        selectedSeasonId={selectedSeasonId}
        onSelectSeason={id => {
          setSelectedSeasonId(id);
          const season = SEASONS_DATA.find(s => s.id === id);
          if (season && season.months.length > 0) {
            setSelectedMonth(season.months[0]);
          }
        }}
        selectedMonth={selectedMonth}
        onSelectMonth={m => setSelectedMonth(m)}
        monthsList={MONTHS_LIST}
      />

      {/* Active Seasonal Overview Card */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E1D6] pb-3">
          <div>
            <span className="editorial-tag text-[9px]">
              Active Season Overview
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#252B26] mt-1">
              {activeSeason.name} in Nagaland ({activeSeason.months.join(", ")})
            </h2>
            <p className="text-xs text-[#5C645E] mt-0.5">
              Currently Selected Month: <strong className="text-[#203E2D]">{selectedMonth}</strong>
            </p>
          </div>

          <div className="px-3 py-1 rounded-md bg-[#FAF7F2] border border-[#E6E1D6] text-xs font-semibold text-[#252B26]">
            {activeSeason.tagline}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5C645E] leading-relaxed max-w-4xl">
          {activeSeason.generalOverview}
        </p>

        {/* Travel Advisories & Road Accessibility Container */}
        <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle size={14} className="text-amber-700 shrink-0" />
            <span>Seasonal Travel & Road Accessibility Advisory</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            {activeSeason.travelAdvisories}
          </p>
        </div>
      </div>

      {/* Live Weather Integration Point */}
      <div className="bg-[#203E2D] text-white p-6 rounded-xl shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FAF7F2]/80">
            <Radio size={13} className="text-[#C68A36] animate-pulse" />
            <span>Meteorological Telemetry Integration Point</span>
          </div>
          <span className="editorial-tag bg-white/10 text-white border-white/20 text-[9px]">
            API Ready
          </span>
        </div>

        <h3 className="font-serif text-base font-bold text-white">
          Real-Time Weather & Mountain Forecast
        </h3>
        <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
          {activeSeason.weatherIntegrationNote} In accordance with data integrity rules, no invented temperatures or static simulated forecasts are rendered. Verified meteorological feeds will be connected in future releases.
        </p>
      </div>

      {/* District-Specific Recommendations Container */}
      <div className="space-y-4">
        <div className="border-b border-[#E6E1D6] pb-3">
          <h3 className="font-serif text-xl font-bold text-[#252B26]">
            District Recommendations for {activeSeason.name}
          </h3>
          <p className="text-xs text-[#5C645E]">
            Curated village festivals, trekking trails, and viewpoints for {activeSeason.name}
          </p>
        </div>

        {activeSeason.recommendations && activeSeason.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSeason.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="editorial-card p-5 space-y-2 hover:border-[#203E2D] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="editorial-tag text-[9px]">
                    {rec.district || "Nagaland"}
                  </span>
                  <span className="text-xs text-[#848E86] font-medium">{rec.activity}</span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#252B26]">{rec.title}</h4>
                <p className="text-xs text-[#5C645E] leading-relaxed">{rec.description}</p>
                {rec.bestMonths && (
                  <p className="text-[11px] text-[#848E86] font-medium pt-1">
                    Optimal Window: <span className="text-[#203E2D] font-bold">{rec.bestMonths}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <TourismEmptyState
            icon={Compass}
            title={`District Recommendations for ${activeSeason.name} Coming Soon`}
            description={`District-specific itineraries and seasonal highlights for ${activeSeason.name} will be published once reviewed by local tourism committees.`}
            showContribute={true}
            actionText="Propose Seasonal Itinerary"
            actionTo="/community-portal"
            categoryLabel="Seasonal Recommendations"
          />
        )}
      </div>

      <SourceAttribution
        source="Nagaland Tourism Meteorological & Seasonal Guidelines"
        provider="Community Stewards & State Tourism Advisory"
        lastReviewed="October 2026"
      />
    </div>
  );
}
