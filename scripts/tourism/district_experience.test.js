/**
 * district_experience.test.js
 * Comprehensive Integration & Verification Test Suite for Reusable District Tourism Pages
 * 
 * Tests against PRD Acceptance Criteria:
 * 1. Architecture: Single reusable data-driven district model
 * 2. Initial Districts: Kohima, Dimapur, and Peren data completeness & provenance
 * 3. Extensibility: Support for other districts (Wokha, Phek, Mokokchung, Mon) with neutral empty states
 * 4. Destination Integration: Seamless merging with CURATED_DESTINATIONS
 * 5. Nearby Districts Graph: Valid non-self-referencing adjacency relationships
 * 6. Travel & Connectivity: Road, rail, and air transit metadata
 * 7. Image Manifest Linkage: Authentic photography mapped to manifest assets
 */

import process from "process";
import { DISTRICTS_REGISTRY, ACCOMMODATION_REGISTRY, CUISINE_REGISTRY, SPECIES_REGISTRY, SEASONS_DATA } from "../../src/data/tourismData.js";
import { CURATED_DESTINATIONS } from "../../src/data/tourismDestinations.js";
import { IMAGE_MANIFEST } from "../../src/data/images/imageManifest.js";
import { validateNearbyDistricts } from "./validationRules.js";

let testCount = 0;
let passCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("\n==================================================");
console.log("🏛️  NAGAQUEST DISTRICT TOURISM EXPERIENCE TEST SUITE");
console.log("==================================================\n");

// 1. DISTRICT REGISTRY REUSABILITY CONTRACT
console.log("1. Reusable District Architecture & Discovery");
{
  assert(Array.isArray(DISTRICTS_REGISTRY) && DISTRICTS_REGISTRY.length >= 7, "DISTRICTS_REGISTRY contains all configured districts");
  
  const expectedDistricts = ["kohima", "dimapur", "peren"];
  for (const id of expectedDistricts) {
    const found = DISTRICTS_REGISTRY.find(d => d.id === id);
    assert(found !== undefined, `Priority district '${id}' is registered in DISTRICTS_REGISTRY`);
    assert(found.status === "published", `Priority district '${id}' status is published`);
    assert(found.dataStatus === "verified_real", `Priority district '${id}' dataStatus is verified_real`);
  }
}

// 2. KOHIMA DISTRICT VERIFICATION
console.log("\n2. Kohima District Heritage & Destinations");
{
  const kohima = DISTRICTS_REGISTRY.find(d => d.id === "kohima");
  assert(kohima.headquarters === "Kohima", "Kohima headquarters is Kohima");
  assert(kohima.region === "Southern Hills", "Kohima region is Southern Hills");
  
  // Villages
  const villageIds = (kohima.villages || []).map(v => v.id);
  assert(villageIds.includes("khonoma"), "Kohima includes Khonoma Green Village");
  assert(villageIds.includes("kisama"), "Kohima includes Kisama Naga Heritage Village");
  assert(villageIds.includes("jakhama"), "Kohima includes Jakhama Village");
  
  // Festivals
  const festivalIds = (kohima.festivals || []).map(f => f.id);
  assert(festivalIds.includes("sekrenyi"), "Kohima includes Angami Sekrenyi Festival");
  assert(festivalIds.includes("hornbill-festival"), "Kohima includes state-wide Hornbill Festival at Kisama");
  
  // Heritage & Nature
  assert(kohima.heritageSites?.some(h => h.id === "kohima-war-cemetery"), "Kohima includes WWII Commonwealth War Cemetery");
  assert(kohima.natureAttractions?.some(n => n.name.includes("Dzukou")), "Kohima includes Dzukou Valley Biosphere");
  assert(kohima.natureAttractions?.some(n => n.name.includes("Japfü")), "Kohima includes Japfü Peak");
  
  // Curated Destinations Merging
  const kohimaDestinations = CURATED_DESTINATIONS.filter(d => d.districtId === "kohima");
  assert(kohimaDestinations.length >= 5, `Kohima has ${kohimaDestinations.length} verified destinations in CURATED_DESTINATIONS`);
}

// 3. DIMAPUR DISTRICT VERIFICATION
console.log("\n3. Dimapur District Heritage & Destinations");
{
  const dimapur = DISTRICTS_REGISTRY.find(d => d.id === "dimapur");
  assert(dimapur.headquarters.includes("Dimapur"), "Dimapur headquarters specified");
  assert(dimapur.region === "Western Plains & Foothills", "Dimapur region is Western Plains & Foothills");
  
  // Villages & Crafts
  const villageIds = (dimapur.villages || []).map(v => v.id);
  assert(villageIds.includes("diezephe"), "Dimapur includes Diezephe Craft Heritage Village");
  assert(villageIds.includes("chumoukedima"), "Dimapur includes Chümoukedima Heritage Foothills");
  
  // Heritage & Nature
  assert(dimapur.heritageSites?.some(h => h.id === "kachari-ruins"), "Dimapur includes Kachari Medieval Monolith Ruins");
  assert(dimapur.natureAttractions?.some(n => n.name.includes("Zoological")), "Dimapur includes Nagaland Zoological Park");
  assert(dimapur.natureAttractions?.some(n => n.name.includes("Green Park")), "Dimapur includes Green Park Eco-Zone");
  
  // Curated Destinations Merging
  const dimapurDestinations = CURATED_DESTINATIONS.filter(d => d.districtId === "dimapur");
  assert(dimapurDestinations.length >= 2, `Dimapur has ${dimapurDestinations.length} verified destinations in CURATED_DESTINATIONS`);
}

// 4. PEREN DISTRICT VERIFICATION
console.log("\n4. Peren District Zeliang Heritage & Photography");
{
  const peren = DISTRICTS_REGISTRY.find(d => d.id === "peren");
  assert(peren.imageId === "peren-overview", "Peren references approved imageId 'peren-overview'");
  assert(IMAGE_MANIFEST["peren-overview"] !== undefined, "Peren hero image exists in IMAGE_MANIFEST");
  
  const villageImages = (peren.villages || []).filter(v => v.imageId);
  for (const v of villageImages) {
    assert(IMAGE_MANIFEST[v.imageId] !== undefined, `Peren village '${v.name}' image '${v.imageId}' is verified in IMAGE_MANIFEST`);
  }

  const perenDestinations = CURATED_DESTINATIONS.filter(d => d.districtId === "peren");
  assert(perenDestinations.length >= 3, `Peren has ${perenDestinations.length} verified destinations in CURATED_DESTINATIONS`);
}

// 5. NEARBY DISTRICTS TOPOLOGY INTEGRITY
console.log("\n5. Nearby Districts Adjacency Topology");
{
  const validDistrictIds = new Set(DISTRICTS_REGISTRY.map(d => d.id));
  
  for (const dist of DISTRICTS_REGISTRY) {
    const findings = validateNearbyDistricts(dist, validDistrictIds);
    const errors = findings.filter(f => f.severity === "ERROR");
    assert(errors.length === 0, `District '${dist.id}' nearby districts topology has 0 errors`);
  }

  // Specifically verify adjacent districts for initial three
  const kohima = DISTRICTS_REGISTRY.find(d => d.id === "kohima");
  const dimapur = DISTRICTS_REGISTRY.find(d => d.id === "dimapur");
  const peren = DISTRICTS_REGISTRY.find(d => d.id === "peren");

  assert(kohima.nearbyDistrictIds.includes("dimapur") && kohima.nearbyDistrictIds.includes("peren"), "Kohima links to Dimapur and Peren");
  assert(dimapur.nearbyDistrictIds.includes("kohima") && dimapur.nearbyDistrictIds.includes("peren"), "Dimapur links to Kohima and Peren");
  assert(peren.nearbyDistrictIds.includes("kohima") && peren.nearbyDistrictIds.includes("dimapur"), "Peren links to Kohima and Dimapur");
}

// 6. FUTURE EXTENSION DISTRICTS & EMPTY STATES
console.log("\n6. Future District Expansion & Neutral Empty States");
{
  const extensionDistricts = ["wokha", "phek", "mokokchung", "mon"];
  for (const id of extensionDistricts) {
    const dist = DISTRICTS_REGISTRY.find(d => d.id === id);
    assert(dist !== undefined, `Extension district '${id}' is registered in schema`);
    assert(Array.isArray(dist.villages), `Extension district '${id}' has empty villages array ready for data`);
    assert(Array.isArray(dist.destinations), `Extension district '${id}' has empty destinations array ready for data`);
  }
}

// 7. STATEWIDE CATEGORIES: CUISINE, ACCOMMODATION, SPECIES & SEASONS
console.log("\n7. Statewide Categories Verification");
{
  assert(Array.isArray(ACCOMMODATION_REGISTRY) && ACCOMMODATION_REGISTRY.length >= 4, `ACCOMMODATION_REGISTRY contains ${ACCOMMODATION_REGISTRY.length} verified stays`);
  assert(Array.isArray(CUISINE_REGISTRY) && CUISINE_REGISTRY.length >= 6, `CUISINE_REGISTRY contains ${CUISINE_REGISTRY.length} verified dishes`);
  assert(Array.isArray(SPECIES_REGISTRY) && SPECIES_REGISTRY.length >= 6, `SPECIES_REGISTRY contains ${SPECIES_REGISTRY.length} verified species`);
  assert(Array.isArray(SEASONS_DATA) && SEASONS_DATA.length === 4, "SEASONS_DATA covers all 4 annual periods");
  
  for (const stay of ACCOMMODATION_REGISTRY) {
    assert(stay.dataStatus === "verified_real", `Stay '${stay.name}' has verified_real dataStatus`);
    assert(stay.externalUrl || stay.contact, `Stay '${stay.name}' has contact or externalUrl`);
  }

  for (const dish of CUISINE_REGISTRY) {
    assert(dish.dataStatus === "verified_real", `Dish '${dish.name}' has verified_real dataStatus`);
    assert(dish.ingredients && dish.ingredients.length > 0, `Dish '${dish.name}' documents authentic ingredients`);
  }

  for (const sp of SPECIES_REGISTRY) {
    assert(sp.dataStatus === "verified_real", `Species '${sp.commonName}' has verified_real dataStatus`);
    assert(sp.scientificName, `Species '${sp.commonName}' includes scientificName`);
  }

  for (const season of SEASONS_DATA) {
    assert(season.recommendations && season.recommendations.length > 0, `Season '${season.name}' includes verified district recommendations`);
  }
}

console.log("\n--------------------------------------------------");
console.log(`Test Results: ${passCount} / ${testCount} passed.`);
if (passCount === testCount) {
  console.log("✅ All District Tourism Experience integration tests passed!\n");
  process.exit(0);
} else {
  console.error("❌ Some tests failed!\n");
  process.exit(1);
}
