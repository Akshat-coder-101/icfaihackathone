# NagaQuest Image Management System Guide

This document describes the centralized image management, optimization, and delivery infrastructure in **NagaQuest**.

---

## 1. Directory Structure

Original assets are stored outside the public directory to avoid bloating production builds, while generated, optimized responsive assets reside under `public/images/`:

```
icfaihackathone/
├── raw_assets/                               # Source original photographs (git-ignored/archived)
│   ├── tourism/districts/peren/
│   │   ├── peren-overview.jpg
│   │   ├── benreu-village.jpg
│   │   └── poilwa-sheep-farm.jpg
│   └── heritage/
│       └── rehangki-morung.jpg
│
├── public/
│   └── images/
│       ├── placeholders/                     # Culturally stylized category SVG placeholders
│       │   ├── destination-placeholder.svg
│       │   ├── village-placeholder.svg
│       │   ├── food-placeholder.svg
│       │   ├── wildlife-placeholder.svg
│       │   ├── district-placeholder.svg
│       │   └── heritage-placeholder.svg
│       ├── tourism/                          # Generated responsive variants (WebP, fallback)
│       │   ├── districts/
│       │   │   └── peren/
│       │   ├── destinations/
│       │   ├── villages/
│       │   └── accommodation/
│       ├── cuisine/
│       ├── flora-fauna/
│       └── heritage/
│
├── scripts/
│   └── images/
│       ├── optimize_images.py                # Automated Python Pillow optimization pipeline
│       ├── validate_manifest.js              # Manifest and asset validation runner
│       ├── optimization_report.json          # Deterministic pipeline output report
│       └── README.md
│
└── src/
    ├── data/
    │   └── images/
    │       ├── imageTypes.js                 # TypeScript-compatible JSDoc schema
    │       ├── imageManifest.js              # Central metadata registry & single source of truth
    │       └── imageHelpers.js               # Resolution, placeholder, and srcSet helpers
    └── components/
        └── images/
            ├── ManagedImage.jsx              # Primary application interface with fallback
            ├── ResponsiveImage.jsx           # Native <picture> tag with WebP/AVIF srcSets
            ├── ImagePlaceholder.jsx          # Vector placeholder fallback
            ├── ImageAttribution.jsx          # Overlay & inline licensing/credit badge
            └── index.js                      # Barrel export
```

---

## 2. Adding an Original Image

1. Place the verified original photo in the appropriate directory inside `raw_assets/` (e.g. `raw_assets/tourism/districts/kohima/kohima-war-cemetery.jpg`).
2. Verify that the image is legitimate, ethically obtained, and respects cultural consent:
   - For sacred ceremonies or traditional persons, ensure explicit permission.
   - AI-generated illustrations must be marked with `dataStatus: "unverified_ai"` or `"illustrative"`, and never presented as authentic photographs.

---

## 3. Running the Optimization Pipeline

The optimization pipeline uses Python with Pillow to resize images, orient them correctly from EXIF data, and export optimized WebP (and JPEG fallback) candidates without upscaling beyond intrinsic dimensions:

```bash
# Run via npm script
npm run images:optimize

# Or directly with python3
python3 scripts/images/optimize_images.py
```

### Pipeline Guarantees:
- **No upscaling**: If an image is 600px wide, it will generate a 400px and 600px variant, skipping the 800px and 1600px targets.
- **Deterministic filenames**: Generates `{slug}-{width}w.webp` and `{slug}-{width}w.jpg`.
- **Duplicate detection**: Checks filename collisions and reports duplicates.
- **AVIF support**: Gracefully checks for AVIF capability (requires `pillow-heif`); if unavailable, generates WebP and JPEG fallbacks.

The script writes its summary to `scripts/images/optimization_report.json`.

---

## 4. Registering an Image in the Central Manifest

Add an entry to `src/data/images/imageManifest.js`. Every entry requires strict attribution and provenance tracking:

```javascript
"kohima-war-cemetery": {
  id: "kohima-war-cemetery",
  src: "/images/tourism/districts/kohima/kohima-war-cemetery-800w.webp",
  alt: "Commonwealth War Cemetery memorial on Garrison Hill, Kohima, Nagaland",
  width: 1600,
  height: 1067,
  category: "destination",
  entityId: "kohima",
  variants: {
    webp: [
      { src: "/images/tourism/districts/kohima/kohima-war-cemetery-400w.webp", width: 400, height: 267 },
      { src: "/images/tourism/districts/kohima/kohima-war-cemetery-800w.webp", width: 800, height: 534 },
      { src: "/images/tourism/districts/kohima/kohima-war-cemetery-1600w.webp", width: 1600, height: 1067 }
    ],
    fallback: [
      { src: "/images/tourism/districts/kohima/kohima-war-cemetery-800w.jpg", width: 800, height: 534 }
    ]
  },
  credit: "Directorate of Tourism, Nagaland",
  sourceUrl: "https://tourism.nagaland.gov.in",
  license: "Government Open Data / Fair Cultural Documentation",
  attributionRequired: true,
  dataStatus: "verified_real",
  consentStatus: "approved"
}
```

### Manifest Fields:
- `id` (string, required): Unique identifier used in components.
- `src` (string, required): Default image path for standard browsers.
- `alt` (string, required): Accessible, descriptive alternative text.
- `width` & `height` (number, required): Intrinsic dimensions to eliminate Cumulative Layout Shift (CLS).
- `category` (string, required): `"district"`, `"village"`, `"destination"`, `"food"`, `"wildlife"`, or `"heritage"`.
- `variants` (object, optional): `webp`, `avif`, and `fallback` arrays with `{ src, width, height }`.
- `dataStatus` (string, required): `"verified_real"`, `"illustrative"`, or `"unverified_ai"`.
- `credit` & `license`: Provenance metadata.

---

## 5. Validating the Manifest and Assets

Run the automated manifest validator:

```bash
npm run images:validate
```

The validator checks:
1. Manifest ID uniqueness.
2. Required schema fields (`src`, `alt`, `width`, `height`, `category`, `dataStatus`, `license`).
3. Local file existence for `src` and all responsive variants.
4. Valid dataStatus values.
5. Distinguishes errors (build-blocking) from warnings (e.g. missing optional AVIF variants).

---

## 6. Using `ManagedImage` in React

Import `ManagedImage` from `src/components/images`:

```jsx
import { ManagedImage } from "../images";

// 1. Standard lazy-loaded card thumbnail
<ManagedImage
  imageId="benreu-village"
  alt="Benreu Village landscape, Peren District"
  category="village"
  aspectRatioClass="aspect-[16/9]"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  showAttribution={false}
/>

// 2. Critical above-the-fold hero banner
<ManagedImage
  imageId="peren-overview"
  alt="Peren District green ridgeline overview"
  category="district"
  priority={true}
  aspectRatioClass="aspect-[21/9]"
  sizes="(max-width: 768px) 100vw, 1200px"
  showAttribution={true}
/>
```

### Key Props:
- `imageId`: Key in `imageManifest.js`. If omitted or null, the category placeholder is seamlessly rendered.
- `category`: Fallback category for SVGs (`"destination"`, `"village"`, `"food"`, `"wildlife"`, `"district"`, `"heritage"`).
- `priority`: Boolean. When `true`, sets `loading="eager"`, `fetchPriority="high"`, and `decoding="sync"` for LCP optimization. Defaults to `false` (`loading="lazy"`, `decoding="async"`).
- `showAttribution`: Displays hover/tap attribution badge with photographer and license details.
- `aspectRatioClass`: Tailwind class reserving container aspect ratio (e.g., `aspect-[16/9]`, `aspect-video`), guaranteeing zero layout shifts.

---

## 7. How Missing Images & Errors are Handled

1. **Unregistered or Missing `imageId`**:
   The component automatically resolves to the category's SVG vector placeholder (e.g., `village-placeholder.svg`).
2. **Network or Asset 404 Load Failure**:
   `ManagedImage` captures native `onError` events and smoothly flips to the SVG vector placeholder.
3. **No Broken Images**:
   At no point will a broken icon or missing asset box be displayed to visitors.

---

## 8. Adding Images for a New District

The system is completely dynamic and not bound to a fixed list of districts:
1. Create a raw asset directory: `raw_assets/tourism/districts/<new-district>/`.
2. Add high-resolution photographs with attribution notes.
3. Run `npm run images:optimize`.
4. Register the new IDs in `src/data/images/imageManifest.js`.
5. Associate the `imageId` in `src/data/tourismData.js` on the respective district or village entry.
6. Validate via `npm run images:validate`.

---

## 9. Preparing for Future CDN Migration

The manifest architecture separates logical image identifiers from physical URLs:
- Currently, `src` and `variants.webp[].src` use absolute root paths (`/images/...`).
- When migrating to an AWS S3, Cloudflare R2, or ImageKit/Cloudinary CDN, define a `CDN_BASE_URL` in `src/data/images/imageHelpers.js`.
- The helper `resolveImage()` can automatically prepend `VITE_IMAGE_CDN_URL` to local paths if configured:
  ```javascript
  const cdnBase = import.meta.env?.VITE_IMAGE_CDN_URL || "";
  return cdnBase ? `${cdnBase}${path}` : path;
  ```
- No component changes will be necessary; all React components continue consuming `imageId`.
