/**
 * Server-only product attach for unified intake (org token → PrescribeRx).
 * Browser code uses resolveProductIdsForEntry + /api/prescriberx/* instead.
 */
import type { ClinicalEntry } from "@/content/clinical/entry-map";
import { SYMPTOMS_ENTRY_SLUG } from "@/content/clinical/entry-map";
import { prescribeRxFetch } from "@/lib/prescriberx/client";

type TelehealthProduct = {
  product_id: string;
  product_name?: string;
  sku?: string | null;
  product_type_name?: string | null;
};

type CatalogProduct = {
  id: string;
  name?: string;
  is_active?: boolean | null;
};

const PREFERRED_PRODUCT_ID: Partial<Record<string, string>> = {
  "weight-loss": "019bc346-1b8f-71a0-a07c-9f8bce3ddcc9",
  transformation: "019bc346-1b8f-71a0-a07c-9f8bce3ddcc9",
  testosterone: "019db308-4be9-7340-b9ba-5bafe9a482ec",
  "recovery-performance": "019cdb9d-63e7-71b3-b0d9-5e2de9492941",
  "skin-hair": "019cdb9d-63e7-71b3-b0d9-5e2de9492941",
  athletes: "019cade3-6192-71fe-a49a-1f0bc8ddffe2",
  "sexual-health": "019cdb9d-6406-7271-b16d-02f6bead3d28",
  "womens-balance": "019f6360-e43e-7347-95e5-de46464cafd1",
};

const PREFERRED_KEYWORDS: Partial<Record<string, readonly string[]>> = {
  "weight-loss": ["tirzepatide", "semaglutide", "glp"],
  transformation: ["tirzepatide", "semaglutide", "glp"],
  testosterone: ["testosterone"],
  "recovery-performance": ["bpc-157", "bpc", "tb-500"],
  "skin-hair": ["bpc-157", "bpc", "ghk"],
  athletes: ["tb-500", "bpc"],
  "sexual-health": ["pt-141", "pt141", "oxytocin"],
  "womens-balance": ["dhea", "estradiol", "progesterone"],
  executives: ["nad+", "nad ", "mots-c"],
  healthspan: ["tesamorelin", "sermorelin", "nad+"],
  parents: ["bpc-157", "nad+", "nad "],
  creators: ["nad+", "nad ", "semax"],
  travelers: ["nad+", "nad ", "bpc-157"],
  [SYMPTOMS_ENTRY_SLUG]: ["semaglutide", "tirzepatide", "nad+", "glp"],
};

function haystack(p: TelehealthProduct): string {
  return `${p.product_name ?? ""} ${p.sku ?? ""} ${p.product_type_name ?? ""}`.toLowerCase();
}

async function telehealthProducts(
  encounterTypeId: string,
): Promise<TelehealthProduct[]> {
  const raw = await prescribeRxFetch<
    | TelehealthProduct[]
    | { products?: TelehealthProduct[] }
    | { data?: TelehealthProduct[] | { products?: TelehealthProduct[] } }
  >(
    `/telehealth/products?encounter_type_id=${encodeURIComponent(encounterTypeId)}`,
  );
  if (Array.isArray(raw)) return raw.filter((p) => p?.product_id);
  const root = raw as {
    products?: TelehealthProduct[];
    data?: TelehealthProduct[] | { products?: TelehealthProduct[] };
  };
  if (Array.isArray(root.products)) {
    return root.products.filter((p) => p?.product_id);
  }
  if (Array.isArray(root.data)) {
    return root.data.filter((p) => p?.product_id);
  }
  if (root.data && Array.isArray(root.data.products)) {
    return root.data.products.filter((p) => p?.product_id);
  }
  return [];
}

async function catalogProducts(): Promise<CatalogProduct[]> {
  const raw = await prescribeRxFetch<
    | { products?: CatalogProduct[] }
    | { data?: { products?: CatalogProduct[] } }
  >("/catalog");
  const root = raw as { products?: CatalogProduct[]; data?: { products?: CatalogProduct[] } };
  const products = root.products ?? root.data?.products ?? [];
  return Array.isArray(products) ? products : [];
}

function matchCatalog(
  products: CatalogProduct[],
  entrySlug: string,
): string[] {
  const preferredId = PREFERRED_PRODUCT_ID[entrySlug];
  const keywords = PREFERRED_KEYWORDS[entrySlug];
  const active = products.filter((p) => p.is_active !== false && p.id);
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
  return [];
}

export async function resolveProductIdsForEntryServer(
  entry: ClinicalEntry,
): Promise<string[]> {
  const products = await telehealthProducts(entry.encounterTypeId);
  if (products.length) {
    const preferredId = PREFERRED_PRODUCT_ID[entry.slug];
    if (preferredId && products.some((p) => p.product_id === preferredId)) {
      return [preferredId];
    }
    const keywords = PREFERRED_KEYWORDS[entry.slug];
    if (keywords?.length) {
      for (const kw of keywords) {
        const hit = products.find((p) => haystack(p).includes(kw.toLowerCase()));
        if (hit?.product_id) return [hit.product_id];
      }
    }
    const first = products[0]?.product_id;
    if (first) return [first];
  }

  const fromCatalog = matchCatalog(await catalogProducts(), entry.slug);
  if (fromCatalog.length) return fromCatalog;

  if (entry.slug === SYMPTOMS_ENTRY_SLUG) {
    const active = (await catalogProducts()).filter(
      (p) => p.is_active !== false && p.id,
    );
    if (active[0]?.id) return [active[0].id];
  }

  return [];
}
