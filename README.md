# 🌄 NagaQuest — A Living Archive of Naga Heritage

> **Hackathon Submission Track:** 1 — Naga Heritage, Culture & Community Tech (Flagship)  
> **Core Judging Thesis:** *"The technology is not the innovation — the archive, dataset, method or community participation is."*  
> **Data Integrity Protocol (PRD v3):** Entries in this repository carry an explicit `dataStatus` tag (`illustrative` demo data vs. `verified_real` community contributions). We do not present invented names or stock sound effects as real elder recordings.

NagaQuest is a **community-governed digital heritage preservation platform** designed to safeguard Naga languages, oral traditions, traditional crafts, and cultural knowledge for future generations through verified contributions from the people who carry that knowledge (elders, storytellers, artisans, and native speakers).

In NagaQuest, **AI helps people discover and learn from the archive — it does not constitute the archive.** The platform rejects synthetic hallucinations, strictly citing community-approved records, enforcing mandatory consent and access rights, providing a 6-stage verification workflow, and enabling full offline access in remote hill districts.

---

## 🛡️ Data Integrity & Provenance Transparency

Per PRD v3 Data Integrity remediation, every entry in NagaQuest carries an explicit `dataStatus` field:
- 🟢 **`verified_real`**: An actual recorded or documented contribution with real consent on record (e.g. team-documented Nagamese greeting `phrase-nagamese-real-001`).
- ⚪ **`illustrative`**: Representative demo material demonstrating the full schema (verbatim transcripts, dialect translations, photo consent, review states) without claiming false elder provenance. Fictional elder names have been replaced with transparent placeholders (`[Illustrative contributor — demo placeholder]`), and stock audio sound effects have been removed in favor of clearly labeled synthetic text recitation.
- 🟡 **`unverified_ai`**: Live AI translation drafts and exploratory companion answers, visually segregated from archive entries.

---

## 🏆 Alignment with Category 1 (Naga Heritage, Culture & Community Tech)

| Category 1 Hackathon Requirement | How NagaQuest Delivers |
|---|---|
| **Tribal language & language learning tools** | **Module 2: Language Studio** — Phrasebook with phonetic pronunciation, cultural context, and honest coverage indicators (e.g. *8 verified phrases in Chang*). Nagamese Creole and indigenous dialects are preserved distinctly, featuring verified real greetings alongside illustrative pilot entries. |
| **Digital archives of oral history and folklore** | **Module 1: Oral Archive** — Pilot archive demonstrating the preservation schema (Chang, Ao, Angami, Konyak), preserving verbatim dialect transliterations (Sauchung dialect of Chang), reviewed translations, and explicit consent records. |
| **Crafts, textiles, music & culinary heritage** | **Module 3: Heritage Atlas** — Documented warrior shawls (*Tsüngkotepsü*, *Shatang*), sacred *Tung* log slit drums, hornbill totems, and *Khonoma* terraced conservation sanctuaries with photo consent fields and community provenance. |
| **Method & Community Participation** | **Module 5: Governance Pipeline** — Complete 6-stage lifecycle: `Contribution → Consent → Documentation → Review → Publication → Stewardship`. Designated elder review gating and immediate reversible withdrawal. |
| **Cultural tourism & community-led experiences** | **Module 7: Cultural Tourism Guide (Live API)** — Real, verifiable geographic points of interest queried live from OpenStreetMap / Google Places, layered with community-contributed etiquette protocols. |
| **Accessible in remote hill areas** | **Module 6: Offline Cultural Library** — Client-side **IndexedDB** database enabling full download of audio, transcripts, and phrases for zero-connectivity village use. |

---

## 🏛️ Platform Architecture & The 7 Core Modules

```
                               NAGAQUEST
                                   |
                         React Web Application
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
   Oral Archive             Language Studio           Heritage Atlas
(Verbatim Transcripts)    (Phonetic Phrasebook)    (Documented Artifacts)
         |                         |                         |
         +-------------------------+-------------------------+
                                   |
                Community Governance & Review Pipeline
                 (Consent • Review Queue • Audit Ledger)
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
  Retrieval Grounding       Offline Library        Cultural Tourism
(Strict Source Citations)     (IndexedDB)             (Live API)
         |                                                   |
 AI Cultural Companion                             OpenStreetMap & ODbL
  (Refuses to hallucinate)                          + Community Advice
```

### 1. 📜 Oral Archive (`/oral-archive`)
- **Preserved Oral Narratives:** Demonstrates the preservation schema with pilot entries for the **Chang tribe of Tuensang** (*The Fire of Naknyulem and the Spirits of the Dark Moon*, *Carving of the Great Tung Log Drum*), alongside Ao, Angami, and Konyak oral histories.
- **Dual-Pane Transcripts:** Toggle between verbatim phonetic dialect transliterations (e.g. Sauchung dialect) and community-reviewed English translations.
- **Audio Integrity:** Stock ambience sound effects have been removed; audio playback uses speech synthesis clearly labeled as synthetic recitation, not field audio.
- **Explicit Provenance Labels:** Every story card displays its `dataStatus` badge so evaluators clearly distinguish illustrative demo data from verified real contributions.

### 2. 🗣️ Language Preservation Studio (`/language-studio`)
- **Native Speaker Phrasebook:** Phrases categorized by Greetings, Hearth & Home, Hospitality, and Festivals.
- **Real & Illustrative Badging:** Genuinely real documented team greetings (`verified_real`) are clearly separated from illustrative demo vocabulary (`illustrative`).
- **Honest Coverage Metrics:** Transparently displays verified entry counts per language variety rather than pretending full-language support.
- **Segregated Draft AI Translation:** Experimental live translations are visually isolated in a dedicated container with the explicit badge **`AI Translation — Not Yet Verified`**, preventing confusion between elder-approved records and machine inferences.

### 3. 🦅 Community Heritage Atlas (`/heritage-atlas`)
- **Tribe-Scoped Artifacts:** Every entry is anchored to a specific community (e.g. *Ao Tsüngkotepsü Warrior Shawl*, *Chang Tung Log Drum*, *Khonoma Green Terraces*). No generic claims.
- **Photo Consent & Provenance:** Demonstrates community consent metadata and attribution fields.
- **Cultural Usage & Taboos:** Customary protocols and spiritual meanings explained with dignity.

### 4. ✨ Source-Grounded AI Learning Companion (`/companion`)
- **Strict Retrieval Grounding:** Answers are synthesized directly from retrieved approved archive entries.
- **Interactive Citations:** Every claim links directly to its source oral story, phrasebook entry, or heritage object, displaying the source's `dataStatus`.
- **Gap Transparency (PRD Principle 3):** If asked about undocumented folklore (e.g., test queries like *"secret submarine rituals in Nagaland"*), the companion explicitly declares an **`Archive Gap — No Guessing`** notice and refuses to hallucinate.
- **3-Tier Visual Source Label:**
  - 🟢 **Grounded in Archive** (with source links)
  - 🟡 **General AI Knowledge — Unverified** (exploratory mode only)
  - 🔵 **Verified Offline Record** (stored locally)
- **Learner Progress Tracker:** Tracks stories explored, vocabulary mastered, and comprehension reflections passed in local storage.

### 5. 👥 Community Governance & Contribution Pipeline (`/community-portal`)
- **6-Stage State Machine:**
  1. *Contribution:* Community members submit recordings, documents, or phrases.
  2. *Consent:* Mandatory capture of usage rights, attribution terms, and access levels (`public`, `community_only`, `private`).
  3. *Documentation:* Verbatim storage with context metadata.
  4. *Review:* Unconditionally set to `pending`; only authorized reviewers can approve or request revisions.
  5. *Publication:* Only approved public entries appear in general exploration.
  6. *Stewardship & Immediate Withdrawal:* Contributors can withdraw material at any time; withdrawals instantly switch access to `private`.
- **Interactive Role Switcher:** Toggle between `Learner (Public)`, `Community Contributor`, and `Designated Reviewer`.
- **Chronological Audit Ledger:** Complete historical audit trail of all reviewer approvals, revision requests, and withdrawals.

### 6. 💾 Offline Cultural Library (`/offline-library`)
- **IndexedDB Client Storage:** Real downloaded recordings, transcripts, and phrase cards stored locally on the user's device.
- **One-Click Pilot Downloader:** Bulk-caches the entire pilot archive for learners and researchers in low-bandwidth hill areas.
- **Strict Separation:** Downloaded records are visually and architecturally segregated from AI offline fallback text.

### 7. 🗺️ Cultural Tourism & Expanded State-Wide Travel System (`/tourism`)
NagaQuest features a comprehensive, multi-category tourism architecture combining **live third-party geospatial discovery** with **reusable district explorers and state-wide travel directories** inspired by the Zeliang Cultural Explorer reference design:

- **State-Wide Tourism Hub (`/tourism`):**
  - Features responsive sub-navigation (`TourismNavTabs`) linking across all tourism portals.
  - Six interactive category cards providing direct entry points into District Explorer, Food & Cuisine, Seasonal Planning, Accommodations, Statutory ILP Guidelines, and Flora & Fauna.
  - Retains live OpenStreetMap (Overpass & Nominatim ODbL) and optional Google Places geospatial queries with server-side caching.
  - Community-contributed qualitative etiquette protocols (visitation rules, elder advice, local guide contacts).

- **Reusable District Tourism Experience (`/tourism/districts/:districtId`):**
  - Declarative, configuration-driven single template (`DistrictDetailPage.jsx`) driving all district pages without per-district JSX duplication.
  - Initialized and verified for priority districts:
    - **Kohima:** Angami heritage, Khonoma Green Village & KNCTS sanctuary, Kisama Naga Heritage Village (Hornbill venue), Jakhama Village, Sekrenyi purification festival, WWII Commonwealth War Cemetery, Dzukou Valley Biosphere, and Japfü Peak.
    - **Dimapur:** Commercial gateway, medieval Kachari monolith ruins (Rajbari ASI protected), Diezephe Craft Heritage Village, Chümoukedima Heritage Foothills, and Nagaland Zoological Park.
    - **Peren:** Zeliang cultural heritage, Mount Pauna sanctuary, Poilwa Sheep Farm, Benreu tourist village, Rehangki morung architecture, Chepeube natural salt springs, and Hega festival.
  - **Dynamic Destination Merging:** Automatically merges matching records from `CURATED_DESTINATIONS` into the district's destination directory.
  - **Interactive Map Preselection:** Direct integration with the OpenStreetMap Tourism Map via `/tourism/map?district=:districtId`, automatically centering and filtering destinations for the selected district.
  - **Nearby Districts Adjacency:** Dynamically links adjacent districts (e.g. Kohima ↔ Dimapur ↔ Peren) with self-reference and topology validation.
  - **Zero Fabrication Policy:** Factual content only; unpopulated categories (such as hotels or regional cuisine) display accessible, neutral empty states with direct links to state-wide guides (`/tourism/stays`, `/tourism/food`).
  - Full Village Directory (`/tourism/districts/:districtId/villages`) capturing route distances, seasonal highlights, and community attractions.
  - Reusable Destination Detail Template (`/tourism/districts/:districtId/destinations/:destinationId`).

- **Interactive Tourism Map (`/tourism/map`):**
  - Open-source Leaflet cartography with OpenStreetMap / CARTO tiles (zero paid API dependencies).
  - Responsive split-view layout with live filter by category and district, viewport-aware pan/zoom animations, and offline destination bookmarking.
  - Supports deep-linking and state sharing via URL search parameters (`?district=:districtId`).

- **Food & Gastronomic Heritage (`/tourism/food`):**
  - 7 structured culinary categories: *Traditional Dishes, Rice & Staple Foods, Smoked & Fermented Delicacies (Axone, Bastenga), Vegetables & Wild Herbs, Meat & Fish Preparations, Traditional Beverages, and Hearth Customs*.
  - Recipe and cultural context modal with community attribution.
  - Data integrity guard: Zero fabricated dishes or simulated restaurant reviews.

- **Seasonal Travel Planning (`/tourism/best-time-to-visit`):**
  - 4 seasonal categories: *Spring (Blooms & Sowing), Summer (Lush Terraces), Monsoon (Misty Ridgelines), and Winter (Festivals & Crisp Skies)*.
  - Month-by-month selector with season-specific road accessibility and travel advisories.
  - Telemetry integration point reserved for verified live weather sensor feeds (IMD / Open-Meteo).

- **Hotels & Accommodations (`/tourism/stays`):**
  - 5 configurable lodging categories: *Hotels, Hostels & Backpackers, Village Homestays, Circuit Houses & Guesthouses, and Eco-Cottages*.
  - Direct host connection and official external links; zero booking commissions or fabricated review ratings.
  - Standardized integration hook ready for live room availability status from community homestay councils.

- **Inner Line Permit (ILP) Travel Requirements (`/tourism/ilp`):**
  - Statutory guidelines under the Bengal Eastern Frontier Regulation (BEFR), 1873.
  - Direct secure link to the official Government of Nagaland portal: `https://ilp.nagaland.gov.in/`.
  - 5-step online application walkthrough, required credentials checklist (Aadhaar, Voter ID, Passport), and comprehensive traveler FAQs.
  - Strict privacy enforcement: NagaQuest never collects identity cards or processes permit fees.

- **Flora & Fauna Biodiversity Explorer (`/tourism/flora-fauna`):**
  - 6 ecological categories: *Flora, Mammals, Avifauna (Birds), Reptiles, Amphibians, and Other Wildlife*.
  - Species detail profiles with IUCN conservation badges, habitat descriptions, and district associations.
  - Anti-poaching sensitivity protocol: Coordinates and precise nesting spots of vulnerable species are kept confidential.

- **Data Integrity & Schema Architecture (`src/data/tourismData.js`):**
  - Completely configuration-driven. New districts, traditional recipes, homestays, and wildlife records can be registered into `src/data/tourismData.js` without modifying underlying React components.
  - Clear, accessible empty states (`TourismEmptyState`) communicate pending community verification without displaying synthetic placeholder facts.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, React Router v7, Vite 8
- **Styling & Design System:** Tailwind CSS v4, DaisyUI v5, Lucide Icons, Canvas Confetti
- **Storage & State:** Reactive ArchiveStore (LocalStorage backed) + IndexedDB (`OfflineLibrary`)
- **AI & Retrieval Grounding:** Google GenAI SDK (`@google/genai`) with model failover and strict grounding wrapper
- **Audio & Accessibility:** Native Web Speech API & HTML5 Audio with fallback recitation

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- Python 3.9+ (for the centralized Python backend)
- npm or yarn

### Installation & Quick Start

#### Option A: Running with Centralized Python Backend (Recommended for full efficiency)
```bash
# 1. Clone the repository
git clone https://github.com/Akshat-coder-101/icfaihackathone.git
cd icfaihackathone

# 2. Start the Python FastAPI backend (centralized API calls, multi-model failover, OSM caching)
pip install -r backend/requirements.txt
python backend/run_backend.py
# Backend runs at http://localhost:8000 (API Docs at http://localhost:8000/docs)

# 3. In another terminal, install and run the React frontend
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser.

#### Option B: Standalone Frontend (Graceful Offline & Client Mode)
If you run only `npm run dev`, the application functions with client-side API rotation and fallback:
```bash
npm install
npm run dev
```

---

## 🐍 Centralized Python Backend Architecture (`backend/`)

To maximize performance, security, and response caching, all heavy API interactions are centralized in an asynchronous **Python FastAPI** backend (`backend/main.py`):

| Endpoint | Method | Functionality |
|---|---|---|
| `/api/health` | GET | Health diagnostics, Gemini key rotation count, Groq failover status, archive item totals. |
| `/api/chat` | POST | Grounded retrieval chatbot. Searches verified archive, prevents hallucinations on archive gaps, and queries Gemini 3 Flash with Groq Qwen-27B failover. |
| `/api/translate` | POST | Multi-dialect indigenous phrase translator with phonetics, practical usage, and related phrases. |
| `/api/tourism/places` | GET | Live OpenStreetMap Overpass API geospatial proxy with 12-hour server caching and ODbL attribution. |
| `/api/tourism/tips` | GET/POST | Community-contributed travel etiquette protocols. |
| `/api/archive/*` | GET | Verified stories, phrases, and heritage objects with PRD v3 `dataStatus` tags. |
| `/api/governance/submit` | POST | 6-stage community contribution queue. |

---

## 🎨 User Experience & Interface Streamlining

Based on user feedback to eliminate cluttered modules and competing buttons:
1. **Unified AI Chatbot (`/companion`)**: Replaced confusing multi-mode forms and tribe dropdowns with an intuitive, modern chat window. Users can query any aspect of Naga culture, click pre-grounded discussion prompts, or ask questions from any story or object card with one click.
2. **Tabbed Language Preservation Studio (`/language-studio`)**: Cleanly split into two dedicated views:
   - *Verified Phrasebook*: Explore community-reviewed phrases, listen to audio phonetics, and save offline.
   - *AI Translation Studio*: An exploratory workspace powered by the Python backend with explicit PRD v3 unverified draft warnings.
3. **Consolidated Tourism Toolbar (`/tourism`)**: Replaced 3 stacked rows of buttons with a single unified toolbar combining Category pills, a District/Tribe territory selector, and instant search.
4. **Focused Module Headers**: Removed duplicate and competing secondary buttons, keeping each page clean and purposeful.

---

## 🖼️ Centralized Image Management System

NagaQuest features a robust, culturally respectful, and performant image management pipeline conforming to the PRD:

- **Centralized Metadata Manifest (`src/data/images/imageManifest.js`)**: Single source of truth recording intrinsic dimensions, alt text, license provenance, consent verification, and responsive variants.
- **Automated Python Pillow Pipeline (`scripts/images/optimize_images.py`)**: Generates optimized WebP and JPEG variants at 400px, 800px, and 1600px targets without upscaling.
- **Zero Layout Shift (`ManagedImage.jsx`, `ResponsiveImage.jsx`)**: Native `<picture>` tags with intrinsic dimensions and Tailwind aspect-ratio containers prevent Cumulative Layout Shift (CLS).
- **Graceful Fallbacks & Category Placeholders**: Culturally stylized SVG vector placeholders for destinations, villages, cuisine, wildlife, districts, and heritage sites when photographs are pending field verification.
- **Image Provenance & Attribution (`ImageAttribution.jsx`)**: Built-in visual badges display photographers, institutions, and open licensing terms.
- **Validation Script (`scripts/images/validate_manifest.js`)**: Verifies asset integrity, dimensions, and path existence.

### Available Image Tooling Commands:
```bash
# Optimize raw photographs and generate responsive WebP variants
npm run images:optimize

# Validate manifest integrity and file references
npm run images:validate
```

For full architecture details, see [docs/image-management.md](docs/image-management.md).

---

## 🗺️ Interactive Tourism Map of Nagaland (`/tourism/map`)

NagaQuest includes an interactive, open-source cartographic exploration platform for Nagaland conforming to the Tourism Map PRD:

- **Zero-Billing & Open-Source Stack**: Built on React Leaflet and Leaflet with standard OpenStreetMap (ODbL) tiles. Requires zero paid Google Maps Platform API credentials, zero credit/debit card setups, and zero recurring billing fees.
- **Nagaland Geocoded Registry (`src/data/tourismDestinations.js`)**: Real, verified geographic coordinates for monuments, ancestral morungs, tourist villages, nature peaks, and craft markets across all 16 hill districts.
- **Category-Themed Vector Pins**: Crisp Leaflet `L.divIcon` pins with category color-coding (heritage, villages, nature sanctuaries, craft markets, accommodations).
- **Responsive Dual-View Layout**: Desktop side-by-side interactive map with scrollable destination card list; mobile map with collapsible destination drawer.
- **Smart Geocoded Controls**: Reset Nagaland extent, auto-fit to filtered results, and one-shot privacy-respecting browser geolocation.
- **External Direction Integration**: Built-in links launch external Google Maps and OpenStreetMap navigation without embedding proprietary engines.
For full map architecture details, see [docs/tourism-map.md](docs/tourism-map.md).

---

## 🛡️ Tourism Data Quality & Validation System

NagaQuest includes an automated data quality and integrity validation engine:

- **Automated Validation Runner (`scripts/tourism/validate_tourism.js`)**: Non-destructive static analysis checking destination records, geographic bounds, image manifest linkage, and provenance.
- **Rules Engine (`scripts/tourism/validationRules.js`)**: Detects duplicate IDs, missing required fields, non-finite coordinates, out-of-region coordinates, invalid district references, unresolved image IDs, malformed URLs, and template text.
- **Reporting & CI Artifacts (`scripts/tourism/validationReport.js`)**: Generates color-coded terminal reports and structured JSON reports saved to `reports/tourism-validation.json`.
- **Strict Mode**: Supports `--strict` mode to treat warnings as fatal failures for CI pipelines.
- **Automated Test Suite (`scripts/tourism/validate_tourism.test.js`)**: Unit tests covering 10 distinct failure and success conditions.

### Validation Commands:
```bash
# Validate image manifest & physical assets
npm run images:validate

# Validate tourism records, coordinates, and provenance
npm run tourism:validate

# Validate in strict mode (zero warnings permitted)
npm run tourism:validate -- --strict

# Run validation unit tests
npm run tourism:test
```

For full validation rules and error codes, see [docs/tourism-data-validation.md](docs/tourism-data-validation.md).

---

## 📋 Hackathon Submission Deliverables Check

- [x] **Category 1 Alignment:** Proven preservation method, governance workflow, and language learning tools.
- [x] **Centralized Python Backend:** FastAPI backend handling multi-key Gemini rotation, Groq failover, OSM caching, and translation.
- [x] **Data Integrity Remediation (PRD v3):** Explicit `dataStatus` labeling (illustrative vs verified_real); no invented names or stock audio presented as real.
- [x] **De-cluttered UX:** Streamlined navigation, simplified chat, unified filter bars, and removed duplicate "Ask AI" buttons.
- [x] **Community Method & Governance:** 6-stage workflow, mandatory consent, reviewer gating, and withdrawal mechanism.
- [x] **Truth & Anti-Hallucination:** Strict retrieval citations; companion refuses to guess on gaps.
- [x] **Zero-Connectivity Support:** IndexedDB offline downloads.
- [x] **Clean Production Build:** Zero build errors, zero linter errors.

---

*Preserved with respect for the elders, storytellers, artisans, and youth of Nagaland.*

