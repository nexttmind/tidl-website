/** Ask TIDL AI — catalog, starters, and answer routing. Goal framed. No molecule names. */

import {
  CATALOG_HREF,
  catalogMenuPairSrc,
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
  /** Title language line under the label in the mega menu. */
  navSubtitle?: string;
};

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
    navSubtitle: "Quiet The Food Noise",
    imageSrc: catalogVialSrc("weight-loss"),
    keywords: ["weight", "metabolic", "appetite", "food noise", "body composition"],
  },
  {
    id: "sexual-health",
    label: "Sexual Health",
    href: "/treatments/sexual-health",
    blurb: "Private care for better intimacy and confidence.",
    navSubtitle: "Have Better Sex",
    imageSrc: catalogVialSrc("sexual-health"),
    keywords: ["sexual", "intimacy", "libido", "erectile"],
  },
  {
    id: "mens-health",
    label: "Energy & Strength",
    href: "/treatments/mens-health",
    blurb: "Wake up with energy, drive, and room to recover.",
    navSubtitle: "Take Back Your Mornings",
    imageSrc: catalogVialSrc("mens-health"),
    keywords: ["testosterone", "trt", "hormone", "low t", "energy", "strength", "men"],
  },
  {
    id: "womens-balance",
    label: "Balance & Beauty",
    href: "/treatments/womens-balance",
    blurb: "Care that keeps pace with every hormonal chapter.",
    navSubtitle: "Steady Through Every Shift",
    imageSrc: catalogVialSrc("womens-balance"),
    keywords: ["women", "woman", "perimenopause", "menopause", "cycle", "balance", "beauty"],
  },
  {
    id: "recovery-performance",
    label: "Recovery & Performance",
    href: "/treatments/recovery-and-performance",
    blurb: "Bounce back faster between the sessions that matter.",
    navSubtitle: "Recover Ready For More",
    imageSrc: catalogVialSrc("recovery-performance"),
    keywords: ["recovery", "performance", "training", "soreness", "muscle"],
  },
  {
    id: "skin-hair",
    label: "Skin & Hair",
    href: "/treatments/skin-and-hair",
    blurb: "Clarity in the mirror. Density you can feel.",
    navSubtitle: "Glow Inside And Out",
    imageSrc: catalogVialSrc("skin-hair"),
    keywords: ["skin", "hair", "acne", "thinning"],
  },
] as const;

export const PROGRAMS: readonly CatalogLink[] = [
  {
    id: "executives",
    label: "Peak Performance",
    href: "/programs/ceos-and-executives",
    blurb: "High output care for people who live in meetings.",
    navSubtitle: "Find Peak Performance",
    imageSrc: catalogVialSrc("executive"),
    keywords: ["ceo", "executive", "founder", "leadership", "board"],
  },
  {
    id: "transformation",
    label: "Appetite Balance",
    href: "/stacks/transformation",
    blurb: "A full reset for mind, body, and the days between.",
    navSubtitle: "Time To Transform",
    imageSrc: catalogVialSrc("transformation"),
    keywords: ["transformation", "mind", "body", "reset", "change", "appetite"],
  },
  {
    id: "healthspan",
    label: "Healthspan",
    href: "/programs/healthspan",
    blurb: "Care built for the years you want to feel capable.",
    navSubtitle: "Build Your Legacy",
    imageSrc: catalogVialSrc("legacy"),
    keywords: ["healthspan", "longevity", "aging", "legacy"],
  },
  {
    id: "parents",
    label: "Stress & Mood",
    href: "/programs/parents",
    blurb: "Care that respects sleep debt, school runs, and real life.",
    navSubtitle: "Create Balance",
    imageSrc: catalogVialSrc("parents"),
    keywords: ["parent", "parents", "mom", "dad", "family", "stress", "mood"],
  },
  {
    id: "athletes",
    label: "Dynamic Training",
    href: "/programs/athletes",
    blurb: "Train hard. Recover harder. Show up ready.",
    navSubtitle: "Train Harder",
    imageSrc: catalogVialSrc("athlete"),
    keywords: ["athlete", "athletes", "sport", "compete", "training", "improve"],
  },
  {
    id: "creators",
    label: "Focus",
    href: "/programs/creators-and-builders",
    blurb: "Focus and stamina for people who ship creative work.",
    navSubtitle: "Find Your Focus",
    imageSrc: catalogVialSrc("creative"),
    keywords: ["creator", "creative", "builder", "maker", "studio", "focus"],
  },
  {
    id: "travelers",
    label: "Jetlag Recovery",
    href: "/programs/travelers",
    blurb: "Stay steady across time zones, flights, and long trips.",
    navSubtitle: "Travel With Ease",
    imageSrc: catalogVialSrc("traveler"),
    keywords: ["travel", "traveler", "flight", "jet lag", "timezone"],
  },
] as const;

/** Topical catalog. Last mega menu slot, beside Jetlag Recovery. */
export const PAIN_RELIEF: CatalogLink = {
  id: "pain-relief",
  label: painReliefCopy.title,
  href: PAIN_RELIEF_HREF,
  blurb: painReliefCopy.lede,
  navSubtitle: "For Sore Days",
  imageSrc: painReliefMenuSrc,
  keywords: ["pain", "sore", "topical", "spray", "cream", "roll on"],
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
  navSubtitle: "Browse The Catalog",
  imageSrc: catalogMenuPairSrc,
  keywords: ["all", "catalog", "browse", "treatments"],
};

/** Treatments mega menu. Same as the footer list, plus the catalog index. */
export const MEGA_MENU_ITEMS: readonly CatalogLink[] = [
  ...ALL_TREATMENTS,
  CATALOG_INDEX,
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
