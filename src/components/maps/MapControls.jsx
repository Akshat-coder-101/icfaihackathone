import { useState } from "react";
import { useMap } from "react-leaflet";
import { RotateCcw, Locate, Maximize2, AlertCircle, CheckCircle2 } from "lucide-react";
import { NAGALAND_CENTER, NAGALAND_DEFAULT_ZOOM } from "../../data/tourismDestinations";

export default function MapControls({
  destinations = [],
  onUserLocationFound
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  // 1. Reset map to full Nagaland extent
  const handleResetNagaland = () => {
    map.flyTo(NAGALAND_CENTER, NAGALAND_DEFAULT_ZOOM, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  };

  // 2. Fit bounds to all currently visible filtered destinations
  const handleFitBounds = () => {
    const validCoords = destinations
      .filter(d => d.latitude && d.longitude)
      .map(d => [d.latitude, d.longitude]);

    if (validCoords.length > 0) {
      map.fitBounds(validCoords, {
        padding: [40, 40],
        maxZoom: 14,
        animate: true,
        duration: 1
      });
    } else {
      handleResetNagaland();
    }
  };

  // 3. User Geolocation (One-shot with permission & privacy respect)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "error",
        message: "Geolocation is not supported by your browser."
      });
      setTimeout(() => setLocationStatus(null), 4000);
      return;
    }

    setLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 13, { duration: 1.2 });

        if (onUserLocationFound) {
          onUserLocationFound([latitude, longitude]);
        }

        setLocationStatus({
          type: "success",
          message: "Centered on your approximate location."
        });
        setTimeout(() => setLocationStatus(null), 3500);
      },
      (err) => {
        setLocating(false);
        let msg = "Could not obtain location.";
        if (err.code === 1) msg = "Location permission was denied.";
        if (err.code === 2) msg = "Position unavailable.";
        if (err.code === 3) msg = "Location request timed out.";

        setLocationStatus({ type: "error", message: msg });
        setTimeout(() => setLocationStatus(null), 4000);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <>
      {/* Floating Control Toolbar on Map (Top Right) */}
      <div className="leaflet-top leaflet-right !top-3 !right-3 z-[1000] flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-sm p-1 rounded-2xl border border-[#EAE5D9] shadow-md flex flex-col gap-1">
          <button
            onClick={handleResetNagaland}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#1E3A2B] hover:bg-[#FAF7F2] hover:text-[#DC143C] transition-colors"
            title="Reset to Full Nagaland Extent"
            aria-label="Reset to Full Nagaland Extent"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={handleFitBounds}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#1E3A2B] hover:bg-[#FAF7F2] hover:text-[#DC143C] transition-colors"
            title="Fit to All Filtered Sites"
            aria-label="Fit to All Filtered Sites"
          >
            <Maximize2 size={15} />
          </button>

          <button
            onClick={handleLocateMe}
            disabled={locating}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              locating
                ? "bg-amber-100 text-amber-800 animate-spin"
                : "text-[#1E3A2B] hover:bg-[#FAF7F2] hover:text-[#DC143C]"
            }`}
            title="Find My Location (Single Check)"
            aria-label="Find My Location"
          >
            <Locate size={15} />
          </button>
        </div>

        {/* Location Status Feedback Toast */}
        {locationStatus && (
          <div
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md border animate-fadeIn flex items-center gap-1.5 ${
              locationStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {locationStatus.type === "success" ? (
              <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={12} className="shrink-0 text-red-600" />
            )}
            <span>{locationStatus.message}</span>
          </div>
        )}
      </div>
    </>
  );
}
