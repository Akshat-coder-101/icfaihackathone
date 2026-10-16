import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { WifiOff } from "lucide-react";
import DestinationMarker from "./DestinationMarker";
import MapControls from "./MapControls";
import MapLoadingState from "./MapLoadingState";
import {
  NAGALAND_CENTER,
  NAGALAND_DEFAULT_ZOOM,
  NAGALAND_BOUNDS,
  DISTRICT_CENTERS
} from "../../data/tourismDestinations";

// Controller component to smoothly pan/zoom map when props change
function MapViewController({
  selectedDestination,
  selectedDistrict,
  destinations
}) {
  const map = useMap();
  const prevDistrictRef = useRef(selectedDistrict);
  const prevDestIdRef = useRef(selectedDestination?.id);

  // 1. Pan to destination if selected
  useEffect(() => {
    if (selectedDestination?.latitude && selectedDestination?.longitude) {
      if (prevDestIdRef.current !== selectedDestination.id) {
        prevDestIdRef.current = selectedDestination.id;
        map.flyTo(
          [selectedDestination.latitude, selectedDestination.longitude],
          13,
          { duration: 1.2 }
        );
      }
    }
  }, [selectedDestination, map]);

  // 2. Pan to district when district filter changes
  useEffect(() => {
    if (prevDistrictRef.current !== selectedDistrict) {
      prevDistrictRef.current = selectedDistrict;

      const districtMeta = DISTRICT_CENTERS[selectedDistrict?.toLowerCase()];
      if (districtMeta) {
        const districtDestinations = destinations.filter(
          d => d.districtId?.toLowerCase() === selectedDistrict.toLowerCase() && d.latitude
        );

        if (districtDestinations.length > 0) {
          const coords = districtDestinations.map(d => [d.latitude, d.longitude]);
          map.fitBounds(coords, {
            padding: [50, 50],
            maxZoom: 12,
            duration: 1
          });
        } else {
          map.flyTo(districtMeta.center, districtMeta.zoom, { duration: 1 });
        }
      }
    }
  }, [selectedDistrict, destinations, map]);

  return null;
}

export default function TourismMap({
  destinations = [],
  selectedDestination = null,
  selectedDistrict = "all",
  onSelectDestination,
  className = ""
}) {
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className={`relative w-full h-full min-h-[460px] md:min-h-[580px] rounded-xl overflow-hidden border border-[#E6E1D6] shadow-xs bg-[#FAF7F2] ${className}`}>
      {/* Offline / Tile Failure Banner */}
      {tileError && (
        <div className="absolute top-3 left-3 right-16 z-[1001] bg-amber-50/95 backdrop-blur-xs border border-amber-200 rounded-lg p-2.5 shadow-md flex items-center gap-2 text-xs text-amber-800">
          <WifiOff size={16} className="shrink-0 text-amber-600" />
          <div className="flex-1">
            <span className="font-bold">Offline / Limited Tile Access: </span>
            <span>Map tiles could not load. Destination coordinates and info cards remain fully available below.</span>
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={NAGALAND_CENTER}
        zoom={NAGALAND_DEFAULT_ZOOM}
        minZoom={7}
        maxZoom={17}
        maxBounds={NAGALAND_BOUNDS}
        maxBoundsViscosity={0.7}
        scrollWheelZoom={true}
        zoomControl={false}
        whenReady={() => setMapReady(true)}
        className="w-full h-full z-0 font-sans"
        style={{ minHeight: "100%", width: "100%" }}
      >
        {/* OpenStreetMap Standard Tiles with compulsory TOS Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            tileerror: () => {
              setTileError(true);
            }
          }}
        />

        {/* Custom Zoom Control positioned bottom right */}
        <ZoomControl position="bottomright" />

        {/* Dynamic View Controller */}
        <MapViewController
          selectedDestination={selectedDestination}
          selectedDistrict={selectedDistrict}
          destinations={destinations}
        />

        {/* Custom Floating Map Action Controls */}
        <MapControls
          destinations={destinations}
          onUserLocationFound={(coords) => setUserLocation(coords)}
        />

        {/* User Geolocation Pin */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{ color: "#2563EB", fillColor: "#3B82F6", fillOpacity: 0.85, weight: 3 }}
          />
        )}

        {/* Destination Markers */}
        {destinations.map(destination => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            isSelected={selectedDestination?.id === destination.id}
            onSelect={onSelectDestination}
          />
        ))}
      </MapContainer>

      {/* Initial Map Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-20">
          <MapLoadingState />
        </div>
      )}
    </div>
  );
}
