/**
 * Oral tablet assets for menu notecards / thumbs.
 * Public filenames stay goal framed. No molecule names on art.
 * Internal `compoundKey` is ops-only; do not render on consumer chrome.
 *
 * Category menu thumbs: isolated Figma exports from TIDL.com
 * (node 679:1483, Category Pills — studio + isolated).
 * SKU thumbs: python3 web/scripts/compose-pill-labels.py
 */

export type PillCategory =
  | "sexual-health"
  | "mens-health"
  | "skin-hair"
  | "weight-loss"
  | "womens-health"
  | "recovery"
  | "athletes"
  | "longevity"
  | "creators"
  | "parents"
  | "executive"
  | "travelers"
  | "transformation";

export type CategoryPill = {
  id: PillCategory;
  src: string;
  fieldSrc: string;
  label: string;
  /** Pharmaceutical form. Design QA only. */
  shape: string;
  /** Symptom path the form follows. Design QA only. */
  form: string;
};

export type PillAsset = {
  id: string;
  /** Public path under /public */
  src: string;
  /** Shape note for design QA */
  shape: string;
  /** Ops mapping only. Never show on consumer surfaces. */
  compoundKey: string;
  category: PillCategory;
  /** Category bloom used as the plate behind the tablet. */
  labelSrc: string;
};

export const CATEGORY_LABEL: Readonly<Record<string, string>> = {
  "sexual-health": "/brand/peptide/labels/sexual-health.png",
  "mens-health": "/brand/peptide/labels/testosterone.png",
  "skin-hair": "/brand/peptide/labels/skin-hair.png",
  "weight-loss": "/brand/peptide/labels/weight-loss.png",
  "womens-health": "/brand/peptide/labels/womens-health.png",
  recovery: "/brand/peptide/labels/recovery.png",
};

/** One oral form per category. Shape follows the symptom path. */
export const CATEGORY_PILLS: readonly CategoryPill[] = [
  {
    id: "athletes",
    src: "/brand/pills/category-athletes.png",
    fieldSrc: "/brand/peptide/labels/field-athletes.png",
    label: "Dynamic Training",
    shape: "Elongated hard capsule",
    form: "Performance and recovery orals",
  },
  {
    id: "longevity",
    src: "/brand/pills/category-longevity.png",
    fieldSrc: "/brand/peptide/labels/field-longevity.png",
    label: "Healthspan",
    shape: "Plump oval softgel",
    form: "Cellular and healthspan orals",
  },
  {
    id: "creators",
    src: "/brand/pills/category-creators.png",
    fieldSrc: "/brand/peptide/labels/field-creators.png",
    label: "Focus",
    shape: "Small round scored tablet",
    form: "Daily focus oral",
  },
  {
    id: "parents",
    src: "/brand/pills/category-parents.png",
    fieldSrc: "/brand/peptide/labels/field-parents.png",
    label: "Stress & Mood",
    shape: "Medium oval softgel",
    form: "Sleep and calm oral",
  },
  {
    id: "recovery",
    src: "/brand/pills/category-recovery.png",
    fieldSrc: "/brand/peptide/labels/field-recovery.png",
    label: "Recovery & Performance",
    shape: "Large oblong scored caplet",
    form: "Tissue and inflammation oral",
  },
  {
    id: "sexual-health",
    src: "/brand/pills/category-sexual-health.png",
    fieldSrc: "/brand/peptide/labels/field-sexual-health.png",
    label: "Sexual Health",
    shape: "Rounded square tablet",
    form: "Unscored speckled oral",
  },
  {
    id: "executive",
    src: "/brand/pills/category-executive.png",
    fieldSrc: "/brand/peptide/labels/field-executive.png",
    label: "Peak Performance",
    shape: "Medium oval daily tablet",
    form: "Desk protocol oral",
  },
  {
    id: "mens-health",
    src: "/brand/pills/category-testosterone.png",
    fieldSrc: "/brand/peptide/labels/field-testosterone.png",
    label: "Energy & Strength",
    shape: "Round scored tablet",
    form: "Hormone adjunct oral",
  },
  {
    id: "travelers",
    src: "/brand/pills/category-travelers.png",
    fieldSrc: "/brand/peptide/labels/field-travelers.png",
    label: "Jetlag Recovery",
    shape: "Compact capsule",
    form: "Portable sleep and jet lag oral",
  },
  {
    id: "skin-hair",
    src: "/brand/pills/category-skin-hair.png",
    fieldSrc: "/brand/peptide/labels/field-skin-hair.png",
    label: "Skin & Hair",
    shape: "Round tablet",
    form: "Hair oral form",
  },
  {
    id: "transformation",
    src: "/brand/pills/category-transformation.png",
    fieldSrc: "/brand/peptide/labels/field-transformation.png",
    label: "Appetite Balance",
    shape: "Almond tablet",
    form: "Metabolic pointed oval",
  },
  {
    id: "weight-loss",
    src: "/brand/pills/category-weight-loss.png",
    fieldSrc: "/brand/peptide/labels/field-weight-loss.png",
    label: "Weight Loss",
    shape: "Convex oval tablet",
    form: "Oral metabolic form",
  },
  {
    id: "womens-health",
    src: "/brand/pills/category-womens-health.png",
    fieldSrc: "/brand/peptide/labels/field-womens-health.png",
    label: "Balance & Beauty",
    shape: "Small oval caplet",
    form: "Hormone balance oral",
  },
] as const;

export const PILL_ASSETS: readonly PillAsset[] = [
  {
    id: "sexual-ed-diamond",
    src: "/brand/pills/sexual-ed-diamond.png",
    shape: "Diamond tablet, crimson bloom",
    compoundKey: "sildenafil",
    category: "sexual-health",
    labelSrc: CATEGORY_LABEL["sexual-health"],
  },
  {
    id: "sexual-ed-almond",
    src: "/brand/pills/sexual-ed-almond.png",
    shape: "Almond tablet, crimson bloom",
    compoundKey: "tadalafil",
    category: "sexual-health",
    labelSrc: CATEGORY_LABEL["sexual-health"],
  },
  {
    id: "sexual-ed-round",
    src: "/brand/pills/sexual-ed-round.png",
    shape: "Round scored tablet, crimson bloom",
    compoundKey: "vardenafil",
    category: "sexual-health",
    labelSrc: CATEGORY_LABEL["sexual-health"],
  },
  {
    id: "sexual-ed-oblong",
    src: "/brand/pills/sexual-ed-oblong.png",
    shape: "Oblong tablet, crimson bloom",
    compoundKey: "avanafil",
    category: "sexual-health",
    labelSrc: CATEGORY_LABEL["sexual-health"],
  },
  {
    id: "mens-enclo",
    src: "/brand/pills/mens-enclo.png",
    shape: "Round scored tablet, ice bloom",
    compoundKey: "enclomiphene",
    category: "mens-health",
    labelSrc: CATEGORY_LABEL["mens-health"],
  },
  {
    id: "mens-ana",
    src: "/brand/pills/mens-ana.png",
    shape: "Small round tablet, ice bloom",
    compoundKey: "anastrozole",
    category: "mens-health",
    labelSrc: CATEGORY_LABEL["mens-health"],
  },
  {
    id: "hair-fina",
    src: "/brand/pills/hair-fina.png",
    shape: "Hex shield tablet, porcelain bloom",
    compoundKey: "finasteride",
    category: "skin-hair",
    labelSrc: CATEGORY_LABEL["skin-hair"],
  },
  {
    id: "hair-duta",
    src: "/brand/pills/hair-duta.png",
    shape: "Dual softgel, porcelain bloom",
    compoundKey: "dutasteride",
    category: "skin-hair",
    labelSrc: CATEGORY_LABEL["skin-hair"],
  },
  {
    id: "hair-mino",
    src: "/brand/pills/hair-mino.png",
    shape: "Round tablet, porcelain bloom",
    compoundKey: "minoxidil-oral",
    category: "skin-hair",
    labelSrc: CATEGORY_LABEL["skin-hair"],
  },
  {
    id: "weight-sema-oral",
    src: "/brand/pills/weight-sema-oral.png",
    shape: "Oval tablet, moss bloom",
    compoundKey: "semaglutide-oral",
    category: "weight-loss",
    labelSrc: CATEGORY_LABEL["weight-loss"],
  },
  {
    id: "weight-orfo",
    src: "/brand/pills/weight-orfo.png",
    shape: "Capsule, moss bloom",
    compoundKey: "orforglipron",
    category: "weight-loss",
    labelSrc: CATEGORY_LABEL["weight-loss"],
  },
] as const;

export function pillSrcByCompoundKey(key: string): string | undefined {
  return PILL_ASSETS.find((p) => p.compoundKey === key)?.src;
}

/** Representative pill thumb per Health Goals menu item. */
export const TREATMENT_MENU_PILL: Readonly<Record<string, string>> = {
  "weight-loss": "/brand/pills/category-weight-loss.png",
  "sexual-health": "/brand/pills/category-sexual-health.png?v=6",
  testosterone: "/brand/pills/category-testosterone.png",
  "skin-hair": "/brand/pills/category-skin-hair.png",
  "womens-balance": "/brand/pills/category-womens-health.png",
  "recovery-performance": "/brand/pills/category-recovery.png",
};

/** Representative pill thumb per program / stack. */
export const PROGRAM_MENU_PILL: Readonly<Record<string, string>> = {
  executives: "/brand/pills/category-executive.png",
  transformation: "/brand/pills/category-transformation.png",
  healthspan: "/brand/pills/category-longevity.png",
  parents: "/brand/pills/category-parents.png",
  athletes: "/brand/pills/category-athletes.png",
  creators: "/brand/pills/category-creators.png",
  travelers: "/brand/pills/category-travelers.png",
};
