import { valueFields } from "@/content/fixtures/value-fields";
import type { ThemeId } from "@/content/brand/peptide-identity";
import type { CategoryPdpData, PdpBenefitItem } from "@/content/pdp/types";
import { PDP_SHARED_FAQ_ORAL } from "@/content/pdp/pricing";
import {
  PDP_CARE_STAGES,
  PDP_DISCLAIMER,
  PDP_PAY_LINE,
  PDP_PLAN_LABEL,
  PDP_PLAN_OPTIONS,
  PDP_PROMO,
  PDP_PROOF_THUMB,
  PDP_QUALITY_BODY,
  PDP_QUALITY_METRICS,
  PDP_QUALITY_TITLE,
  PDP_SAFETY,
  PDP_SHARED_FAQ,
  PDP_SOCIAL,
  PDP_TRUST,
} from "@/content/pdp/shared";

const CALLOUT_LAYOUT = [
  { side: "left" as const, anchor: "cap" as const },
  { side: "right" as const, anchor: "label" as const },
  { side: "left" as const, anchor: "base" as const },
];

type Still = { src: string; label: string; swatch: string };

type HealthGoalSpec = {
  themeId: ThemeId;
  slug: string;
  entrySlug: string;
  title: string;
  tagline: string;
  metadataDescription: string;
  body: string;
  leadTitle: string;
  whatIsAnswer: string;
  vialSrc: string;
  fieldSrc: string;
  heroVideo: string;
  heroPoster: string;
  stills: readonly [Still, Still, Still];
  /** Oral tablet instead of the Flow pen / vial. */
  form?: "oral";
};

function fieldCard(id: ThemeId) {
  const item = valueFields.items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing value field for ${id}`);
  return item;
}

function callouts(id: ThemeId) {
  return fieldCard(id).notes.map((note, index) => ({
    chip: note.chip,
    body: note.title,
    ...CALLOUT_LAYOUT[index],
  }));
}

function benefits(id: ThemeId, stills: readonly Still[]): PdpBenefitItem[] {
  return fieldCard(id).notes.map((note, index) => {
    const still = stills[index] ?? stills[0];
    return {
      title: note.chip,
      description: note.sell,
      media: {
        id: `pdp.${id}.benefit-${index + 1}`,
        label: note.chip,
        swatch: still.swatch,
        note: still.label,
        src: still.src,
      },
    };
  });
}

function buildPdp(spec: HealthGoalSpec): CategoryPdpData {
  const notes = callouts(spec.themeId);
  const card = fieldCard(spec.themeId);
  const ctaHref = `/care/intake?entry=${spec.entrySlug}`;
  const [one, two, three] = spec.stills;

  return {
    metadataTitle: `TIDL · ${spec.title}`,
    metadataDescription: spec.metadataDescription,
    stockLabel: "Available",
    category: "Health goal",
    title: spec.title,
    themeId: spec.themeId,
    price: "$197",
    compareAtPrice: "$297",
    tagline: spec.tagline,
    primaryCta: "Get started",
    primaryCtaHref: ctaHref,
    body: spec.body,
    payLine: PDP_PAY_LINE,
    heroSrc: spec.vialSrc,
    heroCallouts: notes,
    trust: PDP_TRUST,
    planLabel: PDP_PLAN_LABEL,
    planOptions: PDP_PLAN_OPTIONS,
    promo: PDP_PROMO,
    gallery: {
      plates: [
        {
          id: `pdp.${spec.themeId}.hero`,
          label: `${spec.title} care`,
          swatch: "#1a222a",
          note: "Film",
          videoSrc: spec.heroVideo,
          poster: spec.heroPoster,
          src: spec.heroPoster,
          thumbSrc: one.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.themeId}.still-1`,
          label: one.label,
          swatch: one.swatch,
          note: "Lifestyle",
          src: one.src,
          thumbSrc: one.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.themeId}.still-2`,
          label: two.label,
          swatch: two.swatch,
          note: "Lifestyle",
          src: two.src,
          thumbSrc: two.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.themeId}.still-3`,
          label: three.label,
          swatch: three.swatch,
          note: "Lifestyle",
          src: three.src,
          thumbSrc: three.src,
          fit: "cover",
        },
      ],
      proofThumb: PDP_PROOF_THUMB,
    },
    buyBoxFaq: [
      spec.form === "oral" ? PDP_SHARED_FAQ_ORAL[0] : PDP_SHARED_FAQ[0],
      {
        id: "what-is",
        question: `What is ${spec.title} care at TIDL?`,
        answer: spec.whatIsAnswer,
      },
      ...(spec.form === "oral"
        ? PDP_SHARED_FAQ_ORAL.slice(1)
        : PDP_SHARED_FAQ.slice(1)),
    ],
    disclaimer: PDP_DISCLAIMER,
    safetyLink: PDP_SAFETY,
    lead: {
      title: spec.leadTitle,
      body: "Start with a free intake. A licensed clinician reviews your history and decides whether this path is right for you, if prescribed.",
      cta: { label: "Get started", href: "#buy" },
      media: {
        id: `pdp.${spec.themeId}.lead`,
        label: "Lead lifestyle",
        swatch: one.swatch,
        note: one.label,
        videoSrc: spec.heroVideo,
        poster: one.src,
        src: one.src,
      },
    },
    benefits: {
      headline: "Benefits",
      subtitle: card.lede,
      cta: { label: "Get started", href: "#buy" },
      items: benefits(spec.themeId, spec.stills),
    },
    social: PDP_SOCIAL,
    quality: {
      titleLines: PDP_QUALITY_TITLE,
      backgroundSrc: spec.fieldSrc,
      plate: {
        fieldSrc: spec.fieldSrc,
        vialSrc: spec.vialSrc,
        callouts: notes,
      },
      body: PDP_QUALITY_BODY,
      metrics: PDP_QUALITY_METRICS,
    },
    careFlow: {
      headline: "Step by Step Care",
      subtitle:
        "Intake, a clinician review, then a plan that fits, if prescribed.",
      stages: PDP_CARE_STAGES,
      collage: {
        hero: {
          id: `pdp.${spec.themeId}.flow-hero`,
          src: one.src,
          label: spec.title,
          swatch: one.swatch,
        },
        round: {
          id: `pdp.${spec.themeId}.flow-round`,
          src: spec.vialSrc,
          label:
            spec.form === "oral" ? spec.title : `${spec.title} vial`,
          swatch: "#fbf9f6",
          fit: "contain",
          vivid: false,
          bloom: true,
        },
        inset: {
          id: `pdp.${spec.themeId}.flow-inset`,
          src: two.src,
          label: two.label,
          swatch: two.swatch,
        },
      },
    },
  };
}

const SPECS: readonly HealthGoalSpec[] = [
  {
    themeId: "mens-health",
    slug: "mens-health",
    entrySlug: "testosterone",
    title: "Energy & Strength",
    tagline: "Physician guided men's care",
    metadataDescription:
      "Physician guided men's care for energy, lean mass, and drive. Available if prescribed after clinical review.",
    body: "Energy, lean mass, and drive as one protocol, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Energy goals,\nlean mass support,\nclinician guided care",
    whatIsAnswer:
      "A health goal for men whose energy, body composition, and drive have slipped together. The visit covers daytime energy, lean mass, and libido as one protocol. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/mens-health.png?v=3",
    fieldSrc: "/landing/lifestyle/mens-health-field.png",
    heroVideo: "/landing/hero/mens-health.mp4",
    heroPoster: "/landing/hero/mens-health.jpg",
    stills: [
      { src: "/landing/imagery/testosterone/01-locker-room.png", label: "Locker", swatch: "#3a4a5c" },
      { src: "/landing/imagery/testosterone/02-chalk-crop.png", label: "Chalk", swatch: "#5c4a3a" },
      { src: "/landing/imagery/testosterone/03-gym-floor.png", label: "Gym", swatch: "#4a5c58" },
    ],
  },
  {
    themeId: "sexual-health",
    slug: "sexual-health",
    entrySlug: "sexual-health",
    title: "Sexual Health",
    tagline: "Physician guided intimate care",
    metadataDescription:
      "Physician guided care for desire and reliability. Available if prescribed after clinical review.",
    body: "Desire and reliability, reviewed in private, if prescribed after clinical review. An oral tablet from a US based compounding pharmacy.",
    leadTitle: "Desire,\nreliability,\nclinician guided care",
    whatIsAnswer:
      "A health goal when intimacy is the reason for the visit. Desire and reliability, reviewed in private by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/brand/pills/category-sexual-health.png?v=6",
    form: "oral",
    fieldSrc: "/landing/lifestyle/sexual-health-field.png",
    heroVideo: "/landing/hero/sexual-health.mp4",
    heroPoster: "/landing/hero/sexual-health.jpg",
    stills: [
      { src: "/landing/imagery/sexual-health/01-evening-in.png", label: "Evening in", swatch: "#4a3a48" },
      { src: "/landing/imagery/sexual-health/02-linen-crop.png", label: "Linen crop", swatch: "#6a5a4a" },
      { src: "/landing/imagery/sexual-health/03-nightstand.png", label: "Nightstand", swatch: "#3a3a42" },
    ],
  },
  {
    themeId: "womens-balance",
    slug: "womens-balance",
    entrySlug: "womens-balance",
    title: "Balance & Beauty",
    tagline: "Physician guided women's care",
    metadataDescription:
      "Physician guided women's care for energy, mood, and metabolic shifts. Available if prescribed after clinical review.",
    body: "Energy, mood, and metabolic support as physiology shifts, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Energy,\nmetabolic support,\nclinician guided care",
    whatIsAnswer:
      "A health goal for energy, mood, weight, and desire as physiology shifts across cycle, perimenopause, and menopause. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/womens-balance.png?v=4",
    fieldSrc: "/landing/lifestyle/womens-balance-field.png",
    heroVideo: "/landing/hero/womens-balance.mp4",
    heroPoster: "/landing/hero/womens-balance.jpg",
    stills: [
      { src: "/landing/imagery/womens-balance/01-morning-stretch.png", label: "Stretch", swatch: "#6a5c58" },
      { src: "/landing/imagery/womens-balance/02-tea-crop.png", label: "Tea", swatch: "#8a7a6a" },
      { src: "/landing/imagery/womens-balance/03-windowsill.png", label: "Windowsill", swatch: "#7a8a7a" },
    ],
  },
  {
    themeId: "recovery-performance",
    slug: "recovery-and-performance",
    entrySlug: "recovery-performance",
    title: "Recovery & Performance",
    tagline: "Physician guided recovery care",
    metadataDescription:
      "Physician guided care for soreness, tissue, and the days between sessions. Available if prescribed after clinical review.",
    body: "Soreness, tissue, and mobility when the gap is not another training plan, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Recovery,\ntissue repair,\nclinician guided care",
    whatIsAnswer:
      "A health goal for tissue, soreness, and mobility when the gap is not another training plan. The visit is the days between sessions. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/recovery-performance.png?v=4",
    fieldSrc: "/landing/lifestyle/recovery-performance-field.png",
    heroVideo: "/landing/hero/recovery-and-performance.mp4",
    heroPoster: "/landing/hero/recovery-and-performance.jpg",
    stills: [
      { src: "/landing/imagery/recovery-performance/01-stretch.png", label: "Stretch", swatch: "#4a5c6a" },
      { src: "/landing/imagery/recovery-performance/02-tape-crop.png", label: "Tape", swatch: "#5c6a4a" },
      { src: "/landing/imagery/recovery-performance/03-bench.png", label: "Bench", swatch: "#3a4a52" },
    ],
  },
  {
    themeId: "skin-hair",
    slug: "skin-and-hair",
    entrySlug: "skin-hair",
    title: "Skin & Hair",
    tagline: "Physician guided skin and hair care",
    metadataDescription:
      "Physician guided care for hair you want to keep and skin quality a cream does not reach. Available if prescribed after clinical review.",
    body: "Hair you want to keep and skin quality a topical does not reach, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Hair you want to keep,\nskin quality,\nclinician guided care",
    whatIsAnswer:
      "A health goal for thinning hair and for skin quality that a cream does not reach. Built to act while there is still hair to keep. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/skin-hair.png?v=4",
    fieldSrc: "/landing/lifestyle/skin-hair-field.png",
    heroVideo: "/landing/hero/skin-and-hair.mp4",
    heroPoster: "/landing/hero/skin-and-hair.jpg",
    stills: [
      { src: "/landing/imagery/skin-hair/01-bathroom-light.png", label: "Bathroom", swatch: "#6a5a58" },
      { src: "/landing/imagery/skin-hair/02-face-crop.png", label: "Face", swatch: "#8a7a72" },
      { src: "/landing/imagery/skin-hair/03-vanity.png", label: "Vanity", swatch: "#5c4a48" },
    ],
  },
];

export const HEALTH_GOAL_PDPS: Record<string, CategoryPdpData> = Object.fromEntries(
  SPECS.map((spec) => [spec.slug, buildPdp(spec)]),
);

export const HEALTH_GOAL_SLUGS = SPECS.map((spec) => spec.slug);
