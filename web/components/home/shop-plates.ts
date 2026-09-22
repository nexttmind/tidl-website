import type { CSSProperties } from "react";
import { catalogVialSrc } from "@/content/fixtures/catalog";
import type { ThemeId } from "@/content/brand/peptide-identity";

export type BloomLayout = {
  groupW: number;
  groupH: number;
  vialX: number;
  vialY: number;
  rotate: number;
  skewX: number;
  scaleX: 1 | -1;
  hypotW: readonly [number, number];
  hypotH: readonly [number, number];
  /** Extra scale on the bloom image, from the vial origin. */
  imgScale?: number;
  /** Slot inset inside the bloom group: top, right, bottom, left (%). */
  slotInset?: readonly [number, number, number, number];
};

export type ShopPlate = {
  id: ThemeId;
  plateSrc: string;
  vialSrc: string;
  bloomSrc: string;
  bloom: BloomLayout;
};

/** Order matches Figma 772:2713. */
export const SHOP_PLATES: readonly ShopPlate[] = [
  {
    id: "creative",
    plateSrc: "/landing/shop/plates/creative.png",
    vialSrc: catalogVialSrc("creative"),
    bloomSrc: "/landing/shop/blooms/creative.png",
    bloom: {
      groupW: 483,
      groupH: 629.356,
      vialX: 54.245,
      vialY: 45.355,
      rotate: -42.43,
      skewX: -15.22,
      scaleX: 1,
      hypotW: [62.2689, 43.6816],
      hypotH: [37.7311, 56.3184],
    },
  },
  {
    id: "transformation",
    plateSrc: "/landing/shop/plates/transformation.png",
    vialSrc: catalogVialSrc("transformation"),
    bloomSrc: "/landing/shop/blooms/transformation.png",
    bloom: {
      groupW: 470.32,
      groupH: 590.95,
      vialX: 48.76,
      vialY: 42.16,
      rotate: -156.23,
      skewX: -9.86,
      scaleX: -1,
      hypotW: [77.3071, 27.0969],
      hypotH: [22.6929, 72.9031],
    },
  },
  {
    id: "mens-health",
    plateSrc: "/landing/shop/plates/mens-health.png",
    vialSrc: catalogVialSrc("mens-health"),
    bloomSrc: "/landing/shop/blooms/mens-health.png",
    bloom: {
      groupW: 433.98,
      groupH: 452.89,
      vialX: 55.63,
      vialY: 33.12,
      rotate: -165.85,
      skewX: 6.08,
      scaleX: 1,
      hypotW: [88.9669, 22.3905],
      hypotH: [11.0331, 77.6095],
    },
  },
  {
    id: "traveler",
    plateSrc: "/landing/shop/plates/traveler.png",
    vialSrc: catalogVialSrc("traveler"),
    bloomSrc: "/landing/shop/blooms/traveler.png",
    bloom: {
      groupW: 398,
      groupH: 415,
      vialX: 55.78,
      vialY: 36.14,
      rotate: 180,
      skewX: 0,
      scaleX: 1,
      hypotW: [100, 0],
      hypotH: [0, 100],
    },
  },
  {
    id: "weight-loss",
    plateSrc: "/landing/shop/plates/weight-loss.png",
    vialSrc: catalogVialSrc("weight-loss"),
    bloomSrc: "/landing/shop/blooms/weight-loss.png",
    bloom: {
      groupW: 1111.4,
      groupH: 807.47,
      vialX: 59.51,
      vialY: 16.72,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      hypotW: [100, 0],
      hypotH: [0, 100],
    },
  },
  {
    id: "executive",
    plateSrc: "/landing/shop/plates/executive.png",
    vialSrc: catalogVialSrc("executive"),
    bloomSrc: "/landing/shop/blooms/executive.png",
    bloom: {
      groupW: 486,
      groupH: 667.44,
      vialX: 47.12,
      vialY: 40.34,
      rotate: 113.03,
      skewX: -14.05,
      scaleX: 1,
      hypotW: [38.6808, 66.2561],
      hypotH: [61.3192, 33.7439],
    },
  },
  {
    id: "athlete",
    plateSrc: "/landing/shop/plates/athlete.png",
    vialSrc: catalogVialSrc("athlete"),
    bloomSrc: "/landing/shop/blooms/athlete.png",
    bloom: {
      groupW: 372,
      groupH: 427,
      vialX: 43.28,
      vialY: 37.94,
      rotate: 180,
      skewX: 0,
      scaleX: 1,
      hypotW: [100, 0],
      hypotH: [0, 100],
    },
  },
  {
    id: "parents",
    plateSrc: "/landing/shop/plates/parents.png",
    vialSrc: catalogVialSrc("parents"),
    bloomSrc: "/landing/shop/blooms/parents.png",
    bloom: {
      groupW: 509.69,
      groupH: 537.57,
      vialX: 52.63,
      vialY: 46.44,
      rotate: 20.15,
      skewX: -8.49,
      scaleX: 1,
      hypotW: [84.6436, 29.4404],
      hypotH: [15.3564, 70.5596],
    },
  },
  {
    id: "legacy",
    plateSrc: "/landing/shop/plates/legacy.png",
    vialSrc: catalogVialSrc("legacy"),
    bloomSrc: "/landing/shop/blooms/legacy.png",
    bloom: {
      groupW: 562.22,
      groupH: 758.04,
      vialX: 40.55,
      vialY: 49.55,
      rotate: 42.25,
      skewX: 15.19,
      scaleX: 1,
      hypotW: [58.0547, 39.1069],
      hypotH: [41.9453, 60.8931],
    },
  },
  {
    id: "recovery-performance",
    plateSrc: "/landing/shop/plates/recovery-performance.png",
    vialSrc: catalogVialSrc("recovery-performance"),
    bloomSrc: "/landing/shop/blooms/recovery-performance.png",
    bloom: {
      groupW: 508.18,
      groupH: 731.07,
      vialX: 47.95,
      vialY: 51.29,
      rotate: -69.62,
      skewX: 13.06,
      scaleX: -1,
      hypotW: [38.3093, 71.6783],
      hypotH: [61.6907, 28.3217],
    },
  },
  {
    id: "womens-balance",
    plateSrc: "/landing/shop/plates/womens-balance.png",
    vialSrc: catalogVialSrc("womens-balance"),
    bloomSrc: "/landing/shop/blooms/womens-balance.png",
    bloom: {
      groupW: 461.02,
      groupH: 497.28,
      vialX: 48.7,
      vialY: 36.42,
      rotate: 85.14,
      skewX: -3.73,
      scaleX: -1,
      hypotW: [7.986, 87.1108],
      hypotH: [92.014, 12.8892],
    },
  },
  {
    id: "sexual-health",
    plateSrc: "/landing/shop/plates/sexual-health.png",
    vialSrc: catalogVialSrc("sexual-health"),
    bloomSrc: "/landing/shop/blooms/sexual-health.png",
    bloom: {
      groupW: 437,
      groupH: 400,
      vialX: 53.55,
      vialY: 37.5,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      hypotW: [100, 0],
      hypotH: [0, 100],
    },
  },
  {
    id: "skin-hair",
    plateSrc: "/landing/shop/plates/skin-hair.png",
    vialSrc: catalogVialSrc("skin-hair"),
    bloomSrc: "/landing/shop/blooms/skin-hair.png",
    bloom: {
      groupW: 397.66,
      groupH: 486.68,
      vialX: 56.83,
      vialY: 44.38,
      rotate: -178.21,
      skewX: -0.78,
      scaleX: -1,
      hypotW: [97.9044, 2.4974],
      hypotH: [2.0956, 97.5026],
      imgScale: 0.7,
    },
  },
];

const SHOP_PLATE_BY_ID = Object.fromEntries(
  SHOP_PLATES.map((plate) => [plate.id, plate]),
) as Record<ThemeId, ShopPlate>;

export function shopPlate(id: ThemeId): ShopPlate {
  return SHOP_PLATE_BY_ID[id];
}

/** Compact plate vs bloom group. Athlete / traveler also shrink in CSS. */
const BLOOM_CSS_SCALE: Partial<Record<ThemeId, number>> = {
  athlete: 0.8,
  traveler: 0.85,
};

/**
 * Seated --bloom-s so the group sits past the compact plate.
 * Wide groups stay modest; small or pre-shrunk groups scale up.
 */
export function bloomSeatScale(id: ThemeId, bloom: BloomLayout): number {
  const plateW = 0.87;
  const plateH = 0.94 * (430 / 300);
  const stageH = bloom.groupH / bloom.groupW;
  const art = (bloom.imgScale ?? 1) * (BLOOM_CSS_SCALE[id] ?? 1);
  const sx = plateW / Math.max(art, 0.01);
  const sy = plateH / Math.max(stageH * art, 0.01);
  return Math.max(0.86, Math.min(1.32, Math.min(sx, sy) * 1.15));
}

export function bloomStyle(bloom: BloomLayout): CSSProperties {
  return {
    "--group-w": bloom.groupW,
    "--group-h": bloom.groupH,
    "--vial-x": `${bloom.vialX}%`,
    "--vial-y": `${bloom.vialY}%`,
    "--bloom-rotate": `${bloom.rotate}deg`,
    "--bloom-skew": `${bloom.skewX}deg`,
    "--bloom-scale-x": bloom.scaleX,
    "--bloom-img-scale": bloom.imgScale ?? 1,
    "--bloom-slot-t": bloom.slotInset ? `${bloom.slotInset[0]}%` : 0,
    "--bloom-slot-r": bloom.slotInset ? `${bloom.slotInset[1]}%` : 0,
    "--bloom-slot-b": bloom.slotInset ? `${bloom.slotInset[2]}%` : 0,
    "--bloom-slot-l": bloom.slotInset ? `${bloom.slotInset[3]}%` : 0,
    "--hw-a": bloom.hypotW[0],
    "--hw-b": bloom.hypotW[1],
    "--hh-a": bloom.hypotH[0],
    "--hh-b": bloom.hypotH[1],
  } as CSSProperties;
}
