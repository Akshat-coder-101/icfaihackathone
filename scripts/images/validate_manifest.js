#!/usr/bin/env node
/* global process */
/**
 * NagaQuest Image Manifest Validator
 * ----------------------------------
 * Verifies data integrity of the image manifest:
 * - Checks for duplicate image IDs
 * - Verifies existence of referenced files in public/
 * - Validates intrinsic dimension sanity
 * - Ensures required attribution and licensing fields
 * - Differentiates errors from warnings
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
const publicDir = path.resolve(projectRoot, "public");

// Import manifest
const manifestPath = path.resolve(projectRoot, "src/data/images/imageManifest.js");

async function validateManifest() {
  console.log("==================================================");
  console.log("🔍 NagaQuest Image Manifest Integrity Validation");
  console.log("==================================================");
  console.log(`Project Root: ${projectRoot}`);
  console.log(`Public Dir:   ${publicDir}`);
  console.log("--------------------------------------------------");

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Fatal: Image manifest not found at ${manifestPath}`);
    process.exit(1);
  }

  const { IMAGE_MANIFEST } = await import(`file://${manifestPath}`);

  if (!IMAGE_MANIFEST || typeof IMAGE_MANIFEST !== "object") {
    console.error("❌ Fatal: IMAGE_MANIFEST is not a valid object");
    process.exit(1);
  }

  const entries = Object.entries(IMAGE_MANIFEST);
  console.log(`Analyzing ${entries.length} registered image assets...\n`);

  let errorCount = 0;
  let warningCount = 0;
  const seenIds = new Set();

  for (const [key, asset] of entries) {
    const assetPrefix = `[Asset '${key}']`;

    // 1. Check ID matching
    if (asset.id !== key) {
      console.error(`❌ ${assetPrefix}: Key '${key}' does not match asset.id '${asset.id}'`);
      errorCount++;
    }

    // 2. Check duplicate IDs
    if (seenIds.has(asset.id)) {
      console.error(`❌ ${assetPrefix}: Duplicate image ID detected: '${asset.id}'`);
      errorCount++;
    }
    seenIds.add(asset.id);

    // 3. Required metadata fields
    if (!asset.alt || typeof asset.alt !== "string") {
      console.error(`❌ ${assetPrefix}: Missing or invalid 'alt' text`);
      errorCount++;
    }

    if (!asset.category) {
      console.error(`❌ ${assetPrefix}: Missing required 'category'`);
      errorCount++;
    }

    if (!asset.license) {
      console.error(`❌ ${assetPrefix}: Missing required 'license' specification`);
      errorCount++;
    }

    if (typeof asset.attributionRequired !== "boolean") {
      console.error(`❌ ${assetPrefix}: 'attributionRequired' must be boolean`);
      errorCount++;
    }

    if (asset.attributionRequired && !asset.credit) {
      console.warn(`⚠️ ${assetPrefix}: Attribution required but 'credit' is empty`);
      warningCount++;
    }

    // 4. Dimension sanity checks
    if (!asset.width || asset.width <= 0 || !asset.height || asset.height <= 0) {
      console.error(`❌ ${assetPrefix}: Invalid intrinsic dimensions (${asset.width}x${asset.height})`);
      errorCount++;
    }

    // 5. File existence checks for primary src
    if (asset.src.startsWith("/")) {
      const fullPath = path.join(publicDir, asset.src);
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ ${assetPrefix}: Primary file not found on disk: ${asset.src}`);
        errorCount++;
      }
    }

    // 6. Check responsive variants if present
    if (asset.variants) {
      if (asset.variants.webp) {
        for (const variant of asset.variants.webp) {
          if (variant.src.startsWith("/")) {
            const vPath = path.join(publicDir, variant.src);
            if (!fs.existsSync(vPath)) {
              console.error(`❌ ${assetPrefix}: WebP variant file missing: ${variant.src}`);
              errorCount++;
            }
          }
        }
      }

      if (asset.variants.fallback) {
        for (const variant of asset.variants.fallback) {
          if (variant.src.startsWith("/")) {
            const vPath = path.join(publicDir, variant.src);
            if (!fs.existsSync(vPath)) {
              console.error(`❌ ${assetPrefix}: Fallback variant file missing: ${variant.src}`);
              errorCount++;
            }
          }
        }
      }

      if (asset.variants.avif && asset.variants.avif.length === 0) {
        console.warn(`⚠️ ${assetPrefix}: Optional AVIF variants array is empty`);
        warningCount++;
      }
    }
  }

  console.log("--------------------------------------------------");
  if (errorCount === 0) {
    console.log(`✅ Manifest validation passed! (${entries.length} assets checked, ${warningCount} warnings)`);
    process.exit(0);
  } else {
    console.error(`❌ Manifest validation failed with ${errorCount} error(s) and ${warningCount} warning(s)`);
    process.exit(1);
  }
}

validateManifest();
