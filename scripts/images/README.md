# 🌄 NagaQuest Image Optimization Pipeline

Automated tool to resize, optimize, and convert approved cultural photographs and heritage assets into modern, responsive WebP and JPEG formats with metadata tracking.

---

## 🛠️ Prerequisites & Installation

The optimization script uses **Python 3** and **Pillow**:

```bash
pip3 install Pillow
```

*(Optional)* For AVIF format generation, install `pillow-heif`:
```bash
pip3 install pillow-heif
```

---

## 🚀 Usage

Run the optimization script from the project root:

```bash
# Standard run (processes raw_assets -> public/images)
npm run images:optimize

# Or directly via Python:
python3 scripts/images/optimize_images.py

# Force re-generation of existing files:
python3 scripts/images/optimize_images.py --force

# Dry-run analysis (no files written):
python3 scripts/images/optimize_images.py --dry-run
```

---

## ⚙️ Command-Line Options

| Flag | Default | Description |
|---|---|---|
| `--input`, `-i` | `raw_assets` | Source directory of high-resolution images |
| `--output`, `-o` | `public/images` | Destination directory for web variants |
| `--manifest`, `-m` | `scripts/images/optimization_report.json` | Path to output JSON summary |
| `--quality-webp` | `82` | WebP quality factor (0–100) |
| `--quality-jpeg` | `80` | JPEG fallback quality factor (0–100) |
| `--force`, `-f` | `false` | Overwrite existing variants |
| `--dry-run` | `false` | Run without writing output files |

---

## 📐 Responsive Breakpoints

Images are generated at downscaled target widths without upscaling beyond original dimensions:
- **400 px**: Mobile displays and compact cards.
- **800 px**: Standard desktop cards and tablets.
- **1600 px**: High-resolution banners and hero views.

All generated assets follow deterministic naming:
`{basename}-{width}.webp` and `{basename}-{width}.jpg`
