import Fuse from "fuse.js";

// =====================================================================
// HERITAGE SEARCH & SYNONYM EXPANSION UTILITY
// Provides typo-tolerant fuzzy matching, synonym resolution,
// and theme taxonomy normalization for Heritage Atlas & Language Studio.
// =====================================================================

export const SYNONYM_MAP = {
  shawl: ["wrapper", "cloth", "textile", "handloom", "weaving", "shatang", "tsungkotepsu", "lohe"],
  wrapper: ["shawl", "cloth", "textile"],
  cloth: ["shawl", "textile", "fabric", "wrapper"],
  textile: ["shawl", "cloth", "wrapper", "loom", "weaving"],
  drum: ["log drum", "slit drum", "tung", "instrument", "percussion"],
  logdrum: ["drum", "tung", "slit drum"],
  instrument: ["drum", "flute", "mouth organ", "percussion", "music"],
  food: ["dish", "cuisine", "pork", "akhuni", "axone", "bamboo shoot", "meal", "fermented"],
  cuisine: ["food", "dish", "recipe"],
  dish: ["food", "cuisine", "recipe"],
  morung: ["youth lodge", "dormitory", "rehangki", "champo", "architecture", "guard house"],
  architecture: ["morung", "gate", "house", "dwelling", "hearth"],
  festival: ["celebration", "feast", "dance", "naknyulem", "aoling", "sekrenyi", "moatsu", "tokhu emong", "hornbill"],
  dance: ["festival", "folk dance", "warrior dance", "celebration"],
  ornament: ["jewelry", "necklace", "beads", "brass", "earring", "bracelet", "regalia"],
  jewelry: ["ornament", "beads", "necklace"],
  craft: ["basketry", "woodcarving", "pottery", "blacksmithing", "cane", "bamboo", "weaving"],
  basket: ["craft", "cane", "bamboo", "container"],
  pottery: ["craft", "clay", "earthenware"],
  woodcarving: ["craft", "timber", "carving", "morung"],
  place: ["village", "sanctuary", "hills", "valley", "terrace", "dzukou", "khonoma", "monolith", "heritage site"],
  terrace: ["farming", "fields", "agriculture", "sanctuary", "stone wall"],
  sanctuary: ["conservation", "forest", "reserve", "nature", "place"],
  spear: ["dao", "weapon", "regalia", "shield"],
  dao: ["machete", "spear", "sword", "tool", "regalia"],
  regalia: ["headdress", "ceremonial", "warrior", "feathers", "rank", "attire"],
  ritual: ["rite", "ceremony", "kizie", "purification", "taboo", "genna", "practice"],
  practice: ["ritual", "custom", "tradition", "rite"],
  tool: ["agriculture", "hunting", "fishing", "dao", "axe", "hoe"],
  folklore: ["story", "tale", "legend", "myth", "oral tradition", "ballad"]
};

// Normalize search query with synonym tokens
export function expandQueryWithSynonyms(query) {
  if (!query || typeof query !== "string") return [];
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const expansions = new Set(words);

  words.forEach((word) => {
    // Exact word or stemming check
    Object.entries(SYNONYM_MAP).forEach(([key, syns]) => {
      if (word.includes(key) || key.includes(word)) {
        syns.forEach((s) => expansions.add(s));
      }
    });
  });

  return Array.from(expansions);
}

// Normalized 10 Theme Taxonomy (PRD v6 Section 5.4)
export const THEME_TAXONOMY = [
  "Greetings",
  "Family & Kinship",
  "Home & Food",
  "Hospitality",
  "Festivals & Music",
  "Travel & Directions",
  "Market & Crafts",
  "Numbers",
  "Days & Time",
  "Essentials"
];

export function normalizeTheme(category) {
  if (!category) return "Essentials";
  const cat = category.toLowerCase().trim();

  if (cat.includes("greet")) return "Greetings";
  if (cat.includes("kinship") || cat.includes("polite") || cat.includes("family")) return "Family & Kinship";
  if (cat.includes("hearth") || cat.includes("home") || cat.includes("dining") || cat.includes("food")) return "Home & Food";
  if (cat.includes("hospit")) return "Hospitality";
  if (cat.includes("festival") || cat.includes("music") || cat.includes("song")) return "Festivals & Music";
  if (cat.includes("travel") || cat.includes("direction")) return "Travel & Directions";
  if (cat.includes("market") || cat.includes("craft") || cat.includes("trade")) return "Market & Crafts";
  if (cat.includes("number") || cat.includes("count")) return "Numbers";
  if (cat.includes("day") || cat.includes("time") || cat.includes("season")) return "Days & Time";
  return "Essentials";
}

// 17 Recognized Tribes of Nagaland
export const RECOGNIZED_TRIBES = [
  "Angami",
  "Ao",
  "Chakhesang",
  "Chang",
  "Kachari",
  "Khiamniungan",
  "Konyak",
  "Kuki",
  "Lotha",
  "Phom",
  "Pochury",
  "Rengma",
  "Sangtam",
  "Sumi",
  "Tikhir",
  "Yimkhiung",
  "Zeliang"
];

// 12 Recognized Card Types (PRD v6 Section 5.3)
export const HERITAGE_TYPES = [
  { id: "textile", label: "Textiles & Shawls" },
  { id: "ornament", label: "Ornaments & Beads" },
  { id: "regalia", label: "Regalia & Ceremonial" },
  { id: "instrument", label: "Sacred Instruments" },
  { id: "craft", label: "Carvings & Craft" },
  { id: "architecture", label: "Morung & Architecture" },
  { id: "festival", label: "Festivals & Chants" },
  { id: "ritual", label: "Ritual Practices" },
  { id: "place", label: "Sacred Places & Sanctuaries" },
  { id: "food", label: "Indigenous Cuisines" },
  { id: "folklore", label: "Folklore & Oral Lore" },
  { id: "tool", label: "Traditional Tools" }
];

// Configure Fuse fuzzy search for Heritage Objects
export function createHeritageFuse(items) {
  return new Fuse(items, {
    keys: [
      { name: "title", weight: 2.0 },
      { name: "localName", weight: 1.8 },
      { name: "tribeName", weight: 1.5 },
      { name: "tribe", weight: 1.5 },
      { name: "category", weight: 1.2 },
      { name: "type", weight: 1.2 },
      { name: "tags", weight: 1.3 },
      { name: "summary", weight: 1.0 },
      { name: "explanation", weight: 1.0 },
      { name: "usage", weight: 0.8 },
      { name: "communityName", weight: 0.8 }
    ],
    threshold: 0.38,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true
  });
}

// Configure Fuse fuzzy search for Phrases
export function createPhraseFuse(phrases) {
  return new Fuse(phrases, {
    keys: [
      { name: "originalExpression", weight: 2.0 },
      { name: "meaning", weight: 1.8 },
      { name: "pronunciationGuide", weight: 1.2 },
      { name: "languageVariety", weight: 1.4 },
      { name: "theme", weight: 1.0 },
      { name: "category", weight: 1.0 },
      { name: "context", weight: 0.8 },
      { name: "exampleSentence", weight: 0.8 }
    ],
    threshold: 0.38,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true
  });
}
