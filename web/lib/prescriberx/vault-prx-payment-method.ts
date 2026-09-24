import { prescribeRxFetch } from "./client";

export type VaultBillingAddress = {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type VaultPrxPaymentMethodInput = {
  patientChartId: string;
  opaqueData: { data_descriptor: string; data_value: string };
  cardBrand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  billingAddress: VaultBillingAddress;
  setAsDefault?: boolean;
};

export type VaultPrxPaymentMethodResult = {
  paymentMethodId: string;
  gatewayCustomerId?: string;
  gatewayPaymentProfileId?: string;
  merchantAccountId?: string;
};

function normalizeCardBrand(raw: string): string {
  const b = raw.trim().toLowerCase();
  if (b.startsWith("visa")) return "Visa";
  if (b.startsWith("master")) return "Mastercard";
  if (b.startsWith("amex") || b.startsWith("american")) return "Amex";
  if (b.startsWith("discover")) return "Discover";
  return "Visa";
}

function unwrapVaultResponse(json: unknown): VaultPrxPaymentMethodResult {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid vault response from PrescribeRx.");
  }
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const id = data.id;
  if (typeof id !== "string" || !id) {
    throw new Error("PrescribeRx did not return a payment method id.");
  }
  return {
    paymentMethodId: id,
    gatewayCustomerId:
      typeof data.gateway_customer_id === "string"
        ? data.gateway_customer_id
        : undefined,
    gatewayPaymentProfileId:
      typeof data.gateway_payment_profile_id === "string"
        ? data.gateway_payment_profile_id
        : undefined,
    merchantAccountId:
      typeof data.merchant_account_id === "string"
        ? data.merchant_account_id
        : undefined,
  };
}

/** Vault Accept.js opaque data on the org's PrescribeRx merchant (PRX calls Auth.net). */
export async function vaultPrxPaymentMethod(
  input: VaultPrxPaymentMethodInput,
): Promise<VaultPrxPaymentMethodResult> {
  const body = {
    patient_chart_id: input.patientChartId,
    opaque_data: {
      data_descriptor: input.opaqueData.data_descriptor,
      data_value: input.opaqueData.data_value,
    },
    card_brand: normalizeCardBrand(input.cardBrand),
    last_four: input.lastFour.replace(/\D/g, "").slice(-4),
    expiration_month: input.expMonth,
    expiration_year: input.expYear,
    billing_address: {
      first_name: input.billingAddress.first_name,
      last_name: input.billingAddress.last_name,
      street: input.billingAddress.street,
      city: input.billingAddress.city,
      state: input.billingAddress.state.slice(0, 2).toUpperCase(),
      zip: input.billingAddress.zip,
    },
    set_as_default: input.setAsDefault ?? true,
  };

  const json = await prescribeRxFetch("/payment-methods", {
    method: "POST",
    body,
  });
  return unwrapVaultResponse(json);
}
