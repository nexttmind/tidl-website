/** Browser-safe helpers for /api/prescriberx/* (token never in the browser). */

export type TelehealthProduct = {
  product_id: string;
  product_name: string;
  sku: string | null;
  product_type_id?: string | null;
  product_type_name?: string | null;
  rx_required?: boolean | null;
};

export type CatalogPricing = {
  price?: number | null;
  retail_price?: number | null;
  wholesale_price?: number | null;
  cost?: number | null;
  price_type?: string | null;
};

export type CatalogProduct = {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  rx_required: boolean | null;
  pricing?: CatalogPricing | null;
};

export type CatalogSnapshot = {
  products: CatalogProduct[];
  packages: unknown[];
};

type Envelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  const json = (await res.json()) as Envelope<T> & T;
  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json &&
      "message" in json &&
      typeof (json as { message?: string }).message === "string"
        ? (json as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (
    typeof json === "object" &&
    json &&
    "data" in json &&
    (json as Envelope<T>).data !== undefined
  ) {
    return (json as Envelope<T>).data as T;
  }
  return json as T;
}

/** Products allowed for an encounter type. */
export async function fetchTelehealthProducts(
  encounterTypeId: string,
): Promise<TelehealthProduct[]> {
  const q = encodeURIComponent(encounterTypeId);
  const data = await getJson<
    TelehealthProduct[] | { products?: TelehealthProduct[] }
  >(`/api/prescriberx/products?encounter_type_id=${q}`);
  if (Array.isArray(data)) return data.filter((p) => Boolean(p?.product_id));
  if (data && Array.isArray(data.products)) {
    return data.products.filter((p) => Boolean(p?.product_id));
  }
  return [];
}

/** Full sandbox catalog (~products + packages). */
export async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  const data = await getJson<{
    products?: CatalogProduct[];
    packages?: unknown[];
  }>("/api/prescriberx/catalog");
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    packages: Array.isArray(data?.packages) ? data.packages : [],
  };
}
