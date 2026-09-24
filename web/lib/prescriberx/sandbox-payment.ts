/** Sandbox / record-only payment helpers (no live gateway on TIDL yet). */

export type ProtocolPayMethod = "card" | "hsa_fsa";

export function parseProtocolPriceAmount(priceLabel: string): number | null {
  const match = priceLabel.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const n = Number.parseFloat(match[1]!);
  if (!Number.isFinite(n) || n < 0.01) return null;
  return Math.round(n * 100) / 100;
}

export function sandboxGatewayProvider(
  payMethod: ProtocolPayMethod,
  merchantGateway: string | null,
): string {
  if (merchantGateway) return merchantGateway;
  return payMethod === "hsa_fsa" ? "hsa_fsa" : "authorize_net";
}

export function sandboxGatewayTransactionId(encounterId: string): string {
  const slug = encounterId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
  return `tidl-sandbox-${slug}-${Date.now()}`;
}

export function sandboxVaultProfileIds(payMethod: ProtocolPayMethod): {
  customer_profile_id: string;
  payment_profile_id: string;
} {
  const suffix = payMethod === "hsa_fsa" ? "hsa" : "card";
  return {
    customer_profile_id: `tidl-sandbox-${suffix}-customer`,
    payment_profile_id: `tidl-sandbox-${suffix}-profile`,
  };
}
