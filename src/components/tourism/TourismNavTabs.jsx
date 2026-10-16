import { NavLink } from "react-router-dom";
import {
  Compass,
  MapPin,
  Map,
  Utensils,
  Calendar,
  Hotel,
  ShieldCheck,
  Trees
} from "lucide-react";

export default function TourismNavTabs() {
  const tabs = [
    { to: "/tourism", label: "Overview", icon: Compass, end: true },
    { to: "/tourism/districts", label: "Districts & Villages", icon: MapPin },
    { to: "/tourism/map", label: "Interactive Map", icon: Map },
    { to: "/tourism/food", label: "Culinary Heritage", icon: Utensils },
    { to: "/tourism/best-time-to-visit", label: "Seasons & Festivals", icon: Calendar },
    { to: "/tourism/stays", label: "Homestays & Lodging", icon: Hotel },
    { to: "/tourism/ilp", label: "ILP Guidelines", icon: ShieldCheck },
    { to: "/tourism/flora-fauna", label: "Flora & Fauna", icon: Trees }
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-custom">
      <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#E6E1D6] rounded-lg shadow-2xs min-w-max">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#203E2D] text-white font-semibold shadow-xs"
                    : "text-[#5C645E] hover:text-[#203E2D] hover:bg-[#F7F5EF]"
                }`
              }
            >
              <Icon size={13} className="shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
