# NagaQuest Tourism Data Quality & Validation System Guide

This document describes the automated validation framework, integrity rules, finding severities, and developer remediation workflows for **NagaQuest** tourism and destination datasets.

---

## 1. System Overview & Core Objectives

As NagaQuest expands its coverage across all 16 districts of Nagaland, manual review alone cannot prevent duplicate identifiers, coordinate typos, out-of-bounds pins, or broken image manifest links.

The **Tourism Data Quality System** provides an automated, zero-network, and non-destructive auditing layer designed to:

* Enforce structural contracts on destination records in [`src/data/tourismDestinations.js`](file:///Users/pranjalmishra/naga%20quest/icfaihackathone/src/data/tourismDestinations.js).
* Verify district linkages against [`src/data/tourismData.js`](file:///Users/pranjalmishra/naga%20quest/icfaihackathone/src/data/tourismData.js).
* Validate image references against the centralized [`src/data/images/imageManifest.js`](file:///Users/pranjalmishra/naga%20quest/icfaihackathone/src/data/images/imageManifest.js).
* Check geographic plausibility within the bounding box of Nagaland.
* Audit provenance metadata, source URLs, and internal route patterns.
* Output formatted terminal reports and machine-readable JSON artifacts in `reports/tourism-validation.json`.

---

## 2. Command Usage & Options

The system runs entirely via local static analysis and requires **zero internet access** and **no paid API keys**:

```bash
# Standard validation run
npm run tourism:validate

# Strict mode: treats warnings as blocking errors (ideal for CI pipelines)
npm run tourism:validate -- --strict

# Custom JSON report destination
node scripts/tourism/validate_tourism.js --json=reports/custom-audit.json

# Disable JSON report generation
node scripts/tourism/validate_tourism.js --no-json

# Run unit tests verifying rule detection accuracy
npm run tourism:test
```

### Exit Codes:
* `0`: Validation passed (zero blocking errors in standard mode; zero errors and zero warnings in strict mode).
* `1`: Validation failed (one or more structural errors detected, or strict mode failed due to warnings).

---

## 3. Data Schema Contract

Each destination record in `src/data/tourismDestinations.js` is validated against the following schema:

```javascript
{
  id: "rehangki-morung",                            // REQUIRED (string, unique, lowercase kebab-case)
  name: "Rehangki (Traditional Morung)",            // REQUIRED (non-empty string)
  districtId: "peren",                              // REQUIRED (matches an id in DISTRICTS_REGISTRY)
  districtName: "Peren",                            // REQUIRED (human-readable string)
  latitude: 25.5790,                                // REQUIRED (finite number in range [-90, 90])
  longitude: 93.9020,                               // REQUIRED (finite number in range [-180, 180])
  category: "heritage",                             // REQUIRED ("heritage"|"village"|"nature"|"attraction"|"market"|"accommodation"|"food")
  description: "Centuries-old Zeliang dormitory...",// OPTIONAL (clean text without template placeholders)
  imageId: "rehangki-morung",                       // OPTIONAL (if present, must exist in IMAGE_MANIFEST)
  dataStatus: "verified_real",                      // REQUIRED ("verified_real"|"api_sourced"|"illustrative"|"unverified_ai")
  detailPath: "/tourism/districts/peren",           // OPTIONAL (must start with approved internal prefix)
  address: "Benreu Village, Peren District",        // OPTIONAL (geographic location description)
  sourceProvider: "Zeliang Cultural Documentation", // REQUIRED for verified_real / api_sourced
  sourceUrl: "https://tourism.nagaland.gov.in"      // OPTIONAL (valid URL format, HTTPS preferred)
}
```

---

## 4. Rule Index & Finding Severities

Findings are classified into three severity tiers:

### ❌ ERRORS (Structural Failures — Exit Code `1`)
| Code | Condition | Remediation |
| :--- | :--- | :--- |
| `DUPLICATE_DESTINATION_ID` | More than one destination has the same `id`. | Assign a unique slug to each destination. |
| `MISSING_DESTINATION_ID` | `id` is null, undefined, or empty string. | Provide a kebab-case string identifier. |
| `EMPTY_DESTINATION_NAME` | `name` is missing or contains only whitespace. | Supply a valid name. |
| `MISSING_CATEGORY` | `category` field is omitted. | Assign an approved category. |
| `INVALID_CATEGORY` | `category` is not in approved set. | Choose from: `heritage`, `village`, `nature`, `attraction`, `market`, `accommodation`, `food`. |
| `INVALID_COORDINATES` | `latitude` or `longitude` is not a finite number. | Supply numeric decimal coordinates. |
| `COORDINATES_OUT_OF_RANGE` | Latitude outside `[-90, 90]` or longitude outside `[-180, 180]`. | Fix coordinate values. |
| `INVALID_DISTRICT_REFERENCE` | `districtId` is not found in `DISTRICTS_REGISTRY`. | Use an approved district key (e.g., `peren`, `kohima`, `mon`). |
| `UNRESOLVED_IMAGE_ID` | `imageId` does not exist in `IMAGE_MANIFEST`. | Register asset in `src/data/images/imageManifest.js` or set `imageId: null`. |
| `MISSING_DATA_STATUS` | `dataStatus` is omitted. | Assign one of: `verified_real`, `api_sourced`, `illustrative`, `unverified_ai`. |
| `INVALID_DATA_STATUS` | `dataStatus` is an unrecognized string. | Use approved status enum. |
| `MALFORMED_SOURCE_URL` | `sourceUrl` cannot be parsed as a valid URL. | Provide a syntactically correct URL. |
| `INVALID_URL_PROTOCOL` | `sourceUrl` uses protocol other than `http:` or `https:`. | Use standard web protocols. |

### ⚠️ WARNINGS (Review Required — Exit Code `0` in Standard Mode, `1` in Strict Mode)
| Code | Condition | Remediation |
| :--- | :--- | :--- |
| `OUT_OF_REGION_COORDINATES` | Coordinates fall outside Nagaland bounding box (`[25.10, 93.20]` to `[27.10, 95.40]`). | Verify coordinates with authoritative local maps or OpenStreetMap. |
| `DUPLICATE_COORDINATES` | Two distinct destinations share identical coordinates down to 4 decimal places. | Check if places are co-located or if coordinates were accidentally copied. |
| `PLACEHOLDER_COORDINATES` | Coordinates are near `[0, 0]` (Null Island). | Replace placeholder with real coordinates. |
| `MISSING_PROVENANCE_SOURCE` | `dataStatus` is `verified_real` or `api_sourced` but both `sourceProvider` and `sourceUrl` are missing. | Record the source organization, OSM node, or elder council survey. |
| `TEMPLATE_TEXT_DETECTED` | Description contains `lorem ipsum`, `TODO`, `FIXME`, or `sample`. | Replace placeholder text with verified cultural description. |
| `UNRECOGNIZED_ROUTE_PATTERN` | `detailPath` does not start with an approved route prefix (`/tourism`, `/heritage-atlas`, etc.). | Check internal route spelling. |
| `INSECURE_HTTP_URL` | `sourceUrl` uses plain HTTP instead of HTTPS. | Upgrade to HTTPS if supported by the host. |
| `INVALID_ID_FORMAT` | ID does not follow lowercase kebab-case convention. | Standardize ID formatting. |
| `UNEXPECTED_WHITESPACE` | Leading or trailing whitespace found in text fields. | Trim whitespace. |

### ℹ️ INFORMATIONAL (Non-Blocking Observations — Exit Code `0`)
| Code | Condition | Notes |
| :--- | :--- | :--- |
| `CATEGORY_PLACEHOLDER_USED` | Destination has `imageId: null`. | Normal and expected for records awaiting field photography; renders SVG category placeholder without breaking UI. |

---

## 5. Developer Quality Workflow

When adding or updating tourism destinations, run the full verification sequence before committing:

```bash
# 1. Validate images and local asset files
npm run images:validate

# 2. Validate tourism data integrity and geocodes
npm run tourism:validate

# 3. Optional: Run in strict mode to ensure zero review warnings
npm run tourism:validate -- --strict

# 4. Run unit tests
npm run tourism:test

# 5. Verify production bundle builds cleanly
npm run build
```

---

## 6. Cultural Integrity Safeguards

The validator enforces a fundamental distinction:
> **Structural correctness does NOT imply factual truth.**

* The validator **never automatically upgrades** a status to `verified_real`.
* The validator **never mutates or rewrites source data**.
* Missing cultural facts, elder lore, or coordinates are **never synthesized or hallucinated**.
* If an image is unavailable, the system safely relies on neutral SVG placeholders rather than fabricating photography.
