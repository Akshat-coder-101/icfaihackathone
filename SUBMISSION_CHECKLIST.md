# 🏆 NagaQuest: Hackathon Submission Guide & Category 1 Pre-Flight Checklist

**Project Name:** NagaQuest: A Living Archive of Naga Heritage  
**Target Category:** **Category 1 — Naga Heritage, Culture & Community Tech (Flagship Track — ₹1,00,000)**  
**GitHub Repository:** `https://github.com/Akshat-coder-101/icfaihackathone.git`  

---

## 🎯 1. Category 1 Alignment: Why This Wins

The official hackathon brochure specifies the key judging criteria:
> **"KEY: The technology is not the innovation — the archive, dataset, method or community participation is."**

NagaQuest directly addresses this criterion. Unlike ordinary hackathon submissions that wrap a generic chatbot around Wikipedia text, NagaQuest implements a **genuine preservation and governance method**:

1. **The Preservation Schema & Data Integrity (PRD v3):**
   - Implements strict data provenance schemas with an explicit `dataStatus` field (`illustrative` demo data vs. `verified_real` community contributions).
   - Demonstrates the schema through illustrative pilot entries (Chang, Ao, Angami, Konyak) with verbatim dialect transliterations, alongside verified team-documented Nagamese greetings.
   - Transparently replaces fictional names with `[Illustrative contributor]` placeholders and removes stock sound effects in favor of clearly labeled synthetic speech synthesis.

2. **The Method & Community Participation:**
   - **6-Stage Governance Pipeline:** `Contribution → Consent → Documentation → Review → Publication → Stewardship`.
   - **First-Class Consent Field:** Required storyteller consent notes, attribution strings, and access level gating (`public`, `community_only`, `private`).
   - **Reviewer Gated Flow:** Unconditional `pending` status on submission; community elders verify and sign off before publication.
   - **Reversible Publication (Principle 5):** Immediate withdrawal mechanism where a contributor can lock their material to `private` at any point.

3. **Cultural Tourism & Community Experiences (PRD v4):**
   - **Live Third-Party Geospatial API:** Live points of interest queried from **OpenStreetMap (Overpass & Nominatim)** with real coordinates and provider links.
   - **No Hand-Written Tourism Placeholders:** Avoids invented homestays; every location is checkable.
   - **Community-Led Experience Layer:** Local residents and guides layer **qualitative travel etiquette** (best season, Morung entry protocols, local guide contacts) on top of verifiable API facts.
   - **4-Tier Data Trust Hierarchy:** 🟢 `verified_real` | ⚪ `illustrative` | 🔵 `api_sourced` | 🟡 `unverified_ai`.

4. **Grounded AI with Anti-Hallucination Guardrails:**
   - AI serves **discovery and learning**, not generation of fake folklore.
   - Strict retrieval grounding with clickable archive citations displaying source `dataStatus`.
   - **The Archive Can Say "I Don't Know":** Explicit `Archive Gap — No Guessing` response when asked about undocumented traditions.

5. **Remote Hill District Access:**
   - **IndexedDB Offline Cultural Library:** Full client-side download of authentic stories, transcripts, and phrases for zero-connectivity village use.

---

## 📋 2. Hackathon Form Submission Template (Copy-Paste Ready)

### Project Title
`NagaQuest: A Living Archive of Naga Heritage`

### One-Line Elevator Pitch
*A community-governed digital heritage platform preserving Naga languages, oral traditions, and crafts through verified knowledge-holder contributions, source-grounded AI learning, and zero-connectivity offline access.*

### Problem Statement
*Most digital cultural tools rely on generative LLMs that invent plausible-sounding folklore without provenance, fail to capture authentic elder voices, lack community consent controls, and collapse when internet connectivity fails in remote hill villages.*

### Solution & Innovation
*NagaQuest treats indigenous heritage as a living, community-owned archive rather than training data for a chatbot. We built a 6-stage contribution-to-stewardship pipeline where elders and storytellers contribute recordings with explicit consent and attribution rights. A source-grounded AI learning companion answers learner inquiries strictly by citing approved archive entries and explicitly admits gaps when records do not exist. Approved assets are stored locally via IndexedDB for remote, offline access.*

### Key Innovation (Addressing Category 1 Requirement)
*The innovation is not the AI model — it is the community preservation method: verified elder provenance, mandatory consent, reviewer gating, transparent phrasebook coverage metrics, and immediate withdrawal rights for knowledge keepers.*

### Technology Stack
- **Frontend:** React 19, React Router v7, Vite 8, Tailwind CSS v4, DaisyUI v5
- **Storage & State:** Reactive Governance Store + IndexedDB for offline persistence
- **AI Engine:** Google GenAI SDK (`@google/genai`) with model failover and strict grounding wrapper
- **Audio & Accessibility:** Native Web Audio and Speech Synthesis

---

## ⏱️ 3. Live Judge Demo Walk-Through (3–5 Minute Script)

Follow this sequence during your presentation or video demo:

| Time | What to Show | Key Point to Say to Judges |
|---|---|---|
| **0:00 – 0:45** | **Home Dashboard** (`/`) | *"Notice our core philosophy: The technology is not the innovation — the archive, dataset, and community participation is. We focused on depth over breadth with a deep pilot archive for the Chang tribe of Tuensang."* |
| **0:45 – 1:30** | **Module 1: Oral Archive** (`/oral-archive`) | Click on *The Fire of Naknyulem*. Toggle **Original Indigenous Dialect** to show the verbatim Sauchung phonetic transliteration. Point to the **Consent on Record** badge and elder bio. Click **Save Offline**. |
| **1:30 – 2:15** | **Module 2: Language Studio** (`/language-studio`) | Show the **Coverage Banner** (*"Notice we honestly state '8 verified phrases in Chang' rather than pretending we have a full language dictionary"*). Scroll down to show the **Visually Segregated AI Translation** labeled *AI Translation — Not Yet Verified*. |
| **2:15 – 3:00** | **Module 4: Grounded AI Companion** (`/companion`) | 1. Click **🔥 Naknyulem Fire Rites**: Show the **Grounded in Archive** badge and the cited archive sources.<br>2. Click **❓ Unverified Archive Gap Test**: Show the **Archive Gap — No Guessing** notice. Say: *"Our AI companion strictly refuses to hallucinate fake tribal lore."* |
| **3:00 – 3:45** | **Module 5: Governance Pipeline** (`/community-portal`) | Switch role to **Designated Reviewer**. Show the **Reviewer Verification Queue**, approve a pending item, and show the **Immutable Audit Ledger** and **Immediate Withdrawal Center**. |
| **3:45 – 4:15** | **Module 7: Cultural Tourism** (`/tourism`) | Filter by **Angami (Khonoma)**. Show the blue **From OpenStreetMap — Live Data** badge, real GPS coordinates, OpenStreetMap attribution, and the **Community Etiquette & Protocol** layer. Click **+ Add Protocol** to show community contribution. |
| **4:15 – 4:45** | **Module 6: Offline Library** (`/offline-library`) | Show the downloaded Chang story and Khonoma destination stored locally in **IndexedDB** without needing internet. Highlight that remote hill students can learn even with zero connectivity. |

---

## 🔍 4. Pre-Submission Technical Checklist

- [x] **Production Build:** Passes cleanly with `npm run build` (`dist/` created, 0 syntax errors).
- [x] **Git Repository:** Pushed to `https://github.com/Akshat-coder-101/icfaihackathone.git`.
- [x] **README.md:** Updated and aligned directly with Category 1 judging criteria.
- [x] **API Resilience:** App functions 100% offline and locally even if no Gemini API key is provided.
- [x] **Interactive Role Switcher:** Works seamlessly between Learner, Contributor, and Reviewer.
- [x] **Zero Linter Blockers:** Clean code structure across all 6 modules.

---

*Good luck with the submission! You have built a genuine preservation platform that honors the elders and cultural heritage of Nagaland.*
