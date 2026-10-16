import { useState } from "react";
import { resolveImage } from "../../data/images/imageHelpers";
import ResponsiveImage from "./ResponsiveImage";
import ImagePlaceholder from "./ImagePlaceholder";
import ImageAttribution from "./ImageAttribution";

export default function ManagedImage({
  imageId,
  src,
  asset,
  alt,
  width,
  height,
  category = "destination",
  aspectRatio = "aspect-video",
  priority = false,
  loading = "lazy",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  showAttribution = false,
  attributionInline = false,
  className = "",
  imgClassName = "w-full h-full object-cover",
  placeholderLabel = null
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  // If a direct src or asset is provided without an imageId, construct/resolve it
  const target = asset || imageId || (src ? { src, alt, width, height, category } : null);
  const resolvedAsset = resolveImage(target, category);

  // If loading failed at runtime or asset is explicitly a placeholder
  if (loadFailed || !resolvedAsset || resolvedAsset.id?.startsWith("placeholder-")) {
    return (
      <div className={`w-full overflow-hidden ${className}`}>
        <ImagePlaceholder
          category={category}
          aspectRatio={aspectRatio}
          label={placeholderLabel || alt || resolvedAsset?.alt}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatio} bg-neutral-100 ${className}`}>
      <ResponsiveImage
        asset={resolvedAsset}
        alt={alt || resolvedAsset.alt}
        width={width || resolvedAsset.width}
        height={height || resolvedAsset.height}
        loading={loading}
        priority={priority}
        sizes={sizes}
        imgClassName={imgClassName}
        onError={() => setLoadFailed(true)}
      />

      {showAttribution && resolvedAsset.attributionRequired && (
        <ImageAttribution
          credit={resolvedAsset.credit}
          license={resolvedAsset.license}
          sourceUrl={resolvedAsset.sourceUrl}
          dataStatus={resolvedAsset.dataStatus}
          inline={attributionInline}
        />
      )}
    </div>
  );
}
