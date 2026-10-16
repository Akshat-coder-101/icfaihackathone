/**
 * NagaQuest Image Management System — Helper Utilities
 */

import { IMAGE_MANIFEST } from "./imageManifest";

/**
 * Retrieves an image asset from the manifest by ID.
 * @param {string} id - Unique image ID
 * @returns {import('./imageTypes').ImageAsset | null}
 */
export function getImageAsset(id) {
  if (!id || typeof id !== "string") return null;
  return IMAGE_MANIFEST[id] || null;
}

/**
 * Returns the fallback placeholder asset for a given category.
 * @param {string} [category] - Tourism, village, destination, cuisine, wildlife, heritage, district
 * @returns {import('./imageTypes').ImageAsset}
 */
export function getImagePlaceholder(category = "destination") {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("village")) {
    return IMAGE_MANIFEST["placeholder-village"];
  }
  if (normalized.includes("food") || normalized.includes("cuisine")) {
    return IMAGE_MANIFEST["placeholder-food"];
  }
  if (normalized.includes("wildlife") || normalized.includes("fauna") || normalized.includes("flora")) {
    return IMAGE_MANIFEST["placeholder-wildlife"];
  }
  if (normalized.includes("district")) {
    return IMAGE_MANIFEST["placeholder-district"];
  }
  if (normalized.includes("heritage")) {
    return IMAGE_MANIFEST["placeholder-heritage"];
  }
  return IMAGE_MANIFEST["placeholder-destination"];
}

/**
 * Resolves an image ID or asset object into a guaranteed valid ImageAsset.
 * Never throws; safely falls back to a category-specific placeholder.
 * @param {string | import('./imageTypes').ImageAsset} [target] - ID or asset object
 * @param {string} [category] - Category for fallback selection
 * @returns {import('./imageTypes').ImageAsset}
 */
export function resolveImage(target, category = "destination") {
  if (target && typeof target === "object" && target.src) {
    return target;
  }
  if (typeof target === "string") {
    const fromManifest = getImageAsset(target);
    if (fromManifest) return fromManifest;
  }
  return getImagePlaceholder(category);
}

/**
 * Formats an array of ImageVariant objects into a standard HTML srcset string.
 * @param {import('./imageTypes').ImageVariant[]} [variants]
 * @returns {string} E.g., "/img-400.webp 400w, /img-800.webp 800w"
 */
export function generateSrcSet(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return "";
  return variants
    .filter(v => v && v.src && v.width)
    .map(v => `${v.src} ${v.width}w`)
    .join(", ");
}

/**
 * Retrieves all registered images for a specific category.
 * @param {string} category
 * @returns {import('./imageTypes').ImageAsset[]}
 */
export function getAllImagesByCategory(category) {
  if (!category) return [];
  const target = category.toLowerCase();
  return Object.values(IMAGE_MANIFEST).filter(
    img => img.category?.toLowerCase() === target
  );
}

/**
 * Retrieves all registered images associated with an entity ID (e.g. 'peren').
 * @param {string} entityId
 * @returns {import('./imageTypes').ImageAsset[]}
 */
export function getAllImagesByEntity(entityId) {
  if (!entityId) return [];
  const target = entityId.toLowerCase();
  return Object.values(IMAGE_MANIFEST).filter(
    img => img.entityId?.toLowerCase() === target
  );
}
