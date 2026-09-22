/** All-treatments discover. Four families. Goal framed. No molecule names. */

import type { ThemeId } from "@/content/brand/peptide-identity";
import { themeField } from "@/content/brand/peptide-identity";
import { CATALOG_PRICE, catalogItemById, catalogVialSrc } from "@/content/fixtures/catalog";
import {
  PAIN_RELIEF_HREF,
  painReliefCopy,
  painReliefMenuSrc,
} from "@/content/fixtures/pain-relief";

export type DiscoverFamilyId = "metabolic" | "vitality" | "drive" | "restore";

export type DiscoverCard = {
  id: string;
  themeId?: ThemeId;
  label: string;
  href: string;
  price?: string;
  mediaSrc: string;
  nightCss: string;
};

export type DiscoverFamily = {
  id: DiscoverFamilyId;
  title: string;
  lede: string;
  items: readonly DiscoverCard[];
};

export const discoverCopy = {
  title: "All treatments",
  cta: "Discover",
  viewCard: "Card",
  viewGrid: "Grid",
  filterLabel: "Treatment families",
} as const;

const PAIN_RELIEF_CARD: DiscoverCard = {
  id: "pain-relief",
  label: painReliefCopy.title,
  href: PAIN_RELIEF_HREF,
  mediaSrc: painReliefMenuSrc,
  nightCss:
    "radial-gradient(ellipse 122% 110% at 8% 88%, color-mix(in srgb, var(--color-slate) 80%, transparent) 0%, transparent 80%), radial-gradient(ellipse 118% 106% at 88% 12%, color-mix(in srgb, var(--color-night) 74%, transparent) 0%, transparent 80%), linear-gradient(155deg, var(--color-night) 0%, var(--color-slate) 100%)",
};

function cardFromTheme(id: ThemeId): DiscoverCard {
  const field = themeField(id);
  const item = catalogItemById(id);
  if (!item) throw new Error(`Missing catalog item for ${id}`);
  return {
    id,
    themeId: id,
    label: field.label,
    href: item.href,
    price: CATALOG_PRICE,
    mediaSrc: catalogVialSrc(id),
    nightCss: field.night.css,
  };
}

export const discoverFamilies: readonly DiscoverFamily[] = [
  {
    id: "vitality",
    title: "Vitality",
    lede: "Energy, strength, and performance.",
    items: [
      cardFromTheme("mens-health"),
      cardFromTheme("executive"),
      cardFromTheme("athlete"),
      cardFromTheme("creative"),
    ],
  },
  {
    id: "metabolic",
    title: "Metabolic",
    lede: "Weight, appetite, and metabolic health.",
    items: [cardFromTheme("weight-loss"), cardFromTheme("transformation")],
  },
  {
    id: "drive",
    title: "Drive",
    lede: "Sexual and hormonal health.",
    items: [cardFromTheme("sexual-health"), cardFromTheme("womens-balance")],
  },
  {
    id: "restore",
    title: "Restore",
    lede: "Recovery, mobility, sleep, and resilience.",
    items: [
      cardFromTheme("recovery-performance"),
      cardFromTheme("parents"),
      cardFromTheme("legacy"),
      cardFromTheme("traveler"),
      cardFromTheme("skin-hair"),
      PAIN_RELIEF_CARD,
    ],
  },
];
