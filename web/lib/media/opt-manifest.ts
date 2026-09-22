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

/** 720p hero encode when the optimizer has produced one. */
export function optVideoSrc(src: string): string | undefined {
  const { path, query } = splitMediaSrc(src);
  const entry = manifest[path];
  if (!entry?.fallback.endsWith(".mp4")) return undefined;
  return withQuery(entry.fallback, query);
}

export function srcset(candidates: readonly OptCandidate[], query: string): string {
  return candidates
    .map((item) => `${withQuery(item.src, query)} ${item.w}w`)
    .join(", ");
}
