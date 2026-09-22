/** Consumer-facing fixtures only. Goal-framed, stack-named. No molecule names. */
export type ProductFixture = {
  id: string;
  name: string;
  meta: string;
  price: string;
  mediaSlot: string;
  /** Optional cover image path under /public. */
  mediaSrc?: string;
  /** Pack shots use contain. Lifestyle uses cover. */
  mediaFit?: "cover" | "contain";
  mediaAspect?: string;
  href?: string;
};

export type SubcategoryFixture = {
  id: string;
  label: string;
  href: string;
  mediaSlot: string;
};

export const stacksCatalog = {
  navAnnouncement: "Free shipping on orders over $100",
  carouselHero: {
    titleLines: ["Reclaim your", "vitality"] as const,
    subtitle: "There's something for everyone",
    primaryCta: { label: "Get started →", href: "#core" },
    secondaryCta: { label: "Is this right for me?", href: "#assist" },
    products: [
      {
        name: "Recovery Stack",
        price: "From $120",
        badge: "Best seller",
        mediaSlot: "category.product.recovery-stack",
        href: "#recovery-stack",
      },
      {
        name: "Appetite Balance Stack",
        price: "From $125",
        badge: "Popular",
        mediaSlot: "category.product.transformation-stack",
        href: "/stacks/transformation",
      },
      {
        name: "Cellular Stack",
        price: "From $350",
        mediaSlot: "category.product.cellular-stack",
        href: "#cellular-stack",
      },
      {
        name: "Legacy Stack",
        price: "From $100",
        badge: "New",
        mediaSlot: "category.product.legacy-stack",
        href: "#legacy-stack",
      },
      {
        name: "Peak Performance Stack",
        price: "From $150",
        mediaSlot: "category.product.executive-stack",
        href: "#executive-stack",
      },
      {
        name: "Dynamic Training Stack",
        price: "From $140",
        mediaSlot: "category.product.athlete-stack",
        href: "#athlete-stack",
      },
      {
        name: "Radiance Stack",
        price: "From $130",
        mediaSlot: "category.product.radiance-stack",
        href: "#radiance-stack",
      },
    ],
  },
  hero: {
    title: "Stacks",
    body: "Physician guided peptide therapy, compounded at your local pharmacy and delivered in the TIDL Flow pen. Each stack is goal framed. Available if prescribed after clinical review.",
    mediaSlot: "category.hero",
  },
  subcategories: [
    {
      id: "executive",
      label: "Peak Performance",
      href: "#executive",
      mediaSlot: "category.subcat.executive",
    },
    {
      id: "athlete",
      label: "Dynamic Training",
      href: "#athlete",
      mediaSlot: "category.subcat.athlete",
    },
    {
      id: "transformation",
      label: "Appetite Balance",
      href: "#transformation",
      mediaSlot: "category.subcat.transformation",
    },
    {
      id: "parents",
      label: "Stress & Mood",
      href: "#parents",
      mediaSlot: "category.subcat.parents",
    },
    {
      id: "creatives",
      label: "Focus",
      href: "#creatives",
      mediaSlot: "category.subcat.creatives",
    },
    {
      id: "legacy",
      label: "Legacy",
      href: "#legacy",
      mediaSlot: "category.subcat.legacy",
    },
  ] satisfies SubcategoryFixture[],
  carousel: {
    eyebrow: "Start here",
    title: "Core stacks for everyday goals",
    products: [
      {
        id: "executive-stack",
        name: "Peak Performance Stack",
        meta: "Focus, composure, sustained drive · if prescribed",
        price: "$95.00",
        mediaSlot: "category.product.executive-stack",
      },
      {
        id: "athlete-stack",
        name: "Dynamic Training Stack",
        meta: "Training rhythm and recovery · if prescribed",
        price: "$80.00",
        mediaSlot: "category.product.athlete-stack",
      },
      {
        id: "athlete-compete",
        name: "Athlete Compete Stack",
        meta: "Competition prep support · if prescribed",
        price: "$85.00",
        mediaSlot: "category.product.athlete-compete",
      },
      {
        id: "strength-stack",
        name: "Strength Stack",
        meta: "Lean mass and joint comfort goals · if prescribed",
        price: "$90.00",
        mediaSlot: "category.product.strength-stack",
      },
      {
        id: "recovery-stack",
        name: "Recovery Stack",
        meta: "Tissue repair and rebound · if prescribed",
        price: "$120.00",
        mediaSlot: "category.product.recovery-stack",
      },
      {
        id: "foundation-stack",
        name: "Foundation Stack",
        meta: "Baseline metabolic support · if prescribed",
        price: "$80.00",
        mediaSlot: "category.product.foundation-stack",
      },
    ] satisfies ProductFixture[],
  },
  compare: {
    title: "Two paths for metabolic goals",
    products: [
      {
        id: "transformation-stack",
        name: "Appetite Balance Stack",
        meta: "Appetite and metabolic support · if prescribed",
        price: "$125.00",
        mediaSlot: "category.product.transformation-stack",
        href: "/stacks/transformation",
      },
      {
        id: "transformation-focus",
        name: "Appetite Balance Focus",
        meta: "Visceral and composition goals · if prescribed",
        price: "$225.00",
        mediaSlot: "category.product.transformation-focus",
      },
    ] satisfies ProductFixture[],
  },
  bathing: {
    title: "Renewal and repair",
    products: [
      {
        id: "radiance-stack",
        name: "Radiance Stack",
        meta: "Skin and tissue renewal · if prescribed",
        price: "$150.00",
        mediaSlot: "category.product.radiance-stack",
      },
      {
        id: "radiance-standard",
        name: "Radiance Stack · Standard",
        meta: "Everyday renewal support · if prescribed",
        price: "$100.00",
        mediaSlot: "category.product.radiance-standard",
      },
      {
        id: "renewal-stack",
        name: "Renewal Stack",
        meta: "Skin, calm, and repair · if prescribed",
        price: "$175.00",
        mediaSlot: "category.product.renewal-stack",
      },
      {
        id: "rest-stack",
        name: "Rest Stack",
        meta: "Sleep rhythm support · if prescribed",
        price: "$55.00",
        mediaSlot: "category.product.rest-stack",
      },
      {
        id: "energy-stack",
        name: "Energy Stack",
        meta: "Cellular energy goals · if prescribed",
        price: "$70.00",
        mediaSlot: "category.product.energy-stack",
      },
    ] satisfies ProductFixture[],
  },
  seasonal: {
    title: "Longevity and cellular care",
    products: [
      {
        id: "legacy-stack",
        name: "Legacy Stack",
        meta: "Long horizon cellular support · if prescribed",
        price: "$100.00",
        mediaSlot: "category.product.legacy-stack",
      },
      {
        id: "cellular-stack",
        name: "Cellular Stack",
        meta: "Mitochondrial support · if prescribed",
        price: "$350.00",
        mediaSlot: "category.product.cellular-stack",
      },
      {
        id: "transformation-intensive",
        name: "Appetite Balance Intensive",
        meta: "Higher intensity metabolic path · if prescribed",
        price: "$400.00",
        mediaSlot: "category.product.transformation-intensive",
      },
    ] satisfies ProductFixture[],
  },
  assist: {
    id: "assist",
    title: "Not sure where to begin",
    body: "A licensed clinician reviews your goals and history. Stacks are available if prescribed. Start with a consult, then choose a pen protocol that fits your routine.",
    cta: "Find your stack",
  },
  reading: {
    title: "Recommended reading",
    items: [
      {
        id: "r1",
        title: "How the Flow pen works",
        meta: "Two-minute read",
        mediaSlot: "category.reading.r1",
      },
      {
        id: "r2",
        title: "What physician guided means",
        meta: "Guide",
        mediaSlot: "category.reading.r2",
      },
      {
        id: "r3",
        title: "Choosing a stack by goal",
        meta: "Overview",
        mediaSlot: "category.reading.r3",
      },
    ],
  },
  nav: {
    links: [
      { label: "Shop", href: "/stacks" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
} as const;

/** @deprecated use stacksCatalog */
export const handAndBody = stacksCatalog;
