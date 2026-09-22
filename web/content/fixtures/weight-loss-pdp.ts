/** Weight Loss health goal PDP. Goal framed. No molecule names. No outcome claims. */

import {
  PDP_PAY_LINE,
  PDP_PLAN_LABEL,
  PDP_PLAN_OPTIONS,
  PDP_SHARED_FAQ,
  PDP_TRUST,
} from "@/content/pdp/pricing";

export const weightLossPdp = {
  stockLabel: "Available",
  category: "Health goal",
  title: "Weight Loss",
  themeId: "weight-loss" as const,
  titleLines: ["Weight Loss", "Care"] as const,
  price: "$197",
  compareAtPrice: "$297",
  tagline: "Physician guided GLP 1 care",
  primaryCta: "Get started",
  primaryCtaHref: "/care/intake?entry=weight-loss",
  body:
    "Appetite and metabolic goals, if prescribed after clinical review. Delivered through the TIDL Flow pen from a US based compounding pharmacy.",
  payLine: PDP_PAY_LINE,
  heroSrc: "/pdp/weight-loss-vial.png?v=3",
  heroCallouts: [
    {
      chip: "Appetite",
      body: "Built for hunger that has been the whole job",
      side: "left" as const,
      anchor: "cap" as const,
    },
    {
      chip: "Pace",
      body: "Built for loss your physician is willing to stand behind",
      side: "right" as const,
      anchor: "label" as const,
    },
    {
      chip: "Muscle",
      body: "Built for protecting lean mass while the scale moves",
      side: "left" as const,
      anchor: "base" as const,
    },
  ],
  trust: PDP_TRUST,
  planLabel: PDP_PLAN_LABEL,
  planOptions: PDP_PLAN_OPTIONS,
  promo: {
    eyebrow: "Limited time",
    title: "First month pricing",
    body: "Member $39 and prescription $158 the first month if prescribed. Ongoing member price is $49 a month.",
    code: "START100",
  },
  /** Weight Loss labeled stills from Figma Lifestyle Imagery. */
  gallery: {
    plates: [
      {
        id: "pdp.weight-loss.hero",
        label: "Weight Loss care",
        swatch: "#1a222a",
        note: "Film",
        videoSrc: "/landing/hero/weight-loss.mp4",
        poster: "/landing/hero/weight-loss.jpg",
        src: "/landing/hero/weight-loss.jpg",
        thumbSrc: "/landing/lifestyle/stylized-weight-loss.png",
        fit: "cover" as const,
      },
      {
        id: "pdp.weight-loss.walk",
        label: "Walk",
        swatch: "#1a222a",
        note: "Lifestyle",
        src: "/landing/lifestyle/weight-loss-walk.png",
        thumbSrc: "/landing/lifestyle/weight-loss-walk.png",
        fit: "cover" as const,
      },
      {
        id: "pdp.weight-loss.chop",
        label: "Prep",
        swatch: "#1a222a",
        note: "Lifestyle",
        src: "/landing/lifestyle/weight-loss-chop.png",
        thumbSrc: "/landing/lifestyle/weight-loss-chop.png",
        fit: "cover" as const,
      },
      {
        id: "pdp.weight-loss.kitchen",
        label: "Kitchen",
        swatch: "#1a222a",
        note: "Lifestyle",
        src: "/landing/lifestyle/weight-loss-kitchen.png",
        thumbSrc: "/landing/lifestyle/weight-loss-kitchen.png",
        fit: "cover" as const,
      },
    ],
    proofThumb: {
      quote: "The intake was clear and shipping was fast.",
      stars: 5,
    },
  },
  buyBoxFaq: [
    PDP_SHARED_FAQ[0],
    {
      id: "what-is",
      question: "What is Weight Loss care at TIDL?",
      answer:
        "A goal framed GLP 1 protocol compounded for you when clinically appropriate. Your clinician sets the plan. Molecule details appear only after login, inside intake, and on the prescription.",
    },
    ...PDP_SHARED_FAQ.slice(1),
  ],
  disclaimer:
    "Compounded medications are not FDA approved. They are prepared by state licensed compounding pharmacies subject to regulatory oversight. Available if prescribed after clinical review.",
  safetyLink: { label: "Important Safety Information", href: "#safety" },
  lead: {
    title: "Appetite goals,\nmetabolic support,\nclinician guided care",
    body:
      "Start with a free intake. A licensed clinician reviews your history and decides whether this path is right for you, if prescribed.",
    cta: { label: "Get started", href: "#buy" },
    media: {
      id: "pdp.weight-loss.lead",
      label: "Lead lifestyle",
      swatch: "#4a5c58",
      note: "Weight Loss walk",
      videoSrc: "/landing/hero/weight-loss.mp4",
      poster: "/landing/lifestyle/weight-loss-walk.png",
      src: "/landing/lifestyle/weight-loss-walk.png",
    },
  },
  benefits: {
    headline: "Benefits",
    subtitle: "Goal framed support for confidence and daily energy, if prescribed.",
    cta: { label: "Get started", href: "#buy" },
    items: [
      {
        title: "Appetite",
        description:
          "Hunger has been the whole job. This is a physician guided GLP 1 stack built to take that off the day.",
        media: {
          id: "pdp.weight-loss.benefit-1",
          label: "Appetite",
          swatch: "#7a8f6e",
          note: "Walk",
          src: "/landing/imagery/weight-loss/01-walk.png",
        },
      },
      {
        title: "Pace",
        description:
          "The brief is a pace a physician will stand behind. Not a crash, and not a number you cannot keep.",
        media: {
          id: "pdp.weight-loss.benefit-2",
          label: "Pace",
          swatch: "#9a8a6a",
          note: "Prep",
          src: "/landing/imagery/weight-loss/02-chop-crop.png",
        },
      },
      {
        title: "Muscle",
        description:
          "Protect lean mass while the scale moves. The protocol treats composition as the job, not a casualty.",
        media: {
          id: "pdp.weight-loss.benefit-3",
          label: "Muscle",
          swatch: "#6a4a48",
          note: "Kitchen",
          src: "/landing/imagery/weight-loss/03-kitchen.png",
        },
      },
    ],
  },
  /**
   * Landing-style mosaic. One frame per character. No product-in-hand
   * stills. Process and service quotes. No outcome claims.
   */
  social: {
    title: "You're in good company",
    columns: [
      {
        id: "wl-circle-a",
        kind: "circle" as const,
        src: "/landing/social/filler/athlete.png",
        objectPosition: "50% 50%",
      },
      {
        id: "wl-maya",
        kind: "portrait" as const,
        src: "/landing/social/people/weight-loss.png",
        objectPosition: "50% 18%",
        note: {
          name: "Maya L.",
          text: "The quiz was short. A physician reviewed my intake the same day. Available if prescribed after clinical review.",
        },
      },
      {
        id: "wl-stack-james",
        kind: "stack" as const,
        tiles: [
          {
            id: "wl-james-pill",
            kind: "media" as const,
            src: "/landing/social/people/mens-health.png",
            shape: "pill" as const,
            objectPosition: "50% 18%",
            note: {
              name: "James R.",
              text: "The plan for my mornings was explained before I paid. Physician guided, if prescribed after clinical review.",
            },
          },
          {
            id: "wl-quote-plan",
            kind: "quote" as const,
            tone: "paper" as const,
            text: "The plan was explained clearly before I paid anything. Provider reviewed my intake the same day.",
          },
        ],
      },
      {
        id: "wl-daniel",
        kind: "portrait" as const,
        src: "/landing/social/people/athletes.png",
        size: "wide" as const,
        objectPosition: "48% 16%",
        note: {
          name: "Daniel M.",
          text: "Clear protocol around training days. Care replies between sessions. Available if prescribed after clinical review.",
        },
      },
      {
        id: "wl-stack-physician",
        kind: "stack" as const,
        tiles: [
          {
            id: "wl-quote-physician",
            kind: "quote" as const,
            tone: "sage" as const,
            text: "TIDL is physician guided care, made in the USA, available if prescribed after clinical review.",
          },
          {
            id: "wl-priya-oval",
            kind: "media" as const,
            src: "/landing/social/people/womens-health.png",
            shape: "oval" as const,
            objectPosition: "50% 20%",
            note: {
              name: "Priya N.",
              text: "The intake asked about the shifts I actually live. Provider reviewed it the same day. Available if prescribed after clinical review.",
            },
          },
        ],
      },
      {
        id: "wl-sofia",
        kind: "portrait" as const,
        src: "/landing/social/people/parents.png",
        objectPosition: "50% 22%",
        note: {
          name: "Sofia K.",
          text: "Fits school runs. Reordering takes one tap. The care team actually responds.",
        },
      },
      {
        id: "wl-stack-legitimate",
        kind: "stack" as const,
        tiles: [
          {
            id: "wl-chop-pill",
            kind: "media" as const,
            src: "/landing/lifestyle/weight-loss-chop.png",
            shape: "pill" as const,
            objectPosition: "50% 45%",
          },
          {
            id: "wl-quote-legitimate",
            kind: "quote" as const,
            tone: "paper" as const,
            text: "Felt legitimate from day one. Real doctors, real pharmacy, clear instructions.",
          },
        ],
      },
      {
        id: "wl-circle-b",
        kind: "circle" as const,
        src: "/landing/social/filler/creative.png",
        objectPosition: "50% 50%",
      },
      {
        id: "wl-chris",
        kind: "portrait" as const,
        src: "/landing/social/ugc/tidl-ugc-executives.png",
        objectPosition: "50% 16%",
        note: {
          name: "Chris P.",
          text: "Fits between meetings. Same-day provider review. The plan was clear before I paid anything.",
        },
      },
      {
        id: "wl-stack-elena",
        kind: "stack" as const,
        tiles: [
          {
            id: "wl-quote-pharmacy",
            kind: "quote" as const,
            tone: "sand" as const,
            text: "Labeled from a US pharmacy. Care answers when I write.",
          },
          {
            id: "wl-elena-pill",
            kind: "media" as const,
            src: "/landing/social/people/skin-hair.png",
            shape: "pill" as const,
            objectPosition: "50% 22%",
            note: {
              name: "Elena V.",
              text: "TIDL treated this like care, not a checkout. Physician review, then a US pharmacy if prescribed.",
            },
          },
        ],
      },
      {
        id: "wl-ruth",
        kind: "portrait" as const,
        src: "/landing/social/people/healthspan.png",
        objectPosition: "50% 18%",
        note: {
          name: "Ruth M.",
          text: "Care built for the years ahead. Physician guided, made in the USA, if prescribed after clinical review.",
        },
      },
      {
        id: "wl-stack-amara",
        kind: "stack" as const,
        tiles: [
          {
            id: "wl-amara-oval",
            kind: "media" as const,
            src: "/landing/social/people/motion-blur.png",
            shape: "oval" as const,
            objectPosition: "50% 28%",
            note: {
              name: "Amara J.",
              text: "Follow-up messages keep me from guessing. Care that shows up between the sessions that matter.",
            },
          },
          {
            id: "wl-quote-cart",
            kind: "quote" as const,
            tone: "paper" as const,
            text: "Care that starts with a physician, not a cart. Available if prescribed after clinical review.",
          },
        ],
      },
    ],
  },
  bmi: {
    title: "BMI Calculator",
    body:
      "BMI uses height and weight to estimate whether your weight falls in a common range for your height. It is an educational screen, not a diagnosis.",
    disclaimer:
      "BMI does not measure body fat directly and may misclassify people with high muscle mass, pregnancy, older adults, children, or certain medical conditions.",
    mediaSrc: "/landing/lifestyle/womens-health-coast.png",
  },
  quality: {
    titleLines: ["Always quality tested,", "batch by batch"] as const,
    backgroundSrc: "/landing/lifestyle/weight-loss-field.png",
    plate: {
      fieldSrc: "/landing/lifestyle/weight-loss-field.png",
      vialSrc: "/pdp/weight-loss-vial.png?v=3",
      callouts: [
        {
          chip: "Appetite",
          body: "Built for hunger that has been the whole job",
          side: "left" as const,
          anchor: "cap" as const,
        },
        {
          chip: "Pace",
          body: "Built for loss your physician is willing to stand behind",
          side: "right" as const,
          anchor: "label" as const,
        },
        {
          chip: "Muscle",
          body: "Built for protecting lean mass while the scale moves",
          side: "left" as const,
          anchor: "base" as const,
        },
      ],
    },
    body: [
      "Your plan ships from a state licensed pharmacy in our network when prescribed.",
      "Every batch is tested in chemistry and microbiology labs at the pharmacy facility against defined parameters.",
    ],
    metrics: [
      {
        metric: "Potency",
        description:
          "Performed on a recurring schedule. Confirms concentration is within the pharmacy acceptance window for the active ingredient.",
      },
      {
        metric: "Sterility",
        description:
          "Confirms the preparation is free from contaminants. Batches must meet applicable USP sterile compounding requirements.",
      },
      {
        metric: "pH",
        description:
          "Checks acid base balance to support comfort on administration when injectable.",
      },
      {
        metric: "Endotoxicity",
        description:
          "Screens for bacterial endotoxins within USP defined thresholds, alongside sterility testing.",
      },
    ],
  },
  /**
   * One Seed-style sequence: clinical intake into titration.
   * Process language only. No outcome claims. Imagery from Figma 647:6576.
   */
  careFlow: {
    headline: "Step by Step Care",
    subtitle:
      "Intake, a clinician review, then a plan at a level that fits, if prescribed.",
    stages: [
      {
        marker: "Day one",
        title: "Share your history",
        body: "Complete a medical intake from wherever you are. Cover current care, goals, and anything a clinician should know before they review.",
      },
      {
        marker: "Review",
        title: "A clinician decides",
        body: "A licensed physician reads your answers. They may prescribe, request a visit, or decline. Nothing ships without that review.",
      },
      {
        marker: "If prescribed",
        title: "Start low",
        body: "A US based compounding pharmacy fills the plan. Your clinician begins at a low level so your system can adjust. Appetite cues may shift.",
      },
      {
        marker: "Week 4",
        title: "Step when you are ready",
        body: "If you are tolerating the plan, your clinician may raise the level. Each hold is typically about four weeks. Pace follows how you feel.",
      },
      {
        marker: "Week 16",
        title: "Find a level that fits",
        later: true,
        body: "Steps continue toward a maintenance level your clinician considers appropriate. They can pause, hold, or step back. This is not a race to the top.",
      },
    ],
    collage: {
      hero: {
        id: "pdp.weight-loss.flow-hero",
        src: "/landing/lifestyle/stylized-weight-loss.png",
        label: "Weight Loss",
        swatch: "#6b7f6a",
      },
      round: {
        id: "pdp.weight-loss.flow-round",
        src: "/pdp/weight-loss-vial.png?v=3",
        label: "Weight Loss vial",
        swatch: "#fbf9f6",
        fit: "contain" as const,
        vivid: false,
        bloom: true,
      },
      inset: {
        id: "pdp.weight-loss.flow-inset",
        src: "/landing/lifestyle/weight-loss-chop.png",
        label: "Weight Loss prep",
        swatch: "#5c4a3a",
      },
    },
  },
  reading: {
    title: "TIDL Health Guide",
    items: [
      {
        id: "guide-access",
        title: "Safe access to clinician guided GLP 1 care",
        meta: "Care basics",
        media: {
          id: "pdp.reading.wl-1",
          label: "Guide access",
          swatch: "#405774",
          note: "Walk",
          src: "/landing/lifestyle/weight-loss-walk.png",
        },
      },
      {
        id: "guide-bmi",
        title: "BMI versus body composition",
        meta: "Tools",
        media: {
          id: "pdp.reading.wl-2",
          label: "Guide BMI",
          swatch: "#6b8f7a",
          note: "Mint guide",
          src: "/landing/lifestyle/weight-loss-chop.png",
        },
      },
      {
        id: "guide-strength",
        title: "Strength training for beginners",
        meta: "Training",
        media: {
          id: "pdp.reading.wl-3",
          label: "Guide strength",
          swatch: "#8b6b4a",
          note: "Warm guide",
          src: "/landing/lifestyle/weight-loss-golden.png",
        },
      },
    ],
  },
  pairing: {
    title: "Complete your routine",
    fieldSrc: "/landing/section-2/fields/weight-loss.png",
    cta: { label: "Get started", href: "/care/intake?entry=weight-loss" },
    left: {
      id: "transformation" as const,
      vialSrc: "/landing/shop/pairing/transformation-upright.png",
      baseX: 0.5,
      width: 468,
      height: 971,
    },
    right: {
      id: "recovery-performance" as const,
      vialSrc: "/landing/shop/pairing/recovery-tilt-right.png",
      baseX: 0.426,
      width: 662,
      height: 950,
    },
    leftBody:
      "A physician guided GLP 1 stack for appetite, composition, and the months it takes. Available after clinical review.",
    rightBody:
      "A stack for soreness, wear, and the days you keep moving. Available after clinical review.",
  },
  related: {
    eyebrow: "Related paths",
    title: "Complement your plan",
    products: [
      {
        id: "recovery-performance",
        name: "Recovery & Performance",
        meta: "Rebound and stay sharp",
        price: "From $120",
        mediaSlot: "category.product.recovery-stack",
        mediaSrc: "/landing/treatments/card-recovery-performance.png",
        swatch: "#4a5c6a",
      },
      {
        id: "transformation",
        name: "Appetite Balance",
        meta: "Treatment",
        price: "From $197",
        mediaSlot: "category.product.transformation-stack",
        mediaSrc: "/landing/treatments/card-weight-loss.png",
        swatch: "#6a5a4a",
      },
      {
        id: "mens-health",
        name: "Energy & Strength",
        meta: "Hormone review",
        price: "From $150",
        mediaSlot: "category.product.energy-stack",
        mediaSrc: "/landing/treatments/card-mens-health.png",
        swatch: "#3a4a5c",
      },
    ],
  },
  testing: {
    eyebrow: "Pharmacy standard",
    headline: "Analytic testing is the floor.",
    lede: "We only work with US based compounding pharmacies that run analytic testing on their batches. If they cannot show that work, they are not in the network.",
    items: [
      {
        id: "batch",
        icon: "batch" as const,
        title: "Tested batch by batch against defined parameters.",
      },
      {
        id: "analytic",
        icon: "analytic" as const,
        title: "Chemistry and microbiology on every batch.",
      },
      {
        id: "licensed",
        icon: "licensed" as const,
        title: "State licensed US compounding, if prescribed.",
      },
    ],
  },
  pageFaq: {
    title: "Frequently asked questions",
    intro:
      "Member price, prescription price, first month and ongoing rates, renewals, cancellation, and what happens if treatment is not prescribed.",
    items: [
      {
        id: "higher-dose",
        question: "Can I start on a higher plan level?",
        answer:
          "If you are switching from another provider, share your current plan during intake. Your clinician decides whether to maintain or adjust, if prescribed.",
      },
      {
        id: "how-works",
        question: "How does this care path work?",
        answer:
          "GLP 1 pathways help regulate appetite and blood sugar signaling. Your clinician explains the plan that fits your goals if prescribed.",
      },
      {
        id: "alternatives",
        question: "Are there alternatives?",
        answer:
          "Your clinician may discuss FDA approved options or other stacks when clinically appropriate. Decisions stay with the prescribing clinician.",
      },
      {
        id: "side-effects",
        question: "What side effects should I know about?",
        answer:
          "Common effects can include nausea, digestive changes, injection site reactions, and fatigue. Review Important Safety Information and talk with your clinician.",
      },
      {
        id: "fda",
        question: "Is compounded medication FDA approved?",
        answer:
          "Compounded medications are not FDA approved. Brand products that contain similar actives may be FDA approved and are distinct from compounded preparations.",
      },
      {
        id: "not-approved",
        question: "What if a clinician asks for a visit instead?",
        answer:
          "Your clinician may request a visit before deciding. You are told before any extra charge. If they do not prescribe after that visit, you are refunded in full.",
      },
    ],
  },
} as const;
