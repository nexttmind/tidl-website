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

export type ProtocolPayMethod = "card" | "hsa_fsa";

export type CheckoutConfig = {
  sandbox: boolean;
  collector_enabled: boolean;
  record_only_sandbox: boolean;
  accept_js: {
    api_login_id: string;
    client_key: string;
    script_url: string;
    gateway_provider: string;
  } | null;
};

export async function fetchCheckoutConfig(): Promise<CheckoutConfig | null> {
  const res = await fetch("/api/prescriberx/checkout/config", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: CheckoutConfig };
  return json.data ?? null;
}

export type ProtocolBillingAddress = {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type RecordProtocolPaymentResult = {
  transactionId: string | null;
  hasMerchantAccount?: boolean;
  encounterLinked?: boolean;
  sandbox?: boolean;
  record_only: boolean;
  prx_collector?: boolean;
  paymentMethodId?: string;
  orderId?: string | null;
  alreadyPaid?: boolean;
};

/** Protocol checkout payment — sandbox record-only or PrescribeRx collector. */
export async function recordProtocolPayment(input: {
  entrySlug: string;
  encounterId: string;
  payMethod: ProtocolPayMethod;
  priceLabel: string;
  opaque_data?: { data_descriptor: string; data_value: string };
  card_brand?: string;
  last_four?: string;
  exp_month?: number;
  exp_year?: number;
  billing_address?: ProtocolBillingAddress;
}): Promise<RecordProtocolPaymentResult> {
  const q = new URLSearchParams({ entry: input.entrySlug });
  const res = await fetch(
    `/api/prescriberx/protocol/payment?${q.toString()}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encounter_id: input.encounterId,
        pay_method: input.payMethod,
        price_label: input.priceLabel,
        opaque_data: input.opaque_data,
        card_brand: input.card_brand,
        last_four: input.last_four,
        exp_month: input.exp_month,
        exp_year: input.exp_year,
        billing_address: input.billing_address,
      }),
    },
  );
  const json = (await res.json()) as {
    success?: boolean;
    message?: string;
    data?: RecordProtocolPaymentResult;
  };
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message ?? `Payment record failed (${res.status})`);
  }
  return json.data;
}
