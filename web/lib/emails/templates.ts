import { emailAsset, type EmailSpec } from "./chrome";

const LEGAL =
  "Compounds available if prescribed after clinical review. TIDL does not guarantee outcomes. This email is not medical advice.";
const FOOTER = "Physician guided care. Made in the USA. If prescribed after clinical review.";
const CARE = { label: "See what's right for you", href: "/care/intake?entry=symptoms" };
const PEN_STATEMENT = {
  kicker: "The object",
  lines: ["One pre-dosed pen.", "No powders.", "No vials."],
  src: "/landing/pen.png",
};

function withSite(siteUrl: string, spec: EmailSpec): EmailSpec {
  const abs = (href: string) =>
    href.startsWith("http") ? href : emailAsset(siteUrl, href);
  return {
    ...spec,
    homeUrl: siteUrl.replace(/\/$/, ""),
    heroSrc: spec.heroSrc.startsWith("http") ? spec.heroSrc : abs(spec.heroSrc),
    heroPrimary: { ...spec.heroPrimary, href: abs(spec.heroPrimary.href) },
    heroSecondary: spec.heroSecondary
      ? { ...spec.heroSecondary, href: abs(spec.heroSecondary.href) }
      : undefined,
    products: spec.products.map((product) => ({
      ...product,
      src: product.src.startsWith("http") ? product.src : abs(product.src),
      href: abs(product.href),
    })),
    quote: spec.quote
      ? {
          ...spec.quote,
          portraitSrc: spec.quote.portraitSrc
            ? abs(spec.quote.portraitSrc)
            : undefined,
        }
      : undefined,
    cta: { ...spec.cta, href: abs(spec.cta.href) },
  };
}

const stacks = [
  {
    src: "/landing/shop/vials/transformation.png?v=4",
    label: "Appetite Balance",
    href: "/stacks/transformation",
  },
  {
    src: "/landing/shop/vials/athlete.png?v=5",
    label: "Dynamic Training",
    href: "/programs/athletes",
  },
  {
    src: "/landing/shop/vials/executive.png?v=3",
    label: "Peak Performance",
    href: "/programs/ceos-and-executives",
  },
] as const;

export function welcomeResetEmail(siteUrl: string): EmailSpec {
  return withSite(siteUrl, {
    id: "welcome-reset",
    name: "Welcome — Reset your day.",
    subject: "Reset your day.",
    preheader: "A full reset for mind, body, and the days between.",
    promo: "$100 off your first order",
    chapter: "01  ·  Appetite Balance",
    headline: "Reset your day.",
    heroSrc: "/landing/hero/transformation.jpg",
    heroPrimary: { label: "Shop Appetite Balance", href: "/stacks/transformation" },
    heroSecondary: CARE,
    eyebrow: "Physician guided",
    bodyHeadline: "The care you have always deserved",
    bodyCopy: "A full reset for mind, body, and the days between.",
    products: [...stacks],
    statement: PEN_STATEMENT,
    cta: CARE,
    legal: LEGAL,
    footer: FOOTER,
  });
}

export function abandonedIntakeEmail(siteUrl: string): EmailSpec {
  return withSite(siteUrl, {
    id: "abandoned-intake",
    name: "Abandoned intake — Stay sharp.",
    subject: "Stay sharp. Your intake is saved.",
    preheader: "High output care for people who live in meetings.",
    promo: "Your intake is saved",
    chapter: "02  ·  Peak Performance",
    headline: "Stay sharp.",
    heroSrc: "/landing/hero/ceos-and-executives.jpg",
    heroPrimary: {
      label: "Finish your intake",
      href: "/care/intake?entry=symptoms",
    },
    heroSecondary: {
      label: "Shop Peak Performance",
      href: "/programs/ceos-and-executives",
    },
    eyebrow: "Still here when you are",
    bodyHeadline: "High output care for people who live in meetings.",
    bodyCopy: "Pick up where you left off. Same-day provider review.",
    quote: {
      text: "Fits between meetings. Same-day provider review. The plan was clear before I paid anything.",
      attribution: "Chris P.",
      portraitSrc: "/landing/social/james-r.png",
    },
    products: [stacks[2], stacks[0], stacks[1]],
    statement: {
      kicker: "Still here",
      lines: ["Your intake is saved.", "Pick up when you are ready."],
    },
    cta: CARE,
    legal:
      "Available if prescribed after clinical review. TIDL does not guarantee outcomes.",
    footer: "Physician guided care. Made in the USA.",
  });
}

export function shippedEmail(siteUrl: string): EmailSpec {
  return withSite(siteUrl, {
    id: "shipped",
    name: "Shipped — Quiet the food noise.",
    subject: "Your care is on the way.",
    preheader: "Your first protocol just left the pharmacy.",
    promo: "Free shipping on orders over $150",
    chapter: "03  ·  Weight Loss",
    headline: "Quiet the food noise.",
    heroSrc: "/landing/hero/weight-loss.jpg",
    heroPrimary: { label: "Track your order", href: "/care/home" },
    heroSecondary: { label: "Open your care guide", href: "/guide" },
    eyebrow: "On the way",
    bodyHeadline: "Your first protocol just left the pharmacy.",
    bodyCopy: "Unbox. Read the card. Start when your clinician said to.",
    products: [
      {
        src: "/landing/shop/vials/weight-loss.png?v=3",
        label: "Weight Loss",
        href: "/treatments/weight-loss",
      },
    ],
    statement: {
      kicker: "Shipped",
      lines: ["Your first protocol", "just left the pharmacy."],
    },
    cta: { label: "Open your care guide", href: "/guide" },
    legal:
      "Available if prescribed after clinical review. TIDL does not guarantee outcomes.",
    footer: "Physician guided care. Made in the USA.",
  });
}

export function listWelcomeEmail(siteUrl: string): EmailSpec {
  return withSite(siteUrl, {
    id: "list-welcome",
    name: "List — You are on the list",
    subject: "You are on the list",
    preheader: "Early access notes when new stacks open.",
    promo: "$100 off your first order",
    chapter: "Welcome  ·  TIDL",
    headline: "You are on the list.",
    heroSrc: "/landing/hero/transformation.jpg",
    heroPrimary: { label: "Explore stacks", href: "/stacks" },
    heroSecondary: CARE,
    eyebrow: "You are in",
    bodyHeadline: "Early notes. Practitioner framed.",
    bodyCopy: "Early access when new stacks open. Start a visit when you are ready.",
    products: [...stacks],
    statement: PEN_STATEMENT,
    cta: { label: "Explore stacks", href: "/stacks" },
    legal:
      "Physician guided therapy. Made in the USA. This is not medical advice. Treatments require a prescription if prescribed.",
    footer: FOOTER,
  });
}

export function allMarketingEmails(siteUrl: string): EmailSpec[] {
  return [
    welcomeResetEmail(siteUrl),
    abandonedIntakeEmail(siteUrl),
    shippedEmail(siteUrl),
    listWelcomeEmail(siteUrl),
  ];
}
