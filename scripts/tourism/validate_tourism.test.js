/**
 * validate_tourism.test.js
 * Unit & Integration Test Suite for NagaQuest Tourism Data Validation Rules
 * 
 * Verifies that the validation rules accurately detect:
 * 1. Duplicate IDs
 * 2. Missing required fields (id, name, category, dataStatus)
 * 3. Invalid & out-of-range coordinates
 * 4. Out-of-region coordinates (outside Nagaland)
 * 5. Invalid district references
 * 6. Unresolved image manifest IDs
 * 7. Malformed source URLs
 * 8. Suspicious template placeholder text
 * 9. Perfectly valid records with zero errors
 */

import process from "process";
import { validateDestination, validateNearbyDistricts } from "./validationRules.js";

function createMockContext(overrides = {}) {
  return {
    seenIds: new Set(),
    seenCoords: new Map(),
    validDistrictIds: new Set(["peren", "kohima", "dimapur", "wokha", "mokokchung", "phek", "mon", "tuensang"]),
    imageManifest: {
      "rehangki-morung": { id: "rehangki-morung" },
      "benreu-village": { id: "benreu-village" }
    },
    ...overrides
  };
}

let testCount = 0;
let passCount = 0;

function assert(condition, testName) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log("\n🧪 Running Tourism Data Validation Unit Tests...\n");

// Test 1: Valid destination passes with 0 errors
{
  const context = createMockContext();
  const validRecord = {
    id: "rehangki-morung",
    name: "Rehangki Morung",
    districtId: "peren",
    latitude: 25.5790,
    longitude: 93.9020,
    category: "heritage",
    description: "Centuries-old morung in Benreu.",
    imageId: "rehangki-morung",
    dataStatus: "verified_real",
    sourceProvider: "Zeliang Cultural Documentation",
    detailPath: "/tourism/districts/peren"
  };

  const findings = validateDestination(validRecord, context);
  const errors = findings.filter(f => f.severity === "ERROR");
  assert(errors.length === 0, "Valid destination produces 0 errors");
}

// Test 2: Duplicate destination ID detected
{
  const context = createMockContext();
  context.seenIds.add("benreu-village");
  const dupRecord = {
    id: "benreu-village",
    name: "Benreu Tourist Village Duplicate",
    districtId: "peren",
    latitude: 25.5786,
    longitude: 93.9015,
    category: "village",
    dataStatus: "verified_real",
    sourceProvider: "Survey"
  };

  const findings = validateDestination(dupRecord, context);
  const dupFinding = findings.find(f => f.code === "DUPLICATE_DESTINATION_ID");
  assert(dupFinding && dupFinding.severity === "ERROR", "Duplicate destination ID triggers DUPLICATE_DESTINATION_ID error");
}

// Test 3: Missing required name and empty ID
{
  const context = createMockContext();
  const badRecord = {
    id: "",
    name: "   ",
    category: "heritage",
    latitude: 25.6,
    longitude: 94.0,
    dataStatus: "verified_real"
  };

  const findings = validateDestination(badRecord, context);
  assert(findings.some(f => f.code === "MISSING_DESTINATION_ID"), "Empty ID triggers MISSING_DESTINATION_ID");
  assert(findings.some(f => f.code === "EMPTY_DESTINATION_NAME"), "Blank name triggers EMPTY_DESTINATION_NAME");
}

// Test 4: Invalid coordinates (NaN and out of range)
{
  const context = createMockContext();
  const nanRecord = {
    id: "bad-coords",
    name: "Bad Coordinates Place",
    districtId: "kohima",
    latitude: "invalid_lat",
    longitude: 94.0,
    category: "nature",
    dataStatus: "verified_real"
  };

  const findings = validateDestination(nanRecord, context);
  assert(findings.some(f => f.code === "INVALID_COORDINATES"), "Non-numeric latitude triggers INVALID_COORDINATES");
}

// Test 5: Out of region coordinates (e.g. London or New York)
{
  const context = createMockContext();
  const outOfBoundsRecord = {
    id: "london-place",
    name: "Place Outside Nagaland",
    districtId: "kohima",
    latitude: 51.5074,
    longitude: -0.1278,
    category: "attraction",
    dataStatus: "verified_real",
    sourceProvider: "Test"
  };

  const findings = validateDestination(outOfBoundsRecord, context);
  const outFinding = findings.find(f => f.code === "OUT_OF_REGION_COORDINATES");
  assert(outFinding && outFinding.severity === "WARN", "Coordinates outside Nagaland trigger OUT_OF_REGION_COORDINATES warning");
}

// Test 6: Invalid district reference
{
  const context = createMockContext();
  const invalidDistrictRecord = {
    id: "nonexistent-district-dest",
    name: "Unknown District Spot",
    districtId: "atlantis",
    latitude: 25.65,
    longitude: 94.10,
    category: "village",
    dataStatus: "verified_real",
    sourceProvider: "Survey"
  };

  const findings = validateDestination(invalidDistrictRecord, context);
  const distFinding = findings.find(f => f.code === "INVALID_DISTRICT_REFERENCE");
  assert(distFinding && distFinding.severity === "ERROR", "Unknown district triggers INVALID_DISTRICT_REFERENCE error");
}

// Test 7: Unresolved image ID
{
  const context = createMockContext();
  const unresImageRecord = {
    id: "unresolved-img-dest",
    name: "Unresolved Image Spot",
    districtId: "kohima",
    latitude: 25.65,
    longitude: 94.10,
    category: "attraction",
    imageId: "non-existent-photo-uuid",
    dataStatus: "verified_real",
    sourceProvider: "Survey"
  };

  const findings = validateDestination(unresImageRecord, context);
  const imgFinding = findings.find(f => f.code === "UNRESOLVED_IMAGE_ID");
  assert(imgFinding && imgFinding.severity === "ERROR", "Non-existent imageId triggers UNRESOLVED_IMAGE_ID error");
}

// Test 8: Malformed source URL
{
  const context = createMockContext();
  const malformedUrlRecord = {
    id: "bad-url-dest",
    name: "Bad URL Spot",
    districtId: "kohima",
    latitude: 25.65,
    longitude: 94.10,
    category: "attraction",
    dataStatus: "verified_real",
    sourceUrl: "ht!tp://not a valid url"
  };

  const findings = validateDestination(malformedUrlRecord, context);
  assert(findings.some(f => f.code === "MALFORMED_SOURCE_URL"), "Malformed sourceUrl triggers MALFORMED_SOURCE_URL error");
}

// Test 9: Template placeholder text in description
{
  const context = createMockContext();
  const templateRecord = {
    id: "lorem-dest",
    name: "Lorem Place",
    districtId: "kohima",
    latitude: 25.65,
    longitude: 94.10,
    category: "nature",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    dataStatus: "verified_real",
    sourceProvider: "Survey"
  };

  const findings = validateDestination(templateRecord, context);
  assert(findings.some(f => f.code === "TEMPLATE_TEXT_DETECTED"), "Lorem ipsum text triggers TEMPLATE_TEXT_DETECTED warning");
}

// Test 10: Valid nearby districts produce 0 errors
{
  const validDist = {
    id: "peren",
    nearbyDistrictIds: ["kohima", "dimapur"]
  };
  const validIds = new Set(["peren", "kohima", "dimapur", "wokha"]);
  const findings = validateNearbyDistricts(validDist, validIds);
  assert(findings.length === 0, "Valid nearbyDistrictIds produce 0 errors");
}

// Test 11: Self-referencing and unknown nearby district detected
{
  const invalidDist = {
    id: "peren",
    nearbyDistrictIds: ["peren", "unknown_district_xyz"]
  };
  const validIds = new Set(["peren", "kohima", "dimapur"]);
  const findings = validateNearbyDistricts(invalidDist, validIds);
  const hasSelfRef = findings.some(f => f.code === "SELF_REFERENCING_NEARBY_DISTRICT");
  const hasUnknown = findings.some(f => f.code === "INVALID_NEARBY_DISTRICT_REFERENCE");
  assert(hasSelfRef && hasUnknown, "Self-referencing and unknown nearby districts trigger errors");
}

console.log("\n--------------------------------------------------");
console.log(`Test Results: ${passCount} / ${testCount} passed.`);
if (passCount === testCount) {
  console.log("✅ All unit tests passed!\n");
  process.exit(0);
} else {
  console.error("❌ Some unit tests failed!\n");
  process.exit(1);
}
