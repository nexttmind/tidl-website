/**
 * Ops map: merchandising entry → preferred sandbox product for unified intake.
 * Product confirmation step is skipped in UI (field-types); IDs are resolved here.
 *
 * Prefer explicit UUID when that product is in GET /telehealth/products for the
 * entry's encounter type. Otherwise keywords, else first listed product.
 * When the encounter list is empty (sandbox gaps), fall back to catalog match
 * for entries that have preferred IDs / keywords. If catalog has nothing either,
 * submit with no products (same UI — no consumer error banner).
 */

import type { ClinicalEntry } from "@/content/clinical/entry-map";
import {
  fetchCatalogSnapshot,
  fetchTelehealthProducts,
  type TelehealthProduct,
} from "@/lib/prescriberx/browse-api";

/** Preferred product_id when present on the encounter list or catalog. */
const PREFERRED_PRODUCT_ID: Partial<Record<string, string>> = {
  "weight-loss": "019bc346-1b8f-71a0-a07c-9f8bce3ddcc9",
  transformation: "019bc346-1b8f-71a0-a07c-9f8bce3ddcc9",
  testosterone: "019db308-4be9-7340-b9ba-5bafe9a482ec",
  "recovery-performance": "019cdb9d-63e7-71b3-b0d9-5e2de9492941",
  "skin-hair": "019cdb9d-63e7-71b3-b0d9-5e2de9492941",
  athletes: "019cade3-6192-71fe-a49a-1f0bc8ddffe2",
  // Catalog fallbacks when encounter has 0 linked products:
  "sexual-health": "019cdb9d-6406-7271-b16d-02f6bead3d28", // PT-141 pen
  "womens-balance": "019f6360-e43e-7347-95e5-de46464cafd1", // DHEA cream
};

/** Fallback name/sku tokens when preferred UUID is absent. */
const PREFERRED_KEYWORDS: Partial<Record<string, readonly string[]>> = {
  "weight-loss": ["tirzepatide", "semaglutide", "glp"],
  transformation: ["tirzepatide", "semaglutide", "glp"],
  testosterone: ["testosterone"],
  "recovery-performance": ["bpc-157", "bpc", "tb-500"],
  "skin-hair": ["bpc-157", "bpc", "ghk"],
  athletes: ["tb-500", "bpc"],
  "sexual-health": ["pt-141", "pt141", "oxytocin"],
  "womens-balance": ["dhea", "estradiol", "progesterone"],
  // Programs on universal-encounter (0 linked products) — catalog only
  executives: ["nad+", "nad ", "mots-c"],
  healthspan: ["tesamorelin", "sermorelin", "nad+"],
  parents: ["bpc-157", "nad+", "nad "],
  creators: ["nad+", "nad ", "semax"],
  travelers: ["nad+", "nad ", "bpc-157"],
  // symptoms / open path: no preferred SKU — leave empty if encounter has none
};

function haystack(p: TelehealthProduct): string {
  return `${p.product_name ?? ""} ${p.sku ?? ""} ${p.product_type_name ?? ""}`.toLowerCase();
}

function matchKeywords(
  products: TelehealthProduct[],
  keywords: readonly string[],
): TelehealthProduct | null {
  for (const kw of keywords) {
    const hit = products.find((p) => haystack(p).includes(kw.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

async function resolveFromCatalog(entrySlug: string): Promise<string[]> {
  const preferredId = PREFERRED_PRODUCT_ID[entrySlug];
  const keywords = PREFERRED_KEYWORDS[entrySlug];
  if (!preferredId && !keywords?.length) return [];

  try {
    const snap = await fetchCatalogSnapshot();
    const active = snap.products.filter((p) => p.is_active !== false);
    if (preferredId && active.some((p) => p.id === preferredId)) {
      return [preferredId];
    }
    if (keywords?.length) {
      for (const kw of keywords) {
        const hit = active.find((p) =>
          (p.name ?? "").toLowerCase().includes(kw.toLowerCase()),
        );
        if (hit?.id) return [hit.id];
      }
    }
  } catch {
    /* keep empty */
  }
  return [];
}

/**
 * Resolve zero or one product_id for silent attach on unified intake.
 * Never throws for empty catalog — returns [].
 */
export async function resolveProductIdsForEntry(
  entry: ClinicalEntry,
): Promise<string[]> {
  let products: TelehealthProduct[] = [];
  try {
    products = await fetchTelehealthProducts(entry.encounterTypeId);
  } catch {
    products = [];
  }

  if (products.length) {
    const preferredId = PREFERRED_PRODUCT_ID[entry.slug];
    if (preferredId && products.some((p) => p.product_id === preferredId)) {
      return [preferredId];
    }

    const keywords = PREFERRED_KEYWORDS[entry.slug];
    if (keywords?.length) {
      const hit = matchKeywords(products, keywords);
      if (hit?.product_id) return [hit.product_id];
    }

    const first = products[0]?.product_id;
    return first ? [first] : [];
  }

  // Encounter has 0 linked products — use catalog when we have a map for this entry.
  return resolveFromCatalog(entry.slug);
}
