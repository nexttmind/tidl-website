/**
 * Option E catalog.
 * Product art: 1906:73874 bloom + isolated product, boxed as 1785:120977
 * 3:4 vial faces. Layout: bloom 2015:965, list 2039:964.
 */

import { catalogNavTiles } from "@/content/catalog/navigation";
import { catalogProductSrc } from "@/content/fixtures/catalog";
import {
  MEGA_MENU_GROUPS,
  type CatalogLink,
} from "@/content/fixtures/ask-tidl";

export type OptionENavId = "products" | "bundles" | "treatments" | "pain-relief";

export type OptionEItem = CatalogLink & {
  bloomLabel: string;
  bloomSubtitle: string;
  listLabel: string;
  listBody: string;
  /** 3:4 vial face. 1785:120977 cards built from 1906:73874 product art. */
  faceSrc: string;
};

export type OptionENavLink = {
  id: OptionENavId;
  label: string;
  href: string;
  bloomItems: readonly OptionEItem[];
  listItems: readonly OptionEItem[];
};

function groupItem(groupId: string, itemId: string): CatalogLink {
  const group = MEGA_MENU_GROUPS.find((row) => row.id === groupId);
  const item = group?.items.find((row) => row.id === itemId);
  if (!item) {
    throw new Error(`Missing Option E item: ${groupId}/${itemId}`);
  }
  return item;
}

const FACE_TO_CATALOG: Readonly<Record<string, string>> = {};

function face(name: string): string {
  return catalogProductSrc(FACE_TO_CATALOG[name] ?? name);
}

function dual(
  base: CatalogLink,
  bloomLabel: string,
  bloomSubtitle: string,
  listLabel: string,
  listBody: string,
  faceName: string,
): OptionEItem {
  return {
    ...base,
    label: bloomLabel,
    navSubtitle: bloomSubtitle,
    blurb: bloomSubtitle,
    bloomLabel,
    bloomSubtitle,
    listLabel,
    listBody,
    faceSrc: face(faceName),
  };
}

function bloomOnly(
  base: CatalogLink,
  bloomLabel: string,
  bloomSubtitle: string,
  faceName: string,
): OptionEItem {
  return dual(base, bloomLabel, bloomSubtitle, bloomLabel, bloomSubtitle, faceName);
}

const PRODUCTS: readonly OptionEItem[] = [
  dual(
    groupItem("products", "tirzepatide"),
    "Tirzepatide",
    "Dual action appetite support, physician guided",
    "Appetite Balance",
    "Weekly metabolic support for hunger, pace, and staying steady between check ins, if prescribed.",
    "tirzepatide",
  ),
  dual(
    groupItem("products", "semaglutide"),
    "Semaglutide",
    "Appetite support, physician guided",
    "Metabolic Weekly",
    "A physician guided plan for metabolic rhythm across the week, if prescribed.",
    "semaglutide",
  ),
  dual(
    groupItem("products", "b12"),
    "B12",
    "Weekly B12, physician guided",
    "Energy Support",
    "Daily recovery ritual for morning energy and the hours that ask more of you.",
    "b12",
  ),
  dual(
    groupItem("products", "lipo-c"),
    "Lipo C",
    "Weekly lipotropic support, physician guided",
    "Cellular Support",
    "Focus and clarity support aimed at cellular stamina through the workday.",
    "lipo-c",
  ),
  dual(
    groupItem("products", "methylene-blue"),
    "Methylene Blue",
    "A daily capsule for focus, physician guided",
    "Cognitive Clarity",
    "Daytime focus care for meetings, deep work, and the stretch after lunch.",
    "methylene-blue",
  ),
  dual(
    groupItem("products", "sermorelin"),
    "Sermorelin",
    "Supports your body's own rhythm, taken at night",
    "Overnight Recovery",
    "Overnight rebuild support for sleep quality and how you land the next morning.",
    "sermorelin",
  ),
  dual(
    groupItem("products", "tesamorelin"),
    "Tesamorelin",
    "A body composition protocol, physician guided",
    "Lean Mass Support",
    "Composition protocol for lean mass, training load, and metabolic resilience, if prescribed.",
    "tesamorelin",
  ),
  dual(
    groupItem("products", "testosterone"),
    "Testosterone",
    "Energy, drive, and training load, physician guided",
    "Testosterone",
    "A clinician reviewed plan for energy and drive, with labs and a video visit, if prescribed.",
    "testosterone",
  ),
  dual(
    groupItem("products", "at-home-lab"),
    "MD Reviewed Blood Test",
    "Results in 72 hours",
    "MD Reviewed Blood Test",
    "A single use collection kit shipped to you, with portal results in seventy two hours.",
    "at-home-lab",
  ),
];

const BUNDLES: readonly OptionEItem[] = [
  dual(
    groupItem("bundles", "head-start"),
    "Head Start",
    "GLP 1 starter, with a molecule choice",
    "Head Start",
    "Physician stacked momentum, appetite, and energy, if prescribed.",
    "head-start",
  ),
  dual(
    groupItem("bundles", "rest-rise"),
    "Rest & Rise",
    "Rest, repair, and rise",
    "Rest & Rise",
    "Energy, repair, and metabolic care combined into a full longevity protocol, if prescribed.",
    "rest-rise",
  ),
  dual(
    groupItem("bundles", "energy-lift"),
    "Energy Lift",
    "Energy, stamina, and focus",
    "Energy Lift",
    "Private care for performance, desire, and confidence, guided by a practitioner, if prescribed.",
    "energy-lift",
  ),
];

const TREATMENT_LIST: readonly OptionEItem[] = [
  dual(
    groupItem("treatments", "weight-loss"),
    "Weight Loss",
    "Appetite, satiety, control",
    "Weight Loss",
    "Physician guided care for appetite, metabolic pace, and how composition holds over time, if prescribed.",
    "weight-loss",
  ),
  dual(
    groupItem("bundles", "appetite-balance"),
    "Appetite Balance",
    "Composition, appetite, aging",
    "Appetite Balance",
    "A steadier rhythm across hunger cues, energy between meals, and day to day metabolic load.",
    "appetite-balance",
  ),
  dual(
    groupItem("treatments", "mens-peak-performance"),
    "Men's Peak Performance",
    "Energy, strength and drive as one protocol",
    "Men's Peak Performance",
    "Support for daytime energy, drive, and the recovery window after hard sessions.",
    "mens-peak-performance",
  ),
  dual(
    groupItem("treatments", "repair-mobility"),
    "Repair & Mobility",
    "Repair and mobility for tissue under load",
    "Repair & Mobility",
    "Joints, soft tissue, and rebound so you can return to the work that matters.",
    "repair-mobility",
  ),
  dual(
    groupItem("treatments", "rest-rebuild"),
    "Rest & Rebuild",
    "Recovery, repair and sleep between sessions",
    "Rest & Rebuild",
    "Between session recovery built for sleep debt, training load, and showing up ready.",
    "rest-rebuild",
  ),
  dual(
    groupItem("treatments", "longevity"),
    "Longevity",
    "Metabolic support, capacity, and a physician reading your numbers",
    "Longevity",
    "Healthspan minded care for aging markers, capacity, and the years you want to feel capable.",
    "longevity",
  ),
  dual(
    groupItem("treatments", "womens-total-balance"),
    "Women's Total Balance",
    "A GLP 1 program with cellular and lipotropic support",
    "Women's Total Balance",
    "Hormone aware care for mood, cycle, energy, and skin across every chapter.",
    "womens-total-balance",
  ),
];

const TREATMENT_BLOOM: readonly OptionEItem[] = [
  bloomOnly(
    groupItem("bundles", "body-composition"),
    "Body Composition",
    "Composition and recovery",
    "body-composition",
  ),
  bloomOnly(
    groupItem("treatments", "complete-stack"),
    "Complete Stack",
    "Energy, repair, metabolism",
    "complete-stack",
  ),
  bloomOnly(
    groupItem("treatments", "lean-cut"),
    "Lean & Cut",
    "Dual action weight loss with hormone support",
    "lean-cut",
  ),
  bloomOnly(
    groupItem("treatments", "sexual-health"),
    "Sexual Health",
    "Desire and performance, for men and women",
    "sexual-health",
  ),
  TREATMENT_LIST[0],
  TREATMENT_LIST[1],
  TREATMENT_LIST[2],
  TREATMENT_LIST[3],
  TREATMENT_LIST[4],
  TREATMENT_LIST[5],
  TREATMENT_LIST[6],
  bloomOnly(
    groupItem("bundles", "focus"),
    "Focus",
    "Sustained attention and rest on a hard schedule",
    "focus",
  ),
  bloomOnly(
    groupItem("treatments", "stress-mood"),
    "Stress & Mood",
    "Mood, stress, clearer days",
    "stress-mood",
  ),
  bloomOnly(
    groupItem("treatments", "hair-skin-nails"),
    "Hair, Skin & Nails",
    "Hair you want to keep, with skin and nail support",
    "hair-skin-nails",
  ),
];

const ITEM_BY_ID = new Map<string, OptionEItem>(
  [...PRODUCTS, ...BUNDLES, ...TREATMENT_BLOOM].map((item) => [item.id, item]),
);

function itemsFor(kind: "product" | "bundle" | "treatment"): readonly OptionEItem[] {
  return catalogNavTiles()
    .filter((tile) => tile.kind === kind)
    .map((tile) => {
      const item = ITEM_BY_ID.get(tile.id);
      if (!item) throw new Error(`Missing Option E item: ${tile.id}`);
      return {
        ...item,
        href: tile.href,
        label: tile.name,
        bloomLabel: tile.name,
        listLabel: tile.name,
      };
    });
}

function leadWith(items: readonly OptionEItem[], id: string): readonly OptionEItem[] {
  const lead = items.find((item) => item.id === id);
  if (!lead) return items;
  return [lead, ...items.filter((item) => item.id !== id)];
}

const PRODUCT_ITEMS = leadWith(itemsFor("product"), "testosterone");
const BUNDLE_ITEMS = itemsFor("bundle");

/** Catalog and shop keep the blood test. The Products and Bundles menu does not. */
const PRODUCTS_BUNDLES_MENU_OMIT = new Set(["at-home-lab"]);

export function productsBundlesMenuProducts(): readonly OptionEItem[] {
  return PRODUCT_ITEMS.filter((item) => !PRODUCTS_BUNDLES_MENU_OMIT.has(item.id));
}
const TREATMENT_ITEMS = itemsFor("treatment");

export const OPTION_E_NAV: readonly OptionENavLink[] = [
  {
    id: "products",
    label: "Products",
    href: "/products",
    bloomItems: PRODUCT_ITEMS,
    listItems: PRODUCT_ITEMS,
  },
  {
    id: "bundles",
    label: "Product Bundles",
    href: "/bundles",
    bloomItems: BUNDLE_ITEMS,
    listItems: BUNDLE_ITEMS,
  },
  {
    id: "treatments",
    label: "Treatments",
    href: "/treatments",
    bloomItems: TREATMENT_ITEMS,
    listItems: TREATMENT_ITEMS,
  },
  {
    id: "pain-relief",
    label: "Pain Relief",
    href: "/pain-relief",
    bloomItems: [],
    listItems: [],
  },
];

export const OPTION_E_VIEW_ALL: CatalogLink = {
  id: "view-all-treatments",
  label: "View All Treatments",
  href: "/treatments",
  blurb: "Browse the full catalog.",
  navSubtitle: "Browse the full catalog.",
  keywords: ["all", "catalog", "browse"],
};

export function bloomLink(item: OptionEItem): CatalogLink {
  return {
    ...item,
    label: item.bloomLabel,
    navSubtitle: item.bloomSubtitle,
    blurb: item.bloomSubtitle,
    imageSrc: item.faceSrc,
  };
}

export function listLink(item: OptionEItem): CatalogLink {
  return {
    ...item,
    label: item.bloomLabel,
    navSubtitle: item.bloomSubtitle,
    blurb: item.bloomSubtitle,
  };
}
