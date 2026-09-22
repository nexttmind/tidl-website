/**
 * Match curated ThemeIds to PrescribeRx sandbox catalog rows and merge
 * sandbox fields into existing PDP props when a product is found.
 * Titles/body stay goal-framed (no molecule names on consumer headlines).
 * Fail soft: no match → fixture data unchanged.
 */

import type { ThemeId } from "@/content/brand/peptide-identity";
import type {
  CategoryPdpData,
  PdpPlanOption,
  PdpPriceLine,
} from "@/content/pdp/types";
import {
  fetchCatalogSnapshot,
  type CatalogProduct,
} from "@/lib/prescriberx/browse-api";
import { CATALOG_KEYWORDS } from "@/lib/prescriberx/catalog-keywords";

export type LiveCatalogOverlay = {
  productId: string;
  sku: string | null;
  /** Sandbox catalog name — ops/debug only; do not put on consumer titles. */
  catalogName: string;
  shortDescription: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
  rxRequired: boolean | null;
  price: number | null;
  retailPrice: number | null;
  wholesalePrice: number | null;
};

/** Prefer a known sandbox SKU when keywords would be ambiguous. */
const PREFERRED_CATALOG_PRODUCT_ID: Partial<Record<ThemeId, string>> = {
  "sexual-health": "019cdb9d-6406-7271-b16d-02f6bead3d28",
  "womens-balance": "019f6360-e43e-7347-95e5-de46464cafd1",
};

type CacheState = {
  products: CatalogProduct[];
  byTheme: Partial<Record<ThemeId, LiveCatalogOverlay | null>>;
};

let cache: CacheState | null = null;
let inflight: Promise<CacheState> | null = null;

function firstPositive(
  ...vals: Array<number | null | undefined>
): number | null {
  for (const v of vals) {
    if (v != null && Number.isFinite(v) && v > 0) return v;
  }
  return null;
}

function matchProduct(
  products: CatalogProduct[],
  keywords: readonly string[],
): CatalogProduct | null {
  const active = products.filter((p) => p.is_active !== false);
  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    const hit = active.find((p) => (p.name ?? "").toLowerCase().includes(kw));
    if (hit) return hit;
  }
  return null;
}

function resolveProductForTheme(
  products: CatalogProduct[],
  themeId: ThemeId,
): CatalogProduct | null {
  const preferredId = PREFERRED_CATALOG_PRODUCT_ID[themeId];
  if (preferredId) {
    const preferred = products.find(
      (p) => p.id === preferredId && p.is_active !== false,
    );
    if (preferred) return preferred;
  }
  const keywords = CATALOG_KEYWORDS[themeId];
  if (!keywords?.length) return null;
  return matchProduct(products, keywords);
}

function toOverlay(product: CatalogProduct): LiveCatalogOverlay {
  const pricing = product.pricing;
  return {
    productId: product.id,
    sku: product.sku,
    catalogName: product.name,
    shortDescription: product.short_description ?? product.description,
    imageUrl: product.image_url,
    isActive: product.is_active,
    rxRequired: product.rx_required,
    price: firstPositive(
      pricing?.price,
      pricing?.retail_price,
      pricing?.wholesale_price,
    ),
    retailPrice: firstPositive(pricing?.retail_price, pricing?.price),
    wholesalePrice: firstPositive(pricing?.wholesale_price),
  };
}

async function loadCache(): Promise<CacheState> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchCatalogSnapshot()
      .then((snap) => {
        const products = snap.products;
        const byTheme: CacheState["byTheme"] = {};
        for (const theme of Object.keys(CATALOG_KEYWORDS) as ThemeId[]) {
          const hit = resolveProductForTheme(products, theme);
          byTheme[theme] = hit ? toOverlay(hit) : null;
        }
        cache = { products, byTheme };
        return cache;
      })
      .catch(() => {
        cache = { products: [], byTheme: {} };
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function getLiveOverlayForTheme(
  themeId: ThemeId,
): Promise<LiveCatalogOverlay | null> {
  const state = await loadCache();
  if (themeId in state.byTheme) return state.byTheme[themeId] ?? null;
  const hit = resolveProductForTheme(state.products, themeId);
  const overlay = hit ? toOverlay(hit) : null;
  state.byTheme[themeId] = overlay;
  return overlay;
}

export function formatSandboxMoney(amount: number): string {
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}

function scrubPriceLine(
  line: PdpPriceLine,
  price: string,
  compareAt: string,
): PdpPriceLine {
  return {
    ...line,
    member: price,
    prescription: compareAt !== price ? compareAt : "$0",
    total: price,
  };
}

function scrubPlanOption(
  opt: PdpPlanOption,
  price: string,
  compareAt: string,
): PdpPlanOption {
  return {
    ...opt,
    price: opt.price != null ? price : opt.price,
    compareAtPrice: opt.compareAtPrice != null ? compareAt : opt.compareAtPrice,
    afterPrice: opt.afterPrice != null ? price : opt.afterPrice,
    first: opt.first ? scrubPriceLine(opt.first, price, compareAt) : opt.first,
    ongoing: opt.ongoing
      ? scrubPriceLine(opt.ongoing, price, compareAt)
      : opt.ongoing,
  };
}

/**
 * When a sandbox product is found, apply its price, stock, and short
 * description into existing PDP props. Photos stay on brand fixtures.
 * Goal-framed titles stay (no molecule name as the H1).
 */
export function mergeSandboxIntoPdp(
  data: CategoryPdpData,
  live: LiveCatalogOverlay | null,
): CategoryPdpData {
  if (!live) return data;

  const priceNum = live.price;
  const retailNum =
    live.retailPrice != null && priceNum != null && live.retailPrice > priceNum
      ? live.retailPrice
      : live.retailPrice ?? priceNum;

  const hasPrice = priceNum != null;
  const price = hasPrice ? formatSandboxMoney(priceNum) : data.price;
  const compareAt =
    retailNum != null && hasPrice && retailNum > priceNum
      ? formatSandboxMoney(retailNum)
      : hasPrice
        ? price
        : data.compareAtPrice;

  const stockLabel =
    live.isActive === false
      ? "Unavailable"
      : live.isActive === true
        ? "Available"
        : data.stockLabel;

  // Prefer sandbox short_description for supporting copy; keep brand title.
  const tagline =
    live.shortDescription && live.shortDescription.trim()
      ? live.shortDescription.trim()
      : data.tagline;

  return {
    ...data,
    sandboxLive: true,
    stockLabel,
    tagline,
    price: hasPrice ? price : data.price,
    compareAtPrice: hasPrice ? compareAt : data.compareAtPrice,
    // heroSrc + gallery: keep brand photos (do not use sandbox image_url)
    planOptions: hasPrice
      ? data.planOptions.map((opt) => scrubPlanOption(opt, price, compareAt))
      : data.planOptions,
  };
}
