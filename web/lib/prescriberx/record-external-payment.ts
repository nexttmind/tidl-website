/**
 * Record a sandbox / MoR-external capture in PrescribeRx via POST /transactions/external.
 * No card is charged on TIDL; PRX stores the reference for reconciliation.
 */

import { PrescribeRxError, prescribeRxFetch } from "./client";
import { resolveMerchantAccountId } from "./merchant-accounts";
import {
  sandboxGatewayProvider,
  sandboxGatewayTransactionId,
  sandboxVaultProfileIds,
  type ProtocolPayMethod,
} from "./sandbox-payment";

export type RecordExternalPaymentInput = {
  encounterId: string;
  amount: number;
  payMethod: ProtocolPayMethod;
  billedOnDomain?: string | null;
};

export type RecordExternalPaymentResult = {
  transactionId: string | null;
  hasMerchantAccount: boolean;
  encounterLinked: boolean;
};

type ExternalBody = Record<string, unknown>;

function buildBody(input: RecordExternalPaymentInput, opts: {
  merchantAccountId: string | null;
  gatewayProvider: string;
  linkEncounter: boolean;
}): ExternalBody {
  const vault = sandboxVaultProfileIds(input.payMethod);
  const body: ExternalBody = {
    amount: input.amount,
    currency: "USD",
    type: "sale",
    gateway_provider: opts.gatewayProvider,
    gateway_transaction_id: sandboxGatewayTransactionId(input.encounterId),
    authorization_code: "SANDBOX",
    billed_on_domain: input.billedOnDomain ?? "tidlll.com",
    external_reference: `tidl-protocol:${input.encounterId}:${input.payMethod}`,
    customer_profile_id: vault.customer_profile_id,
    payment_profile_id: vault.payment_profile_id,
    raw_response: {
      source: "tidl_sandbox_protocol",
      pay_method: input.payMethod,
      record_only: true,
    },
  };
  if (opts.linkEncounter) {
    body.encounter_id = input.encounterId;
  } else {
    body.external_reference = `tidl-encounter:${input.encounterId}:${input.payMethod}`;
  }
  if (opts.merchantAccountId) {
    body.merchant_account_id = opts.merchantAccountId;
  }
  return body;
}

function unwrapTransaction(json: unknown): RecordExternalPaymentResult {
  if (!json || typeof json !== "object") {
    return { transactionId: null, hasMerchantAccount: false, encounterLinked: false };
  }
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    transactionId:
      typeof data.transaction_id === "string" ? data.transaction_id : null,
    hasMerchantAccount: data.has_merchant_account === true,
    encounterLinked: false,
  };
}

async function postExternal(body: ExternalBody): Promise<RecordExternalPaymentResult> {
  const json = await prescribeRxFetch("/transactions/external", {
    method: "POST",
    body,
  });
  return unwrapTransaction(json);
}

function isEncounterOrg403(err: unknown): boolean {
  return (
    err instanceof PrescribeRxError &&
    err.status === 403 &&
    JSON.stringify(err.body).toLowerCase().includes("encounter")
  );
}

function isMerchantOrg403(err: unknown): boolean {
  return (
    err instanceof PrescribeRxError &&
    err.status === 403 &&
    JSON.stringify(err.body).toLowerCase().includes("merchant")
  );
}

export async function recordExternalPayment(
  input: RecordExternalPaymentInput,
): Promise<RecordExternalPaymentResult> {
  const { id: merchantAccountId, gatewayProvider: merchantGateway } =
    await resolveMerchantAccountId();
  const gatewayProvider = sandboxGatewayProvider(
    input.payMethod,
    merchantGateway,
  );

  const withEncounter = buildBody(input, {
    merchantAccountId,
    gatewayProvider,
    linkEncounter: true,
  });

  try {
    const result = await postExternal(withEncounter);
    return { ...result, encounterLinked: true };
  } catch (err) {
    if (!isEncounterOrg403(err) && !isMerchantOrg403(err)) throw err;
  }

  const withoutMerchant = buildBody(input, {
    merchantAccountId: null,
    gatewayProvider,
    linkEncounter: true,
  });
  try {
    const result = await postExternal(withoutMerchant);
    return { ...result, encounterLinked: true };
  } catch (err) {
    if (!isEncounterOrg403(err)) throw err;
  }

  const auditOnly = buildBody(input, {
    merchantAccountId: null,
    gatewayProvider,
    linkEncounter: false,
  });
  const result = await postExternal(auditOnly);
  return { ...result, encounterLinked: false };
}
