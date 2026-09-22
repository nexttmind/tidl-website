/** Transformation stack PDP. Goal framed. No molecule names. No outcome claims. */

import type { CategoryPdpData } from "@/content/pdp/types";
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

const CALLOUTS = [
  {
    chip: "Appetite",
    body: "Built for food noise that has been running the day",
    side: "left" as const,
    anchor: "cap" as const,
  },
  {
    chip: "Muscle",
    body: "Built for losing fat without giving up lean mass",
    side: "right" as const,
    anchor: "label" as const,
  },
  {
    chip: "Guidance",
    body: "Built for a physician adjusting the protocol as you go",
    side: "left" as const,
    anchor: "base" as const,
  },
] as const;

const CTA_HREF = "/care/intake?entry=transformation";

export const transformationPdp: CategoryPdpData = {
  metadataTitle: "TIDL · Appetite Balance",
  metadataDescription:
    "Physician guided GLP 1 stack for appetite, composition, and the months it takes. Available if prescribed after clinical review.",
  stockLabel: "Available",
  category: "Stack",
  title: "Appetite Balance",
  themeId: "transformation",
  price: "$197",
  compareAtPrice: "$297",
  tagline: "Physician guided GLP 1 stack",
  primaryCta: "Get started",
  primaryCtaHref: CTA_HREF,
  body: "Appetite, composition, and the months it takes, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
  payLine: PDP_PAY_LINE,
  heroSrc: "/pdp/cutouts/transformation.png?v=4",
  heroCallouts: CALLOUTS,
  trust: PDP_TRUST,
  planLabel: PDP_PLAN_LABEL,
  planOptions: PDP_PLAN_OPTIONS,
  promo: PDP_PROMO,
  gallery: {
    plates: [
      {
        id: "pdp.transformation.hero",
        label: "Appetite Balance care",
        swatch: "#1c2438",
        note: "Film",
        videoSrc: "/landing/hero/transformation.mp4",
        poster: "/landing/hero/transformation.jpg",
        src: "/landing/hero/transformation.jpg",
        thumbSrc: "/landing/lifestyle/transformation-dressed.png",
        fit: "cover",
      },
      {
        id: "pdp.transformation.dressed",
        label: "Dressed",
        swatch: "#1e241f",
        note: "Lifestyle",
        src: "/landing/lifestyle/transformation-dressed.png",
        thumbSrc: "/landing/lifestyle/transformation-dressed.png",
        fit: "cover",
      },
      {
        id: "pdp.transformation.fabric",
        label: "Fabric",
        swatch: "#6b6662",
        note: "Lifestyle",
        src: "/landing/lifestyle/transformation-fabric.png",
        thumbSrc: "/landing/lifestyle/transformation-fabric.png",
        fit: "cover",
      },
      {
        id: "pdp.transformation.dresser",
        label: "Dresser",
        swatch: "#454237",
        note: "Lifestyle",
        src: "/landing/lifestyle/transformation-dresser.png",
        thumbSrc: "/landing/lifestyle/transformation-dresser.png",
        fit: "cover",
      },
    ],
    proofThumb: PDP_PROOF_THUMB,
  },
  buyBoxFaq: [
    PDP_SHARED_FAQ[0],
    {
      id: "what-is",
      question: "What is Appetite Balance care at TIDL?",
      answer:
        "A stack for appetite, composition, and the months it takes, reviewed by a physician. Available if prescribed after clinical review. Molecule details appear only after login, inside intake, and on the prescription.",
    },
    ...PDP_SHARED_FAQ.slice(1),
  ],
  disclaimer: PDP_DISCLAIMER,
  safetyLink: PDP_SAFETY,
  lead: {
    title: "Appetite goals,\nlean mass support,\nclinician guided care",
    body: "Start with a free intake. A licensed clinician reviews your history and decides whether this stack is right for you, if prescribed.",
    cta: { label: "Get started", href: "#buy" },
    media: {
      id: "pdp.transformation.lead",
      label: "Lead lifestyle",
      swatch: "#1e241f",
      note: "Dressed",
      videoSrc: "/landing/hero/transformation.mp4",
      poster: "/landing/lifestyle/transformation-dressed.png",
      src: "/landing/lifestyle/transformation-dressed.png",
    },
  },
  benefits: {
    headline: "Benefits",
    subtitle:
      "A physician guided GLP 1 stack for appetite, composition, and the months it takes. Available if prescribed.",
    cta: { label: "Get started", href: "#buy" },
    items: [
      {
        title: "Appetite",
        description:
          "The day has been organized around the next meal. This stack is built to change that, with a physician on the protocol, not another set of rules.",
        media: {
          id: "pdp.transformation.benefit-1",
          label: "Appetite",
          swatch: "#1e241f",
          note: "Dressed",
          src: "/landing/imagery/transformation/01-getting-dressed.png",
        },
      },
      {
        title: "Muscle",
        description:
          "Keep the shape you trained for. The protocol treats composition as the job, not a side effect of eating less.",
        media: {
          id: "pdp.transformation.benefit-2",
          label: "Muscle",
          swatch: "#6b6662",
          note: "Fabric",
          src: "/landing/imagery/transformation/02-fabric-crop.png",
        },
      },
      {
        title: "Guidance",
        description:
          "A physician stays in it after the first month. Dose, pace, and hold points move with how you actually respond.",
        media: {
          id: "pdp.transformation.benefit-3",
          label: "Guidance",
          swatch: "#454237",
          note: "Dresser",
          src: "/landing/imagery/transformation/03-dresser.png",
        },
      },
    ],
  },
  social: PDP_SOCIAL,
  bmi: {
    title: "BMI Calculator",
    body: "BMI uses height and weight to estimate whether your weight falls in a common range for your height. It is an educational screen, not a diagnosis.",
    disclaimer:
      "BMI does not measure body fat directly and may misclassify people with high muscle mass, pregnancy, older adults, children, or certain medical conditions.",
    mediaSrc: "/landing/lifestyle/transformation-dressed.png",
  },
  quality: {
    titleLines: PDP_QUALITY_TITLE,
    backgroundSrc: "/landing/lifestyle/transformation-field.png",
    plate: {
      fieldSrc: "/landing/lifestyle/transformation-field.png",
      vialSrc: "/pdp/cutouts/transformation.png?v=4",
      callouts: CALLOUTS,
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
        id: "pdp.transformation.flow-hero",
        src: "/landing/lifestyle/transformation-dressed.png",
        label: "Appetite Balance",
        swatch: "#1e241f",
      },
      round: {
        id: "pdp.transformation.flow-round",
        src: "/pdp/cutouts/transformation.png?v=4",
        label: "Appetite Balance vial",
        swatch: "#fbf9f6",
        fit: "contain",
        vivid: false,
        bloom: true,
      },
      inset: {
        id: "pdp.transformation.flow-inset",
        src: "/landing/lifestyle/transformation-fabric.png",
        label: "Fabric",
        swatch: "#6b6662",
      },
    },
  },
  pairing: {
    title: "Complete your routine",
    fieldSrc: "/landing/section-2/fields/transformation.png",
    cta: { label: "Get started", href: CTA_HREF },
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
    leftBody:
      "A stack for soreness, wear, and the weeks lost to not bouncing back. Available after clinical review.",
    rightBody:
      "A stack for the days between sessions. Tissue, sleep, and capacity. Available after clinical review.",
  },
};
