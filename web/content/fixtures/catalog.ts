/** Shared catalog index. Goal framed. No molecule names. */

import { TREATMENT_MENU_PILL } from "@/content/brand/pills";
import { themeField, type ThemeId, type ThemeKind } from "@/content/brand/peptide-identity";
import { valueFields, type ValueFieldCard } from "@/content/fixtures/value-fields";

export const CATALOG_HREF = "/categories";

/** Pairing-notecard vials, composited for the Treatments mega menu. */
export const catalogMenuPairSrc = "/landing/shop/menu-all-treatments.png";

/** Mega menu order. Health Goals first, then Treatments. */
const HEALTH_GOAL_ORDER = [
  "mens-health",
  "sexual-health",
  "weight-loss",
  "womens-balance",
  "recovery-performance",
  "skin-hair",
] as const;

const TREATMENT_ORDER = [
  "executive",
  "transformation",
  "legacy",
  "parents",
  "athlete",
  "creative",
] as const;

/** Traveler is the most situational stack. Omit it so the index grid stays even. */
const OMITTED_INDEX_IDS = new Set<ThemeId>(["traveler"]);

/** Left-to-right hue order from the vials + blooms rail. Adjacent hues sit together. */
const COLOR_STACK_ORDER = [
  "creative",
  "transformation",
  "mens-health",
  "weight-loss",
  "executive",
  "athlete",
  "parents",
  "legacy",
  "recovery-performance",
  "womens-balance",
  "sexual-health",
  "skin-hair",
] as const;

export const catalogCopy = {
  heroSrc: "/landing/categories/header.png?v=3",
  heroSrc2x: "/landing/categories/header@2x.png?v=3",
  titleLead: "Built for",
  titleAccent: "how you live",
  lede: "Pick a health goal or a treatment that matches how you live. A physician reviews what, if anything, is prescribed.",
  healthGoals: {
    id: "health-goals",
    title: "Health Goals",
    lede: "Start with what you want from care.",
  },
  treatments: {
    id: "treatments",
    title: "Treatments",
    lede: "Match care to the life you are already living.",
  },
  pairing: {
    title: "Complete your routine",
    cta: { label: "Get Started" },
    left: {
      id: "recovery-performance",
      vialSrc: "/landing/shop/pairing/recovery-upright.png",
      baseX: 0.497,
      width: 476,
      height: 986,
    },
    right: {
      id: "athlete",
      vialSrc: "/landing/shop/pairing/athlete-lean-left.png",
      baseX: 0.629,
      width: 688,
      height: 905,
    },
  },
} as const;

export const CATALOG_PRICE = "Starting at $197";

export type CatalogNotecardCopy = {
  body: string;
};

/** Category index notecards. Goal framed. No molecule names. */
export const catalogNotecards: Partial<Record<ThemeId, CatalogNotecardCopy>> = {
  "weight-loss": {
    body: "Physician guided GLP 1 care for appetite, pace, and lean mass. Available after clinical review.",
  },
  "sexual-health": {
    body: "Private care for desire and reliability, reviewed by a physician. Available after clinical review.",
  },
  "mens-health": {
    body: "A stack for the crash, the softness, and the fog. Reviewed by a physician.",
  },
  "womens-balance": {
    body: "Care for energy, mood, and every hormonal chapter. Available after clinical review.",
  },
  "recovery-performance": {
    body: "A stack for soreness, wear, and the days between hard sessions. Available after clinical review.",
  },
  "skin-hair": {
    body: "A stack for hair you want to keep and skin that is more than a topical.",
  },
  executive: {
    body: "A stack for a calendar that does not flex. Energy and stamina under physician review.",
  },
  transformation: {
    body: "A physician guided GLP 1 stack for appetite, composition, and the months it takes.",
  },
  legacy: {
    body: "A stack for function and capacity as the years add up. Available after clinical review.",
  },
  parents: {
    body: "A stack for the version of you that still has something left after work and bedtime.",
  },
  athlete: {
    body: "A stack for the days between sessions. Tissue, sleep, and capacity, reviewed by a physician.",
  },
  creative: {
    body: "A stack for long sessions, late hours, and a nervous system that never clocks out.",
  },
};

export function catalogNotecardCopy(id: ThemeId): CatalogNotecardCopy {
  return (
    catalogNotecards[id] ?? {
      body: "Physician guided care, reviewed by a physician. Available after clinical review.",
    }
  );
}

/** Cross lockup set, Figma 1120:3. Bump when isolated vials change. */
const CATALOG_VIAL_REV = 6;

export function catalogVialSrc(id: ThemeId): string {
  if (id === "sexual-health") {
    return TREATMENT_MENU_PILL["sexual-health"];
  }
  return `/landing/shop/vials/${id}.png?v=${CATALOG_VIAL_REV}`;
}

export function catalogItemById(id: ThemeId): ValueFieldCard | undefined {
  return valueFields.items.find((item) => item.id === id);
}

function sortById<T extends string>(
  items: readonly ValueFieldCard[],
  order: readonly T[],
) {
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const left = rank.get(a.id as T) ?? Number.MAX_SAFE_INTEGER;
    const right = rank.get(b.id as T) ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

export function catalogStackItems(): readonly ValueFieldCard[] {
  const items = valueFields.items.filter((item) => !OMITTED_INDEX_IDS.has(item.id));
  return sortById(items, COLOR_STACK_ORDER);
}

export function catalogItemsByKind(kind: ThemeKind): readonly ValueFieldCard[] {
  const items = valueFields.items.filter(
    (item) =>
      themeField(item.id).kind === kind && !OMITTED_INDEX_IDS.has(item.id),
  );
  if (kind === "treatment") return sortById(items, HEALTH_GOAL_ORDER);
  return sortById(items, TREATMENT_ORDER);
}
