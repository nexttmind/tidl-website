/**
 * PrescribeRx collector checkout after physician approval:
 * vault card on PRX merchant, then charge the encounter-linked order.
 */

import { PrescribeRxError, prescribeRxFetch } from "./client";
import {
  isEncounterOrderPaid,
  unwrapEncounterOrder,
  type EncounterOrderRef,
} from "./encounter-order";
import { unwrapEncounterStatus } from "./encounter-status";
import { resolveMerchantAccountId } from "./merchant-accounts";
import type { ProtocolPayMethod } from "./sandbox-payment";
import {
  vaultPrxPaymentMethod,
  type VaultBillingAddress,
} from "./vault-prx-payment-method";

export type CollectPrxProtocolPaymentInput = {
  patientChartId: string;
  encounterId: string;
  amount: number;
  payMethod: ProtocolPayMethod;
  billedOnDomain?: string | null;
  opaqueData: { data_descriptor: string; data_value: string };
  cardBrand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  billingAddress: VaultBillingAddress;
};

export type CollectPrxProtocolPaymentResult = {
  paymentMethodId: string;
  orderId: string | null;
  transactionId: string | null;
  alreadyPaid: boolean;
  gatewayProvider: string;
};

async function fetchEncounterOrder(
  encounterId: string,
): Promise<EncounterOrderRef | null> {
  const raw = await prescribeRxFetch(
    `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
  );
  return unwrapEncounterOrder(unwrapEncounterStatus(raw));
}

async function fetchOrderAmount(orderId: string): Promise<number | null> {
  try {
    const raw = await prescribeRxFetch(
      `/orders/${encodeURIComponent(orderId)}`,
    );
    if (!raw || typeof raw !== "object") return null;
    const root = raw as Record<string, unknown>;
    const data =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : root;
    const total = data.grand_total ?? data.total;
    if (typeof total === "number" && Number.isFinite(total)) return total;
    if (typeof total === "string") {
      const n = Number.parseFloat(total);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

type ChargeBody = Record<string, unknown>;

function buildChargeBody(opts: {
  orderId: string | null;
  encounterId: string;
  paymentMethodId: string;
  merchantAccountId: string | null;
  gatewayProvider: string;
  amount: number;
  billedOnDomain?: string | null;
  payMethod: ProtocolPayMethod;
}): ChargeBody {
  const body: ChargeBody = {
    amount: opts.amount,
    currency: "USD",
    type: "sale",
    gateway_provider: opts.gatewayProvider,
    payment_method_id: opts.paymentMethodId,
    billed_on_domain: opts.billedOnDomain ?? "tidlll.com",
    external_reference: `tidl-prx-collect:${opts.encounterId}:${opts.payMethod}`,
  };
  if (opts.merchantAccountId) {
    body.merchant_account_id = opts.merchantAccountId;
  }
  if (opts.orderId) body.order_id = opts.orderId;
  body.encounter_id = opts.encounterId;
  return body;
}

function unwrapChargeTransaction(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  return typeof data.transaction_id === "string" ? data.transaction_id : null;
}

async function tryCaptureOrder(
  orderId: string,
  paymentMethodId: string,
  amount: number,
): Promise<boolean> {
  try {
    await prescribeRxFetch(`/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      body: { payment_method_id: paymentMethodId, amount },
    });
    return true;
  } catch (err) {
    if (err instanceof PrescribeRxError && err.status === 404) return false;
    throw err;
  }
}

async function chargeViaPrxGateway(body: ChargeBody): Promise<string | null> {
  const json = await prescribeRxFetch("/transactions/external", {
    method: "POST",
    body,
  });
  return unwrapChargeTransaction(json);
}

export async function collectPrxProtocolPayment(
  input: CollectPrxProtocolPaymentInput,
): Promise<CollectPrxProtocolPaymentResult> {
  const orderRef = await fetchEncounterOrder(input.encounterId);
  if (orderRef && isEncounterOrderPaid(orderRef.paymentStatus)) {
    return {
      paymentMethodId: "",
      orderId: orderRef.orderId,
      transactionId: null,
      alreadyPaid: true,
      gatewayProvider: "authorize_net",
    };
  }

  const vault = await vaultPrxPaymentMethod({
    patientChartId: input.patientChartId,
    opaqueData: input.opaqueData,
    cardBrand: input.cardBrand,
    lastFour: input.lastFour,
    expMonth: input.expMonth,
    expYear: input.expYear,
    billingAddress: input.billingAddress,
    setAsDefault: true,
  });

  const { id: merchantAccountId, gatewayProvider: merchantGateway } =
    await resolveMerchantAccountId();
  const gatewayProvider = merchantGateway ?? "authorize_net";

  let amount = input.amount;
  if (orderRef?.orderId) {
    const orderTotal = await fetchOrderAmount(orderRef.orderId);
    if (orderTotal != null && orderTotal > 0) amount = orderTotal;
  }

  const chargeBody = buildChargeBody({
    orderId: orderRef?.orderId ?? null,
    encounterId: input.encounterId,
    paymentMethodId: vault.paymentMethodId,
    merchantAccountId: vault.merchantAccountId ?? merchantAccountId,
    gatewayProvider,
    amount,
    billedOnDomain: input.billedOnDomain,
    payMethod: input.payMethod,
  });

  if (orderRef?.orderId) {
    const captured = await tryCaptureOrder(
      orderRef.orderId,
      vault.paymentMethodId,
      amount,
    );
    if (captured) {
      return {
        paymentMethodId: vault.paymentMethodId,
        orderId: orderRef.orderId,
        transactionId: null,
        alreadyPaid: false,
        gatewayProvider,
      };
    }
  }

  let transactionId: string | null = null;
  try {
    transactionId = await chargeViaPrxGateway(chargeBody);
  } catch (err) {
    if (err instanceof PrescribeRxError && err.status === 403) {
      const withoutMerchant = { ...chargeBody };
      delete withoutMerchant.merchant_account_id;
      transactionId = await chargeViaPrxGateway(withoutMerchant);
    } else {
      throw err;
    }
  }

  return {
    paymentMethodId: vault.paymentMethodId,
    orderId: orderRef?.orderId ?? null,
    transactionId,
    alreadyPaid: false,
    gatewayProvider,
  };
}
