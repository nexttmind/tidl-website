import type { CSSProperties } from "react";
import { optEntry } from "@/lib/media/opt-manifest";
import type { ShopKind } from "@/components/home/shop-catalog";

/**
 * Cap, base, and lowest ink, as fractions of each pen lockup.
 * Cap and base are where the isolate vial sits in that photo.
 * The whole photo scales so that span matches the isolate. A base
 * that stops short of the glass makes the pen and the vial too big.
 * Ink is the pen tip, so captions clear the tip rather than the
 * empty padding under it.
 */
export const LOCKUP_VIAL_FIT: Record<string, readonly [number, number, number]> = {
  "appetite-balance": [0.395, 0.92, 0.988],
  b12: [0.412, 0.852, 0.976],
  "body-composition": [0.395, 0.92, 0.988],
  "cellular-health": [0.381, 0.861, 0.974],
  "complete-stack": [0.39, 0.88, 0.995],
  "energy-lift": [0.37, 0.809, 0.947],
  "fast-start": [0.38, 0.811, 0.971],
  "head-start": [0.388, 0.828, 0.964],
  focus: [0.403, 0.853, 0.986],
  "hair-skin-nails": [0.368, 0.818, 0.96],
  "lean-cut": [0.348, 0.778, 0.877],
  "lipo-c": [0.426, 0.876, 0.986],
  longevity: [0.406, 0.896, 0.991],
  "mens-peak-performance": [0.382, 0.842, 0.977],
  "repair-mobility": [0.373, 0.843, 0.971],
  "rest-rebuild": [0.38, 0.86, 0.986],
  "rest-rise": [0.363, 0.86, 0.975],
  semaglutide: [0.402, 0.852, 0.948],
  sermorelin: [0.403, 0.853, 0.986],
  "steady-start": [0.388, 0.828, 0.964],
  "stress-mood": [0.371, 0.851, 0.938],
  tesamorelin: [0.408, 0.849, 0.978],
  testosterone: [0.398, 0.882, 0.973],
  tirzepatide: [0.438, 0.888, 0.963],
  "weight-loss": [0.391, 0.891, 0.976],
  "womens-total-balance": [0.353, 0.813, 0.958],
};

/** PDP plate is 330 by 440. Bundle art is fit inside 92% by 72% of that. */
const HOST_W_OVER_H = 330 / 440;
const BUNDLE_BOX_W = 0.92;
const BUNDLE_BOX_H = 0.72;
const SEATED_VIAL_H = 0.78;

function isolateSlot(
  kind: ShopKind | undefined,
  isolate: { width: number; height: number } | undefined,
): number {
  if (kind !== "bundle" || !isolate || isolate.height <= 0) return SEATED_VIAL_H;
  const aspect = isolate.width / isolate.height;
  const boxW = BUNDLE_BOX_W * HOST_W_OVER_H;
  return Math.min(BUNDLE_BOX_H, boxW / aspect);
}

/** Lockup frame for the PDP stage, in fractions of the plate. */
export function stageLockupStyle(
  id: string,
  kind: ShopKind | undefined,
  isolateSrc: string | undefined,
  lockupSrc: string | undefined,
): CSSProperties | undefined {
  const fit = LOCKUP_VIAL_FIT[id];
  const lockup = lockupSrc ? optEntry(lockupSrc) : undefined;
  if (!fit || !lockup || lockup.height <= 0) return undefined;
  const span = fit[1] - fit[0];
  if (span <= 0) return undefined;
  const isolate = isolateSrc ? optEntry(isolateSrc) : undefined;
  const imgH = isolateSlot(kind, isolate) / span;
  const vialAspect =
    isolate && isolate.height > 0 ? isolate.width / isolate.height : 0.44;
  return {
    "--lockup-img-h": String(imgH),
    "--lockup-aspect": String(lockup.width / lockup.height),
    "--lockup-vial-mid": String((fit[0] + fit[1]) / 2),
    "--lockup-vial-span": String(span),
    "--lockup-vial-aspect": String(vialAspect),
  } as CSSProperties;
}
