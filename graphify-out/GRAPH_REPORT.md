# Graph Report - icfaihackathone  (2026-10-16)

## Corpus Check
- 88 files · ~7,796,319 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, .example 1, (none) 1)

## Summary
- 510 nodes · 1201 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `574f69f3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ManagedImage
- App.jsx
- main.py
- GeminiService
- NagaQuest Image Management System Guide
- 🌄 NagaQuest — A Living Archive of Naga Heritage
- validate_tourism.js
- ArchiveStore
- imageHelpers.js
- TourismMap.jsx
- package.json
- NagaQuest District Tourism Experience
- dependencies
- TourismApiService
- 📋 2. Hackathon Form Submission Template (Copy-Paste Ready)
- devDependencies
- scripts
- 🌄 NagaQuest Image Optimization Pipeline
- NagaQuest Tourism Data Validation Tool
- 🍲 Nagaland Food & Cuisine Photographic Assets Registry
- vite.config.js

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 45 edges
2. `ManagedImage()` - 31 edges
3. `ArchiveStore` - 30 edges
4. `GeminiService` - 29 edges
5. `react` - 28 edges
6. `App()` - 25 edges
7. `react-router-dom` - 24 edges
8. `TourismNavTabs()` - 24 edges
9. `TourismPageHeader()` - 21 edges
10. `TourismEmptyState()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `7. How Missing Images & Errors are Handled` --references--> `ManagedImage()`  [INFERRED]
  docs/image-management.md → src/components/images/ManagedImage.jsx
- `1. Overview & Technology Stack` --references--> `ManagedImage()`  [INFERRED]
  docs/tourism-map.md → src/components/images/ManagedImage.jsx
- `Architectural Core Principles` --references--> `ManagedImage()`  [INFERRED]
  docs/district-tourism-experience.md → src/components/images/ManagedImage.jsx
- `6. Using `ManagedImage` in React` --references--> `ManagedImage()`  [INFERRED]
  docs/image-management.md → src/components/images/ManagedImage.jsx
- `3. Map Preselection & State Sharing` --references--> `MapViewController()`  [INFERRED]
  docs/district-tourism-experience.md → src/components/maps/TourismMap.jsx

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "ManagedImage"
Cohesion: 0.13
Nodes (36): 7. 🗺️ Cultural Tourism & Expanded State-Wide Travel System (`/tourism`), react-router-dom, ManagedImage(), AccommodationCard(), AccommodationsView(), CuisineCard(), DestinationCard(), DestinationDetailPage() (+28 more)

### Community 1 - "App.jsx"
Cohesion: 0.10
Nodes (35): lucide-react, react, App(), CommunityPortal(), CulturalCompanion(), QUICK_STARTERS, HeritageAtlas(), ALL_LANGUAGES_LIST (+27 more)

### Community 2 - "main.py"
Cohesion: 0.07
Nodes (23): call_gemini(), call_groq(), chat(), ChatRequest, get_gemini_keys(), get_groq_key(), get_objects(), get_phrases() (+15 more)

### Community 3 - "GeminiService"
Cohesion: 0.09
Nodes (13): @google/genai, ApiKeyModal(), CATEGORY_DIRECTIVES, categoryTemperature(), GeminiService, getTribeAnchor(), hashCacheKey(), MODELS_TO_TRY (+5 more)

### Community 4 - "NagaQuest Image Management System Guide"
Cohesion: 0.06
Nodes (32): 1. Directory Structure, 2. Adding an Original Image, 3. Running the Optimization Pipeline, 4. Registering an Image in the Central Manifest, 5. Validating the Manifest and Assets, 6. Using `ManagedImage` in React, 7. How Missing Images & Errors are Handled, 8. Adding Images for a New District (+24 more)

### Community 5 - "🌄 NagaQuest — A Living Archive of Naga Heritage"
Cohesion: 0.07
Nodes (25): 1. 📜 Oral Archive (`/oral-archive`), 2. 🗣️ Language Preservation Studio (`/language-studio`), 3. 🦅 Community Heritage Atlas (`/heritage-atlas`), 4. ✨ Source-Grounded AI Learning Companion (`/companion`), 5. 👥 Community Governance & Contribution Pipeline (`/community-portal`), 6. 💾 Offline Cultural Library (`/offline-library`), 🏆 Alignment with Category 1 (Naga Heritage, Culture & Community Tech), Available Image Tooling Commands: (+17 more)

### Community 6 - "validate_tourism.js"
Cohesion: 0.09
Nodes (22): __dirname, __filename, manifestPath, projectRoot, publicDir, args, __dirname, disableJson (+14 more)

### Community 8 - "imageHelpers.js"
Cohesion: 0.15
Nodes (13): 9. Preparing for Future CDN Migration, Dashboard(), ImageAttribution(), ImagePlaceholder(), renderCategoryIcon(), ResponsiveImage(), generateSrcSet(), getImageAsset() (+5 more)

### Community 9 - "TourismMap.jsx"
Cohesion: 0.21
Nodes (15): leaflet, react-leaflet, createCustomPin(), DestinationMarker(), DestinationPopup(), MapControls(), MapLoadingState(), MapViewController() (+7 more)

### Community 10 - "package.json"
Cohesion: 0.13
Nodes (17): name, private, type, version, canvas-confetti, daisyui, eslint, @eslint/js (+9 more)

### Community 11 - "NagaQuest District Tourism Experience"
Cohesion: 0.13
Nodes (14): 1. Kohima District (`/tourism/districts/kohima`), 1. Overview & Architecture, 2. Dimapur District (`/tourism/districts/dimapur`), 2. Reusable Component Hierarchy, 3. Map Preselection & State Sharing, 3. Peren District (`/tourism/districts/peren`), 4. Initial Districts Population, 5. How to Add a New District (Zero JSX Edits) (+6 more)

### Community 12 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, canvas-confetti, daisyui, fuse.js, @google/genai, @google/generative-ai, leaflet, lucide-react (+6 more)

### Community 13 - "TourismApiService"
Cohesion: 0.21
Nodes (3): REGIONAL_DIRECTORIES, TourismApiService, VERIFIED_OSM_SEED_POIS

### Community 14 - "📋 2. Hackathon Form Submission Template (Copy-Paste Ready)"
Cohesion: 0.17
Nodes (11): 🎯 1. Category 1 Alignment: Why This Wins, 📋 2. Hackathon Form Submission Template (Copy-Paste Ready), ⏱️ 3. Live Judge Demo Walk-Through (3–5 Minute Script), 🔍 4. Pre-Submission Technical Checklist, Key Innovation (Addressing Category 1 Requirement), 🏆 NagaQuest: Hackathon Submission Guide & Category 1 Pre-Flight Checklist, One-Line Elevator Pitch, Problem Statement (+3 more)

### Community 15 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 16 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, images:optimize, images:validate, lint, preview, tourism:test (+1 more)

### Community 17 - "🌄 NagaQuest Image Optimization Pipeline"
Cohesion: 0.33
Nodes (5): ⚙️ Command-Line Options, 🌄 NagaQuest Image Optimization Pipeline, 🛠️ Prerequisites & Installation, 📐 Responsive Breakpoints, 🚀 Usage

### Community 18 - "NagaQuest Tourism Data Validation Tool"
Cohesion: 0.40
Nodes (4): 📋 Finding Severities, NagaQuest Tourism Data Validation Tool, 🚀 Usage, 🔍 Validation Rules & Error Codes

### Community 19 - "🍲 Nagaland Food & Cuisine Photographic Assets Registry"
Cohesion: 0.50
Nodes (3): Expected Subjects Directory: `raw_assets/food/nagaland-food/`, 🍲 Nagaland Food & Cuisine Photographic Assets Registry, Processing Pipeline

### Community 20 - "vite.config.js"
Cohesion: 0.50
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

## Knowledge Gaps
- **6 isolated node(s):** `@google/generative-ai`, `canvas-confetti`, `daisyui`, `tailwindcss`, `@types/react` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 169 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `App.jsx` to `imageHelpers.js`, `TourismMap.jsx`, `package.json`, `ManagedImage`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `ManagedImage()` (e.g. with `Architectural Core Principles` and `6. Using `ManagedImage` in React`) actually correct?**
  _`ManagedImage()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@google/generative-ai`, `canvas-confetti`, `daisyui` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ManagedImage` be split into smaller, more focused modules?**
  _Cohesion score 0.13466461853558628 - nodes in this community are weakly interconnected._
- **Why does `ManagedImage()` connect `ManagedImage` to `imageHelpers.js`, `TourismMap.jsx`, `NagaQuest District Tourism Experience`, `NagaQuest Image Management System Guide`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.103954802259887 - nodes in this community are weakly interconnected._
- **Why does `ArchiveStore` connect `ArchiveStore` to `App.jsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._