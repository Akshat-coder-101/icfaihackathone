import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import DestinationPopup from "./DestinationPopup";

// Generate custom SVG HTML for category divIcon
function createCustomPin(category, isSelected) {
  let bgColor = "#1E3A2B"; // Default Deep Jungle Green
  let glyphSvg = `<circle cx="14" cy="14" r="5" fill="white" />`;

  if (category === "heritage") {
    bgColor = "#DC143C"; // Crimson
    glyphSvg = `<path d="M5 21V19H7V10H9V19H11V10H13V19H15V10H17V19H19V21H5ZM4 8L12 4L20 8V9H4V8Z" fill="white" />`;
  } else if (category === "village") {
    bgColor = "#0D9488"; // Teal
    glyphSvg = `<path d="M14 6L6 13V21H11V16H17V21H22V13L14 6Z" fill="white" />`;
  } else if (category === "nature") {
    bgColor = "#15803D"; // Forest Green
    glyphSvg = `<path d="M14 4L7 16H10L8 21H20L18 16H21L14 4Z" fill="white" />`;
  } else if (category === "market") {
    bgColor = "#7C3AED"; // Purple
    glyphSvg = `<path d="M6 7H22L20 18H8L6 7ZM10 11V14H12V11H10ZM14 11V14H16V11H14ZM14 2C12.34 2 11 3.34 11 5H9C9 2.24 11.24 0 14 0C16.76 0 19 2.24 19 5H17C17 3.34 15.66 2 14 2Z" fill="white" />`;
  } else if (category === "attraction") {
    bgColor = "#B45309"; // Amber
    glyphSvg = `<path d="M14 3L16.5 9.5L23 10.5L18 15.5L19.5 22L14 18.5L8.5 22L10 15.5L5 10.5L11.5 9.5L14 3Z" fill="white" />`;
  } else if (category === "accommodation") {
    bgColor = "#2563EB"; // Blue
    glyphSvg = `<path d="M7 11V7H12V11H7ZM7 18V13H21V18H7ZM5 21V5H7V5H19V21H5Z" fill="white" />`;
  }

  const pulseRing = isSelected
    ? `<span style="position:absolute; width:44px; height:44px; top:-6px; left:-6px; border-radius:50%; background:${bgColor}; opacity:0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
    : "";

  const shadow = `box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2);`;
  const border = isSelected ? "border: 2.5px solid #FFD700;" : "border: 2px solid #FFFFFF;";
  const scale = isSelected ? "transform: scale(1.15);" : "";

  return L.divIcon({
    className: "nagaquest-map-pin",
    html: `
      <div style="position:relative; width:32px; height:32px; cursor:pointer;">
        ${pulseRing}
        <div style="width:32px; height:32px; background:${bgColor}; border-radius:50% 50% 50% 0; transform: rotate(-45deg); display:flex; align-items:center; justify-content:center; ${border} ${shadow} ${scale} transition: transform 0.2s ease;">
          <div style="transform: rotate(45deg); width:20px; height:20px; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor">
              ${glyphSvg}
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

export default function DestinationMarker({
  destination,
  isSelected,
  onSelect
}) {
  const customIcon = useMemo(() => {
    return createCustomPin(destination.category, isSelected);
  }, [destination.category, isSelected]);

  if (!destination.latitude || !destination.longitude) {
    return null;
  }

  return (
    <Marker
      position={[destination.latitude, destination.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          if (onSelect) onSelect(destination);
        }
      }}
    >
      <Popup className="nagaquest-leaflet-popup" maxWidth={320}>
        <DestinationPopup destination={destination} />
      </Popup>
    </Marker>
  );
}
