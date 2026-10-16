import { Flower2, Sun, CloudRain, Snowflake } from "lucide-react";

export default function SeasonSelector({
  seasons = [],
  selectedSeasonId,
  onSelectSeason,
  selectedMonth,
  onSelectMonth,
  monthsList = []
}) {
  const getIcon = (id) => {
    switch (id) {
      case "spring":
        return Flower2;
      case "summer":
        return Sun;
      case "monsoon":
        return CloudRain;
      case "winter":
        return Snowflake;
      default:
        return Sun;
    }
  };

  return (
    <div className="space-y-3">
      {/* 4 Seasons Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {seasons.map(season => {
          const Icon = getIcon(season.id);
          const isSelected = season.id === selectedSeasonId;

          return (
            <button
              key={season.id}
              onClick={() => onSelectSeason(season.id)}
              className={`p-4 rounded-lg border transition-all text-left flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-[#203E2D] text-white border-[#203E2D] shadow-xs"
                  : "bg-white text-[#252B26] border-[#E6E1D6] hover:border-[#203E2D]/50 hover:shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-white/10 text-[#FAF7F2]"
                      : "bg-[#F7F5EF] text-[#203E2D] group-hover:bg-[#203E2D] group-hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A45E45]" />
                )}
              </div>

              <div className="mt-3">
                <span className="block font-serif text-sm font-bold tracking-tight">
                  {season.name}
                </span>
                <span
                  className={`text-[11px] block mt-0.5 ${
                    isSelected ? "text-white/70" : "text-[#848E86]"
                  }`}
                >
                  {season.months.join(" • ")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Month Selector Pills */}
      <div className="editorial-card p-3 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#848E86] block px-1">
          Select Month for Detailed Advisory
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {monthsList.map(month => {
            const isMonthSelected = selectedMonth === month.name;
            const matchesActiveSeason = month.seasonId === selectedSeasonId;

            return (
              <button
                key={month.name}
                onClick={() => {
                  onSelectMonth(month.name);
                  if (month.seasonId !== selectedSeasonId) {
                    onSelectSeason(month.seasonId);
                  }
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isMonthSelected
                    ? "bg-[#203E2D] text-white shadow-xs"
                    : matchesActiveSeason
                    ? "bg-[#FAF7F2] text-[#203E2D] hover:bg-[#EAE5D9]"
                    : "bg-transparent text-[#848E86] hover:text-[#252B26]"
                }`}
              >
                {month.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
