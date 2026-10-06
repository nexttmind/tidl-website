/** Ask TIDL AI — catalog, starters, and answer routing. Goal framed. No molecule names. */

import { catalogHref } from "@/content/catalog/routes";
import {
  CATALOG_HREF,
  catalogMenuPairSrc,
  catalogProductSrc,
  catalogVialSrc,
} from "@/content/fixtures/catalog";
import {
  PAIN_RELIEF_HREF,
  painReliefCopy,
  painReliefMenuSrc,
} from "@/content/fixtures/pain-relief";

export type CatalogLink = {
  id: string;
  label: string;
  href: string;
  blurb: string;
  keywords: readonly string[];
  /** Mega menu thumb. Isolated vial, transparent plate. */
  imageSrc?: string;
  /** Apex-derived short description under the label in the mega menu. */
  navSubtitle?: string;
};

export type MegaMenuGroup = {
  id: string;
  title: string;
  items: readonly CatalogLink[];
};

export const LABS_HREF = "/labs";

export type AskAnswer = {
  paragraphs: readonly string[];
  treatments: readonly CatalogLink[];
  programs: readonly CatalogLink[];
  disclaimer: string;
};

export const TREATMENTS: readonly CatalogLink[] = [
  {
    id: "weight-loss",
    label: "Weight Loss",
    href: "/treatments/weight-loss",
    blurb: "Feel in control of hunger, cravings, and what comes next.",
    navSubtitle: "Appetite, satiety, and metabolic control",
    imageSrc: catalogVialSrc("weight-loss"),
    keywords: ["weight", "metabolic", "appetite", "food noise", "body composition"],
  },
  {
    id: "sexual-health",
    label: "Sexual Health",
    href: "/treatments/sexual-health",
    blurb: "Private care for better intimacy and confidence.",
    navSubtitle: "Desire and performance, for men and women",
    imageSrc: catalogVialSrc("sexual-health"),
    keywords: ["sexual", "intimacy", "libido", "erectile"],
  },
  {
    id: "mens-health",
    label: "Men's Peak Performance",
    href: "/treatments/mens-health",
    blurb: "Wake up with energy, drive, and room to recover.",
    navSubtitle: "Energy, strength and drive as one protocol",
    imageSrc: catalogVialSrc("mens-health"),
    keywords: ["testosterone", "trt", "hormone", "low t", "energy", "strength", "men"],
  },
  {
    id: "womens-balance",
    label: "Women's Total Balance",
    href: "/treatments/womens-balance",
    blurb: "Care that keeps pace with every hormonal chapter.",
    navSubtitle: "A GLP 1 program with cellular and lipotropic support",
    imageSrc: catalogVialSrc("womens-balance"),
    keywords: ["women", "woman", "perimenopause", "menopause", "cycle", "balance", "beauty"],
  },
  {
    id: "recovery-performance",
    label: "Repair & Mobility",
    href: "/treatments/recovery-and-performance",
    blurb: "Bounce back faster between the sessions that matter.",
    navSubtitle: "Repair and mobility for tissue under load",
    imageSrc: catalogVialSrc("recovery-performance"),
    keywords: ["recovery", "performance", "training", "soreness", "muscle"],
  },
  {
    id: "skin-hair",
    label: "Hair, Skin & Nails",
    href: "/treatments/skin-and-hair",
    blurb: "Clarity in the mirror. Density you can feel.",
    navSubtitle: "Hair you want to keep, with skin and nail support",
    imageSrc: catalogVialSrc("skin-hair"),
    keywords: ["skin", "hair", "acne", "thinning"],
  },
] as const;

export const PROGRAMS: readonly CatalogLink[] = [
  {
    id: "executives",
    label: "Peak Performance",
    href: "/treatments/mens-health",
    blurb: "High output care for people who live in meetings.",
    navSubtitle: "Energy, strength and drive as one protocol",
    imageSrc: catalogVialSrc("executive"),
    keywords: ["ceo", "executive", "founder", "leadership", "board"],
  },
  {
    id: "transformation",
    label: "Appetite Balance",
    href: "/stacks/transformation",
    blurb: "A full reset for mind, body, and the days between.",
    navSubtitle: "Body composition, appetite, and healthy aging",
    imageSrc: catalogVialSrc("transformation"),
    keywords: ["transformation", "mind", "body", "reset", "change", "appetite"],
  },
  {
    id: "healthspan",
    label: "Healthspan",
    href: "/programs/healthspan",
    blurb: "Care built for the years you want to feel capable.",
    navSubtitle: "Metabolic support, capacity, and a physician reading your numbers",
    imageSrc: catalogVialSrc("legacy"),
    keywords: ["healthspan", "longevity", "aging", "legacy"],
  },
  {
    id: "parents",
    label: "Stress & Mood",
    href: "/programs/parents",
    blurb: "Care that respects sleep debt, school runs, and real life.",
    navSubtitle: "Mood, stress, and clearer days",
    imageSrc: catalogVialSrc("parents"),
    keywords: ["parent", "parents", "mom", "dad", "family", "stress", "mood"],
  },
  {
    id: "athletes",
    label: "Rest & Rebuild",
    href: "/programs/athletes",
    blurb: "Train hard. Recover harder. Show up ready.",
    navSubtitle: "Recovery, repair and sleep between sessions",
    imageSrc: catalogVialSrc("athlete"),
    keywords: ["athlete", "athletes", "sport", "compete", "training", "improve"],
  },
  {
    id: "creators",
    label: "Focus",
    href: "/programs/creators-and-builders",
    blurb: "Focus and stamina for people who ship creative work.",
    navSubtitle: "Sustained attention and rest on a hard schedule",
    imageSrc: catalogVialSrc("creative"),
    keywords: ["creator", "creative", "builder", "maker", "studio", "focus"],
  },
] as const;

/** Topical catalog. Last mega menu slot, beside Jetlag Recovery. */
export const PAIN_RELIEF: CatalogLink = {
  id: "pain-relief",
  label: painReliefCopy.title,
  href: PAIN_RELIEF_HREF,
  blurb: painReliefCopy.lede,
  navSubtitle: "Sore tissue and everyday inflammation",
  imageSrc: painReliefMenuSrc,
  keywords: ["pain", "sore", "topical", "spray", "cream"],
};

/** Footer Treatments column. Health goals first, then lifestyle programs, then topicals. */
export const ALL_TREATMENTS: readonly CatalogLink[] = [
  ...TREATMENTS,
  ...PROGRAMS,
  PAIN_RELIEF,
];

/** Catalog index. Last mega menu slot, beside Pain Relief. */
export const CATALOG_INDEX: CatalogLink = {
  id: "all-treatments",
  label: "All Treatments",
  href: CATALOG_HREF,
  blurb: "Health goals and treatments in one catalog.",
  navSubtitle: "Health goals and treatments in one place",
  imageSrc: catalogMenuPairSrc,
  keywords: ["all", "catalog", "browse", "treatments"],
};

function catalogById(list: readonly CatalogLink[], id: string): CatalogLink {
  const item = list.find((row) => row.id === id);
  if (!item) {
    throw new Error(`Missing catalog link: ${id}`);
  }
  return item;
}

function menuLink(
  base: CatalogLink,
  patch: Pick<CatalogLink, "id" | "label"> & Partial<CatalogLink>,
): CatalogLink {
  return { ...base, ...patch };
}

const sexualHealthGoal = catalogById(TREATMENTS, "sexual-health");
const transformationGoal = catalogById(PROGRAMS, "transformation");
const healthspanGoal = catalogById(PROGRAMS, "healthspan");

export const COMPOUND_VIAL = {
  "glp-1": "/landing/shop/vials/compounds/glp-1.png",
  tirzepatide: catalogProductSrc("tirzepatide"),
  semaglutide: catalogProductSrc("semaglutide"),
  tesamorelin: catalogProductSrc("tesamorelin"),
  testosterone: catalogProductSrc("testosterone"),
  nad: "/landing/shop/vials/compounds/nad.png",
  sermorelin: catalogProductSrc("sermorelin"),
  glutathione: "/landing/shop/vials/compounds/glutathione.png",
  "pt-141": "/landing/shop/vials/compounds/pt-141.png",
  b12: catalogProductSrc("b12"),
  "lipo-c": catalogProductSrc("lipo-c"),
  "methylene-blue": catalogProductSrc("methylene-blue"),
  "at-home-lab": catalogProductSrc("at-home-lab"),
  "body-composition": catalogProductSrc("body-composition"),
  "complete-stack": catalogProductSrc("complete-stack"),
  "lean-cut": catalogProductSrc("lean-cut"),
  "sexual-health": catalogProductSrc("sexual-health"),
} as const;

/** Ids with a ground plate in /landing/catalog/plates. A plate does not imply a vial. */
const COMPOUND_PLATE = [
  "glp-1",
  "tirzepatide",
  "semaglutide",
  "testosterone",
  "tesamorelin",
  "nad",
  "sermorelin",
  "glutathione",
  "methylene-blue",
  "pt-141",
  "b12",
  "lipo-c",
  "body-composition",
  "complete-stack",
  "lean-cut",
  "sexual-health",
  "at-home-lab",
  "pain-relief",
  "weight-loss",
  "transformation",
  "mens-health",
  "recovery-performance",
  "athletes",
  "travelers",
  "healthspan",
  "creators",
  "parents",
  "womens-balance",
  "skin-hair",
] as const;

export type CompoundPlateId = (typeof COMPOUND_PLATE)[number];

export function compoundPlateId(id: string): CompoundPlateId | undefined {
  return (COMPOUND_PLATE as readonly string[]).includes(id)
    ? (id as CompoundPlateId)
    : undefined;
}

const tirzepatideItem = menuLink(transformationGoal, {
  id: "tirzepatide",
  label: "Tirzepatide",
  href: "/products/tirzepatide",
  navSubtitle: "Dual action appetite support, physician guided",
  imageSrc: COMPOUND_VIAL.tirzepatide,
  keywords: [...transformationGoal.keywords, "tirzepatide"],
});

const semaglutideItem: CatalogLink = {
  id: "semaglutide",
  label: "Semaglutide",
  href: "/products/semaglutide",
  blurb: "Physician guided GLP 1 care, if prescribed.",
  navSubtitle: "Appetite support, physician guided",
  imageSrc: COMPOUND_VIAL.semaglutide,
  keywords: ["semaglutide", "glp", "weight"],
};

const tesamorelinItem = menuLink(healthspanGoal, {
  id: "tesamorelin",
  label: "Tesamorelin",
  href: "/products/tesamorelin",
  navSubtitle: "A body composition protocol, physician guided",
  imageSrc: COMPOUND_VIAL.tesamorelin,
  keywords: [...healthspanGoal.keywords, "tesamorelin"],
});

const mensGoal = catalogById(TREATMENTS, "mens-health");

const testosteroneItem = menuLink(mensGoal, {
  id: "testosterone",
  label: "Testosterone",
  href: "/products/testosterone",
  navSubtitle: "Energy, drive, and training load, physician guided",
  imageSrc: COMPOUND_VIAL.testosterone,
  keywords: [...mensGoal.keywords, "testosterone", "trt"],
});

const sermorelinItem: CatalogLink = {
  id: "sermorelin",
  label: "Sermorelin",
  href: "/products/sermorelin",
  blurb: "Physician guided longevity care, if prescribed.",
  navSubtitle: "Supports your body's own rhythm, taken at night",
  imageSrc: COMPOUND_VIAL.sermorelin,
  keywords: ["sermorelin", "longevity", "healthspan"],
};

export const LABS_ITEM: CatalogLink = {
  id: "at-home-lab",
  label: "MD Reviewed Blood Test",
  href: LABS_HREF,
  blurb: "A single-use collection device shipped to you. Portal results in 72 hours.",
  navSubtitle: "Results In 72 Hours",
  imageSrc: COMPOUND_VIAL["at-home-lab"],
  keywords: ["lab", "blood", "test", "panel", "reddrop"],
};

const b12Item: CatalogLink = {
  id: "b12",
  label: "B12",
  href: "/products/b12",
  blurb: "Physician guided cellular health care, if prescribed.",
  navSubtitle: "Weekly B12, physician guided",
  imageSrc: COMPOUND_VIAL.b12,
  keywords: ["b12", "b 12", "cellular", "energy"],
};

const methyleneBlueItem: CatalogLink = {
  id: "methylene-blue",
  label: "Methylene Blue",
  href: "/products/methylene-blue",
  blurb: "Physician guided cellular health care, if prescribed.",
  navSubtitle: "A daily capsule for focus, physician guided",
  imageSrc: COMPOUND_VIAL["methylene-blue"],
  keywords: ["methylene blue", "meth blue", "cellular", "longevity"],
};

const lipoCItem: CatalogLink = {
  id: "lipo-c",
  label: "Lipo C",
  href: "/products/lipo-c",
  blurb: "Physician guided metabolic care, if prescribed.",
  navSubtitle: "Weekly lipotropic support, physician guided",
  imageSrc: COMPOUND_VIAL["lipo-c"],
  keywords: ["lipo", "lipo c", "weight", "metabolic"],
};

const bodyCompositionItem = menuLink(transformationGoal, {
  id: "body-composition",
  label: "Body Composition",
  href: "/treatments/body-composition",
  navSubtitle: "Composition and recovery",
  imageSrc: COMPOUND_VIAL["body-composition"],
  keywords: [...transformationGoal.keywords, "composition", "bundle"],
});

const completeStackItem: CatalogLink = {
  id: "complete-stack",
  label: "Complete Stack",
  href: "/treatments/complete-stack",
  blurb: "Physician guided stacked care, if prescribed.",
  navSubtitle: "Energy, repair, and metabolic care in one protocol",
  imageSrc: COMPOUND_VIAL["complete-stack"],
  keywords: ["complete", "stack", "bundle", "protocol"],
};

const leanCutItem: CatalogLink = {
  id: "lean-cut",
  label: "Lean & Cut",
  href: "/treatments/lean-cut",
  blurb: "Physician guided body composition care, if prescribed.",
  navSubtitle: "Dual action weight loss with hormone support",
  imageSrc: COMPOUND_VIAL["lean-cut"],
  keywords: ["lean", "cut", "bundle", "weight"],
};

const sexualHealthBundle = menuLink(sexualHealthGoal, {
  id: "sexual-health",
  label: "Sexual Health",
  imageSrc: COMPOUND_VIAL["sexual-health"],
});

const bloodTestItem = menuLink(LABS_ITEM, {
  id: "at-home-lab",
  label: "MD Reviewed Blood Test",
});

/**
 * Header Treatments dropdown. Products, bundles, and treatments from
 * Figma 1785:120977. Hrefs go to the catalog PDP for that item. Footer
 * and Ask TIDL stay goal framed.
 */
export const MEGA_MENU_GROUPS: readonly MegaMenuGroup[] = [
  {
    id: "products",
    title: "Products",
    items: [
      tirzepatideItem,
      semaglutideItem,
      b12Item,
      lipoCItem,
      methyleneBlueItem,
      sermorelinItem,
      tesamorelinItem,
      testosteroneItem,
      bloodTestItem,
    ],
  },
  {
    id: "bundles",
    title: "Product Bundles",
    items: [
      {
        id: "head-start",
        label: "Head Start",
        href: catalogHref("head-start"),
        blurb: "Physician stacked momentum, appetite, and energy, if prescribed.",
        navSubtitle: "GLP 1 starter, with a molecule choice",
        imageSrc: catalogProductSrc("head-start"),
        keywords: ["head", "start", "bundle"],
      },
      {
        id: "rest-rise",
        label: "Rest & Rise",
        href: catalogHref("rest-rise"),
        blurb: "Physician stacked overnight repair and morning energy, if prescribed.",
        navSubtitle: "Rest, repair, and rise",
        imageSrc: catalogProductSrc("rest-rise"),
        keywords: ["rest", "rise", "bundle"],
      },
      {
        id: "energy-lift",
        label: "Energy Lift",
        href: catalogHref("energy-lift"),
        blurb: "Physician stacked energy and stamina, if prescribed.",
        navSubtitle: "Energy, stamina, and focus",
        imageSrc: catalogProductSrc("energy-lift"),
        keywords: ["energy", "lift", "bundle"],
      },
      bodyCompositionItem,
      menuLink(catalogById(PROGRAMS, "transformation"), {
        id: "appetite-balance",
        label: "Appetite Balance",
      }),
      menuLink(catalogById(PROGRAMS, "creators"), {
        id: "focus",
        label: "Focus",
      }),
    ],
  },
  {
    id: "treatments",
    title: "Treatments",
    items: [
      catalogById(TREATMENTS, "weight-loss"),
      menuLink(catalogById(TREATMENTS, "womens-balance"), {
        id: "womens-total-balance",
        label: "Women's Total Balance",
      }),
      leanCutItem,
      completeStackItem,
      menuLink(catalogById(TREATMENTS, "mens-health"), {
        id: "mens-peak-performance",
        label: "Men's Peak Performance",
      }),
      catalogById(TREATMENTS, "sexual-health"),
      menuLink(catalogById(TREATMENTS, "recovery-performance"), {
        id: "repair-mobility",
        label: "Repair & Mobility",
      }),
      menuLink(catalogById(PROGRAMS, "athletes"), {
        id: "rest-rebuild",
        label: "Rest & Rebuild",
        navSubtitle: "Recovery, repair and sleep between sessions",
      }),
      menuLink(catalogById(PROGRAMS, "healthspan"), {
        id: "longevity",
        label: "Longevity",
      }),
      menuLink(catalogById(PROGRAMS, "parents"), {
        id: "stress-mood",
        label: "Stress & Mood",
      }),
      menuLink(catalogById(TREATMENTS, "skin-hair"), {
        id: "hair-skin-nails",
        label: "Hair, Skin & Nails",
      }),
    ],
  },
];

export const MEGA_MENU_ITEMS: readonly CatalogLink[] = MEGA_MENU_GROUPS.flatMap(
  (group) => group.items,
);

/**
 * Homepage header notecards. Figma product row from 1785:120977.
 */
export const HEADER_NOTECARDS: readonly CatalogLink[] = [
  tirzepatideItem,
  semaglutideItem,
  b12Item,
  lipoCItem,
  methyleneBlueItem,
  sermorelinItem,
  tesamorelinItem,
  testosteroneItem,
  bloodTestItem,
];

export const SUGGESTED_QUESTIONS = [
  "Which health goal fits quieting food noise?",
  "How does physician review work before a stack starts?",
  "What is the Appetite Balance treatment?",
  "I travel a lot. Which treatment should I look at?",
  "How is Balance & Beauty different from other hormone care?",
  "What should athletes know about Recovery & Performance?",
] as const;

export const ASK_COPY = {
  title: "Ask TIDL",
  subtitle: "Clinically trained answers with full context. Your provider still decides.",
  placeholder: "Ask about health goals, treatments, or how care works…",
  suggestionsLabel: "Suggested questions",
  recentLabel: "Recently asked",
  recentEmpty: "Your recent questions will show up here.",
  answerLabel: "Answer",
  exploreTreatments: "Health Goals",
  explorePrograms: "Treatments",
  askAgain: "Ask another question",
  loadingLabel: "Reviewing clinical context",
  shortcutHint: "Esc to close",
  disclaimer:
    "Educational guidance only. A licensed provider reviews your intake and decides what, if anything, is prescribed.",
} as const;

const DEFAULT_DISCLAIMER = ASK_COPY.disclaimer;

function scoreLink(query: string, link: CatalogLink): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const key of link.keywords) {
    if (q.includes(key)) score += key.length > 4 ? 3 : 2;
  }
  if (q.includes(link.label.toLowerCase())) score += 5;
  return score;
}

function topMatches(query: string, catalog: readonly CatalogLink[], limit = 3) {
  return [...catalog]
    .map((link) => ({ link, score: scoreLink(query, link) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.link);
}

function buildParagraphs(
  query: string,
  treatments: readonly CatalogLink[],
  programs: readonly CatalogLink[],
): string[] {
  const q = query.toLowerCase();
  const paragraphs: string[] = [];

  if (/physician|provider|review|intake|prescrib|how does|start|begin/.test(q)) {
    paragraphs.push(
      "Care on TIDL starts with your goals, not a product pitch. You share context through intake, a licensed provider reviews it, and only then is a plan offered if clinically appropriate.",
    );
    paragraphs.push(
      "Payment and clinical review are sequenced so you know what you are committing to before a prescription is written. Nothing ships without that review.",
    );
  }

  if (treatments.length > 0) {
    const names = treatments.map((t) => t.label).join(", ");
    paragraphs.push(
      `Based on what you asked, these health goals are the closest fit: ${names}. Each path is goal framed. A provider confirms whether a protocol is right for you, and only then is anything prescribed.`,
    );
  }

  if (programs.length > 0) {
    const names = programs.map((p) => p.label).join(", ");
    paragraphs.push(
      `On the treatments side, consider ${names}. Treatments group care around how you live and work, so the same clinical tools show up inside a rhythm that matches your calendar.`,
    );
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      "TIDL pairs health goals with lifestyle treatments. Health goals focus on a clinical need. Treatments organize that care around how you spend your days.",
    );
    paragraphs.push(
      "Browse the links below, or ask a more specific question about a health goal, a treatment, intake, or how provider review works. Answers stay educational. Your provider decides what, if anything, is prescribed.",
    );
  } else if (treatments.length === 0 && programs.length === 0) {
    paragraphs.push(
      "If you want a tighter answer, name a health goal (for example Weight Loss or Skin & Hair) or a treatment (for example Dynamic Training or Jetlag Recovery).",
    );
  }

  return paragraphs;
}

/** Client-side answer router. Swap for the clinically trained LLM endpoint later. */
export function answerAskTidl(query: string): AskAnswer {
  const trimmed = query.trim();
  let treatments = topMatches(trimmed, TREATMENTS);
  let programs = topMatches(trimmed, PROGRAMS);

  if (treatments.length === 0 && programs.length === 0) {
    treatments = TREATMENTS.slice(0, 3);
    programs = PROGRAMS.slice(0, 3);
  }

  return {
    paragraphs: buildParagraphs(trimmed, treatments, programs),
    treatments,
    programs,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
