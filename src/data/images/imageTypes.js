/**
 * NagaQuest Image Management System — Type Definitions & Schemas
 * 
 * Provides TypeScript-compatible JSDoc type definitions for centralized image
 * assets, responsive variants, data provenance tiers, and licensing protocols.
 */

/**
 * @typedef {'verified_real' | 'illustrative' | 'unverified_ai' | 'api_sourced'} ImageDataStatus
 */

/**
 * @typedef {'approved' | 'pending' | 'restricted' | 'not_applicable'} ImageConsentStatus
 */

/**
 * @typedef {'tourism' | 'heritage' | 'cuisine' | 'wildlife' | 'district' | 'village' | 'destination'} ImageCategory
 */

/**
 * @typedef {Object} ImageVariant
 * @property {string} src - Web-accessible absolute or relative URL
 * @property {number} width - Intrinsic width of the variant in pixels
 * @property {number} height - Intrinsic height of the variant in pixels
 * @property {number} [sizeKb] - File size in kilobytes
 */

/**
 * @typedef {Object} ImageVariants
 * @property {ImageVariant[]} [avif] - Optional AVIF next-gen variants
 * @property {ImageVariant[]} [webp] - Primary WebP responsive variants
 * @property {ImageVariant[]} [fallback] - JPEG/PNG fallback variants
 */

/**
 * @typedef {Object} ImageAsset
 * @property {string} id - Unique identifier (kebab-case)
 * @property {string} src - Primary default image URL
 * @property {string} alt - Accessible, descriptive alternative text
 * @property {number} width - Default intrinsic width
 * @property {number} height - Default intrinsic height
 * @property {ImageCategory} category - System category
 * @property {string} [entityId] - Associated district, village, or record ID
 * @property {ImageVariants} [variants] - Responsive format variants
 * @property {string} [credit] - Photographer, creator, or archiving body
 * @property {string} [sourceUrl] - Link to official source or archival reference
 * @property {string} license - License specification (e.g., 'CC-BY-SA 4.0', 'Community Heritage Permission', 'ODbL')
 * @property {boolean} attributionRequired - Whether visible attribution is mandated
 * @property {ImageDataStatus} dataStatus - Data integrity and provenance status
 * @property {ImageConsentStatus} [consentStatus] - Village or clan consent authorization
 */

export const IMAGE_DATA_STATUSES = ['verified_real', 'illustrative', 'unverified_ai', 'api_sourced'];
export const IMAGE_CATEGORIES = ['tourism', 'heritage', 'cuisine', 'wildlife', 'district', 'village', 'destination'];
