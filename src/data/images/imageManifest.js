/**
 * NagaQuest Centralized Image Manifest
 * ------------------------------------
 * Single source of truth for managed image assets across NagaQuest.
 * Contains metadata, intrinsic dimensions, responsive variants, attribution,
 * and data integrity tags.
 */

/** @type {Record<string, import('./imageTypes').ImageAsset>} */
export const IMAGE_MANIFEST = {
  // ==========================================
  // 1. VERIFIED PILOT CULTURAL PHOTOGRAPHY
  // ==========================================
  "peren-overview": {
    id: "peren-overview",
    src: "/images/tourism/districts/peren/peren-overview-800.webp",
    alt: "Panoramic hilltop view of Peren Old Village and verdant ridgelines in Peren District",
    width: 823,
    height: 1280,
    category: "district",
    entityId: "peren",
    variants: {
      webp: [
        { src: "/images/tourism/districts/peren/peren-overview-400.webp", width: 400, height: 622, sizeKb: 55.3 },
        { src: "/images/tourism/districts/peren/peren-overview-800.webp", width: 800, height: 1244, sizeKb: 117.8 },
        { src: "/images/tourism/districts/peren/peren-overview-823.webp", width: 823, height: 1280, sizeKb: 119.4 }
      ],
      fallback: [
        { src: "/images/tourism/districts/peren/peren-overview-400.jpg", width: 400, height: 622, sizeKb: 64.8 },
        { src: "/images/tourism/districts/peren/peren-overview-800.jpg", width: 800, height: 1244, sizeKb: 165.7 },
        { src: "/images/tourism/districts/peren/peren-overview-823.jpg", width: 823, height: 1280, sizeKb: 154.1 }
      ]
    },
    credit: "Zeliang Cultural Preservation Field Records",
    sourceUrl: "https://tourism.nagaland.gov.in/",
    license: "Community Heritage Documentation Rights",
    attributionRequired: true,
    dataStatus: "verified_real",
    consentStatus: "approved"
  },

  "benreu-village": {
    id: "benreu-village",
    src: "/images/tourism/districts/peren/benreu-village-496.webp",
    alt: "Traditional timber architecture and mist-shrouded mountain homes in Benreu village on Mt. Pauna slopes",
    width: 496,
    height: 618,
    category: "village",
    entityId: "benreu",
    variants: {
      webp: [
        { src: "/images/tourism/districts/peren/benreu-village-400.webp", width: 400, height: 498, sizeKb: 57.5 },
        { src: "/images/tourism/districts/peren/benreu-village-496.webp", width: 496, height: 618, sizeKb: 90.7 }
      ],
      fallback: [
        { src: "/images/tourism/districts/peren/benreu-village-400.jpg", width: 400, height: 498, sizeKb: 60.1 },
        { src: "/images/tourism/districts/peren/benreu-village-496.jpg", width: 496, height: 618, sizeKb: 87.6 }
      ]
    },
    credit: "Mt. Pauna Tourist Village Council & Field Archive",
    license: "Community Heritage Documentation Rights",
    attributionRequired: true,
    dataStatus: "verified_real",
    consentStatus: "approved"
  },

  "poilwa-sheep-farm": {
    id: "poilwa-sheep-farm",
    src: "/images/tourism/districts/peren/poilwa-sheep-farm-800.webp",
    alt: "Sheep grazing on green terraced hillsides at Poilwa sheep farm in Peren District",
    width: 962,
    height: 1280,
    category: "village",
    entityId: "poilwa",
    variants: {
      webp: [
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-400.webp", width: 400, height: 532, sizeKb: 44.6 },
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-800.webp", width: 800, height: 1064, sizeKb: 126.4 },
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-962.webp", width: 962, height: 1280, sizeKb: 156.0 }
      ],
      fallback: [
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-400.jpg", width: 400, height: 532, sizeKb: 50.1 },
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-800.jpg", width: 800, height: 1064, sizeKb: 156.2 },
        { src: "/images/tourism/districts/peren/poilwa-sheep-farm-962.jpg", width: 962, height: 1280, sizeKb: 193.9 }
      ]
    },
    credit: "Poilwa Village Council & Department of Veterinary & Animal Husbandry",
    license: "Community Documentation Permission",
    attributionRequired: true,
    dataStatus: "verified_real",
    consentStatus: "approved"
  },

  "rehangki-morung": {
    id: "rehangki-morung",
    src: "/images/heritage/rehangki-morung-800.webp",
    alt: "Exterior facade of a traditional Rehangki morung with steep thatch roof and massive carved Bonsum timber pillars",
    width: 1536,
    height: 2048,
    category: "heritage",
    entityId: "rehangki-morung",
    variants: {
      webp: [
        { src: "/images/heritage/rehangki-morung-400.webp", width: 400, height: 533, sizeKb: 61.2 },
        { src: "/images/heritage/rehangki-morung-800.webp", width: 800, height: 1067, sizeKb: 178.5 },
        { src: "/images/heritage/rehangki-morung-1536.webp", width: 1536, height: 2048, sizeKb: 410.2 }
      ],
      fallback: [
        { src: "/images/heritage/rehangki-morung-400.jpg", width: 400, height: 533, sizeKb: 72.4 },
        { src: "/images/heritage/rehangki-morung-800.jpg", width: 800, height: 1067, sizeKb: 219.8 },
        { src: "/images/heritage/rehangki-morung-1536.jpg", width: 1536, height: 2048, sizeKb: 520.1 }
      ]
    },
    credit: "Peren Village Clan Elder Custodians",
    license: "Tribal Clan Heritage Documentation",
    attributionRequired: true,
    dataStatus: "verified_real",
    consentStatus: "approved"
  },

  // ==========================================
  // 2. CANONICAL PLACEHOLDER MANIFEST ENTRIES
  // ==========================================
  "placeholder-district": {
    id: "placeholder-district",
    src: "/images/placeholders/district-placeholder.svg",
    alt: "District overview photography is being documented through field archives",
    width: 800,
    height: 450,
    category: "district",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  },

  "placeholder-village": {
    id: "placeholder-village",
    src: "/images/placeholders/village-placeholder.svg",
    alt: "Village photography pending community authority consent and documentation",
    width: 800,
    height: 450,
    category: "village",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  },

  "placeholder-destination": {
    id: "placeholder-destination",
    src: "/images/placeholders/destination-placeholder.svg",
    alt: "Destination photography pending field verification and geolocation review",
    width: 800,
    height: 450,
    category: "destination",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  },

  "placeholder-food": {
    id: "placeholder-food",
    src: "/images/placeholders/food-placeholder.svg",
    alt: "Traditional dish image pending authentic culinary documentation",
    width: 800,
    height: 450,
    category: "cuisine",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  },

  "placeholder-wildlife": {
    id: "placeholder-wildlife",
    src: "/images/placeholders/wildlife-placeholder.svg",
    alt: "Wildlife photography pending sanctuary validation and anti-poaching review",
    width: 800,
    height: 450,
    category: "wildlife",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  },

  "placeholder-heritage": {
    id: "placeholder-heritage",
    src: "/images/placeholders/heritage-placeholder.svg",
    alt: "Heritage artifact photography pending clan archiving and attribution verification",
    width: 800,
    height: 450,
    category: "heritage",
    license: "NagaQuest Platform Open Asset",
    attributionRequired: false,
    dataStatus: "illustrative"
  }
};
