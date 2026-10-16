# NagaQuest District Tourism Experience

## 1. Overview & Architecture

The **NagaQuest District Tourism Experience** provides a modular, reusable, and data-driven district explorer template for all districts of Nagaland. Instead of creating separate, duplicated JSX page implementations for each district, a single unified template (`DistrictDetailPage.jsx`) dynamically renders district overviews, indigenous villages, curated geographic destinations, cultural festivals, heritage monuments, nature sanctuaries, travel access information, and adjacent neighboring territories.

### Architectural Core Principles
1. **Zero Hardcoded District Pages**: Kohima, Dimapur, Peren, and any future districts share the exact same template file (`DistrictDetailPage.jsx`). Adding or updating a district requires **only** updating data records in `src/data/tourismData.js` and `src/data/tourismDestinations.js`.
2. **Centralized Data Sources of Truth**:
   - `DISTRICTS_REGISTRY` in `src/data/tourismData.js`: Authoritative district identity, region, tagline, verified villages, festivals, heritage sites, nature attractions, and travel information.
   - `CURATED_DESTINATIONS` in `src/data/tourismDestinations.js`: Centralized destination registry with coordinates, category, address, and provenance metadata. Destinations matching `districtId` are dynamically merged into the district's destination directory automatically.
   - `IMAGE_MANIFEST` in `src/data/images/imageManifest.js`: Centralized image assets with responsive WebP variants, dimensions, and attribution.
3. **Anti-Fabrication & Cultural Provenance Policy**:
   - NagaQuest strictly forbids fabricating hotel names, room prices, fake folklore, or synthetic photography.
   - Where verified field records exist (e.g. pilot photography for Peren Old Village and Benreu), authentic photography is loaded through `ManagedImage`.
   - Where photography is pending field compilation (e.g. Kohima or Dimapur hero banners), clean category SVG placeholders (`/images/placeholders/district-placeholder.svg`) are displayed without breaking the layout.
   - Where content categories (such as hotels or cuisine) are not yet verified by local councils, informative neutral empty states (`TourismEmptyState`) are displayed with direct pathways to state-wide guides (`/tourism/stays`, `/tourism/food`).

---

## 2. Reusable Component Hierarchy

```
DistrictDetailPage.jsx (Route: /tourism/districts/:districtId)
│
├── TourismNavTabs (Cross-module tourism navigation)
├── TourismPageHeader (Breadcrumbs, title, HQ badge, region badge, verification badge, share action)
├── District Hero Banner (ManagedImage with category="district" + priority loading)
├── NagaWeavingDivider (Traditional geometric design motif)
├── Section Anchor Navigation (Filter by All, Villages, Destinations, Map, Festivals, Heritage, Nature, Stays, Cuisine, Travel, Nearby, Archive)
│
├── 1. District Overview (Administrative HQ, Geographic region, Preservation status, Tagline & Overview)
├── 2. Village Explorer (VillageCard grid with Morungs, trails, distance from HQ, and highlights)
├── 3. Destination Directory (DestinationCard grid dynamically merged from CURATED_DESTINATIONS)
├── 4. Interactive Map Callout (Direct deep-link to /tourism/map?district=:districtId)
├── 5. Cultural Festivals & Ceremonies (Traditional rites, seasonal periods, and cultural significance)
├── 6. Historical & Heritage Sites (Monoliths, historic battlegrounds, morungs, and Atlas links)
├── 7. Nature & Outdoor Attractions (High-altitude valleys, peaks, sanctuaries, and flora)
├── 8. Accommodations & Homestays (AccommodationCard or neutral empty state linking to /tourism/stays)
├── 9. Traditional Cuisine & Food (CuisineCard or neutral empty state linking to /tourism/food)
├── 10. Travel & Access Information (Road connectivity, nearest airport, railway station, road conditions, and ILP links)
├── 11. Nearby Districts (Adjacency navigation cards linking to /tourism/districts/:adjacentId)
├── 12. Related Living Archive Records (Cross-links to /heritage-atlas, /oral-archive, /language-studio)
└── SourceAttribution (Provider attribution and review timestamp)
```

---

## 3. Map Preselection & State Sharing

When a visitor clicks **"Explore on Map"** or **"Open in Interactive Map"** from any district page, the application navigates to:
```
/tourism/map?district=:districtId
```
`TourismMapPage.jsx` inspects the URL query parameters using `useSearchParams`:
1. Reads `?district=:districtId`.
2. Automatically preselects that district in the district filter dropdown.
3. Automatically triggers the existing Leaflet `MapViewController`, which:
   - If the district has destinations with coordinates, calls `map.fitBounds(coords)` to smoothly zoom and center the viewport on those destinations.
   - If no markers exist yet, flies smoothly to `DISTRICT_CENTERS[districtId].center` at the optimal zoom level.
4. When the user changes the district dropdown inside `TourismMapPage`, the URL search parameter updates in real time, preserving browser back/forward history and shareable URLs.

---

## 4. Initial Districts Population

### 1. Kohima District (`/tourism/districts/kohima`)
- **Status**: Published (`verified_real`)
- **Headquarters**: Kohima
- **Region**: Southern Hills
- **Curated Destinations (5)**: Khonoma Green Village, Kisama Naga Heritage Village, Dzukou Valley Trailhead, Kohima Commonwealth War Cemetery, Nagaland State Museum.
- **Villages (3)**: Khonoma Village (KNCTS sanctuary, Semoma Fort), Kisama Heritage Village (Hornbill venue, all tribal morungs), Jakhama Village (Dzukou Valley gateway, Angami terraced fields).
- **Cultural Festivals (2)**: Sekrenyi (Angami purification festival, February), Hornbill Festival (State-wide convergence, Dec 1–10).
- **Heritage Sites (3)**: Kohima Commonwealth War Cemetery (Garrison Hill & DC tennis court), Kisama Morung Complex, Nagaland State Museum at Bayavü.
- **Nature Attractions (2)**: Dzukou Valley Biosphere Reserve (2,452m), Japfü Peak (3,048m, world's tallest rhododendron tree).
- **Nearby Districts**: Dimapur, Peren, Wokha, Phek.

### 2. Dimapur District (`/tourism/districts/dimapur`)
- **Status**: Published (`verified_real`)
- **Headquarters**: Dimapur / Chümoukedima
- **Region**: Western Plains & Foothills
- **Curated Destinations (2)**: Kachari Medieval Monolith Ruins (Rajbari), Diezephe Craft Heritage Village.
- **Villages & Craft Centers (2)**: Diezephe Craft Heritage Village (Generational woodcarving & backstrap weaving), Chümoukedima Heritage Foothills (1860s British administrative post, Triple Falls).
- **Cultural Festivals (1)**: Dimapur Inter-Tribal Cultural Exchanges & Post-Harvest Thanksgiving Fairs.
- **Heritage Sites (1)**: Kachari Medieval Sandstone Monoliths (ASI protected).
- **Nature Attractions (2)**: Nagaland Zoological Park (176 ha wildlife reserve), Green Park Eco-Zone.
- **Nearby Districts**: Kohima, Peren.

### 3. Peren District (`/tourism/districts/peren`)
- **Status**: Published (`verified_real`)
- **Headquarters**: Peren
- **Region**: South-Western Hills
- **Curated Destinations (4)**: Benreu Tourist Village, Poilwa Village & Sheep Farm, Mount Pauna Sanctuary Peak, Rehangki Morung.
- **Villages (7)**: Poilwa, Benreu, Pedi, Peletkie, Puilwa, Nzauna, Peren Town.
- **Cultural Festivals (3)**: Hega Festival (February), Milei Ngyi Festival, Cosmos Festival (Peletkie).
- **Heritage Sites (2)**: Rehangki Traditional Morungs, Chepeube Ancestral Salt Springs.
- **Nature Attractions (2)**: Mount Pauna (2,486m), Poilwa Sheep Farm & Hausum Valley.
- **Verified Imagery**: `peren-overview`, `benreu-village`, `poilwa-sheep-farm`.
- **Nearby Districts**: Kohima, Dimapur.

---

## 5. How to Add a New District (Zero JSX Edits)

To add another district (e.g. Tuensang, Zunheboto, Kiphire, Longleng, Noklak, Shamator, Niuland, Tseminyu):

### Step 1: Add District Record in `src/data/tourismData.js`
In `DISTRICTS_REGISTRY`, append a new object conforming to the schema:
```javascript
{
  id: "tuensang",
  name: "Tuensang",
  headquarters: "Tuensang",
  region: "Eastern Frontier Hills",
  tagline: "Land of the Chang, Khiamniungan, Sangtam, and Yimkhiung Communities",
  description: "The largest eastern district of Nagaland...",
  status: "published", // or "draft"
  dataStatus: "verified_real", // or "illustrative"
  imageId: null, // or manifest ID if verified photo is registered
  nearbyDistrictIds: ["mon", "mokokchung", "kiphire", "shamator", "noklak"],
  contentSections: ["overview", "destinations", "villages", "festivals", "travel_info", "stays", "map"],
  villages: [
    {
      id: "tuensang-village",
      name: "Tuensang Village",
      distance: "Adjacent to town",
      bestSeason: "October to April",
      highlights: ["Ancestral Chang settlement", "Traditional log drum pavilion"],
      description: "...",
      attractions: ["Historic Morungs", "Community log drum"]
    }
  ],
  festivals: [
    {
      id: "naknyulem",
      name: "Naknyulüm Festival",
      period: "July",
      associatedCommunity: "Chang Naga",
      description: "...",
      significance: "..."
    }
  ],
  heritageSites: [],
  natureAttractions: [],
  travelInfo: {
    connectivity: "Connected via NH-202 from Mokokchung and Kohima.",
    nearestAirport: "Jorhat Airport (Assam) — approx 180 KM",
    nearestRailway: "Amguri / Mariani (Assam) — approx 160 KM"
  },
  relatedArchiveLinks: []
}
```

### Step 2: Add Geographic Center & Destinations in `src/data/tourismDestinations.js`
In `DISTRICT_CENTERS`:
```javascript
tuensang: {
  name: "Tuensang",
  center: [26.2800, 94.8300],
  zoom: 11
}
```
In `CURATED_DESTINATIONS`, add verified destination records with `districtId: "tuensang"`:
```javascript
{
  id: "tuensang-living-heritage",
  name: "Tuensang Traditional Morung",
  districtId: "tuensang",
  districtName: "Tuensang",
  latitude: 26.2820,
  longitude: 94.8320,
  category: "heritage",
  description: "...",
  imageId: null,
  dataStatus: "verified_real",
  detailPath: "/tourism/districts/tuensang",
  sourceProvider: "District Field Documentation"
}
```

### Step 3: Run Validation & Verification
```bash
npm run tourism:validate
npm run tourism:test
npm run build
```
The new district will instantly be live at `/tourism/districts/tuensang` with full destination listings, map integration, and nearby district links with zero code changes!

---

## 6. Testing & Validation Commands

All integrity checks and unit tests run in non-interactive CI/CD mode:
- `npm run images:validate`: Validates image manifest assets against disk.
- `npm run tourism:validate`: Validates all destination records, coordinates, district IDs, and adjacency relationships.
- `npm run tourism:test`: Runs 70 unit and integration tests across rules, destinations, and district topology.
- `npm run build`: Executes the full Vite production bundle build.
