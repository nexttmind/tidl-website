import { pdpStageSrc, shopCatalogItem } from "@/components/home/shop-catalog";
import { catalogHref, catalogRoute } from "@/content/catalog/routes";
import { intakeHref } from "@/content/clinical/entry-map";
import { CATALOG_PRICE } from "@/content/fixtures/catalog";
import { painReliefStartsAt } from "@/content/fixtures/pain-relief";
import { PDP_DEK } from "@/content/pdp/dek";
import { launchStartsAtLabel } from "@/content/pdp/launch-pricing";
import { PDP_SHARED_FAQ_ORAL } from "@/content/pdp/pricing";
import {
  CATALOG_PDP_BY_ID,
  CATALOG_PDP_SPECS,
  type CatalogPdpSpec,
} from "@/content/pdp/catalog-specs";
import {
  PDP_CARE_STAGES,
  PDP_COMPLIANCE_LINE,
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
import type { CategoryPdpData, PdpBenefitItem } from "@/content/pdp/types";

const CALLOUT_LAYOUT = [
  { side: "left" as const, anchor: "cap" as const },
  { side: "right" as const, anchor: "label" as const },
  { side: "left" as const, anchor: "base" as const },
];

const BMI = {
  title: "BMI Calculator",
  body: "BMI uses height and weight to estimate whether your weight falls in a common range for your height. It is an educational screen, not a diagnosis.",
  disclaimer:
    "BMI does not measure body fat directly and may misclassify people with high muscle mass, pregnancy, older adults, children, or certain medical conditions.",
  mediaSrc: "/landing/lifestyle/womens-health-coast.png",
} as const;

const KIND_LABEL = {
  product: "Product",
  bundle: "Bundle",
  treatment: "Treatment",
} as const;

function callouts(spec: CatalogPdpSpec) {
  return spec.chips.map((chip, index) => ({
    chip,
    body: spec.callouts[index],
    ...CALLOUT_LAYOUT[index],
  }));
}

function benefits(spec: CatalogPdpSpec): PdpBenefitItem[] {
  return spec.chips.map((chip, index) => {
    const still = spec.stills[index] ?? spec.stills[0];
    return {
      title: chip,
      description: spec.sells[index],
      media: {
        id: `pdp.${spec.id}.benefit-${index + 1}`,
        label: chip,
        swatch: still.swatch,
        note: still.label,
        src: still.src,
      },
    };
  });
}

function buildPdp(spec: CatalogPdpSpec): CategoryPdpData {
  const route = catalogRoute(spec.id);
  if (!route) throw new Error(`Missing catalog route for ${spec.id}`);
  const art = shopCatalogItem(spec.id);
  const notes = callouts(spec);
  const [one, two, three] = spec.stills;
  const vialSrc =
    pdpStageSrc(spec.id) ??
    art?.vialSrc ??
    `/landing/shop/catalog/vials/${spec.id}.png`;
  const fieldSrc = art?.plateSrc ?? `/landing/shop/catalog/plates/${spec.id}.png`;
  const ctaHref =
    spec.form === "otc" ? "/pain-relief" : intakeHref(route.entrySlug);
  const leadBody =
    spec.form === "kit"
      ? "Order the kit. Collect at home. Portal results land in seventy two hours."
      : spec.form === "otc"
        ? "Shop the topical line. No clinician review required to order."
        : "Start with a free intake. A licensed clinician reviews your history and decides whether this path is right for you, if prescribed.";
  const faqBase = spec.form === "oral" ? PDP_SHARED_FAQ_ORAL : PDP_SHARED_FAQ;

  return {
    metadataTitle: `TIDL · ${spec.title}`,
    metadataDescription: spec.metadataDescription,
    stockLabel: spec.form === "otc" ? "In stock" : "Available",
    category: KIND_LABEL[route.kind],
    title: spec.title,
    themeId: route.themeId,
    catalogId: spec.id,
    barrageGraphic: spec.id,
    price:
      spec.form === "otc"
        ? painReliefStartsAt()
        : (launchStartsAtLabel(spec.id) ?? "Shop"),
    compareAtPrice: "",
    tagline: spec.tagline,
    dek: PDP_DEK[spec.id],
    primaryCta: spec.form === "otc" ? "Shop Pain Relief" : "Start your assessment",
    primaryCtaHref: ctaHref,
    complianceLine:
      spec.form === "kit" || spec.form === "otc"
        ? undefined
        : PDP_COMPLIANCE_LINE,
    body: spec.body,
    payLine: spec.form === "kit" || spec.form === "otc" ? "" : PDP_PAY_LINE,
    heroSrc: pdpStageSrc(spec.id) ?? vialSrc,
    heroCallouts: notes,
    trust: PDP_TRUST,
    planLabel: PDP_PLAN_LABEL,
    planOptions: spec.form === "kit" || spec.form === "otc" ? [] : PDP_PLAN_OPTIONS,
    promo: PDP_PROMO,
    gallery: {
      plates: [
        {
          id: `pdp.${spec.id}.hero`,
          label: `${spec.title} care`,
          swatch: "#1a222a",
          note: "Film",
          videoSrc: spec.video,
          poster: spec.poster,
          src: spec.poster,
          thumbSrc: one.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.id}.still-1`,
          label: one.label,
          swatch: one.swatch,
          note: "Lifestyle",
          src: one.src,
          thumbSrc: one.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.id}.still-2`,
          label: two.label,
          swatch: two.swatch,
          note: "Lifestyle",
          src: two.src,
          thumbSrc: two.src,
          fit: "cover",
        },
        {
          id: `pdp.${spec.id}.still-3`,
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
      faqBase[0],
      {
        id: "what-is",
        question: `What is ${spec.title} at TIDL?`,
        answer: spec.whatIs,
      },
      ...faqBase.slice(1),
    ],
    disclaimer: PDP_DISCLAIMER,
    safetyLink: PDP_SAFETY,
    lead: {
      title: spec.leadTitle,
      body: leadBody,
      cta: {
        label: spec.form === "otc" ? "Shop Pain Relief" : "Start your assessment",
        href: spec.form === "otc" ? ctaHref : "#buy",
      },
      media: {
        id: `pdp.${spec.id}.lead`,
        label: "Lead lifestyle",
        swatch: one.swatch,
        note: one.label,
        videoSrc: spec.video,
        poster: one.src,
        src: one.src,
      },
    },
    benefits: {
      headline: "Benefits",
      subtitle: spec.tagline,
      cta: { label: "Start your assessment", href: "#buy" },
      items: benefits(spec),
    },
    social: PDP_SOCIAL,
    bmi: spec.bmi ? BMI : undefined,
    quality: {
      titleLines: PDP_QUALITY_TITLE,
      backgroundSrc: fieldSrc,
      plate: {
        fieldSrc,
        vialSrc,
        callouts: notes,
      },
      body: PDP_QUALITY_BODY,
      metrics: PDP_QUALITY_METRICS,
    },
    careFlow: {
      headline: spec.form === "otc" ? "How it works" : "Step by Step Care",
      subtitle:
        spec.form === "kit"
          ? "Order the kit. Collect. Read results in the portal."
          : spec.form === "otc"
            ? "Shop the topical line. Use as directed on the label."
            : "Intake, a clinician review, then a plan that fits, if prescribed.",
      stages: PDP_CARE_STAGES,
      collage: {
        hero: {
          id: `pdp.${spec.id}.flow-hero`,
          src: one.src,
          label: spec.title,
          swatch: one.swatch,
        },
        round: {
          id: `pdp.${spec.id}.flow-round`,
          src: vialSrc,
          label: spec.form === "oral" || spec.form === "kit" ? spec.title : `${spec.title} vial`,
          swatch: "#fbf9f6",
          fit: "contain",
          vivid: false,
          bloom: true,
        },
        inset: {
          id: `pdp.${spec.id}.flow-inset`,
          src: two.src,
          label: two.label,
          swatch: two.swatch,
        },
      },
    },
  };
}

export const CATALOG_PDPS: Readonly<Record<string, CategoryPdpData>> =
  Object.fromEntries(
    CATALOG_PDP_SPECS.filter((spec) => spec.form !== "otc").map(
      (spec) => [spec.id, buildPdp(spec)],
    ),
  );

export function catalogPdp(id: string): CategoryPdpData | undefined {
  return CATALOG_PDPS[id];
}

export function catalogPdpSlugs(kind: "product" | "bundle" | "treatment"): string[] {
  return CATALOG_PDP_SPECS.filter((spec) => {
    if (spec.form === "kit" || spec.form === "otc") return false;
    const route = catalogRoute(spec.id);
    return route?.kind === kind;
  }).map((spec) => spec.id);
}

export const CATALOG_GUIDE_NOTES = CATALOG_PDP_SPECS.map((spec) => ({
  id: spec.id,
  title: spec.title,
  tagline: spec.tagline,
  href: catalogHref(spec.id),
  notes: spec.chips.map((chip, index) => ({
    chip,
    title: spec.callouts[index],
  })),
  stack: spec.whatIs,
  mood: spec.body,
}));

export const CATALOG_NOTECARD_BODY: Readonly<Record<string, string>> =
  Object.fromEntries(CATALOG_PDP_SPECS.map((spec) => [spec.id, spec.body]));

export { CATALOG_PRICE };
