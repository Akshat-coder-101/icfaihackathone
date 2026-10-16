import { generateSrcSet } from "../../data/images/imageHelpers";

export default function ResponsiveImage({
  asset,
  alt,
  width,
  height,
  loading = "lazy",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  imgClassName = "w-full h-full object-cover",
  onLoad,
  onError
}) {
  if (!asset) return null;

  const resolvedAlt = alt || asset.alt || "Naga cultural documentation image";
  const resolvedWidth = width || asset.width || 800;
  const resolvedHeight = height || asset.height || 450;

  const avifSrcSet = generateSrcSet(asset.variants?.avif);
  const webpSrcSet = generateSrcSet(asset.variants?.webp);
  const fallbackSrcSet = generateSrcSet(asset.variants?.fallback);

  const primaryFallbackSrc =
    asset.variants?.fallback?.[0]?.src ||
    asset.variants?.webp?.[0]?.src ||
    asset.src;

  const fetchPriority = priority ? "high" : "auto";
  const loadingStrategy = priority ? "eager" : loading;

  return (
    <picture className={`block w-full h-full ${className}`}>
      {/* 1. Optional Next-Gen AVIF Format */}
      {avifSrcSet && (
        <source
          type="image/avif"
          srcSet={avifSrcSet}
          sizes={sizes}
        />
      )}

      {/* 2. Modern WebP Format */}
      {webpSrcSet && (
        <source
          type="image/webp"
          srcSet={webpSrcSet}
          sizes={sizes}
        />
      )}

      {/* 3. Base Fallback Image with Intrinsic Dimensions to prevent Layout Shift (CLS) */}
      <img
        src={primaryFallbackSrc}
        srcSet={fallbackSrcSet || undefined}
        sizes={sizes}
        alt={resolvedAlt}
        width={resolvedWidth}
        height={resolvedHeight}
        loading={loadingStrategy}
        decoding="async"
        fetchPriority={fetchPriority}
        className={imgClassName}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}
