import { CATALOG_VIAL_REV } from "@/content/fixtures/catalog";
import { PDP_DEK } from "@/content/pdp/dek";
import type { CategoryPdpData, PdpBenefitItem } from "@/content/pdp/types";
import {
  painReliefAmazonHref,
  painReliefCopy,
  painReliefProducts,
  painReliefSocial,
  type PainReliefProduct,
} from "@/content/fixtures/pain-relief";

const CALLOUT_LAYOUT = [
  { side: "left" as const, anchor: "cap" as const },
  { side: "right" as const, anchor: "label" as const },
  { side: "left" as const, anchor: "base" as const },
];

type Still = { src: string; label: string; swatch: string };

type PainReliefPdpSpec = {
  id: string;
  leadTitle: string;
  whatIsAnswer: string;
  chips: readonly [string, string, string];
  callouts: readonly [string, string, string];
  sells: readonly [string, string, string];
  packSrc: string;
  fieldSrc: string;
  stills: readonly [Still, Still, Still];
};

const TRUST = [
  {
    text: "Made in the USA",
    icon: "pharmacy" as const,
  },
  {
    text: "Free shipping on orders over $100",
    icon: "supply" as const,
  },
  {
    text: "Transparent pricing. No hidden membership fees",
    icon: "pricing" as const,
  },
] as const;

const PROMO = {
  eyebrow: "Shipping",
  title: "Free over $100",
  body: "Free shipping on orders over $100. No membership required.",
  code: "",
} as const;

const QUALITY_TITLE = ["Made in the USA,", "built for the day"] as const;

const QUALITY_BODY = [
  "These products are topical. They are not a substitute for clinical care.",
  "Read the label before use. Keep away from heat and flame if the label says flammable.",
] as const;

const QUALITY_METRICS = [
  {
    metric: "Made here",
    description:
      "Made in the USA. Built for training days, desk days, and the hours in between.",
  },
  {
    metric: "Topical",
    description:
      "Sprays and creams. External use only. Read the label before use.",
  },
  {
    metric: "Ships free",
    description: "Free shipping on orders over $100. No membership required.",
  },
] as const;

const HOW_TO_STAGES = [
  {
    marker: "Pick",
    title: "Choose the format",
    body: "Spray or cream. Cold, heat, or the pair that matches the day.",
  },
  {
    marker: "Apply",
    title: "Use it where you need it",
    body: "Shake if it is a spray. Point and spray. Creams you work in by hand.",
  },
  {
    marker: "Wait",
    title: "Let it sit",
    body: "Give it a minute. Do not cover. Stay off heat and flame if the label says flammable.",
  },
  {
    marker: "Again",
    title: "Keep it in the bag",
    later: true,
    body: "Use as directed on the label. These products are topical. They are not a substitute for clinical care.",
  },
] as const;

const PROOF_THUMB = {
  quote: "Pick the format that fits the day.",
  stars: 5,
} as const;

function productById(id: string): PainReliefProduct {
  const item = painReliefProducts.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing pain relief product ${id}`);
  return item;
}

function callouts(
  chips: readonly [string, string, string],
  bodies: readonly string[],
) {
  return chips.map((chip, index) => ({
    chip,
    body: bodies[index] ?? chip,
    ...CALLOUT_LAYOUT[index],
  }));
}

function benefits(
  id: string,
  chips: readonly [string, string, string],
  sells: readonly string[],
  stills: readonly Still[],
): PdpBenefitItem[] {
  return chips.map((chip, index) => {
    const still = stills[index] ?? stills[0];
    return {
      title: chip,
      description: sells[index] ?? chip,
      media: {
        id: `pdp.pain.${id}.benefit-${index + 1}`,
        label: chip,
        swatch: still.swatch,
        note: still.label,
        src: still.src,
      },
    };
  });
}

function buildPdp(spec: PainReliefPdpSpec): CategoryPdpData {
  const product = productById(spec.id);
  const notes = callouts(spec.chips, spec.callouts);
  const soldOut = product.soldOut === true;
  const ctaLabel = "Buy Now";
  const ctaHref = painReliefAmazonHref(spec.id);
  const [one, two, three] = spec.stills;

  return {
    metadataTitle: `TIDL · ${product.name}`,
    metadataDescription: product.meta,
    soldOut,
    stockLabel: soldOut ? "Sold out" : "Available",
    category: "Pain Relief",
    title: product.name,
    themeId: "recovery-performance",
    artId: spec.id,
    barrageGraphic: "pain-relief",
    barragePack: spec.id,
    price: product.price.replace(/^From\s+/, ""),
    compareAtPrice: "",
    tagline: product.meta,
    dek: PDP_DEK[spec.id],
    primaryCta: ctaLabel,
    primaryCtaHref: ctaHref,
    body: product.body,
    payLine: painReliefCopy.announcement,
    heroSrc: `/landing/shop/catalog/vials/${spec.id}.png?v=${CATALOG_VIAL_REV}`,
    heroCallouts: notes,
    trust: TRUST,
    planLabel: "",
    planOptions: [],
    promo: PROMO,
    gallery: {
      plates: [
        {
          id: `pdp.pain.${spec.id}.hero`,
          label: one.label,
          swatch: one.swatch,
          note: "Lifestyle",
          src: one.src,
          thumbSrc: one.src,
          fit: "cover",
        },
        {
          id: `pdp.pain.${spec.id}.still-1`,
          label: two.label,
          swatch: two.swatch,
          note: "Lifestyle",
          src: two.src,
          thumbSrc: two.src,
          fit: "cover",
        },
        {
          id: `pdp.pain.${spec.id}.still-2`,
          label: three.label,
          swatch: three.swatch,
          note: "Lifestyle",
          src: three.src,
          thumbSrc: three.src,
          fit: "cover",
        },
        {
          id: `pdp.pain.${spec.id}.pack`,
          label: product.name,
          swatch: "#f0f0ed",
          note: "Product",
          src: spec.packSrc,
          thumbSrc: spec.packSrc,
          fit: "contain",
        },
      ],
      proofThumb: PROOF_THUMB,
    },
    buyBoxFaq: [
      {
        id: "included",
        question: "What's included",
        answer:
          "The product as shown. Free shipping on orders over $100. Read the label before use.",
        defaultOpen: true,
      },
      {
        id: "what-is",
        question: `What is ${product.name}?`,
        answer: spec.whatIsAnswer,
      },
      {
        id: "how-to",
        question: "How to use",
        answer: product.body,
      },
      {
        id: "clinical",
        question: "Is this a substitute for clinical care?",
        answer: painReliefCopy.disclaimer,
      },
    ],
    disclaimer: painReliefCopy.disclaimer,
    safetyLink: { label: "Read the label", href: "#buy" },
    lead: {
      title: spec.leadTitle,
      body: "Made in the USA. Read the label before use. These products are topical. They are not a substitute for clinical care.",
      cta: { label: ctaLabel, href: ctaHref },
      media: {
        id: `pdp.pain.${spec.id}.lead`,
        label: one.label,
        swatch: one.swatch,
        note: one.label,
        src: one.src,
        poster: one.src,
      },
    },
    benefits: {
      headline: "Use it for",
      subtitle: product.body,
      cta: { label: ctaLabel, href: ctaHref },
      items: benefits(spec.id, spec.chips, spec.sells, spec.stills),
    },
    social: painReliefSocial,
    quality: {
      titleLines: QUALITY_TITLE,
      backgroundSrc: spec.fieldSrc,
      plate: {
        fieldSrc: spec.fieldSrc,
        vialSrc: product.mediaSrc ?? spec.packSrc,
        callouts: notes,
      },
      body: QUALITY_BODY,
      metrics: QUALITY_METRICS,
    },
    careFlow: {
      headline: "How to use",
      subtitle: "Pick a format. Apply where you need it. Read the label.",
      stages: HOW_TO_STAGES,
      collage: {
        hero: {
          id: `pdp.pain.${spec.id}.flow-hero`,
          src: one.src,
          label: product.name,
          swatch: one.swatch,
        },
        round: {
          id: `pdp.pain.${spec.id}.flow-round`,
          src: product.mediaSrc ?? spec.packSrc,
          label: product.name,
          swatch: "#fbf9f6",
          fit: "contain",
          vivid: false,
          bloom: true,
        },
        inset: {
          id: `pdp.pain.${spec.id}.flow-inset`,
          src: two.src,
          label: two.label,
          swatch: two.swatch,
        },
      },
    },
  };
}

const L = {
  cryo: {
    src: "/pain-relief/lifestyle/header-cryo.png",
    label: "Court",
    swatch: "#1a2218",
  },
  howTo: {
    src: "/pain-relief/lifestyle/how-to.jpg",
    label: "Apply",
    swatch: "#3a4a52",
  },
  max: {
    src: "/pain-relief/lifestyle/header-max.png",
    label: "Bench",
    swatch: "#4a6a7a",
  },
  heatHeader: {
    src: "/pain-relief/lifestyle/header-heat.png",
    label: "Shoulder",
    swatch: "#2a4a6a",
  },
  heat: {
    src: "/pain-relief/lifestyle/heat.jpg",
    label: "Roller",
    swatch: "#1a5a4a",
  },
  evening: {
    src: "/pain-relief/lifestyle/header-evening.png",
    label: "Grass",
    swatch: "#4a6a48",
  },
  hold: {
    src: "/pain-relief/lifestyle/still-03.jpg",
    label: "Hold",
    swatch: "#1a1a1a",
  },
  jar: {
    src: "/pain-relief/lifestyle/still-04.jpg",
    label: "Track",
    swatch: "#8a3a3a",
  },
  gym: {
    src: "/pain-relief/lifestyle/still-05.jpg",
    label: "Gym",
    swatch: "#3a3a3a",
  },
  yellowApply: {
    src: "/pain-relief/lifestyle/still-08.jpg",
    label: "Ankle",
    swatch: "#3a5a3a",
  },
  blackApply: {
    src: "/pain-relief/lifestyle/still-09.jpg",
    label: "Shoulder",
    swatch: "#2a2a2a",
  },
  track: {
    src: "/pain-relief/lifestyle/still-10.jpg",
    label: "Track",
    swatch: "#3a5a3a",
  },
  bag: {
    src: "/pain-relief/lifestyle/still-11.jpg",
    label: "Bag",
    swatch: "#1a1a1a",
  },
  ice: {
    src: "/pain-relief/lifestyle/still-12.jpg",
    label: "Pack",
    swatch: "#6a8aaa",
  },
  hotBack: {
    src: "/pain-relief/pdp/hot-cold-system/back.jpg",
    label: "Back",
    swatch: "#2a2a2a",
  },
  hotLeg: {
    src: "/pain-relief/pdp/hot-cold-system/leg.jpg",
    label: "Leg",
    swatch: "#3a3a3a",
  },
} as const satisfies Record<string, Still>;

const SPECS: readonly PainReliefPdpSpec[] = [
  {
    id: "cryotherapy-spray",
    leadTitle: "After activity,\ntight joints,\na cooling spray",
    whatIsAnswer:
      "A cooling spray for pre and post activity, desk days, and tight joints. Point, spray, and let it sit. Topical. Read the label before use.",
    chips: ["Relief", "Recovery", "Mobility"],
    callouts: [
      "Cools the second it lands",
      "Made for after training",
      "Move easier",
    ],
    sells: [
      "Cold on sore muscles, without the ice pack and the mess. Spray it and let it work.",
      "The sooner you hit it, the better tomorrow goes.",
      "Great after a session, and just as good after a long day at a desk.",
    ],
    packSrc: "/pain-relief/pdp/cryotherapy-spray/pack.png",
    fieldSrc: L.howTo.src,
    stills: [L.howTo, L.cryo, L.blackApply],
  },
  {
    id: "max-strength-spray",
    leadTitle: "Stubborn soreness,\nstiff joints,\na stronger cooling spray",
    whatIsAnswer:
      "The strongest cooling spray in the line. Built for stubborn soreness, stiff joints, and aching backs. Shake, spray, and wait. Topical. Read the label before use.",
    chips: ["Power", "Endurance", "Performance"],
    callouts: [
      "Two actives at full strength",
      "Relief that holds",
      "Back at it tomorrow",
    ],
    sells: [
      "Our strongest cooling formula. For the days a regular spray isn't cutting it.",
      "When you've really put your body through it, go straight to this one.",
      "Deep, serious cold so you're not sitting out tomorrow.",
    ],
    packSrc: "/pain-relief/pdp/max-strength-spray/pack.png",
    fieldSrc: L.gym.src,
    stills: [L.max, L.gym, L.hold],
  },
  {
    id: "cryotherapy-cream",
    leadTitle: "Joints you can work in,\nsore areas,\na cooling cream",
    whatIsAnswer:
      "A cream for joints and sore areas you want to massage. Apply, work it in, let it absorb. Topical. Read the label before use.",
    chips: ["Comfort", "Flexibility", "Control"],
    callouts: [
      "Cools as you rub it in",
      "Right into the joint",
      "Exactly where you want it",
    ],
    sells: [
      "Same cooling, but you rub it in. Better when you want to work a specific spot.",
      "Get right into the joint that's bothering you.",
      "No overspray, no mist. Just where you want it.",
    ],
    packSrc: "/pain-relief/pdp/cryotherapy-cream/pack.png",
    fieldSrc: L.jar.src,
    stills: [L.jar, L.howTo, L.bag],
  },
  {
    id: "heat-therapy-spray",
    leadTitle: "Before activity,\nstiff tissue,\na warming spray",
    whatIsAnswer:
      "A warming spray for pre activity, stiff necks, and the end of a long day. Shake, spray, wait. Topical. Read the label before use.",
    chips: ["Readiness", "Flexibility", "Confidence"],
    callouts: [
      "Loosen up first",
      "Good for tight backs",
      "A better first set",
    ],
    sells: [
      "Warm up tight muscles before the session instead of stretching cold.",
      "Heat loosens what cold can't. Use it on the stuff that never quite lets go.",
      "Start warm and the whole session feels easier.",
    ],
    packSrc: "/pain-relief/pdp/heat-therapy-spray/pack.png",
    fieldSrc: L.heat.src,
    stills: [L.heat, L.heatHeader, L.yellowApply],
  },
  {
    id: "evening-spray",
    leadTitle: "The last hour,\nsore muscles,\nan evening spray",
    whatIsAnswer:
      "An evening spray for sore muscles and the last hour of the day. Spray, let it absorb, rest. Topical. Read the label before use.",
    chips: ["Calm", "Comfort", "Rest"],
    callouts: [
      "A gentler scent",
      "For evening aches",
      "Part of the bedtime routine",
    ],
    sells: [
      "The day's over and your body's still tense. This is for that hour.",
      "Soreness always gets louder when you finally sit down.",
      "Part of the routine before bed, like brushing your teeth.",
    ],
    packSrc: "/pain-relief/pdp/evening-spray/pack.png",
    fieldSrc: L.evening.src,
    stills: [L.evening, L.blackApply, L.bag],
  },
  {
    id: "hot-cold-system",
    leadTitle: "Warm up.\nCool down.\nA two spray pair",
    whatIsAnswer:
      "Heat spray and cryotherapy spray together. Warm up before activity. Cool down after. Alternate if you want contrast. Topical. Read the label before use.",
    chips: ["Readiness", "Recovery", "Balance"],
    callouts: [
      "Both ends covered",
      "The part most people skip",
      "One kit, whole session",
    ],
    sells: [
      "Heat before, cold after. Two sprays, one kit, the way athletes have done it forever.",
      "Warm up properly, cool down properly. Most people skip one and feel it.",
      "Everything you need for a training day, in one go.",
    ],
    packSrc: "/pain-relief/pdp/hot-cold-system/pack.png",
    fieldSrc: L.hotBack.src,
    stills: [L.hotBack, L.hotLeg, L.ice],
  },
  {
    id: "rapid-relief-duo",
    leadTitle: "Broad areas.\nJoints by hand.\nA two step kit",
    whatIsAnswer:
      "The cooling spray for broad areas. The cream for joints you want to work in by hand. Topical. Read the label before use.",
    chips: ["Relief", "Comfort", "Confidence"],
    callouts: [
      "Two ways to apply",
      "Spray the back, rub the knee",
      "Covered either way",
    ],
    sells: [
      "The spray covers ground fast. The cream goes into the spot that needs hands.",
      "Spray the whole back, work the cream into the one place that's really angry.",
      "Two formats, so you're covered either way.",
    ],
    packSrc: "/pain-relief/pdp/rapid-relief-duo/pack.png",
    fieldSrc: L.howTo.src,
    stills: [L.howTo, L.jar, L.cryo],
  },
];

export function painReliefBarrageWords(
  id: string,
): readonly [string, string, string] | undefined {
  return SPECS.find((spec) => spec.id === id)?.chips;
}

export function painReliefMenuPreview(id: string): {
  fieldSrc: string;
  callouts: readonly { chip: string; body: string }[];
} | null {
  const spec = SPECS.find((row) => row.id === id);
  if (!spec) return null;
  return {
    fieldSrc: spec.fieldSrc,
    callouts: spec.chips.map((chip, index) => ({
      chip,
      body: spec.callouts[index],
    })),
  };
}

export const PAIN_RELIEF_PDPS: Record<string, CategoryPdpData> = Object.fromEntries(
  SPECS.filter((spec) => painReliefProducts.some((product) => product.id === spec.id)).map(
    (spec) => [spec.id, buildPdp(spec)],
  ),
);

export const PAIN_RELIEF_SLUGS = painReliefProducts.map((product) => product.id);
