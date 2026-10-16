# NagaQuest Tourism Data Validation Tool

Automated structural validation, coordinate verification, image manifest linkage, and provenance auditing for NagaQuest's tourism and destination registries.

---

## 🚀 Usage

```bash
# Standard validation
npm run tourism:validate

# Strict mode (warnings cause non-zero exit code)
npm run tourism:validate -- --strict

# Custom JSON report path
node scripts/tourism/validate_tourism.js --json=reports/custom-report.json

# Run unit tests
node scripts/tourism/validate_tourism.test.js
```

---

## 📋 Finding Severities

| Severity | Description | Exit Code Behavior |
| :--- | :--- | :--- |
| **❌ ERROR** | Structural or integrity failure (duplicate IDs, invalid coordinates, missing required fields, unresolved image IDs) | Causes command to fail with code `1` |
| **⚠️ WARN** | Review-required finding (coordinates outside Nagaland bounds, missing source attribution, placeholder text, duplicate coordinates) | Code `0` in standard mode; code `1` in `--strict` mode |
| **ℹ️ INFO** | Non-blocking observation (e.g. destination using fallback category vector placeholder) | Code `0` |

---

## 🔍 Validation Rules & Error Codes

1. **Unique Identifiers**:
   - `DUPLICATE_DESTINATION_ID` (ERROR)
   - `MISSING_DESTINATION_ID` (ERROR)
   - `INVALID_ID_FORMAT` (WARN)
2. **Required Fields**:
   - `EMPTY_DESTINATION_NAME` (ERROR)
   - `MISSING_CATEGORY` (ERROR)
   - `MISSING_DATA_STATUS` (ERROR)
3. **Geographic Coordinates**:
   - `INVALID_COORDINATES` (ERROR: NaN or missing numeric values)
   - `COORDINATES_OUT_OF_RANGE` (ERROR: lat outside [-90, 90] or lng outside [-180, 180])
   - `OUT_OF_REGION_COORDINATES` (WARN: coords outside Nagaland bounding box `[25.10, 93.20]` to `[27.10, 95.40]`)
   - `PLACEHOLDER_COORDINATES` (WARN: suspicious `0, 0` coordinates)
   - `DUPLICATE_COORDINATES` (WARN: shared coordinates between distinct sites)
4. **District Registry Integrity**:
   - `INVALID_DISTRICT_REFERENCE` (ERROR: districtId does not exist in `DISTRICTS_REGISTRY`)
   - `MISSING_DISTRICT_ID` (WARN: districtId omitted)
   - `DUPLICATE_VILLAGE_ID` (ERROR: duplicate village inside district)
5. **Image Manifest Linkage**:
   - `UNRESOLVED_IMAGE_ID` (ERROR: imageId not found in `IMAGE_MANIFEST`)
   - `CATEGORY_PLACEHOLDER_USED` (INFO: valid fallback vector placeholder)
6. **Provenance & Data Status**:
   - `INVALID_DATA_STATUS` (ERROR: status not in recognized enum)
   - `MISSING_PROVENANCE_SOURCE` (WARN: `verified_real` record without source)
   - `MALFORMED_SOURCE_URL` (ERROR: syntactically invalid sourceUrl)
   - `INSECURE_HTTP_URL` (WARN: HTTP instead of HTTPS)
7. **Content Quality**:
   - `TEMPLATE_TEXT_DETECTED` (WARN: `TODO`, `lorem ipsum`, or template markers)
