import manifestJson from "./opt-manifest.json";

export type OptCandidate = {
  src: string;
  w: number;
};

export type OptEntry = {
  fallback: string;
  webp: readonly OptCandidate[];
  raster: readonly OptCandidate[];
  width: number;
  height: number;
  /** Hero and other looping mp4s. Smallest first. */
  mp4?: readonly OptCandidate[];
};

const manifest = manifestJson as Record<string, OptEntry>;

export function splitMediaSrc(src: string): { path: string; query: string } {
  const index = src.indexOf("?");
  if (index === -1) return { path: src, query: "" };
  return { path: src.slice(0, index), query: src.slice(index) };
}

export function withQuery(src: string, query: string): string {
  return query ? `${src}${query}` : src;
}

export function optEntry(src: string): OptEntry | undefined {
  return manifest[splitMediaSrc(src).path];
}

function pickCandidate(
  list: readonly OptCandidate[],
  maxWidth: number,
): OptCandidate | undefined {
  if (list.length === 0) return undefined;
  const sorted = [...list].sort((a, b) => a.w - b.w);
  return [...sorted].reverse().find((item) => item.w <= maxWidth) ?? sorted[0];
}

function mimeFor(src: string): string {
  if (src.endsWith(".webp")) return "image/webp";
  if (src.endsWith(".png")) return "image/png";
  if (src.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

/** Sized still when the optimizer has a variant. */
export function optImgSrc(src: string, maxWidth = 1600): string {
  const { path, query } = splitMediaSrc(src);
  const entry = manifest[path];
  if (!entry) return src;
  const pick =
    pickCandidate(entry.webp, maxWidth) ??
    pickCandidate(entry.raster, maxWidth) ?? { src: entry.fallback, w: entry.width };
  return withQuery(pick.src, query);
}

/**
 * Hero encode. 720 for phone and tablet, 1080 for desktop when present.
 * Falls back to the 720 file, never the camera original.
 */
export function optVideoSrc(src: string, maxWidth = 720): string | undefined {
  const { path, query } = splitMediaSrc(src);
  const entry = manifest[path];
  if (!entry) return undefined;
  if (entry.mp4 && entry.mp4.length > 0) {
    const pick = pickCandidate(entry.mp4, maxWidth);
    return pick ? withQuery(pick.src, query) : undefined;
  }
  if (entry.fallback.endsWith(".mp4")) return withQuery(entry.fallback, query);
  return undefined;
}

/** CSS background that prefers a WebP derivative. */
export function optCssImageSet(src: string, maxWidth = 1200): string {
  const { path, query } = splitMediaSrc(src);
  const entry = manifest[path];
  if (!entry) return `url("${src}")`;
  const webp = pickCandidate(entry.webp, maxWidth);
  const raster =
    pickCandidate(entry.raster, maxWidth) ??
    ({ src: entry.fallback, w: entry.width } as OptCandidate);
  const href = (item: OptCandidate) => withQuery(item.src, query);
  if (webp) {
    return `image-set(url("${href(webp)}") type("image/webp"), url("${href(raster)}") type("${mimeFor(raster.src)}"))`;
  }
  return `url("${href(raster)}")`;
}

export function srcset(candidates: readonly OptCandidate[], query: string): string {
  return candidates
    .map((item) => `${withQuery(item.src, query)} ${item.w}w`)
    .join(", ");
}
