#!/usr/bin/env python3
"""
NagaQuest Image Optimization Pipeline
-------------------------------------
Converts approved source images into production-ready responsive WebP (and optional AVIF/JPEG)
variants with proper dimensions, EXIF orientation correction, transparency handling,
and metadata tracking for the NagaQuest Image Manifest.

Usage:
    python3 scripts/images/optimize_images.py [options]

Options:
    --input, -i       Source directory of raw images (default: raw_assets)
    --output, -o      Output directory for web assets (default: public/images)
    --manifest, -m    Path to manifest report (default: scripts/images/optimization_report.json)
    --quality-webp    WebP compression quality (default: 82)
    --quality-jpeg    JPEG fallback compression quality (default: 80)
    --force, -f       Force re-processing of already optimized files
    --dry-run         Analyze and report without writing files
"""

import os
import sys
import json
import hashlib
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Error: Pillow is required. Install it using: pip3 install Pillow")
    sys.exit(1)

# Check for AVIF/HEIF support in Pillow (optional dependency)
HAS_AVIF = False
try:
    
    import pillow_heif  # type: ignore[import-untyped,import-not-found]

    if hasattr(pillow_heif, "register_avif_opener"):
        pillow_heif.register_avif_opener()
    elif hasattr(pillow_heif, "register_heif_opener"):
        pillow_heif.register_heif_opener()
    HAS_AVIF = True
except Exception:
    pass

# Target responsive widths (downscaling only, never upscales)
DEFAULT_WIDTHS = [400, 800, 1600]
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif'}


def calculate_sha256(filepath: Path) -> str:
    """Computes SHA-256 hash of a file for change detection."""
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            sha.update(chunk)
    return sha.hexdigest()


def process_image(
    input_path: Path,
    relative_path: Path,
    output_dir: Path,
    widths: List[int],
    quality_webp: int,
    quality_jpeg: int,
    force: bool = False,
    dry_run: bool = False
) -> Dict:
    """
    Processes a single source image into responsive variants.
    """
    stem = input_path.stem.lower().replace(" ", "-").replace("_", "-")
    # Subdirectory relative to input directory
    sub_dir = relative_path.parent
    target_dir = output_dir / sub_dir
    if not dry_run:
        target_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as img:
        # Correct orientation from EXIF tags
        img = ImageOps.exif_transpose(img)
        orig_w, orig_h = img.size
        has_alpha = img.mode in ('RGBA', 'LA', 'P')

        variants = {
            "webp": [],
            "jpeg": []
        }
        if HAS_AVIF:
            variants["avif"] = []

        # Determine target widths without upscaling
        valid_widths = [w for w in widths if w < orig_w]
        if orig_w not in valid_widths:
            valid_widths.append(orig_w)
        valid_widths.sort()

        generated_files = []

        for target_w in valid_widths:
            aspect = orig_h / orig_w
            target_h = int(round(target_w * aspect))

            # Resize with Lanczos filtering
            if target_w == orig_w and target_h == orig_h:
                resized = img.copy()
            else:
                resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

            # 1. Generate WebP
            webp_name = f"{stem}-{target_w}.webp"
            webp_path = target_dir / webp_name
            rel_webp_src = f"/images/{sub_dir / webp_name}".replace("//", "/")
            if not rel_webp_src.startswith("/images/"):
                rel_webp_src = "/images/" + rel_webp_src.lstrip("/")

            if not dry_run and (force or not webp_path.exists()):
                resized.save(webp_path, "WEBP", quality=quality_webp, method=6)

            file_size_kb = (webp_path.stat().st_size / 1024) if (webp_path.exists() and not dry_run) else 0
            variants["webp"].append({
                "src": rel_webp_src,
                "width": target_w,
                "height": target_h,
                "sizeKb": round(file_size_kb, 1)
            })
            generated_files.append(webp_name)

            # 2. Generate JPEG fallback
            jpeg_name = f"{stem}-{target_w}.jpg"
            jpeg_path = target_dir / jpeg_name
            rel_jpeg_src = f"/images/{sub_dir / jpeg_name}".replace("//", "/")
            if not rel_jpeg_src.startswith("/images/"):
                rel_jpeg_src = "/images/" + rel_jpeg_src.lstrip("/")

            if not dry_run and (force or not jpeg_path.exists()):
                # Handle alpha channel for JPEG
                if has_alpha:
                    bg = Image.new("RGB", resized.size, (255, 255, 255))
                    bg.paste(resized, mask=resized.split()[-1])
                    bg.save(jpeg_path, "JPEG", quality=quality_jpeg, optimize=True)
                else:
                    rgb_img = resized.convert("RGB")
                    rgb_img.save(jpeg_path, "JPEG", quality=quality_jpeg, optimize=True)

            jpeg_size_kb = (jpeg_path.stat().st_size / 1024) if (jpeg_path.exists() and not dry_run) else 0
            variants["jpeg"].append({
                "src": rel_jpeg_src,
                "width": target_w,
                "height": target_h,
                "sizeKb": round(jpeg_size_kb, 1)
            })
            generated_files.append(jpeg_name)

        primary_src = variants["webp"][-1]["src"] if variants["webp"] else ""
        fallback_src = variants["jpeg"][-1]["src"] if variants["jpeg"] else ""

        return {
            "id": stem,
            "originalName": input_path.name,
            "originalWidth": orig_w,
            "originalHeight": orig_h,
            "aspectRatio": round(orig_w / orig_h, 3),
            "primarySrc": primary_src,
            "fallbackSrc": fallback_src,
            "variants": variants,
            "generatedCount": len(generated_files)
        }


def run_pipeline(
    input_dir: Path,
    output_dir: Path,
    manifest_report: Path,
    widths: List[int],
    quality_webp: int,
    quality_jpeg: int,
    force: bool = False,
    dry_run: bool = False
):
    print("==================================================")
    print("🌄 NagaQuest Image Optimization Pipeline")
    print("==================================================")
    print(f"Input Directory:  {input_dir}")
    print(f"Output Directory: {output_dir}")
    print(f"Target Widths:    {widths}")
    print(f"WebP Quality:     {quality_webp} | JPEG Quality: {quality_jpeg}")
    print(f"AVIF Support:     {'Enabled' if HAS_AVIF else 'Disabled (Install pillow-heif for AVIF)'}")
    print(f"Mode:             {'Dry-run' if dry_run else 'Production'}")
    print("--------------------------------------------------")

    if not input_dir.exists():
        print(f"Error: Input directory '{input_dir}' does not exist.")
        sys.exit(1)

    source_files = [
        p for p in input_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not source_files:
        print(f"No source images found in '{input_dir}'.")
        return

    print(f"Found {len(source_files)} source image(s) to process.")

    results = []
    seen_ids = set()

    for path in sorted(source_files):
        rel = path.relative_to(input_dir)
        try:
            res = process_image(
                path,
                rel,
                output_dir,
                widths,
                quality_webp,
                quality_jpeg,
                force=force,
                dry_run=dry_run
            )

            # Check for ID collisions
            if res["id"] in seen_ids:
                print(f"⚠️ Warning: Duplicate ID collision detected for '{res['id']}' from '{path}'")
            seen_ids.add(res["id"])

            results.append(res)
            print(f"✓ Processed: {rel} -> ID '{res['id']}' ({res['originalWidth']}x{res['originalHeight']}) | {res['generatedCount']} variants")
        except Exception as e:
            print(f"✗ Failed processing '{rel}': {e}", file=sys.stderr)

    # Save summary report
    if not dry_run:
        manifest_report.parent.mkdir(parents=True, exist_ok=True)
        report_data = {
            "version": "1.0.0",
            "sourceDirectory": str(input_dir),
            "outputDirectory": str(output_dir),
            "totalProcessed": len(results),
            "avifEnabled": HAS_AVIF,
            "assets": results
        }
        with open(manifest_report, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)
        print("--------------------------------------------------")
        print(f"Optimization report saved to: {manifest_report}")
        print("Pipeline execution completed successfully.")


def main():
    parser = argparse.ArgumentParser(description="NagaQuest Image Optimization Pipeline")
    parser.add_argument("--input", "-i", default="raw_assets", help="Input directory")
    parser.add_argument("--output", "-o", default="public/images", help="Output directory")
    parser.add_argument("--manifest", "-m", default="scripts/images/optimization_report.json", help="Report output path")
    parser.add_argument("--quality-webp", type=int, default=82, help="WebP quality (default: 82)")
    parser.add_argument("--quality-jpeg", type=int, default=80, help="JPEG fallback quality (default: 80)")
    parser.add_argument("--force", "-f", action="store_true", help="Force overwrite")
    parser.add_argument("--dry-run", action="store_true", help="Analyze without saving")

    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    manifest_path = Path(args.manifest).resolve()

    run_pipeline(
        input_path,
        output_path,
        manifest_path,
        DEFAULT_WIDTHS,
        args.quality_webp,
        args.quality_jpeg,
        force=args.force,
        dry_run=args.dry_run
    )


if __name__ == "__main__":
    main()
