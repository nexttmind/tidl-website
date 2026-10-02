import { catalogHref } from "@/content/catalog/routes";
import { catalogNavTile, catalogNavTiles } from "@/content/catalog/navigation";
import { CATALOG_VIAL_REV } from "@/content/fixtures/catalog";
import type { LaunchForm } from "@/content/pdp/launch-pricing";
import type { BloomLayout } from "./shop-plates";

const REV = CATALOG_VIAL_REV;

const FLAT = {
  rotate: 0,
  skewX: 0,
  scaleX: 1 as const,
  hypotW: [100, 0] as const,
  hypotH: [0, 100] as const,
};

function bloom(
  groupW: number,
  groupH: number,
  vialX: number,
  vialY: number,
  vialW: number,
  vialH: number,
): BloomLayout {
  return {
    groupW,
    groupH,
    vialX,
    vialY,
    vialW,
    vialH,
    ...FLAT,
  };
}

function fieldSrc(id: string): string {
  return `/landing/shop/catalog/plates/${id}.png?v=${REV}`;
}

function vialSrc(id: string): string {
  return `/landing/shop/catalog/vials/${id}.png?v=${REV}`;
}

function bloomSrc(id: string): string {
  return `/landing/shop/catalog/blooms/${id}.png?v=${REV}`;
}

function penLockupSrc(id: string): string {
  return `/landing/shop/catalog/pen-lockups/${id}.png?v=${REV}`;
}

function pillSrc(id: string): string {
  return `/landing/shop/catalog/pills/${id}.png?v=${REV}`;
}

export type ShopKind = "product" | "treatment" | "bundle";

/**
 * Pin in the lockup PNG that maps to the Form tile midline.
 * x 0.50 is the live Lipo C horizontal. y 0.64 is the lockup
 * vial centre (cap 0.394, base 0.889), so it sits on the isolate.
 */
export type LockupVialAnchor = { x: number; y: number };

const LOCKUP_VIAL: LockupVialAnchor = { x: 0.5, y: 0.64 };

type Visual = {
  kind: ShopKind;
  plateSrc: string;
  vialSrc: string;
  bloomSrc: string;
  bloom: BloomLayout;
  penLockupSrc?: string;
  lockupVial?: LockupVialAnchor;
  pillSrc?: string;
};

/** No Flow pen on the lockup. Oral, kit, topical, or no pen board. */
const NO_PEN = new Set([
  "methylene-blue",
  "at-home-lab",
  "pain-relief",
  "cryotherapy-spray",
  "max-strength-spray",
  "cryotherapy-cream",
  "heat-therapy-spray",
  "evening-spray",
  "hot-cold-system",
  "rapid-relief-duo",
  "sexual-health",
]);

/** Pen lockups from 2143:176711 / 2143:176761 / 2143:176829. */
const NO_PEN_LOCKUP = new Set([...NO_PEN]);

/** Isolated pills from 2221:206. */
const HAS_PILL = new Set([
  "methylene-blue",
  "sexual-health",
  "cellular-health",
  "stress-mood",
  "tirzepatide",
  "semaglutide",
  "sermorelin",
  "b12",
  "lipo-c",
  "energy-lift",
  "rest-rise",
  "focus",
]);

function visual(kind: ShopKind, id: string, layout: BloomLayout): Visual {
  const isolate = id === "sexual-health" ? pillSrc(id) : vialSrc(id);
  return {
    kind,
    plateSrc: fieldSrc(id),
    vialSrc: isolate,
    bloomSrc: bloomSrc(id),
    bloom: layout,
    ...(NO_PEN_LOCKUP.has(id)
      ? {}
      : { penLockupSrc: penLockupSrc(id), lockupVial: LOCKUP_VIAL }),
    ...(HAS_PILL.has(id) ? { pillSrc: pillSrc(id) } : {}),
  };
}

/**
 * Homepage shop rail art. Lockups from Product / Treatment / Bundle
 * Vials and Blooms on 2138:89195, 2138:110228, 2138:149713.
 * Group is the bloom frame absoluteRenderBounds. vialX/Y is the isolate
 * centre in that box. Rotation is baked into the bloom PNG.
 */
const VISUAL: Record<string, Visual> = {
  tirzepatide: visual(
    "product",
    "tirzepatide",
    bloom(1035, 1233, 55.36, 44.85, 402, 924),
  ),
  semaglutide: visual(
    "product",
    "semaglutide",
    bloom(1072, 1204, 43.89, 36.38, 413, 924),
  ),
  sermorelin: visual(
    "product",
    "sermorelin",
    bloom(1033, 1319, 58.28, 41.93, 414, 924),
  ),
  tesamorelin: visual(
    "product",
    "tesamorelin",
    bloom(1113, 1256, 61.01, 39.05, 412, 925),
  ),
  b12: visual("product", "b12", bloom(1093, 1185, 50.27, 38.99, 405, 924)),
  "lipo-c": visual(
    "product",
    "lipo-c",
    bloom(1216, 1185, 52.06, 38.99, 402, 924),
  ),
  "methylene-blue": visual(
    "product",
    "methylene-blue",
    bloom(1166, 1155, 50, 47.45, 922, 922),
  ),
  "at-home-lab": visual(
    "product",
    "at-home-lab",
    bloom(1640, 922, 41.37, 46.8, 1357, 575),
  ),
  "body-composition": visual(
    "treatment",
    "body-composition",
    bloom(999, 1084, 50.45, 27.21, 1005, 1048),
  ),
  "complete-stack": visual(
    "treatment",
    "complete-stack",
    bloom(1104, 946, 49.09, 27.43, 406, 925),
  ),
  "lean-cut": visual(
    "treatment",
    "lean-cut",
    bloom(1654.46, 1711.83, 47.99, 44.91, 420, 925),
  ),
  "sexual-health": visual(
    "treatment",
    "sexual-health",
    bloom(1301, 1059, 38.2, 42, 480, 480),
  ),
  "weight-loss": visual(
    "treatment",
    "weight-loss",
    bloom(936, 1343, 59.62, 50.48, 408, 924),
  ),
  "appetite-balance": visual(
    "treatment",
    "appetite-balance",
    bloom(1004, 1288, 46.41, 34.39, 996, 1046),
  ),
  "mens-peak-performance": visual(
    "treatment",
    "mens-peak-performance",
    bloom(1075, 1236, 49.12, 37.42, 400, 925),
  ),
  "repair-mobility": visual(
    "treatment",
    "repair-mobility",
    bloom(1502, 948, 55.76, 18.35, 407, 924),
  ),
  "rest-rebuild": visual(
    "treatment",
    "rest-rebuild",
    bloom(936, 1288, 45.73, 43.63, 404, 924),
  ),
  "cellular-health": visual(
    "treatment",
    "cellular-health",
    bloom(1012, 1216, 51.28, 38, 406, 924),
  ),
  longevity: visual(
    "treatment",
    "longevity",
    bloom(982, 1166, 48.93, 44.64, 405, 919),
  ),
  focus: visual("treatment", "focus", bloom(1017, 1335, 54.82, 45.69, 1198, 975)),
  "stress-mood": visual(
    "treatment",
    "stress-mood",
    bloom(1462.92, 1329.4, 57.49, 43.48, 404, 924),
  ),
  "womens-total-balance": visual(
    "treatment",
    "womens-total-balance",
    bloom(1036, 1421, 52.46, 40.75, 421, 924),
  ),
  "hair-skin-nails": visual(
    "treatment",
    "hair-skin-nails",
    bloom(1139.38, 1266.34, 49.52, 34.94, 419, 924),
  ),
  "pain-relief": visual(
    "product",
    "pain-relief",
    bloom(1484.9, 1552.43, 53.27, 49.84, 688, 924),
  ),
  /** Pain Relief Products Framed, 2260:2. Group is the bloom bounds. */
  "cryotherapy-spray": visual(
    "product",
    "cryotherapy-spray",
    bloom(1484.9, 1552.43, 53.27, 49.84, 688, 924),
  ),
  "max-strength-spray": visual(
    "product",
    "max-strength-spray",
    bloom(982, 1166, 48.78, 44.94, 688, 924),
  ),
  "cryotherapy-cream": visual(
    "product",
    "cryotherapy-cream",
    bloom(936, 1288, 45.62, 44.02, 688, 924),
  ),
  "heat-therapy-spray": visual(
    "product",
    "heat-therapy-spray",
    bloom(1484.9, 1552.43, 53.27, 49.84, 688, 924),
  ),
  "evening-spray": visual(
    "product",
    "evening-spray",
    bloom(1012, 1216, 51.28, 38.16, 688, 924),
  ),
  "hot-cold-system": visual(
    "product",
    "hot-cold-system",
    bloom(1654.46, 1711.83, 47.86, 45.29, 688, 924),
  ),
  "rapid-relief-duo": visual(
    "product",
    "rapid-relief-duo",
    bloom(936, 1288, 45.62, 44.02, 688, 924),
  ),
  "steady-start": visual(
    "bundle",
    "steady-start",
    bloom(2092, 1401, 48.06, 41.4, 1347, 934),
  ),
  "rest-rise": visual(
    "bundle",
    "rest-rise",
    bloom(1795, 1486, 50.03, 44.92, 844, 936),
  ),
  "fast-start": visual(
    "bundle",
    "fast-start",
    bloom(2122, 1569, 50, 45.35, 1442, 933),
  ),
  "energy-lift": visual(
    "bundle",
    "energy-lift",
    bloom(1525, 1540, 52.85, 44.58, 1024, 925),
  ),
  /** Vial group is tirzepatide, Lipo C, and B12. Pen lockup stays the Steady Start board. */
  "head-start": {
    ...visual(
      "bundle",
      "fast-start",
      bloom(2122, 1569, 50, 45.35, 1215, 916),
    ),
    vialSrc: vialSrc("head-start"),
    bloomSrc: bloomSrc("steady-start"),
    penLockupSrc: penLockupSrc("steady-start"),
  },
};

/** Order and names come from the pricing file navigation. */
const SHOP_ORDER: readonly string[] = catalogNavTiles().map((tile) => tile.id);

export type ShopCatalogItem = {
  id: string;
  kind: ShopKind;
  label: string;
  href: string;
  plateSrc: string;
  vialSrc: string;
  bloomSrc: string;
  bloom: BloomLayout;
  penLockupSrc?: string;
  lockupVial?: LockupVialAnchor;
  pillSrc?: string;
};

function itemFor(id: string): ShopCatalogItem {
  const art = VISUAL[id];
  if (!art) {
    throw new Error(`Missing shop catalog art for ${id}`);
  }
  const tile = catalogNavTile(id);
  return {
    ...art,
    id,
    kind: tile?.kind ?? art.kind,
    label: tile?.name ?? id,
    href: tile?.href ?? catalogHref(id),
  };
}

export const SHOP_CATALOG: readonly ShopCatalogItem[] = SHOP_ORDER.map(itemFor);

const SHOP_CATALOG_BY_ID = Object.fromEntries(
  Object.keys(VISUAL).map((id) => [id, itemFor(id)]),
);

/** ThemeId leftovers that still resolve to a Figma title. */
const SHOP_ID_ALIAS: Readonly<Record<string, string>> = {
  "mens-health": "mens-peak-performance",
  "recovery-performance": "repair-mobility",
  "womens-balance": "womens-total-balance",
  "skin-hair": "hair-skin-nails",
};

export function shopCatalogItem(id: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG_BY_ID[SHOP_ID_ALIAS[id] ?? id];
}

/** Homepage catalog tiles. Vial, except the two products that are oral only. */
const TILE_PILL = new Set(["methylene-blue", "sexual-health"]);

export function catalogTileSrc(id: string): string {
  const item = shopCatalogItem(id);
  if (!item) return "";
  if (TILE_PILL.has(id)) return item.pillSrc ?? item.vialSrc;
  return item.vialSrc;
}

export function catalogHasPenLockup(id: string): boolean {
  return Boolean(shopCatalogItem(id)?.penLockupSrc);
}

/** Left PDP stage. Always the isolate without a pen. Never a lockup. */
export function pdpStageSrc(catalogId: string): string | undefined {
  const item = shopCatalogItem(catalogId);
  if (!item) return undefined;
  if (item.pillSrc && !item.penLockupSrc) return item.pillSrc;
  return item.vialSrc;
}

/** Image for the selected form. The PDP stage and the form control both use it. */
export function formHeroSrc(catalogId: string, form: LaunchForm): string | undefined {
  const item = shopCatalogItem(catalogId);
  if (!item) return undefined;
  if (form === "vial-pen") return item.penLockupSrc ?? item.vialSrc;
  if (form === "capsule") return item.pillSrc ?? item.vialSrc;
  if (form === "kit" || form === "vial") return item.vialSrc;
  if (item.pillSrc && !item.penLockupSrc) return item.pillSrc;
  return item.vialSrc;
}

/** Figma Backgrounds only 1:119401. Pain SKUs share the Pain Relief field. */
export function catalogFieldId(
  catalogId?: string,
  themeId?: string,
): string | undefined {
  if (catalogId) return catalogId;
  if (themeId === "recovery-performance") return "pain-relief";
  return shopCatalogItem(themeId ?? "")?.id;
}
