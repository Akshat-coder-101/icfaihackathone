/**
 * validationRules.js
 * NagaQuest Tourism Data Validation Rules & Integrity Checks
 * 
 * Defines deterministic rules for verifying:
 * - ID uniqueness and syntax
 * - Required fields
 * - Coordinate plausibility and bounds
 * - District references against DISTRICTS_REGISTRY
 * - Category validity
 * - Image manifest linkage against IMAGE_MANIFEST
 * - Detail route patterns
 * - Provenance metadata and URL syntax
 * - Content quality and template text detection
 */

// Nagaland geographic plausibility bounding box
export const NAGALAND_PLAUSIBILITY_BOUNDS = {
  minLat: 25.10,
  maxLat: 27.10,
  minLng: 93.20,
  maxLng: 95.40
};

// Recognized tourism categories in NagaQuest
export const VALID_CATEGORIES = new Set([
  "heritage",
  "village",
  "nature",
  "attraction",
  "market",
  "accommodation",
  "food"
]);

// Recognized data provenance statuses (PRD v3, v4, v5)
export const VALID_DATA_STATUSES = new Set([
  "verified_real",
  "api_sourced",
  "illustrative",
  "unverified_ai"
]);

// Known internal route prefixes
export const VALID_ROUTE_PREFIXES = [
  "/tourism",
  "/heritage-atlas",
  "/oral-archive",
  "/language-studio",
  "/community-portal"
];

// Template placeholder patterns
const SUSPICIOUS_TEXT_PATTERNS = [
  /lorem\s+ipsum/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bplaceholder\b/i,
  /\[insert\s+/i,
  /sample\s+description/i,
  /test\s+destination/i
];

/**
 * Validates a single destination record against all rules.
 * 
 * @param {Object} dest - Destination record
 * @param {Object} context - Validation context { seenIds, seenCoords, validDistrictIds, imageManifest }
 * @returns {Array<Object>} List of findings: { severity: 'ERROR'|'WARN'|'INFO', code: string, message: string, remediation: string }
 */
export function validateDestination(dest, context) {
  const findings = [];
  const { seenIds, seenCoords, validDistrictIds, imageManifest } = context;

  // 1. ID VALIDATION
  if (!dest.id || typeof dest.id !== "string" || dest.id.trim() === "") {
    findings.push({
      severity: "ERROR",
      code: "MISSING_DESTINATION_ID",
      message: "Destination is missing a valid 'id'.",
      remediation: "Provide a unique, nonempty string identifier (e.g., 'rehangki-morung')."
    });
  } else {
    const idTrimmed = dest.id.trim();
    if (idTrimmed !== dest.id) {
      findings.push({
        severity: "WARN",
        code: "UNEXPECTED_WHITESPACE",
        message: `Destination ID '${dest.id}' contains leading or trailing whitespace.`,
        remediation: "Trim whitespace from ID."
      });
    }

    if (!/^[a-z0-9-]+$/.test(idTrimmed)) {
      findings.push({
        severity: "WARN",
        code: "INVALID_ID_FORMAT",
        message: `Destination ID '${dest.id}' should use kebab-case (lowercase letters, numbers, hyphens).`,
        remediation: "Format destination ID as lowercase kebab-case."
      });
    }

    if (seenIds.has(idTrimmed)) {
      findings.push({
        severity: "ERROR",
        code: "DUPLICATE_DESTINATION_ID",
        message: `Duplicate destination ID detected: '${dest.id}'.`,
        remediation: "Assign a unique ID to each destination."
      });
    } else {
      seenIds.add(idTrimmed);
    }
  }

  // 2. REQUIRED FIELDS
  if (!dest.name || typeof dest.name !== "string" || dest.name.trim() === "") {
    findings.push({
      severity: "ERROR",
      code: "EMPTY_DESTINATION_NAME",
      message: `Destination '${dest.id || "unknown"}' has an empty or missing 'name'.`,
      remediation: "Provide a verified human-readable name."
    });
  } else if (dest.name.trim() !== dest.name) {
    findings.push({
      severity: "WARN",
      code: "UNEXPECTED_WHITESPACE",
      message: `Destination name '${dest.name}' contains leading or trailing whitespace.`,
      remediation: "Trim whitespace from destination name."
    });
  }

  // 3. CATEGORY VALIDATION
  if (!dest.category) {
    findings.push({
      severity: "ERROR",
      code: "MISSING_CATEGORY",
      message: `Destination '${dest.id}' is missing required field 'category'.`,
      remediation: `Assign a valid category from: ${Array.from(VALID_CATEGORIES).join(", ")}.`
    });
  } else if (!VALID_CATEGORIES.has(dest.category.toLowerCase())) {
    findings.push({
      severity: "ERROR",
      code: "INVALID_CATEGORY",
      message: `Destination '${dest.id}' has invalid category '${dest.category}'.`,
      remediation: `Choose from: ${Array.from(VALID_CATEGORIES).join(", ")}.`
    });
  }

  // 4. COORDINATE VALIDATION
  const hasLat = typeof dest.latitude === "number" && !isNaN(dest.latitude);
  const hasLng = typeof dest.longitude === "number" && !isNaN(dest.longitude);

  if (!hasLat || !hasLng) {
    findings.push({
      severity: "ERROR",
      code: "INVALID_COORDINATES",
      message: `Destination '${dest.id}' has missing or non-numerical coordinates (lat: ${dest.latitude}, lng: ${dest.longitude}).`,
      remediation: "Ensure latitude and longitude are valid finite decimal numbers."
    });
  } else {
    // Range sanity checks
    if (dest.latitude < -90 || dest.latitude > 90 || dest.longitude < -180 || dest.longitude > 180) {
      findings.push({
        severity: "ERROR",
        code: "COORDINATES_OUT_OF_RANGE",
        message: `Coordinates for '${dest.id}' [${dest.latitude}, ${dest.longitude}] exceed global range limits.`,
        remediation: "Latitude must be between -90 and 90; Longitude must be between -180 and 180."
      });
    }

    // Placeholder coordinate detection (e.g. 0,0)
    if (Math.abs(dest.latitude) < 0.001 && Math.abs(dest.longitude) < 0.001) {
      findings.push({
        severity: "WARN",
        code: "PLACEHOLDER_COORDINATES",
        message: `Destination '${dest.id}' has suspicious null island coordinates [0, 0].`,
        remediation: "Replace placeholder with verified geographic coordinates."
      });
    }

    // Regional plausibility check: Nagaland
    const inBounds =
      dest.latitude >= NAGALAND_PLAUSIBILITY_BOUNDS.minLat &&
      dest.latitude <= NAGALAND_PLAUSIBILITY_BOUNDS.maxLat &&
      dest.longitude >= NAGALAND_PLAUSIBILITY_BOUNDS.minLng &&
      dest.longitude <= NAGALAND_PLAUSIBILITY_BOUNDS.maxLng;

    if (!inBounds) {
      findings.push({
        severity: "WARN",
        code: "OUT_OF_REGION_COORDINATES",
        message: `Coordinates for '${dest.id}' [${dest.latitude}, ${dest.longitude}] fall outside Nagaland regional bounding box.`,
        remediation: "Verify that latitude is in [25.10, 27.10] and longitude is in [93.20, 95.40]."
      });
    }

    // Duplicate coordinates check
    const coordKey = `${dest.latitude.toFixed(4)},${dest.longitude.toFixed(4)}`;
    if (seenCoords.has(coordKey)) {
      const existingId = seenCoords.get(coordKey);
      findings.push({
        severity: "WARN",
        code: "DUPLICATE_COORDINATES",
        message: `Destination '${dest.id}' shares identical coordinates [${coordKey}] with '${existingId}'.`,
        remediation: "Confirm if places are co-located or if coordinates were accidentally duplicated."
      });
    } else {
      seenCoords.set(coordKey, dest.id);
    }
  }

  // 5. DISTRICT REFERENCE VALIDATION
  if (!dest.districtId) {
    findings.push({
      severity: "WARN",
      code: "MISSING_DISTRICT_ID",
      message: `Destination '${dest.id}' does not specify a 'districtId'.`,
      remediation: "Assign an authoritative district ID from DISTRICTS_REGISTRY."
    });
  } else {
    const distKey = dest.districtId.toLowerCase().trim();
    if (!validDistrictIds.has(distKey)) {
      findings.push({
        severity: "ERROR",
        code: "INVALID_DISTRICT_REFERENCE",
        message: `Destination '${dest.id}' references unknown districtId '${dest.districtId}'.`,
        remediation: `Ensure districtId matches an entry in DISTRICTS_REGISTRY: ${Array.from(validDistrictIds).join(", ")}.`
      });
    }
  }

  // 6. IMAGE MANIFEST REFERENCE
  if (dest.imageId) {
    if (typeof dest.imageId !== "string" || dest.imageId.trim() === "") {
      findings.push({
        severity: "WARN",
        code: "INVALID_IMAGE_ID",
        message: `Destination '${dest.id}' has empty or invalid imageId.`,
        remediation: "Provide a valid image manifest key or set imageId to null."
      });
    } else if (imageManifest && !imageManifest[dest.imageId]) {
      findings.push({
        severity: "ERROR",
        code: "UNRESOLVED_IMAGE_ID",
        message: `Destination '${dest.id}' references imageId '${dest.imageId}' which does not exist in IMAGE_MANIFEST.`,
        remediation: "Register image in src/data/images/imageManifest.js or run npm run images:validate."
      });
    }
  } else {
    findings.push({
      severity: "INFO",
      code: "CATEGORY_PLACEHOLDER_USED",
      message: `Destination '${dest.id}' has no imageId; will render fallback '${dest.category || "destination"}' SVG placeholder.`,
      remediation: "Non-blocking: add verified photography when field documentation is compiled."
    });
  }

  // 7. ROUTE / DETAIL PATH VALIDATION
  if (dest.detailPath) {
    if (typeof dest.detailPath !== "string") {
      findings.push({
        severity: "ERROR",
        code: "INVALID_DETAIL_PATH_TYPE",
        message: `Destination '${dest.id}' detailPath must be a string.`,
        remediation: "Specify an internal route string like '/tourism/districts/peren'."
      });
    } else {
      const isInternal = dest.detailPath.startsWith("/");
      const matchesPrefix = VALID_ROUTE_PREFIXES.some(prefix => dest.detailPath.startsWith(prefix));

      if (!isInternal || !matchesPrefix) {
        findings.push({
          severity: "WARN",
          code: "UNRECOGNIZED_ROUTE_PATTERN",
          message: `Destination '${dest.id}' detailPath '${dest.detailPath}' does not match recognized route prefixes.`,
          remediation: `Use an approved route starting with: ${VALID_ROUTE_PREFIXES.join(", ")}.`
        });
      }
    }
  }

  // 8. DATA STATUS & PROVENANCE
  if (!dest.dataStatus) {
    findings.push({
      severity: "ERROR",
      code: "MISSING_DATA_STATUS",
      message: `Destination '${dest.id}' is missing required field 'dataStatus'.`,
      remediation: `Set dataStatus to one of: ${Array.from(VALID_DATA_STATUSES).join(", ")}.`
    });
  } else if (!VALID_DATA_STATUSES.has(dest.dataStatus)) {
    findings.push({
      severity: "ERROR",
      code: "INVALID_DATA_STATUS",
      message: `Destination '${dest.id}' has unrecognized dataStatus '${dest.dataStatus}'.`,
      remediation: `Allowed values: ${Array.from(VALID_DATA_STATUSES).join(", ")}.`
    });
  } else if ((dest.dataStatus === "verified_real" || dest.dataStatus === "api_sourced") && !dest.sourceProvider && !dest.sourceUrl) {
    findings.push({
      severity: "WARN",
      code: "MISSING_PROVENANCE_SOURCE",
      message: `Destination '${dest.id}' has dataStatus '${dest.dataStatus}' but provides neither 'sourceProvider' nor 'sourceUrl'.`,
      remediation: "Document the attribution source (e.g. 'OpenStreetMap (Node 12345)' or local council survey)."
    });
  }

  // 9. URL SYNTAX VALIDATION
  if (dest.sourceUrl) {
    try {
      const parsedUrl = new URL(dest.sourceUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        findings.push({
          severity: "ERROR",
          code: "INVALID_URL_PROTOCOL",
          message: `Destination '${dest.id}' sourceUrl '${dest.sourceUrl}' uses unsupported protocol '${parsedUrl.protocol}'.`,
          remediation: "Use standard https:// or http:// web URLs."
        });
      } else if (parsedUrl.protocol === "http:") {
        findings.push({
          severity: "WARN",
          code: "INSECURE_HTTP_URL",
          message: `Destination '${dest.id}' sourceUrl uses insecure HTTP: '${dest.sourceUrl}'.`,
          remediation: "Upgrade to HTTPS if supported by the provider."
        });
      }
    } catch {
      findings.push({
        severity: "ERROR",
        code: "MALFORMED_SOURCE_URL",
        message: `Destination '${dest.id}' has malformed sourceUrl: '${dest.sourceUrl}'.`,
        remediation: "Provide a syntactically valid URL."
      });
    }
  }

  // 10. CONTENT QUALITY & SUSPICIOUS TEMPLATE TEXT
  if (dest.description) {
    if (typeof dest.description !== "string") {
      findings.push({
        severity: "ERROR",
        code: "INVALID_DESCRIPTION_TYPE",
        message: `Destination '${dest.id}' description must be a string.`,
        remediation: "Provide a text description or omit the field."
      });
    } else {
      for (const pattern of SUSPICIOUS_TEXT_PATTERNS) {
        if (pattern.test(dest.description)) {
          findings.push({
            severity: "WARN",
            code: "TEMPLATE_TEXT_DETECTED",
            message: `Destination '${dest.id}' description contains suspicious placeholder text matching ${pattern}.`,
            remediation: "Replace template text with authentic, verified description."
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Validates a district's nearbyDistrictIds configuration.
 *
 * @param {Object} district - District object from DISTRICTS_REGISTRY
 * @param {Set<string>} validDistrictIds - Set of recognized district identifiers
 * @returns {Array<Object>} List of findings
 */
export function validateNearbyDistricts(district, validDistrictIds) {
  const findings = [];
  if (!district || !district.nearbyDistrictIds) return findings;

  if (!Array.isArray(district.nearbyDistrictIds)) {
    findings.push({
      severity: "ERROR",
      code: "INVALID_NEARBY_DISTRICTS_TYPE",
      message: `District '${district.id}' nearbyDistrictIds must be an array.`,
      remediation: "Provide an array of valid district ID strings."
    });
    return findings;
  }

  const seenNearby = new Set();
  for (const nearId of district.nearbyDistrictIds) {
    if (nearId === district.id) {
      findings.push({
        severity: "ERROR",
        code: "SELF_REFERENCING_NEARBY_DISTRICT",
        message: `District '${district.id}' references itself in nearbyDistrictIds.`,
        remediation: "Remove self-reference from nearbyDistrictIds."
      });
    }

    if (seenNearby.has(nearId)) {
      findings.push({
        severity: "WARN",
        code: "DUPLICATE_NEARBY_DISTRICT",
        message: `District '${district.id}' has duplicate entry '${nearId}' in nearbyDistrictIds.`,
        remediation: "Remove duplicate district reference."
      });
    } else {
      seenNearby.add(nearId);
    }

    if (validDistrictIds && !validDistrictIds.has(nearId?.toLowerCase())) {
      findings.push({
        severity: "ERROR",
        code: "INVALID_NEARBY_DISTRICT_REFERENCE",
        message: `District '${district.id}' references unknown nearby district '${nearId}'.`,
        remediation: `Use valid district ID: ${Array.from(validDistrictIds).join(", ")}.`
      });
    }
  }

  return findings;
}

