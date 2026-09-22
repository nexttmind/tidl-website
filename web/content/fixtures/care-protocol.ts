import type { ThemeId } from "@/content/brand/peptide-identity";
import { catalogVialSrc } from "@/content/fixtures/catalog";

/**
 * Post-review protocol / order fixture.
 * Authenticated portal surface: named agents allowed (compliance portal boundary).
 * Values are demo sample data, not live PHI.
 */

export type ProtocolAgent = {
  id: string;
  name: string;
  description: string;
  dosage: string;
  type: "RX" | "EVAL";
  /** Lifestyle / product plate for the visual grid */
  image: string;
  imageAlt: string;
};

export type ProtocolGalleryPlate = {
  id: string;
  src: string;
  alt: string;
};

export type CareTeamMember = {
  id: string;
  name: string;
  role: string;
  status: string;
  /** Generated portrait from the care dial roster. */
  imageSrc?: string;
  imageAlt?: string;
};

export type PharmacyInfo = {
  name: string;
  detail: string;
  status: string;
};

export type ClinicalSummaryRow = {
  label: string;
  value: string;
};

export type FulfillmentStep = {
  marker: string;
  title: string;
  body: string;
  later?: boolean;
};

export type FulfillmentCollagePlate = {
  id: string;
  src: string;
  label: string;
  swatch?: string;
  fit?: "cover" | "contain";
  bloom?: boolean;
};

export type CareProtocolOrder = {
  entrySlug: string;
  statusLabel: string;
  greetingEyebrow: string;
  stackName: string;
  stackMeta: string;
  price: string;
  priceNote: string;
  hero: {
    image: string;
    video?: string;
    alt: string;
  };
  gallery: readonly ProtocolGalleryPlate[];
  agents: readonly ProtocolAgent[];
  goals: readonly string[];
  historyFlags: readonly string[];
  careTeam: readonly CareTeamMember[];
  pharmacy: PharmacyInfo;
  clinicalSummary: {
    title: string;
    rows: readonly ClinicalSummaryRow[];
  };
  paymentDisclaimer: string;
  fulfillmentHeadline: string;
  fulfillmentSubtitle: string;
  fulfillmentThemeId: ThemeId;
  fulfillmentSteps: readonly FulfillmentStep[];
  fulfillmentCollage: {
    hero: FulfillmentCollagePlate;
    round: FulfillmentCollagePlate;
    inset: FulfillmentCollagePlate;
  };
};

export const careProtocolByEntry: Record<string, CareProtocolOrder> = {
  executives: {
    entrySlug: "executives",
    statusLabel: "Awaiting payment",
    greetingEyebrow: "One step remaining",
    stackName: "Executive Performance Core stack",
    stackMeta: "Seven directions of care · One pre dosed pen · Physician review includes",
    price: "$395",
    priceNote: "Charged now. If your physician determines the therapy is not appropriate for you, you are refunded in full.",
    hero: {
      image: "/landing/hero/ceos-and-executives.jpg?v=7",
      video: "/landing/hero/ceos-and-executives.mp4?v=7",
      alt: "Executive care protocol atmosphere",
    },
    gallery: [
      {
        id: "g1",
        src: "/landing/hero/ceos-and-executives.jpg?v=7",
        alt: "Executive protocol lifestyle",
      },
      {
        id: "g2",
        src: "/landing/category/hero-executive.png",
        alt: "Executive stack plate",
      },
      {
        id: "g3",
        src: "/landing/category/note-executive.png",
        alt: "Executive care note",
      },
      {
        id: "g4",
        src: "/landing/category/export-executive.png",
        alt: "Executive field",
      },
    ],
    agents: [
      {
        id: "sermorelin",
        name: "Sermorelin acetate",
        description: "Growth hormone releasing hormone analog",
        dosage: "0.3 mg nightly",
        type: "RX",
        image: "/landing/hero/ceos-and-executives.jpg?v=7",
        imageAlt: "Executive protocol lifestyle",
      },
      {
        id: "nad",
        name: "NAD+",
        description: "Nicotinamide adenine dinucleotide",
        dosage: "100 mg weekly",
        type: "RX",
        image: "/landing/category/hero-executive.png",
        imageAlt: "Executive stack plate",
      },
      {
        id: "bpc-tb",
        name: "BPC-157 with TB-500",
        description: "Peptide fragments studied for tissue repair",
        dosage: "Physician set, cycled",
        type: "RX",
        image: "/landing/category/note-executive.png",
        imageAlt: "Executive care note",
      },
      {
        id: "trt-eval",
        name: "Testosterone optimization evaluation",
        description: "Hormone evaluation, therapy only if indicated",
        dosage: "Set after labs",
        type: "EVAL",
        image: "/landing/category/export-executive.png",
        imageAlt: "Executive field",
      },
    ],
    goals: ["Peak Performance", "Sleep", "Longevity", "Energy"],
    historyFlags: ["None of these"],
    careTeam: [
      {
        id: "physician",
        name: "Dr. Maria Jensen, MD",
        role: "Board certified, internal medicine · Licensed in California",
        status: "Assigned, awaiting your payment",
        imageSrc: "/landing/providers/jensen.png",
        imageAlt: "Dr. Maria Jensen",
      },
    ],
    pharmacy: {
      name: "Meridian Compounding",
      detail: "Irvine, California · 503A licensed, sterile compounding",
      status: "Standing by",
    },
    clinicalSummary: {
      title: "What your physician sees",
      rows: [
        { label: "Age", value: "41" },
        { label: "Sex at birth", value: "Male" },
        { label: "State", value: "California" },
        { label: "Height", value: "5 ft 11 in" },
        { label: "Weight", value: "182 lb" },
        { label: "Sleep", value: "Broken but manageable" },
        { label: "Medications", value: "None reported" },
        { label: "Allergies", value: "None reported" },
      ],
    },
    paymentDisclaimer:
      "Charged now. If your physician determines the therapy is not appropriate for you, you are refunded in full.",
    fulfillmentHeadline: "From order to pen",
    fulfillmentSubtitle: "What happens next",
    fulfillmentThemeId: "executive",
    fulfillmentSteps: [
      {
        marker: "Now",
        title: "Place your order",
        body: "Confirm payment on this page. Your prescription stays with your care team.",
      },
      {
        marker: "Pharmacy",
        title: "Pharmacy compounds",
        body: "Your assigned pharmacy prepares the pen for your protocol, if prescribed.",
      },
      {
        marker: "Delivery",
        title: "Ships discreetly",
        later: true,
        body: "Typically within three to five business days after the pharmacy releases the order.",
      },
    ],
    fulfillmentCollage: {
      hero: {
        id: "protocol.executives.flow-hero",
        src: "/landing/hero/ceos-and-executives.jpg?v=7",
        label: "Executive care",
        swatch: "#386c5f",
      },
      round: {
        id: "protocol.executives.flow-round",
        src: catalogVialSrc("executive"),
        label: "Executive vial",
        swatch: "#fbf9f6",
        fit: "contain",
        bloom: true,
      },
      inset: {
        id: "protocol.executives.flow-inset",
        src: "/landing/category/note-executive.png",
        label: "Executive care",
        swatch: "#c4783a",
      },
    },
  },
  transformation: {
    entrySlug: "transformation",
    statusLabel: "Awaiting payment",
    greetingEyebrow: "One step remaining",
    stackName: "Appetite Balance stack",
    stackMeta: "Goal framed GLP 1 protocol · Physician guided · Pen delivered",
    price: "$349",
    priceNote:
      "Charged now. If your physician determines the therapy is not appropriate for you, you are refunded in full.",
    hero: {
      image: "/landing/hero/transformation.jpg?v=5",
      video: "/landing/hero/transformation.mp4?v=5",
      alt: "Transformation protocol atmosphere",
    },
    gallery: [
      {
        id: "g1",
        src: "/landing/hero/transformation.jpg?v=5",
        alt: "Transformation lifestyle",
      },
      {
        id: "g2",
        src: "/landing/category/hero-transformation.png",
        alt: "Transformation stack plate",
      },
      {
        id: "g3",
        src: "/landing/category/note-transformation.png",
        alt: "Transformation note",
      },
      {
        id: "g4",
        src: "/landing/category/export-transformation.png",
        alt: "Transformation field",
      },
    ],
    agents: [
      {
        id: "glp1",
        name: "GLP 1 protocol",
        description: "Compounded for you when clinically appropriate",
        dosage: "Physician set titration",
        type: "RX",
        image: "/landing/hero/transformation.jpg?v=5",
        imageAlt: "Transformation lifestyle",
      },
      {
        id: "support",
        name: "Metabolic support panel",
        description: "Labs and follow up your clinician may order",
        dosage: "Set after review",
        type: "EVAL",
        image: "/landing/category/hero-transformation.png",
        imageAlt: "Transformation stack plate",
      },
    ],
    goals: ["Weight and appetite", "Energy", "Longevity"],
    historyFlags: ["None of these"],
    careTeam: [
      {
        id: "physician",
        name: "Dr. Alin Andersson, MD",
        role: "Board certified, internal medicine · Licensed in California",
        status: "Assigned, awaiting your payment",
        imageSrc: "/landing/providers/andersson.png",
        imageAlt: "Dr. Alin Andersson",
      },
    ],
    pharmacy: {
      name: "Meridian Compounding",
      detail: "Irvine, California · 503A licensed, sterile compounding",
      status: "Standing by",
    },
    clinicalSummary: {
      title: "What your physician sees",
      rows: [
        { label: "Age", value: "38" },
        { label: "Sex at birth", value: "Female" },
        { label: "State", value: "California" },
        { label: "Height", value: "5 ft 6 in" },
        { label: "Weight", value: "168 lb" },
        { label: "Sleep", value: "Mostly steady" },
        { label: "Medications", value: "None reported" },
        { label: "Allergies", value: "None reported" },
      ],
    },
    paymentDisclaimer:
      "Charged now. If your physician determines the therapy is not appropriate for you, you are refunded in full.",
    fulfillmentHeadline: "From order to pen",
    fulfillmentSubtitle: "What happens next",
    fulfillmentThemeId: "transformation",
    fulfillmentSteps: [
      {
        marker: "Now",
        title: "Place your order",
        body: "Confirm payment on this page. Your prescription stays with your care team.",
      },
      {
        marker: "Pharmacy",
        title: "Pharmacy compounds",
        body: "Your assigned pharmacy prepares the pen for your protocol, if prescribed.",
      },
      {
        marker: "Delivery",
        title: "Ships discreetly",
        later: true,
        body: "Typically within three to five business days after the pharmacy releases the order.",
      },
    ],
    fulfillmentCollage: {
      hero: {
        id: "protocol.transformation.flow-hero",
        src: "/landing/hero/transformation.jpg?v=5",
        label: "Appetite Balance",
        swatch: "#6b7f6a",
      },
      round: {
        id: "protocol.transformation.flow-round",
        src: catalogVialSrc("transformation"),
        label: "Appetite Balance vial",
        swatch: "#fbf9f6",
        fit: "contain",
        bloom: true,
      },
      inset: {
        id: "protocol.transformation.flow-inset",
        src: "/landing/category/note-transformation.png",
        label: "Appetite Balance",
        swatch: "#5c4a3a",
      },
    },
  },
};

const DEFAULT_PROTOCOL = careProtocolByEntry.executives;

const ENTRY_ALIASES: Record<string, keyof typeof careProtocolByEntry> = {
  executives: "executives",
  transformation: "transformation",
  "weight-loss": "transformation",
  "recovery-performance": "executives",
  athletes: "executives",
  creators: "executives",
  healthspan: "executives",
  parents: "executives",
  travelers: "executives",
  testosterone: "executives",
  "womens-balance": "executives",
  "sexual-health": "executives",
  "skin-hair": "executives",
  symptoms: "executives",
};

type LifestylePlate = {
  src: string;
  alt: string;
};

type ProtocolMedia = {
  themeId: ThemeId;
  label: string;
  hero: CareProtocolOrder["hero"];
  lifestyle: readonly LifestylePlate[];
  collageHero: string;
  collageInset: string;
  vialSrc: string;
};

/** Labeled plates from Figma Imagery (node 647:6576). */
function labeledMedia(
  folder: string,
  themeId: ThemeId,
  label: string,
  plates: readonly [LifestylePlate, LifestylePlate, LifestylePlate],
  video?: string,
  vialSrc?: string,
): ProtocolMedia {
  const base = `/landing/imagery/${folder}`;
  return {
    themeId,
    label,
    hero: {
      image: plates[0].src,
      ...(video ? { video } : {}),
      alt: `${label} care atmosphere`,
    },
    lifestyle: plates,
    collageHero: `${base}/stylized.png`,
    collageInset: plates[1].src,
    vialSrc: vialSrc ?? catalogVialSrc(themeId),
  };
}

const PROTOCOL_MEDIA: Record<string, ProtocolMedia> = {
  executives: labeledMedia(
    "executives",
    "executive",
    "Peak Performance",
    [
      { src: "/landing/imagery/executives/01-corridor.png", alt: "Office corridor" },
      { src: "/landing/imagery/executives/02-desk-crop.png", alt: "Desk crop" },
      { src: "/landing/imagery/executives/03-window-ledge.png", alt: "Window ledge" },
    ],
    "/landing/hero/ceos-and-executives.mp4?v=7",
  ),
  transformation: labeledMedia(
    "transformation",
    "transformation",
    "Appetite Balance",
    [
      { src: "/landing/imagery/transformation/01-getting-dressed.png", alt: "Getting dressed" },
      { src: "/landing/imagery/transformation/02-fabric-crop.png", alt: "Fabric crop" },
      { src: "/landing/imagery/transformation/03-dresser.png", alt: "Dresser" },
    ],
    "/landing/hero/transformation.mp4?v=5",
  ),
  "weight-loss": labeledMedia(
    "weight-loss",
    "weight-loss",
    "Weight Loss",
    [
      { src: "/landing/imagery/weight-loss/01-walk.png", alt: "Walk" },
      { src: "/landing/imagery/weight-loss/02-chop-crop.png", alt: "Chop crop" },
      { src: "/landing/imagery/weight-loss/03-kitchen.png", alt: "Kitchen" },
    ],
    "/landing/hero/weight-loss.mp4",
    "/pdp/weight-loss-vial.png?v=3",
  ),
  athletes: labeledMedia(
    "athletes",
    "athlete",
    "Dynamic Training",
    [
      { src: "/landing/imagery/athletes/01-joyful-hold.png", alt: "Joyful hold" },
      { src: "/landing/imagery/athletes/02-close-up-crop.png", alt: "Close-up crop" },
      { src: "/landing/imagery/athletes/03-trackside.png", alt: "Trackside" },
    ],
    "/landing/hero/athletes.mp4?v=1",
  ),
  creators: labeledMedia(
    "creators",
    "creative",
    "Focus",
    [
      { src: "/landing/imagery/creators/01-screen-hold.png", alt: "Screen hold" },
      { src: "/landing/imagery/creators/02-desk-crop.png", alt: "Desk crop" },
      { src: "/landing/imagery/creators/03-workbench.png", alt: "Workbench" },
    ],
    "/landing/hero/creators-and-builders.mp4?v=2",
  ),
  healthspan: labeledMedia(
    "healthspan",
    "legacy",
    "Healthspan",
    [
      { src: "/landing/imagery/healthspan/01-kitchen-morning.png", alt: "Kitchen morning" },
      { src: "/landing/imagery/healthspan/02-hands-crop.png", alt: "Hands crop" },
      { src: "/landing/imagery/healthspan/03-park-path.png", alt: "Park path" },
    ],
    "/landing/hero/healthspan.mp4?v=1",
  ),
  parents: labeledMedia(
    "parents",
    "parents",
    "Stress & Mood",
    [
      { src: "/landing/imagery/parents/01-after-the-rush.png", alt: "After the rush" },
      { src: "/landing/imagery/parents/02-counter-crop.png", alt: "Counter crop" },
      { src: "/landing/imagery/parents/03-back-steps.png", alt: "Back steps" },
    ],
    "/landing/hero/parents.mp4?v=1",
  ),
  travelers: labeledMedia(
    "travelers",
    "traveler",
    "Jetlag Recovery",
    [
      { src: "/landing/imagery/travelers/01-hotel-window.png", alt: "Hotel window" },
      { src: "/landing/imagery/travelers/02-passport-crop.png", alt: "Passport crop" },
      { src: "/landing/imagery/travelers/03-nightstand.png", alt: "Nightstand" },
    ],
    "/landing/hero/travelers.mp4?v=1",
  ),
  "recovery-performance": labeledMedia(
    "recovery-performance",
    "recovery-performance",
    "Recovery and Performance",
    [
      { src: "/landing/imagery/recovery-performance/01-stretch.png", alt: "Stretch" },
      { src: "/landing/imagery/recovery-performance/02-tape-crop.png", alt: "Tape crop" },
      { src: "/landing/imagery/recovery-performance/03-bench.png", alt: "Bench" },
    ],
    "/landing/hero/recovery-and-performance.mp4?v=2",
  ),
  testosterone: labeledMedia(
    "testosterone",
    "mens-health",
    "Energy & Strength",
    [
      { src: "/landing/imagery/testosterone/01-locker-room.png", alt: "Locker room" },
      { src: "/landing/imagery/testosterone/02-chalk-crop.png", alt: "Chalk crop" },
      { src: "/landing/imagery/testosterone/03-gym-floor.png", alt: "Gym floor" },
    ],
    "/landing/hero/mens-health.mp4?v=3",
  ),
  "womens-balance": labeledMedia(
    "womens-balance",
    "womens-balance",
    "Balance & Beauty",
    [
      { src: "/landing/imagery/womens-balance/01-morning-stretch.png", alt: "Morning stretch" },
      { src: "/landing/imagery/womens-balance/02-tea-crop.png", alt: "Tea crop" },
      { src: "/landing/imagery/womens-balance/03-windowsill.png", alt: "Windowsill" },
    ],
    "/landing/hero/womens-balance.mp4?v=3",
  ),
  "sexual-health": labeledMedia(
    "sexual-health",
    "sexual-health",
    "Sexual Health",
    [
      { src: "/landing/imagery/sexual-health/01-evening-in.png", alt: "Evening in" },
      { src: "/landing/imagery/sexual-health/02-linen-crop.png", alt: "Linen crop" },
      { src: "/landing/imagery/sexual-health/03-nightstand.png", alt: "Nightstand" },
    ],
    "/landing/hero/sexual-health.mp4?v=2",
  ),
  "skin-hair": labeledMedia(
    "skin-hair",
    "skin-hair",
    "Skin and Hair",
    [
      { src: "/landing/imagery/skin-hair/01-bathroom-light.png", alt: "Bathroom light" },
      { src: "/landing/imagery/skin-hair/02-face-crop.png", alt: "Face crop" },
      { src: "/landing/imagery/skin-hair/03-vanity.png", alt: "Vanity" },
    ],
    "/landing/hero/skin-and-hair.mp4",
  ),
};

PROTOCOL_MEDIA.symptoms = PROTOCOL_MEDIA.executives;

function applyProtocolMedia(
  protocol: CareProtocolOrder,
  slug: string,
): CareProtocolOrder {
  const media = PROTOCOL_MEDIA[slug] ?? PROTOCOL_MEDIA.executives;
  const plates = media.lifestyle;
  return {
    ...protocol,
    entrySlug: slug,
    hero: media.hero,
    gallery: plates.map((plate, index) => ({
      id: `${slug}-g${index + 1}`,
      src: plate.src,
      alt: plate.alt,
    })),
    agents: protocol.agents.map((agent, index) => {
      const plate = plates[index % plates.length];
      return {
        ...agent,
        image: plate.src,
        imageAlt: plate.alt,
      };
    }),
    fulfillmentThemeId: media.themeId,
    fulfillmentCollage: {
      hero: {
        id: `${slug}.flow-hero`,
        src: media.collageHero,
        label: media.label,
        swatch: "#6b7f6a",
      },
      round: {
        id: `${slug}.flow-round`,
        src: media.vialSrc,
        label: `${media.label} vial`,
        swatch: "#fbf9f6",
        fit: "contain",
        bloom: true,
      },
      inset: {
        id: `${slug}.flow-inset`,
        src: media.collageInset,
        label: media.label,
        swatch: "#5c4a3a",
      },
    },
  };
}

export function resolveCareProtocol(
  entrySlug: string | null | undefined,
): CareProtocolOrder {
  const slug = entrySlug || DEFAULT_PROTOCOL.entrySlug;
  const key = ENTRY_ALIASES[slug] ?? "executives";
  const base = careProtocolByEntry[key] ?? DEFAULT_PROTOCOL;
  return applyProtocolMedia(base, slug);
}
