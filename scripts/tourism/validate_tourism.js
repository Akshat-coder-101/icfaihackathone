#!/usr/bin/env node
/**
 * validate_tourism.js
 * NagaQuest Tourism Data Validation CLI Runner
 * --------------------------------------------
 * Validates destination records, district linkages, geographic coordinates,
 * image manifest references, and provenance metadata.
 * 
 * Usage:
 *   node scripts/tourism/validate_tourism.js
 *   node scripts/tourism/validate_tourism.js --strict
 *   node scripts/tourism/validate_tourism.js --json=reports/custom-report.json
 */

import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { validateDestination, validateNearbyDistricts } from "./validationRules.js";
import { printTerminalReport, saveJsonReport } from "./validationReport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Parse CLI flags
const args = process.argv.slice(2);
const isStrict = args.includes("--strict");
const jsonArg = args.find(a => a.startsWith("--json="));
const jsonOutputPath = jsonArg
  ? path.resolve(projectRoot, jsonArg.split("=")[1])
  : path.resolve(projectRoot, "reports/tourism-validation.json");
const disableJson = args.includes("--no-json");

async function runValidation() {
  const destinationsPath = path.resolve(projectRoot, "src/data/tourismDestinations.js");
  const tourismDataPath = path.resolve(projectRoot, "src/data/tourismData.js");
  const manifestPath = path.resolve(projectRoot, "src/data/images/imageManifest.js");

  // Check file presence
  if (!fs.existsSync(destinationsPath)) {
    console.error(`❌ Fatal: Tourism destinations not found at ${destinationsPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(tourismDataPath)) {
    console.error(`❌ Fatal: Tourism data not found at ${tourismDataPath}`);
    process.exit(1);
  }

  // Load modules dynamically
  const { CURATED_DESTINATIONS } = await import(`file://${destinationsPath}`);
  const { DISTRICTS_REGISTRY } = await import(`file://${tourismDataPath}`);

  let imageManifest = null;
  if (fs.existsSync(manifestPath)) {
    const { IMAGE_MANIFEST } = await import(`file://${manifestPath}`);
    imageManifest = IMAGE_MANIFEST;
  }

  // Authoritative district IDs from registry + statutory districts of Nagaland
  const validDistrictIds = new Set([
    ...DISTRICTS_REGISTRY.map(d => d.id.toLowerCase().trim()),
    "tuensang",
    "zunheboto",
    "kiphire",
    "longleng",
    "noklak",
    "chumoukedima",
    "niuland",
    "tseminyu",
    "shamator"
  ]);

  const findings = [];
  const seenIds = new Set();
  const seenCoords = new Map();

  const context = {
    seenIds,
    seenCoords,
    validDistrictIds,
    imageManifest
  };

  // 1. VALIDATE CURATED DESTINATIONS
  for (const dest of CURATED_DESTINATIONS) {
    const destFindings = validateDestination(dest, context);
    for (const f of destFindings) {
      findings.push({
        destinationId: dest.id || "unspecified",
        ...f
      });
    }
  }

  // 2. VALIDATE DISTRICT REGISTRY INTEGRITY
  const seenDistrictIds = new Set();
  for (const dist of DISTRICTS_REGISTRY) {
    if (!dist.id || seenDistrictIds.has(dist.id)) {
      findings.push({
        destinationId: dist.id || "district",
        severity: "ERROR",
        code: "INVALID_DISTRICT_ID",
        message: `District has invalid or duplicate id '${dist.id}'.`,
        remediation: "Ensure all district IDs in DISTRICTS_REGISTRY are unique."
      });
    } else {
      seenDistrictIds.add(dist.id);
    }

    if (!dist.name) {
      findings.push({
        destinationId: dist.id,
        severity: "ERROR",
        code: "MISSING_DISTRICT_NAME",
        message: `District '${dist.id}' is missing required field 'name'.`,
        remediation: "Provide official district name."
      });
    }

    // Check district imageId
    if (dist.imageId && imageManifest && !imageManifest[dist.imageId]) {
      findings.push({
        destinationId: dist.id,
        severity: "ERROR",
        code: "UNRESOLVED_DISTRICT_IMAGE_ID",
        message: `District '${dist.id}' references imageId '${dist.imageId}' not found in IMAGE_MANIFEST.`,
        remediation: "Register image in imageManifest.js or remove imageId."
      });
    }

    // Check embedded villages
    if (dist.villages && Array.isArray(dist.villages)) {
      const seenVillageIds = new Set();
      for (const v of dist.villages) {
        if (!v.id || seenVillageIds.has(v.id)) {
          findings.push({
            destinationId: `${dist.id}:${v.id || "village"}`,
            severity: "ERROR",
            code: "DUPLICATE_VILLAGE_ID",
            message: `Village '${v.id}' in district '${dist.id}' has duplicate or invalid ID.`,
            remediation: "Ensure village IDs within each district are unique."
          });
        } else {
          seenVillageIds.add(v.id);
        }

        if (v.imageId && imageManifest && !imageManifest[v.imageId]) {
          findings.push({
            destinationId: `${dist.id}:${v.id}`,
            severity: "ERROR",
            code: "UNRESOLVED_VILLAGE_IMAGE_ID",
            message: `Village '${v.name}' references imageId '${v.imageId}' not found in IMAGE_MANIFEST.`,
            remediation: "Register village image in imageManifest.js or remove imageId."
          });
        }
      }
    }

    // Check nearbyDistrictIds
    const nearbyFindings = validateNearbyDistricts(dist, validDistrictIds);
    for (const nf of nearbyFindings) {
      findings.push({
        destinationId: dist.id,
        ...nf
      });
    }
  }

  // Compile summary statistics
  const errors = findings.filter(f => f.severity === "ERROR").length;
  const warnings = findings.filter(f => f.severity === "WARN").length;
  const info = findings.filter(f => f.severity === "INFO").length;

  const reportData = {
    timestamp: new Date().toISOString(),
    isStrict,
    summary: {
      totalDestinations: CURATED_DESTINATIONS.length,
      totalDistricts: DISTRICTS_REGISTRY.length,
      errors,
      warnings,
      info
    },
    findings
  };

  // Print console report
  printTerminalReport(reportData, isStrict);

  // Save JSON report unless disabled
  if (!disableJson) {
    saveJsonReport(reportData, jsonOutputPath);
  }

  // Exit code logic
  const isPassed = isStrict ? errors === 0 && warnings === 0 : errors === 0;
  process.exit(isPassed ? 0 : 1);
}

runValidation().catch(err => {
  console.error("❌ Fatal error during tourism data validation:", err);
  process.exit(1);
});
