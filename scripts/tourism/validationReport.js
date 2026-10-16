/**
 * validationReport.js
 * NagaQuest Tourism Data Validation Reporter
 * 
 * Generates formatted terminal reports and machine-readable JSON artifacts.
 */

import fs from "fs";
import path from "path";

/**
 * Print human-readable report to console
 * 
 * @param {Object} reportData
 * @param {boolean} isStrict
 */
export function printTerminalReport(reportData, isStrict = false) {
  const { summary, findings } = reportData;

  console.log("\n==================================================");
  console.log("🏛️  NAGAQUEST TOURISM DATA QUALITY & INTEGRITY AUDIT");
  console.log("==================================================");
  console.log(`Timestamp:             ${reportData.timestamp}`);
  console.log(`Destinations Checked:  ${summary.totalDestinations}`);
  console.log(`Districts Checked:     ${summary.totalDistricts}`);
  console.log(`Total Findings:        ${findings.length}`);
  console.log(`  - ❌ Errors:         ${summary.errors}`);
  console.log(`  - ⚠️  Warnings:       ${summary.warnings}`);
  console.log(`  - ℹ️  Info:           ${summary.info}`);
  if (isStrict) {
    console.log("  - 🛡️  Mode:           STRICT (Warnings treated as errors)");
  }
  console.log("--------------------------------------------------");

  const errors = findings.filter(f => f.severity === "ERROR");
  const warnings = findings.filter(f => f.severity === "WARN");
  const infos = findings.filter(f => f.severity === "INFO");

  // Print Errors
  if (errors.length > 0) {
    console.log("\n❌ CRITICAL STRUCTURAL & INTEGRITY ERRORS:");
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. [${err.code}] Dest: '${err.destinationId || "general"}'`);
      console.log(`     Message:     ${err.message}`);
      console.log(`     Remediation: ${err.remediation}\n`);
    });
  }

  // Print Warnings
  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS & PROVENANCE REVIEW REQUIRED:");
    warnings.forEach((warn, idx) => {
      console.log(`  ${idx + 1}. [${warn.code}] Dest: '${warn.destinationId || "general"}'`);
      console.log(`     Message:     ${warn.message}`);
      console.log(`     Remediation: ${warn.remediation}\n`);
    });
  }

  // Print Info (if small count or verbose)
  if (infos.length > 0) {
    console.log(`\nℹ️  INFORMATIONAL OBSERVATIONS (${infos.length}):`);
    infos.slice(0, 5).forEach((inf, idx) => {
      console.log(`  ${idx + 1}. [${inf.code}] ${inf.message}`);
    });
    if (infos.length > 5) {
      console.log(`     ... and ${infos.length - 5} more category placeholder observations.`);
    }
  }

  console.log("--------------------------------------------------");

  const passed = isStrict
    ? summary.errors === 0 && summary.warnings === 0
    : summary.errors === 0;

  if (passed) {
    if (summary.warnings > 0) {
      console.log("✅ RESULT: PASSED WITH REVIEW WARNINGS");
      console.log("   (Non-blocking: structural integrity confirmed. Review warnings above before release.)");
    } else {
      console.log("✅ RESULT: PASSED ALL INTEGRITY CHECKS (Zero errors, zero warnings)");
    }
  } else {
    console.error("❌ RESULT: VALIDATION FAILED");
    if (isStrict && summary.warnings > 0 && summary.errors === 0) {
      console.error("   (Failed in STRICT mode due to outstanding warnings)");
    } else {
      console.error(`   (${summary.errors} structural errors must be resolved)`);
    }
  }
  console.log("==================================================\n");
}

/**
 * Save machine-readable JSON report to disk
 * 
 * @param {Object} reportData
 * @param {string} outputPath
 */
export function saveJsonReport(reportData, outputPath) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), "utf8");
    console.log(`📄 Machine-readable report saved to: ${outputPath}`);
  } catch (err) {
    console.warn(`⚠️ Failed to write JSON report to ${outputPath}:`, err.message);
  }
}
