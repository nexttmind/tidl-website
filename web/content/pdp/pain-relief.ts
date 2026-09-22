import type { CategoryPdpData, PdpBenefitItem } from "@/content/pdp/types";
import {
  painReliefCopy,
  painReliefProducts,
  painReliefShopHref,
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
      "Sprays, roll ons, and creams. External use only. Read the label before use.",
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
    body: "Spray, roll on, or cream. Cold, heat, or the pair that matches the day.",
  },
  {
    marker: "Apply",
    title: "Use it where you need it",
    body: "Shake if it is a spray. Point, spray, or roll. Creams you work in by hand.",
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

function callouts(chips: readonly [string, string, string], uses: readonly string[]) {
  return chips.map((chip, index) => ({
    chip,
    body: uses[index] ?? chip,
    ...CALLOUT_LAYOUT[index],
  }));
}

function benefits(
  id: string,
  chips: readonly [string, string, string],
  uses: readonly string[],
  stills: readonly Still[],
): PdpBenefitItem[] {
  return chips.map((chip, index) => {
    const still = stills[index] ?? stills[0];
    return {
      title: chip,
      description: uses[index] ?? chip,
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
  const notes = callouts(spec.chips, product.uses);
  const shopHref = painReliefShopHref(product.handle);
  const [one, two, three] = spec.stills;

  return {
    metadataTitle: `TIDL · ${product.name}`,
    metadataDescription: product.meta,
    stockLabel: "Available",
    category: "Pain Relief",
    title: product.name,
    themeId: "recovery-performance",
    barrageGraphic: "pain-relief",
    barragePack: spec.id,
    price: product.price.replace(/^From\s+/, ""),
    compareAtPrice: "",
    tagline: product.meta,
    primaryCta: "Add to cart",
    primaryCtaHref: shopHref,
    body: product.body,
    payLine: painReliefCopy.announcement,
    heroSrc: product.mediaSrc ?? spec.packSrc,
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
      cta: { label: "Add to cart", href: shopHref },
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
      cta: { label: "Add to cart", href: shopHref },
      items: benefits(spec.id, spec.chips, product.uses, spec.stills),
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
  morning: {
    src: "/pain-relief/lifestyle/header-morning.png",
    label: "Steps",
    swatch: "#8a8a82",
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
  field: {
    src: "/pain-relief/lifestyle/still-06.jpg",
    label: "Field",
    swatch: "#4a6a3a",
  },
  portrait: {
    src: "/pain-relief/lifestyle/still-07.jpg",
    label: "Rest",
    swatch: "#5a4a3a",
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
    chips: ["After activity", "Tight joints", "Ice pack stand in"],
    packSrc: "/pain-relief/pdp/cryotherapy-spray/pack.png",
    fieldSrc: L.howTo.src,
    stills: [L.howTo, L.cryo, L.blackApply],
  },
  {
    id: "max-strength-spray",
    leadTitle: "Stubborn soreness,\nstiff joints,\na stronger cooling spray",
    whatIsAnswer:
      "The strongest cooling spray in the line. Built for stubborn soreness, stiff joints, and aching backs. Shake, spray, and wait. Topical. Read the label before use.",
    chips: ["Hard days", "Stiff joints", "Pre and post"],
    packSrc: "/pain-relief/pdp/max-strength-spray/pack.png",
    fieldSrc: L.gym.src,
    stills: [L.max, L.gym, L.hold],
  },
  {
    id: "cryotherapy-cream",
    leadTitle: "Joints you can work in,\nsore areas,\na cooling cream",
    whatIsAnswer:
      "A cream for joints and sore areas you want to massage. Apply, work it in, let it absorb. Topical. Read the label before use.",
    chips: ["Joints", "Long days", "By hand"],
    packSrc: "/pain-relief/pdp/cryotherapy-cream/pack.png",
    fieldSrc: L.jar.src,
    stills: [L.jar, L.howTo, L.bag],
  },
  {
    id: "heat-therapy-spray",
    leadTitle: "Before activity,\nstiff tissue,\na warming spray",
    whatIsAnswer:
      "A warming spray for pre activity, stiff necks, and the end of a long day. Shake, spray, wait. Topical. Read the label before use.",
    chips: ["Warmup", "Stiff tissue", "Daily tension"],
    packSrc: "/pain-relief/pdp/heat-therapy-spray/pack.png",
    fieldSrc: L.heat.src,
    stills: [L.heat, L.heatHeader, L.yellowApply],
  },
  {
    id: "heat-roll-on",
    leadTitle: "Targeted areas,\nmidday tension,\na warming roll on",
    whatIsAnswer:
      "A warming roll on for joints, necks, and the middle of a workday. Roll, press, wait. Topical. Read the label before use.",
    chips: ["Targeted", "Midday", "On the go"],
    packSrc: "/pain-relief/pdp/heat-roll-on/pack.png",
    fieldSrc: L.heat.src,
    stills: [L.heatHeader, L.heat, L.track],
  },
  {
    id: "morning-spray",
    leadTitle: "Stiff mornings,\nthe first hour,\na warming start",
    whatIsAnswer:
      "A morning spray for stiff joints and the first hour of the day. Point, spray, let it absorb. Topical. Read the label before use.",
    chips: ["Mornings", "Warmup", "Post sleep"],
    packSrc: "/pain-relief/pdp/morning-spray/pack.png",
    fieldSrc: L.morning.src,
    stills: [L.morning, L.field, L.portrait],
  },
  {
    id: "evening-spray",
    leadTitle: "The last hour,\nsore muscles,\nan evening spray",
    whatIsAnswer:
      "An evening spray for sore muscles and the last hour of the day. Spray, let it absorb, rest. Topical. Read the label before use.",
    chips: ["Evening", "Pre bed", "Tired legs"],
    packSrc: "/pain-relief/pdp/evening-spray/pack.png",
    fieldSrc: L.evening.src,
    stills: [L.evening, L.blackApply, L.bag],
  },
  {
    id: "hot-cold-system",
    leadTitle: "Warm up.\nCool down.\nA two spray pair",
    whatIsAnswer:
      "Heat spray and cryotherapy spray together. Warm up before activity. Cool down after. Alternate if you want contrast. Topical. Read the label before use.",
    chips: ["Warmup", "Cooldown", "Contrast"],
    packSrc: "/pain-relief/pdp/hot-cold-system/pack.png",
    fieldSrc: L.hotBack.src,
    stills: [L.hotBack, L.hotLeg, L.ice],
  },
  {
    id: "morning-evening-duo",
    leadTitle: "Both ends of the day.\nOne pair.",
    whatIsAnswer:
      "Morning spray and evening spray in one pair. One for the start of the day. One for the close. Topical. Read the label before use.",
    chips: ["Morning", "Evening", "Daily rhythm"],
    packSrc: "/pain-relief/pdp/morning-evening-duo/pack.png",
    fieldSrc: L.morning.src,
    stills: [L.morning, L.evening, L.ice],
  },
  {
    id: "rapid-relief-duo",
    leadTitle: "Broad areas.\nJoints by hand.\nA two step kit",
    whatIsAnswer:
      "The cooling spray for broad areas. The cream for joints you want to work in by hand. Topical. Read the label before use.",
    chips: ["Cooling", "By hand", "Two step"],
    packSrc: "/pain-relief/pdp/rapid-relief-duo/pack.png",
    fieldSrc: L.howTo.src,
    stills: [L.howTo, L.jar, L.cryo],
  },
  {
    id: "performance-recovery",
    leadTitle: "Hard sessions.\nTight tissue.\nThe close of the day",
    whatIsAnswer:
      "Three products in one kit. Max strength for cooling. Heat roll on for tight tissue. Evening spray to close the day. Topical. Read the label before use.",
    chips: ["Hard sessions", "Tight tissue", "Wind down"],
    packSrc: "/pain-relief/pdp/performance-recovery/pack.png",
    fieldSrc: L.gym.src,
    stills: [L.max, L.heatHeader, L.evening],
  },
];

export const PAIN_RELIEF_PDPS: Record<string, CategoryPdpData> = Object.fromEntries(
  SPECS.map((spec) => [spec.id, buildPdp(spec)]),
);

export const PAIN_RELIEF_SLUGS = SPECS.map((spec) => spec.id);
