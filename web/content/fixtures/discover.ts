/** Compact catalog. Families match the locked launch set. */

import { SHOP_CATALOG, type ShopCatalogItem } from "@/components/home/shop-catalog";
import { heroTheme } from "@/content/brand/peptide-identity";
import { catalogHref, catalogRoute } from "@/content/catalog/routes";
import { catalogPriceLine } from "@/content/pdp/launch-pricing";

export type DiscoverFamilyId =
  | "products"
  | "bundles"
  | "weight-body"
  | "energy-performance"
  | "recovery-longevity"
  | "mind-balance";

export type DiscoverCard = {
  id: string;
  catalogId: string;
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
  filterLabel: "Catalog families",
} as const;

function nightFor(id: string): string {
  const route = catalogRoute(id);
  const field = route ? heroTheme(route.themeId) : null;
  return field?.night.css ?? "var(--color-night)";
}

function cardFromShop(item: ShopCatalogItem): DiscoverCard {
  return {
    id: item.id,
    catalogId: item.id,
    label: item.label,
    href: catalogHref(item.id),
    price: catalogPriceLine(item.id),
    mediaSrc: item.vialSrc,
    nightCss: nightFor(item.id),
  };
}

function cardsOf(kind: ShopCatalogItem["kind"]): DiscoverCard[] {
  return SHOP_CATALOG.filter((item) => item.kind === kind).map(cardFromShop);
}

const byId = Object.fromEntries(SHOP_CATALOG.map((item) => [item.id, item]));

function cards(...ids: string[]): DiscoverCard[] {
  return ids.flatMap((id) => {
    const item = byId[id];
    return item ? [cardFromShop(item)] : [];
  });
}

export const discoverFamilies: readonly DiscoverFamily[] = [
  {
    id: "products",
    title: "Products",
    lede: "Labeled isolates and the at home kit.",
    items: cardsOf("product"),
  },
  {
    id: "bundles",
    title: "Product Bundles",
    lede: "Stacked protocols reviewed as one visit.",
    items: cardsOf("bundle"),
  },
  {
    id: "weight-body",
    title: "Weight and Body Composition",
    lede: "Appetite, composition, and the months it takes.",
    items: cards("weight-loss", "lean-cut"),
  },
  {
    id: "energy-performance",
    title: "Energy and Performance",
    lede: "Energy, drive, intimacy, and a full stack.",
    items: cards(
      "mens-peak-performance",
      "sexual-health",
      "complete-stack",
    ),
  },
  {
    id: "recovery-longevity",
    title: "Recovery and Longevity",
    lede: "Tissue, rest, cellular support, and healthspan.",
    items: cards("repair-mobility", "rest-rebuild", "longevity"),
  },
  {
    id: "mind-balance",
    title: "Mind, Balance and Beauty",
    lede: "Focus, mood, hormonal chapters, and hair.",
    items: cards("stress-mood", "womens-total-balance", "hair-skin-nails"),
  },
];

export const treatmentDiscoverFamilies: readonly DiscoverFamily[] =
  discoverFamilies.filter((family) => family.id !== "products" && family.id !== "bundles");

export const productDiscoverFamilies: readonly DiscoverFamily[] =
  discoverFamilies.filter((family) => family.id === "products");

export const bundleDiscoverFamilies: readonly DiscoverFamily[] =
  discoverFamilies.filter((family) => family.id === "bundles");
