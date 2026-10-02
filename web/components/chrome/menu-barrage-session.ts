import { flushSync } from "react-dom";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { pdpStageSrc, shopCatalogItem } from "@/components/home/shop-catalog";
import { barrageFrames, hasMenuBarrage } from "@/content/pdp/barrage";
import { optEntry, optImgSrc, splitMediaSrc, srcset } from "@/lib/media/opt-manifest";

type BarrageRouter = {
  prefetch: (href: string, options?: { kind: PrefetchKind }) => void;
  push: (href: string) => void;
};

export type MenuBarragePlay = {
  id: string;
  href: string;
  n: number;
};

const VIAL_SIZES = "(width < 721px) 84vw, (width < 1025px) 52vw, 460px";
const BLOOM_SIZES = "(width < 721px) 92vw, (width < 1025px) 72vw, 760px";

const BARRAGE_FRAMES = 9;

let play: MenuBarragePlay | null = null;
const listeners = new Set<() => void>();
let warmed: HTMLImageElement[] = [];
const warmedStills = new Set<string>();
const stillBitmaps: HTMLImageElement[] = [];

function emit() {
  for (const listener of listeners) listener();
}

export function menuBarragePlay(): MenuBarragePlay | null {
  return play;
}

export function menuBarrageActive(): boolean {
  return play !== null;
}

export function subscribeMenuBarrage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startMenuBarragePlay(next: { id: string; href: string }) {
  play = { id: next.id, href: next.href, n: Date.now() };
  emit();
}

/** Warm the hero, cover the screen, and open the page under the sequence. */
export function playMenuBarrage(router: BarrageRouter, id: string, href: string) {
  warmMenuBarrageSequence(id);
  warmPdpHero(id);
  let dest = "";
  try {
    const next = new URL(href, window.location.origin);
    const same =
      next.origin === window.location.origin &&
      next.pathname === window.location.pathname &&
      next.search === window.location.search;
    if (next.origin === window.location.origin && !same) {
      dest = `${next.pathname}${next.search}${next.hash}`;
    }
  } catch {
    dest = "";
  }
  if (dest) void router.prefetch(dest, { kind: PrefetchKind.FULL });
  flushSync(() => startMenuBarragePlay({ id, href }));
  if (dest) router.push(dest);
}

export function endMenuBarragePlay() {
  if (!play) return;
  play = null;
  emit();
}

function warmBitmap(src: string, sizes: string): HTMLImageElement {
  const img = new Image();
  const { query } = splitMediaSrc(src);
  const entry = optEntry(src);
  if (entry && entry.webp.length > 0) {
    img.sizes = sizes;
    img.srcset = srcset(entry.webp, query);
  } else if (entry && entry.raster.length > 0) {
    img.sizes = sizes;
    img.srcset = srcset(entry.raster, query);
  } else {
    img.src = src;
  }
  void img.decode().then(
    () => undefined,
    () => undefined,
  );
  return img;
}

function barrageDesktop(): boolean {
  return window.matchMedia("(width >= 1025px)").matches;
}

/** Same wide still the player paints on desktop. */
function playbackSrc(src: string, desktop: boolean): string {
  if (!desktop) return src;
  let wide: string | null = null;
  if (
    src.includes("/landing/stills/graphics/") &&
    !src.includes("/graphics/wide/")
  ) {
    wide = src.replace(
      "/landing/stills/graphics/",
      "/landing/stills/graphics/wide/",
    );
  } else if (src.startsWith("/landing/stills/") && !src.includes("/graphics/")) {
    wide = src.replace("/landing/stills/", "/landing/stills/wide/");
  } else if (src.startsWith("/pain-relief/lifestyle/")) {
    wide = src.replace("/pain-relief/lifestyle/", "/pain-relief/lifestyle/wide/");
  }
  return wide && optEntry(wide) ? wide : src;
}

function warmStill(src: string, maxWidth: number, priority: "low" | "high") {
  const href = optImgSrc(src, maxWidth);
  if (warmedStills.has(href)) return;
  warmedStills.add(href);
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = priority;
  img.src = href;
  stillBitmaps.push(img);
  void img.decode().then(
    () => undefined,
    () => undefined,
  );
}

function stillsFor(id: string): string[] {
  if (!hasMenuBarrage(id)) return [];
  const desktop = barrageDesktop();
  return barrageFrames(id)
    .slice(0, BARRAGE_FRAMES)
    .map((frame) => playbackSrc(frame.src, desktop));
}

function mediaSettled(el: HTMLImageElement | HTMLVideoElement): Promise<void> {
  if (el instanceof HTMLImageElement) {
    if (!el.currentSrc && !el.src) return Promise.resolve();
    if (el.complete) return Promise.resolve();
  } else if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, 2000);
    function done() {
      window.clearTimeout(timer);
      resolve();
    }
    el.addEventListener("load", done, { once: true });
    el.addEventListener("canplay", done, { once: true });
    el.addEventListener("error", done, { once: true });
  });
}

function warmMenuBarrageOpeners(ids: readonly string[]) {
  const width = barrageDesktop() ? 1600 : 800;
  for (const id of new Set(ids)) {
    const src = stillsFor(id)[0];
    if (src) warmStill(src, width, "low");
  }
}

/**
 * First still of each menu tile, after the hero video and the tile images
 * in `scope` have finished. Those stay ahead of the barrage files.
 */
export function warmMenuBarrageAfterPaint(
  ids: readonly string[],
  scope: ParentNode | null,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => undefined;
  }
  let cancelled = false;
  const images = scope ? [...scope.querySelectorAll("img")] : [];
  const video = document.querySelector<HTMLVideoElement>(
    "[data-landing-hero-video='true']",
  );
  const nodes: Array<HTMLImageElement | HTMLVideoElement> = [...images];
  if (video) nodes.push(video);
  void Promise.all(nodes.map((el) => mediaSettled(el))).then(() => {
    if (!cancelled) warmMenuBarrageOpeners(ids);
  });
  return () => {
    cancelled = true;
  };
}

/** Remaining frames for the tile under the pointer, before the tap commits. */
export function warmMenuBarrageSequence(id: string) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const width = barrageDesktop() ? 1600 : 800;
  for (const src of stillsFor(id)) warmStill(src, width, "high");
}

/** Decode the hero vial and bloom while the menu sequence is on screen. */
export function warmPdpHero(id: string) {
  const item = shopCatalogItem(id);
  if (!item) return;
  const next: HTMLImageElement[] = [];
  const stage = pdpStageSrc(id);
  if (stage) next.push(warmBitmap(stage, VIAL_SIZES));
  if (item.bloomSrc) next.push(warmBitmap(item.bloomSrc, BLOOM_SIZES));
  warmed = next;
  return warmed.length;
}
