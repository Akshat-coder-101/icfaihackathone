# 🍲 Nagaland Food & Cuisine Photographic Assets Registry

This directory is designated for authentic, high-resolution original photography of Nagaland traditional cuisine, culinary practices, and hearth heritage.

## Expected Subjects Directory: `raw_assets/food/nagaland-food/`

In accordance with NagaQuest cultural heritage integrity standards, **AI-generated imagery is strictly prohibited** as documentary photography. Photographs must be sourced with verified provenance, photographer credit, and community consent.

| Subject | Expected File | Category | Status |
|---|---|---|---|
| Nagaland food overview | `nagaland-food-overview.jpg` | Cuisine | ⏳ Pending verified field photography |
| Traditional cooking and the hearth | `traditional-hearth.jpg` | Hearth Heritage | ⏳ Pending verified field photography |
| Smoked pork | `smoked-pork.jpg` | Smoked Protein | ⏳ Pending verified field photography |
| Smoked pork stew | `smoked-pork-stew.jpg` | Traditional Stew | ⏳ Pending verified field photography |
| Pork with bamboo shoots | `pork-bamboo-shoots.jpg` | Fermented Dish | ⏳ Pending verified field photography |
| Boiled vegetables | `boiled-vegetables.jpg` | Seasonal Produce | ⏳ Pending verified field photography |
| Bamboo-steamed fish | `bamboo-steamed-fish.jpg` | Riverine Specialty | ⏳ Pending verified field photography |
| Roasted intestines | `roasted-intestines.jpg` | Traditional Meat | ⏳ Pending verified field photography |
| Beans and vegetables | `beans-vegetables.jpg` | Heirloom Legumes | ⏳ Pending verified field photography |
| Bitter melon | `bitter-melon.jpg` | Regional Botanicals | ⏳ Pending verified field photography |
| Chicken and glutinous rice soup | `chicken-rice-soup.jpg` | Comfort Soup | ⏳ Pending verified field photography |
| Eel chilli preparation | `eel-chilli.jpg` | Riverine Condiment | ⏳ Pending verified field photography |
| Crab chilli preparation | `crab-chilli.jpg` | Stream Relish | ⏳ Pending verified field photography |
| Naga chilli preparations | `naga-chilli.jpg` | GI Raja Mircha | ⏳ Pending verified field photography |

## Processing Pipeline
Once approved JPG photographs with documented consent are placed here:
```bash
# Optimize raw photos to responsive WebP and fallback JPEG formats:
npm run images:optimize

# Validate manifest integrity:
npm run images:validate
```
Variants will be generated to `public/images/food/nagaland-food/` and registered in `src/data/images/imageManifest.js`.
