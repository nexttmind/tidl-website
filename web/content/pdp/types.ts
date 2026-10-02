import type { ThemeId } from "@/content/brand/peptide-identity";
import type { CategoryPairingData } from "@/components/category/CategoryPairing";
import type { SocialColumn } from "@/components/home/LandingSocial";
import type { GalleryPlate } from "@/components/pdp/ProductGallery";
import type { HeroCallout, TrustItem } from "@/components/pdp/ProductBuyBox";
import type { StageCollage, StageStep } from "@/components/pdp/StageSequence";

export type PdpPriceLine = {
  label: string;
  member: string;
  prescription: string;
  total: string;
  cadence?: string;
};

export type PdpPlanOption = {
  value: string;
  label: string;
  price?: string;
  compareAtPrice?: string;
  cadence?: string;
  /** Secondary hero figure, e.g. ongoing monthly after first month. */
  afterPrice?: string;
  afterCadence?: string;
  payLine?: string;
  saveLabel?: string;
  first?: PdpPriceLine;
  ongoing?: PdpPriceLine | null;
  commitment?: string;
  billed?: string;
};

export type PdpFaqItem = {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

export type PdpBenefitItem = {
  title: string;
  description: string;
  media: {
    id: string;
    label: string;
    swatch: string;
    note: string;
    src: string;
  };
};

export type CategoryPdpData = {
  metadataTitle: string;
  metadataDescription: string;
  stockLabel: string;
  /** Set when PDP pricing/stock was merged from PrescribeRx sandbox catalog. */
  sandboxLive?: boolean;
  soldOut?: boolean;
  category: string;
  title: string;
  themeId: ThemeId;
  catalogId?: string;
  /** Shop art id for the hero plate, bloom, and cutout. Not a launch catalog id. */
  artId?: string;
  /** Type-field graphic slug. Defaults to themeId. Pain Relief shares recovery-performance tokens. */
  barrageGraphic?: string;
  /** Optional still pack. Pain Relief PDPs each have their own mix. */
  barragePack?: string;
  price: string;
  compareAtPrice: string;
  tagline: string;
  /** Two lines between the wash plate and the form. Phone and tablet only. */
  dek?: readonly [string, string];
  primaryCta: string;
  primaryCtaHref: string;
  /** One visible Rx line under the buy box buttons. Omit on OTC and kit. */
  complianceLine?: string;
  body: string;
  payLine: string;
  heroSrc: string;
  heroCallouts: readonly HeroCallout[];
  trust: readonly TrustItem[];
  planLabel: string;
  planOptions: readonly PdpPlanOption[];
  promo: {
    eyebrow: string;
    title: string;
    body: string;
    code: string;
  };
  gallery: {
    plates: readonly GalleryPlate[];
    proofThumb: { quote: string; stars: number };
  };
  buyBoxFaq: readonly PdpFaqItem[];
  disclaimer: string;
  safetyLink: { label: string; href: string };
  lead: {
    title: string;
    body: string;
    cta: { label: string; href: string; disabled?: boolean };
    media: {
      id: string;
      label: string;
      swatch: string;
      note: string;
      videoSrc?: string;
      poster: string;
      src: string;
    };
  };
  benefits: {
    headline: string;
    subtitle: string;
    cta: { label: string; href: string; disabled?: boolean };
    items: readonly PdpBenefitItem[];
  };
  social: {
    title: string;
    columns: readonly SocialColumn[];
  };
  bmi?: {
    title: string;
    body: string;
    disclaimer: string;
    mediaSrc: string;
  };
  quality: {
    titleLines: readonly string[];
    backgroundSrc: string;
    plate: {
      fieldSrc: string;
      vialSrc: string;
      callouts: readonly HeroCallout[];
    };
    body: readonly string[];
    metrics: readonly { metric: string; description: string }[];
  };
  careFlow: {
    headline: string;
    subtitle: string;
    stages: readonly StageStep[];
    collage: StageCollage;
  };
  pairing?: CategoryPairingData;
  /** Dual-role add on, rendered below the buy box. Price omitted when absent. */
  addonNote?: {
    heading: string;
    body: string;
    href: string;
    hrefLabel: string;
    price?: string;
  };
};
