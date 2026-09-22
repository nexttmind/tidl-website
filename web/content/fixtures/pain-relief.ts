/** Consumer topical catalog scraped from tidl.com/collections/frontpage. No molecule names. */

import type { HeroSlide } from "@/components/home/LandingHero";
import type { SocialColumn } from "@/components/home/LandingSocial";
import type { ProductFixture } from "@/content/fixtures/hand-and-body";

export type PainReliefGroupId = "cold" | "heat" | "daily" | "systems";

export type PainReliefProduct = ProductFixture & {
  handle: string;
  group: PainReliefGroupId;
  body: string;
  uses: readonly string[];
};

const SHOP = "https://tidl.com/products";

export function painReliefShopHref(handle: string) {
  return `${SHOP}/${handle}`;
}

export function painReliefPdpHref(id: string) {
  return `/pain-relief/${id}`;
}

function product({
  id,
  handle,
  name,
  meta,
  price,
  group,
  body,
  uses,
  file,
}: {
  id: string;
  handle: string;
  name: string;
  meta: string;
  price: string;
  group: PainReliefGroupId;
  body: string;
  uses: readonly string[];
  file: string;
}): PainReliefProduct {
  return {
    id,
    handle,
    name,
    meta,
    price,
    group,
    body,
    uses,
    mediaSlot: `pain-relief.${id}`,
    mediaSrc: `/pain-relief/${file}`,
    mediaFit: "contain",
    mediaAspect: "1 / 1",
    href: painReliefPdpHref(id),
  };
}

export const PAIN_RELIEF_HREF = "/pain-relief";

/** Isolated cryotherapy spray for the landing subheader and Treatments mega menu. */
export const painReliefMenuSrc = "/pain-relief/menu-cryotherapy-spray.png";

export const painReliefCopy = {
  title: "Pain Relief",
  lede: "Sprays, roll ons, and creams for sore days, training days, and the hours in between.",
  announcement: "Free shipping on orders over $100",
  shopCta: "Shop the line",
  disclaimer:
    "These products are topical. They are not a substitute for clinical care. Read the label before use.",
} as const;

export const painReliefHeroSlides = [
  {
    id: "pain-relief",
    railLabel: "Pain Relief",
    headline: painReliefCopy.title,
    subtext: painReliefCopy.lede,
    cta: { label: painReliefCopy.shopCta, href: "#daily" },
    mediaSrc: "/pain-relief/hero.mp4",
    posterSrc: "/pain-relief/hero-poster.jpg",
    mediaPosition: "center 40%",
  },
] as const satisfies readonly HeroSlide[];

/**
 * Partner UGC stills from the tidl.com homepage marquee. Generic filenames.
 * No celebrity names, no outcome claims, no "if prescribed".
 */
export const painReliefSocial = {
  title: "You're in good company",
  columns: [
    {
      id: "pr-circle-a",
      kind: "circle" as const,
      src: "/pain-relief/social/01.jpg",
      objectPosition: "50% 18%",
    },
    {
      id: "pr-portrait-a",
      kind: "portrait" as const,
      src: "/pain-relief/social/02.jpg",
      objectPosition: "50% 16%",
    },
    {
      id: "pr-stack-formats",
      kind: "stack" as const,
      tiles: [
        {
          id: "pr-pill-a",
          kind: "media" as const,
          src: "/pain-relief/social/03.jpg",
          shape: "pill" as const,
          objectPosition: "50% 18%",
        },
        {
          id: "pr-quote-formats",
          kind: "quote" as const,
          tone: "paper" as const,
          text: "Sprays, roll ons, and creams. Pick the format that fits the day.",
        },
      ],
    },
    {
      id: "pr-portrait-b",
      kind: "portrait" as const,
      src: "/pain-relief/social/04.jpg",
      size: "wide" as const,
      objectPosition: "50% 16%",
    },
    {
      id: "pr-stack-made",
      kind: "stack" as const,
      tiles: [
        {
          id: "pr-quote-made",
          kind: "quote" as const,
          tone: "sage" as const,
          text: "Made in the USA. Built for training days and the hours in between.",
        },
        {
          id: "pr-oval-a",
          kind: "media" as const,
          src: "/pain-relief/social/05.jpg",
          shape: "oval" as const,
          objectPosition: "50% 16%",
        },
      ],
    },
    {
      id: "pr-portrait-c",
      kind: "portrait" as const,
      src: "/pain-relief/social/06.jpg",
      objectPosition: "50% 14%",
    },
    {
      id: "pr-circle-b",
      kind: "circle" as const,
      src: "/pain-relief/social/07.jpg",
      objectPosition: "50% 18%",
    },
    {
      id: "pr-stack-move",
      kind: "stack" as const,
      tiles: [
        {
          id: "pr-pill-b",
          kind: "media" as const,
          src: "/pain-relief/social/08.jpg",
          shape: "pill" as const,
          objectPosition: "50% 16%",
        },
        {
          id: "pr-quote-move",
          kind: "quote" as const,
          tone: "sand" as const,
          text: "A spray or a roll on. The format that fits how you move.",
        },
      ],
    },
    {
      id: "pr-portrait-d",
      kind: "portrait" as const,
      src: "/pain-relief/social/09.jpg",
      size: "wide" as const,
      objectPosition: "50% 28%",
    },
    {
      id: "pr-portrait-e",
      kind: "portrait" as const,
      src: "/pain-relief/social/10.jpg",
      objectPosition: "50% 18%",
    },
  ] as const satisfies readonly SocialColumn[],
};

export const painReliefProducts = [
  product({
    id: "cryotherapy-spray",
    handle: "sport-cryotherapy-spray",
    name: "Cryotherapy Spray",
    meta: "Cooling spray for after activity",
    price: "From $39.99",
    group: "cold",
    body: "A cooling spray for pre and post activity, desk days, and tight joints. Point, spray, and let it sit.",
    uses: [
      "After training or a long desk day",
      "Tight joints and stiff backs",
      "A mess free stand in for ice packs",
    ],
    file: "cryotherapy-spray.png",
  }),
  product({
    id: "max-strength-spray",
    handle: "tidl-max-strength-cryotherapy-spray",
    name: "Max Strength Spray",
    meta: "The strongest cooling spray in the line",
    price: "From $49.99",
    group: "cold",
    body: "Built for stubborn soreness, stiff joints, and aching backs. Shake, spray, and wait.",
    uses: [
      "Hard training, work, or everyday wear",
      "Stiff joints and stubborn back tension",
      "Pre and post activity cooling",
    ],
    file: "max-strength-spray.png",
  }),
  product({
    id: "cryotherapy-cream",
    handle: "plant-powered-performance-cream",
    name: "Cryotherapy Cream",
    meta: "Cooling cream you can work in by hand",
    price: "$39.99",
    group: "cold",
    body: "A cream for joints and sore areas you want to massage. Apply, work it in, let it absorb.",
    uses: [
      "Knees, wrists, elbows, shoulders, and back",
      "After workouts or long days",
      "At home recovery or post treatment massage",
    ],
    file: "cryotherapy-cream.png",
  }),
  product({
    id: "heat-therapy-spray",
    handle: "tidl-heat-therapy-spray-1",
    name: "Heat Therapy Spray",
    meta: "Warming spray for tight tissue",
    price: "From $39.99",
    group: "heat",
    body: "A warming spray for pre activity, stiff necks, and the end of a long day. Shake, spray, wait.",
    uses: [
      "Pre activity warmup or post activity routine",
      "Stiff necks, lower backs, and tight joints",
      "Daily tension from work or training",
    ],
    file: "heat-therapy-spray.png",
  }),
  product({
    id: "heat-roll-on",
    handle: "tidl-heat-therapy-roll-on",
    name: "Heat Therapy Roll On",
    meta: "Warming roll on for targeted areas",
    price: "From $39.99",
    group: "heat",
    body: "A warming roll on for joints, necks, and the middle of a workday. Roll, press, wait.",
    uses: [
      "Pre and post activity",
      "Midday neck and back tension",
      "On the go at work or in the gym",
    ],
    file: "heat-roll-on.png",
  }),
  product({
    id: "morning-spray",
    handle: "tidl-morning-therapy-spray",
    name: "Morning Therapy Spray",
    meta: "A warming start for stiff mornings",
    price: "From $39.99",
    group: "daily",
    body: "A morning spray for stiff joints and the first hour of the day. Point, spray, let it absorb.",
    uses: [
      "Morning joint and muscle stiffness",
      "Pre activity warmup",
      "Back, shoulders, and post sleep tightness",
    ],
    file: "morning-spray.png",
  }),
  product({
    id: "evening-spray",
    handle: "tidl-evening-therapy-spray",
    name: "Evening Therapy Spray",
    meta: "An evening spray for winding down",
    price: "From $39.99",
    group: "daily",
    body: "An evening spray for sore muscles and the last hour of the day. Spray, let it absorb, rest.",
    uses: [
      "Evening tension from the day",
      "A pre bed routine for muscles and joints",
      "Sore back, stiff neck, and tired legs",
    ],
    file: "evening-spray.png",
  }),
  product({
    id: "hot-cold-system",
    handle: "tidl-hot-cold-therapy-system",
    name: "Hot and Cold Therapy System",
    meta: "Heat and cold as a two spray pair",
    price: "$25.99",
    group: "systems",
    body: "Heat spray and cryotherapy spray together. Warm up before activity. Cool down after. Alternate if you want contrast.",
    uses: [
      "Warmup before training or physical work",
      "Cooldown after workouts or long days",
      "A portable stand in for packs and pads",
    ],
    file: "hot-cold-system.png",
  }),
  product({
    id: "morning-evening-duo",
    handle: "morning-evening-therapy-duo",
    name: "Morning and Evening Duo",
    meta: "A daily pair for both ends of the day",
    price: "$25.99",
    group: "systems",
    body: "Morning spray and evening spray in one pair. One for the start of the day. One for the close.",
    uses: [
      "Morning stiffness",
      "Evening tension from work or training",
      "A simple daily rhythm",
    ],
    file: "morning-evening-duo.png",
  }),
  product({
    id: "rapid-relief-duo",
    handle: "rapid-relief-duo",
    name: "Cream and Spray Duo",
    meta: "Cryotherapy spray and cream together",
    price: "$25.99",
    group: "systems",
    body: "The cooling spray for broad areas. The cream for joints you want to work in by hand.",
    uses: [
      "Pre and post activity cooling",
      "Joints you can massage",
      "A two step recovery kit",
    ],
    file: "rapid-relief-duo.png",
  }),
  product({
    id: "performance-recovery",
    handle: "tidl-performance-recovery-stack",
    name: "Performance Recovery Stack",
    meta: "Max strength, heat roll on, and evening spray",
    price: "$39.99",
    group: "systems",
    body: "Three products in one kit. Max strength for cooling. Heat roll on for tight tissue. Evening spray to close the day.",
    uses: [
      "Hard sessions and long workdays",
      "Stiff joints and tight muscles",
      "An evening wind down",
    ],
    file: "performance-recovery.png",
  }),
] as const satisfies readonly PainReliefProduct[];

export const painReliefGroups = [
  {
    id: "daily",
    title: "Morning and evening",
    nav: "Daily",
    beat: "AM / PM",
    when: "Both ends of the day",
  },
  {
    id: "heat",
    title: "Heat",
    nav: "Heat",
    beat: "Before",
    when: "Before you move",
  },
  {
    id: "cold",
    title: "Cold",
    nav: "Cold",
    beat: "After",
    when: "After you move",
  },
  {
    id: "systems",
    title: "Pairs and kits",
    nav: "Systems",
    beat: "Kit",
    when: "Pairs and kits",
  },
] as const satisfies readonly {
  id: PainReliefGroupId;
  title: string;
  nav: string;
  beat: string;
  when: string;
}[];

export function painReliefByGroup(
  group: PainReliefGroupId,
): readonly PainReliefProduct[] {
  return painReliefProducts.filter((item) => item.group === group);
}
