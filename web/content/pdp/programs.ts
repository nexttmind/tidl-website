import { valueFields } from "@/content/fixtures/value-fields";
import type { CategoryPairingData } from "@/components/category/CategoryPairing";
import type { ThemeId } from "@/content/brand/peptide-identity";
import type { CategoryPdpData, PdpBenefitItem } from "@/content/pdp/types";
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

type ProgramSpec = {
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
  pairing?: Omit<CategoryPairingData, "cta" | "title">;
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

function buildPdp(spec: ProgramSpec): CategoryPdpData {
  const notes = callouts(spec.themeId);
  const card = fieldCard(spec.themeId);
  const ctaHref = `/care/intake?entry=${spec.entrySlug}`;
  const [one, two, three] = spec.stills;

  return {
    metadataTitle: `TIDL · ${spec.title}`,
    metadataDescription: spec.metadataDescription,
    stockLabel: "Available",
    category: "Program",
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
      PDP_SHARED_FAQ[0],
      {
        id: "what-is",
        question: `What is ${spec.title} care at TIDL?`,
        answer: spec.whatIsAnswer,
      },
      ...PDP_SHARED_FAQ.slice(1),
    ],
    disclaimer: PDP_DISCLAIMER,
    safetyLink: PDP_SAFETY,
    lead: {
      title: spec.leadTitle,
      body: "Start with a free intake. A licensed clinician reviews your history and decides whether this program is right for you, if prescribed.",
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
          label: `${spec.title} vial`,
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
    pairing: spec.pairing
      ? {
          title: "Complete your routine",
          cta: { label: "Get started", href: ctaHref },
          ...spec.pairing,
        }
      : undefined,
  };
}

const SPECS: readonly ProgramSpec[] = [
  {
    themeId: "athlete",
    slug: "athletes",
    entrySlug: "athletes",
    title: "Dynamic Training",
    tagline: "Physician guided athletic care",
    metadataDescription:
      "Physician guided care for the days between sessions. Tissue, sleep, and capacity. Available if prescribed after clinical review.",
    body: "Tissue, sleep, and capacity when soreness still sets the calendar, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Recovery,\ntissue repair,\nclinician guided care",
    whatIsAnswer:
      "A program for the days between sessions. Tissue, joints, and sleep, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/athlete.png?v=5",
    fieldSrc: "/landing/lifestyle/athlete-field.png",
    heroVideo: "/landing/hero/athletes.mp4",
    heroPoster: "/landing/hero/athletes.jpg",
    stills: [
      { src: "/landing/imagery/athletes/01-joyful-hold.png", label: "Hold", swatch: "#8a8789" },
      { src: "/landing/imagery/athletes/02-close-up-crop.png", label: "Crop", swatch: "#532e1c" },
      { src: "/landing/imagery/athletes/03-trackside.png", label: "Track", swatch: "#5f5c5d" },
    ],
    pairing: {
      fieldSrc: "/landing/section-2/fields/athlete.png",
      left: {
        id: "recovery-performance",
        vialSrc: "/landing/shop/pairing/recovery-upright.png",
        baseX: 0.497,
        width: 476,
        height: 986,
      },
      right: {
        id: "transformation",
        vialSrc: "/landing/shop/pairing/transformation-upright.png",
        baseX: 0.5,
        width: 468,
        height: 971,
      },
      leftBody:
        "A stack for soreness, wear, and the weeks lost to not bouncing back. Available after clinical review.",
      rightBody:
        "A physician guided GLP 1 stack for appetite, composition, and the months it takes. Available after clinical review.",
    },
  },
  {
    themeId: "creative",
    slug: "creators-and-builders",
    entrySlug: "creators",
    title: "Focus",
    tagline: "Physician guided care for makers",
    metadataDescription:
      "Physician guided care for long sessions, late hours, and a nervous system that never clocks out. Available if prescribed after clinical review.",
    body: "Long sessions, late hours, and a nervous system that never clocks out, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Focus,\nrest,\nclinician guided care",
    whatIsAnswer:
      "A program for people who ship creative work. Focus, rest, and the load of chronic pressure, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/creative.png?v=3",
    fieldSrc: "/landing/lifestyle/creative-field.png",
    heroVideo: "/landing/hero/creators-and-builders.mp4",
    heroPoster: "/landing/hero/creators-and-builders.jpg",
    stills: [
      { src: "/landing/imagery/creators/01-screen-hold.png", label: "Screen", swatch: "#040809" },
      { src: "/landing/imagery/creators/02-desk-crop.png", label: "Desk", swatch: "#291f1c" },
      { src: "/landing/imagery/creators/03-workbench.png", label: "Workbench", swatch: "#161818" },
    ],
  },
  {
    themeId: "executive",
    slug: "ceos-and-executives",
    entrySlug: "executives",
    title: "Peak Performance",
    tagline: "Physician guided executive care",
    metadataDescription:
      "Physician guided care for a calendar that does not flex. Energy, composition, and stamina. Available if prescribed after clinical review.",
    body: "Energy, composition, and stamina when hour ten is still the job, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Stamina,\ncomposition,\nclinician guided care",
    whatIsAnswer:
      "A program for high demand calendars. Stamina, composition, and clear decisions across a long day, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/executive.png?v=3",
    fieldSrc: "/landing/lifestyle/executive-field.png",
    heroVideo: "/landing/hero/ceos-and-executives.mp4",
    heroPoster: "/landing/hero/ceos-and-executives.jpg",
    stills: [
      { src: "/landing/imagery/executives/01-corridor.png", label: "Corridor", swatch: "#5f6b6e" },
      { src: "/landing/imagery/executives/02-desk-crop.png", label: "Desk", swatch: "#0e0702" },
      { src: "/landing/imagery/executives/03-window-ledge.png", label: "Ledge", swatch: "#0a293f" },
    ],
  },
  {
    themeId: "legacy",
    slug: "healthspan",
    entrySlug: "healthspan",
    title: "Healthspan",
    tagline: "Physician guided longevity care",
    metadataDescription:
      "Physician guided care for function and capacity as the years add up. Available if prescribed after clinical review.",
    body: "Function and capacity as the years add up, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Metabolic support,\ncapacity,\nclinician guided care",
    whatIsAnswer:
      "A program for function you still want to use. Metabolic drift, strength, and a physician reading your numbers, not an average. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/legacy.png?v=6",
    fieldSrc: "/landing/lifestyle/legacy-field.png",
    heroVideo: "/landing/hero/healthspan.mp4",
    heroPoster: "/landing/hero/healthspan.jpg",
    stills: [
      { src: "/landing/imagery/healthspan/01-kitchen-morning.png", label: "Kitchen", swatch: "#b6b9bc" },
      { src: "/landing/imagery/healthspan/02-hands-crop.png", label: "Hands", swatch: "#6b331a" },
      { src: "/landing/imagery/healthspan/03-park-path.png", label: "Park", swatch: "#444523" },
    ],
  },
  {
    themeId: "parents",
    slug: "parents",
    entrySlug: "parents",
    title: "Stress & Mood",
    tagline: "Physician guided care for parents",
    metadataDescription:
      "Physician guided care for energy, rest, and the load of a household. Available if prescribed after clinical review.",
    body: "Energy, rest, and the load of a household when more hours are not an option, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Energy,\nrest,\nclinician guided care",
    whatIsAnswer:
      "A program for the version of you that still has something left after work and bedtime. Energy, rest, and household load, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/parents.png?v=3",
    fieldSrc: "/landing/lifestyle/parents-field.png",
    heroVideo: "/landing/hero/parents.mp4",
    heroPoster: "/landing/hero/parents.jpg",
    stills: [
      { src: "/landing/imagery/parents/01-after-the-rush.png", label: "Rush", swatch: "#271f19" },
      { src: "/landing/imagery/parents/02-counter-crop.png", label: "Counter", swatch: "#6e5d4e" },
      { src: "/landing/imagery/parents/03-back-steps.png", label: "Steps", swatch: "#20170d" },
    ],
  },
  {
    themeId: "traveler",
    slug: "travelers",
    entrySlug: "travelers",
    title: "Jetlag Recovery",
    tagline: "Physician guided travel care",
    metadataDescription:
      "Physician guided care that holds across time zones, hotel sleep, and missed training. Available if prescribed after clinical review.",
    body: "A pre dosed plan that holds across time zones, hotel sleep, and missed training, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
    leadTitle: "Rhythm,\nrecovery,\nclinician guided care",
    whatIsAnswer:
      "A program that does not pause at the gate. Rhythm, recovery, and continuity across time zones, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    vialSrc: "/pdp/cutouts/traveler.png?v=3",
    fieldSrc: "/landing/lifestyle/traveler-field.png",
    heroVideo: "/landing/hero/travelers.mp4",
    heroPoster: "/landing/hero/travelers.jpg",
    stills: [
      { src: "/landing/imagery/travelers/01-hotel-window.png", label: "Hotel", swatch: "#37281a" },
      { src: "/landing/imagery/travelers/02-passport-crop.png", label: "Passport", swatch: "#050c0c" },
      { src: "/landing/imagery/travelers/03-nightstand.png", label: "Nightstand", swatch: "#151c15" },
    ],
  },
];

export const PROGRAM_PDPS: Record<string, CategoryPdpData> = Object.fromEntries(
  SPECS.map((spec) => [spec.slug, buildPdp(spec)]),
);

export const PROGRAM_SLUGS = SPECS.map((spec) => spec.slug);
