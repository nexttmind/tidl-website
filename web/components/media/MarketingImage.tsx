import {
  optEntry,
  splitMediaSrc,
  srcset,
  withQuery,
} from "@/lib/media/opt-manifest";
import type { CSSProperties } from "react";

type MarketingImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
  style?: CSSProperties;
  dataBloomVial?: boolean;
};

const DEFAULT_SIZES =
  "(width < 721px) 100vw, (width < 1025px) 80vw, 1200px";

/**
 * Marketing stills from /public. Uses prebuilt srcset when the optimizer
 * has a variant. Picture is display:contents so existing img CSS still wins.
 */
export function MarketingImage({
  src,
  alt,
  className,
  sizes = DEFAULT_SIZES,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  style,
  dataBloomVial,
}: MarketingImageProps) {
  const { query } = splitMediaSrc(src);
  const entry = optEntry(src);
  const imgWidth = width ?? entry?.width;
  const imgHeight = height ?? entry?.height;

  if (!entry) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fallback before optimize
      <img
        className={className}
        src={src}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        data-bloom-vial={dataBloomVial ? "" : undefined}
      />
    );
  }

  return (
    <picture style={{ display: "contents" }}>
      {entry.webp.length > 0 ? (
        <source
          type="image/webp"
          srcSet={srcset(entry.webp, query)}
          sizes={sizes}
        />
      ) : null}
      {entry.raster.length > 0 ? (
        <source
          type={entry.raster[0]?.src.endsWith(".png") ? "image/png" : "image/jpeg"}
          srcSet={srcset(entry.raster, query)}
          sizes={sizes}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- static marketing frames */}
      <img
        className={className}
        src={withQuery(entry.fallback, query)}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        data-bloom-vial={dataBloomVial ? "" : undefined}
      />
    </picture>
  );
}
