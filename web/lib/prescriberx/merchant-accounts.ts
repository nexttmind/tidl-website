/**
 * PrescribeRx merchant accounts (Settings → Payments → Merchant Accounts).
 * Used to reconcile sandbox / MoR reference captures.
 */

import { prescribeRxFetch } from "./client";

export type MerchantAccountSummary = {
  id: string;
  external_code: string | null;
  name: string;
  gateway_provider: string;
  environment: string;
  is_active: boolean;
  is_default: boolean;
  allows_recurring_payments: boolean;
};

function unwrapAccounts(json: unknown): MerchantAccountSummary[] {
  if (!json || typeof json !== "object") return [];
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (!Array.isArray(data)) return [];
  return data.filter(
    (row): row is MerchantAccountSummary =>
      !!row &&
      typeof row === "object" &&
      typeof (row as MerchantAccountSummary).id === "string",
  );
}

export async function listMerchantAccounts(): Promise<MerchantAccountSummary[]> {
  const json = await prescribeRxFetch("/merchant-accounts");
  return unwrapAccounts(json).filter((a) => a.is_active !== false);
}

/** Prefer env override, else org default, else first active. */
export async function resolveMerchantAccountId(): Promise<{
  id: string | null;
  gatewayProvider: string | null;
}> {
  const override = process.env.PRESCRIBERX_MERCHANT_ACCOUNT_ID?.trim();
  if (override) {
    const accounts = await listMerchantAccounts();
    const hit = accounts.find((a) => a.id === override);
    return {
      id: override,
      gatewayProvider: hit?.gateway_provider ?? "authorize_net",
    };
  }
  const accounts = await listMerchantAccounts();
  const pick =
    accounts.find((a) => a.is_default) ?? accounts[0] ?? null;
  if (!pick) return { id: null, gatewayProvider: null };
  return { id: pick.id, gatewayProvider: pick.gateway_provider };
}
