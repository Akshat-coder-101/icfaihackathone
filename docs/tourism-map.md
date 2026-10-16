# NagaQuest Interactive Tourism Map Guide

This document describes the architecture, open-source cartographic stack, data schemas, and developer workflows for the **NagaQuest Interactive Tourism Map**.

---

## 1. Overview & Technology Stack

The NagaQuest Tourism Map is an open-source, billing-free geographic exploration tool for Nagaland built directly into the existing application:

* **React 19 & Vite**: Primary UI runtime.
* **React Leaflet (`^5.0.0`) & Leaflet (`^1.9.4`)**: Client-side interactive mapping.
* **OpenStreetMap (OSM) Tiles**: Free cartographic tile layer served with compulsory OpenStreetMap Foundation attribution (`&copy; OpenStreetMap contributors, ODbL`).
* **Zero Billing & Zero Paid Keys**: No Google Maps Platform billing setup, credit/debit card, or proprietary API key required.
* **NagaQuest Image Management Integration**: Popups and destination cards seamlessly consume `ManagedImage` with responsive WebP variants and culturally styled category vector placeholders.
* **Data Integrity Protocol**: Only verified coordinates within Nagaland are rendered. Factual coordinates are never fabricated to artificially populate empty areas.

---

## 2. Directory & Component Structure

```
icfaihackathone/
├── src/
│   ├── data/
│   │   └── tourismDestinations.js        # Geocoded destination registry & filter helpers
│   ├── components/
│   │   ├── maps/
│   │   │   ├── TourismMap.jsx            # Core Leaflet map container & tile layer
│   │   │   ├── DestinationMarker.jsx     # Custom category-themed L.divIcon SVG pins
│   │   │   ├── DestinationPopup.jsx      # Rich popup card with thumbnail & directions
│   │   │   ├── MapControls.jsx           # Floating actions: Reset, Fit Bounds, Locate Me
│   │   │   ├── MapLoadingState.jsx       # Skeleton loading state
│   │   │   └── index.js                  # Barrel export
│   │   └── tourism/
│   │       ├── TourismMapPage.jsx        # Full responsive explorer page (/tourism/map)
│   │       └── TourismNavTabs.jsx        # Unified tourism sub-navigation
└── docs/
    └── tourism-map.md                    # This architecture document
```

---

## 3. Geographic Extent & Configuration

Nagaland is situated between approx 25.10° N to 27.05° N latitude and 93.30° E to 95.35° E longitude.

| Property | Value | Description |
| :--- | :--- | :--- |
| **State Center** | `[26.1584, 94.5624]` | Geometric center of Nagaland |
| **Default Zoom** | `8` | Displays all 16 hill districts |
| **Bounding Box** | `[[25.10, 93.30], [27.05, 95.35]]` | Max view constraint to keep focus on Nagaland |
| **Min / Max Zoom** | `7` to `17` | Prevents unnecessary global tile requests |

### Verified District Centers
- **Peren**: `[25.5186, 93.7389]` (Zoom: 11)
- **Kohima**: `[25.6700, 94.1070]` (Zoom: 11)
- **Dimapur**: `[25.9064, 93.7275]` (Zoom: 11)
- **Wokha**: `[26.2328, 94.2592]` (Zoom: 11)
- **Mokokchung**: `[26.3256, 94.5200]` (Zoom: 11)
- **Phek**: `[25.6833, 94.3167]` (Zoom: 11)
- **Mon**: `[26.7500, 95.0667]` (Zoom: 11)
- **Tuensang**: `[26.2342, 94.7415]` (Zoom: 11)

---

## 4. Destination Schema

Every destination entry in `src/data/tourismDestinations.js` conforms to the schema:

```javascript
{
  id: "khonoma-green-village",                       // Unique stable identifier
  name: "Khonoma Green Village",                     // Destination name
  districtId: "kohima",                              // Associated district key
  districtName: "Kohima",                            // Display name of district
  latitude: 25.6542904,                              // Verified decimal latitude
  longitude: 94.0220132,                             // Verified decimal longitude
  category: "village",                               // "heritage" | "village" | "nature" | "attraction" | "market" | "accommodation"
  description: "India's first green village...",     // Cultural / travel description
  imageId: null,                                     // Reference to imageManifest.js (or null for SVG fallback)
  dataStatus: "verified_real",                       // "verified_real" | "api_sourced" | "illustrative"
  detailPath: "/tourism/districts/kohima",           // Internal route to district or destination page
  address: "Khonoma, Kohima District, Nagaland",     // Geographic address
  sourceProvider: "OpenStreetMap (Node 245736456)"   // Attribution and provenance
}
```

---

## 5. Adding a New Destination to the Map

1. Verify coordinates using authoritative OpenStreetMap nodes, official government records, or field surveys. Ensure coordinates fall strictly within Nagaland.
2. Open `src/data/tourismDestinations.js`.
3. Add the record to the `CURATED_DESTINATIONS` array:
   ```javascript
   {
     id: "new-destination-slug",
     name: "Destination Name",
     districtId: "district_key",
     districtName: "District Name",
     latitude: 25.xxxxx,
     longitude: 94.xxxxx,
     category: "heritage", // or "village", "nature", "attraction", "market"
     description: "Verified description...",
     imageId: "optional-manifest-image-id",
     dataStatus: "verified_real",
     detailPath: "/tourism/districts/district_key",
     address: "Locality, Nagaland",
     sourceProvider: "Authoritative Survey"
   }
   ```
4. Save the file. The interactive map, search index, and district filters update automatically.

---

## 6. Key Features & Controls

1. **Category-Themed SVG Pins (`DestinationMarker.jsx`)**:
   Uses Leaflet `L.divIcon` to generate crisp vector pins matching the NagaQuest palette:
   - Crimson (`#DC143C`): Heritage & Ancient Morungs
   - Teal (`#0D9488`): Historic Villages
   - Forest Green (`#15803D`): Nature Reserves & Mountain Peaks
   - Amber (`#B45309`): Cultural Landmarks
   - Purple (`#7C3AED`): Traditional Craft & Local Markets
   - Blue (`#2563EB`): Hotels & Stays
2. **Floating Map Controls (`MapControls.jsx`)**:
   - **Reset Nagaland Extent**: Resets map view smoothly to full state overview (`zoom: 8`).
   - **Fit Bounds**: Automatically zooms and frames all currently filtered destination pins.
   - **Locate Me**: One-shot browser geolocation (requests permission, pans to user coordinates with a pulsing indicator, handles errors gracefully, does not track continuously).
3. **Directions & Navigation**:
   Destination popups and cards include direct external navigation links to Google Maps (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`) and OpenStreetMap directions without requiring any Google Maps API keys or billing.
4. **Offline Resilience & Save Capability**:
   - Detects tile failure and displays a non-intrusive banner while keeping local destination data available.
   - Users can click the Bookmark button on any card to save the destination to the IndexedDB-backed `offlineLibrary`.

---

## 7. OpenStreetMap Usage & Attribution Compliance

The map complies with the OpenStreetMap Foundation Tile Usage Policy:
- Uses the standard tile server: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- Compulsory attribution is permanently displayed on the map canvas: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`.
- Does not bulk scrape or pre-fetch tiles across unauthorized zoom levels.
- Max zoom is constrained to level 17 to prevent excessive tile traffic.
