import { readSessionFromRequest } from "@/lib/auth/session";
import {
  OwnershipError,
  assertChartOwnsEncounter,
} from "@/lib/prescriberx/auth-ownership";
import {
  GENERIC_UNAUTHENTICATED,
  GENERIC_VALIDATION,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import { clientIpFromRequest } from "@/lib/prescriberx/auth-rate-limit";
import { consumeProtocolPaymentRateLimit } from "@/lib/prescriberx/protocol-payment-rate-limit";
import { collectPrxProtocolPayment } from "@/lib/prescriberx/collect-prx-protocol-payment";
import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  guardPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import {
  evaluateProtocolAccess,
  unwrapEncounterStatus,
} from "@/lib/prescriberx/encounter-status";
import { isPrxCollectorPaymentsEnabled } from "@/lib/prescriberx/prx-collector-config";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";
import { recordExternalPayment } from "@/lib/prescriberx/record-external-payment";
import {
  parseProtocolPriceAmount,
  type ProtocolPayMethod,
} from "@/lib/prescriberx/sandbox-payment";

export const dynamic = "force-dynamic";

type OpaqueDataBody = {
  data_descriptor?: string;
  data_value?: string;
};

type BillingAddressBody = {
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type Body = {
  encounter_id?: string;
  amount?: number;
  pay_method?: ProtocolPayMethod;
  price_label?: string;
  opaque_data?: OpaqueDataBody;
  card_brand?: string;
  last_four?: string;
  exp_month?: number;
  exp_year?: number;
  billing_address?: BillingAddressBody;
};

function payMethodValid(v: unknown): v is ProtocolPayMethod {
  return v === "card" || v === "hsa_fsa";
}

function parseOpaque(
  raw: OpaqueDataBody | undefined,
): { data_descriptor: string; data_value: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const descriptor = raw.data_descriptor?.trim();
  const value = raw.data_value?.trim();
  if (!descriptor || !value) return null;
  return { data_descriptor: descriptor, data_value: value };
}

function parseBilling(
  raw: BillingAddressBody | undefined,
): {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const first_name = raw.first_name?.trim();
  const last_name = raw.last_name?.trim();
  const street = raw.street?.trim();
  const city = raw.city?.trim();
  const state = raw.state?.trim();
  const zip = raw.zip?.trim();
  if (!first_name || !last_name || !street || !city || !state || !zip) {
    return null;
  }
  return { first_name, last_name, street, city, state, zip };
}

export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();
  const guard = guardPrescribeRxEnv(env);
  if (guard) return guard;

  const collectorEnabled = isPrxCollectorPaymentsEnabled();
  const sandboxRecordOnly = env.sandbox && !collectorEnabled;

  if (!env.sandbox && !collectorEnabled) {
    return authJson(
      {
        success: false,
        code: "payment_not_enabled",
        message:
          "PrescribeRx collector payments are not configured. Set Accept.js credentials and PRESCRIBERX_COLLECTOR_PAYMENTS=true.",
      },
      503,
    );
  }

  const ip = clientIpFromRequest(request);
  const payLimit = consumeProtocolPaymentRateLimit(ip);
  if (!payLimit.allowed) {
    return rateLimitedResponse(payLimit.retryAfterSec);
  }

  const session = await readSessionFromRequest(request);
  if (!session?.email || !session.patientChartId) {
    return authJson(
      {
        success: false,
        authenticated: false,
        message: GENERIC_UNAUTHENTICATED,
        code: "unauthenticated",
      },
      401,
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_json" },
      422,
    );
  }

  const encounterId = body.encounter_id?.trim();
  if (!encounterId) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "missing_encounter" },
      422,
    );
  }

  if (!payMethodValid(body.pay_method)) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_pay_method" },
      422,
    );
  }

  let amount = body.amount;
  if (amount == null && body.price_label) {
    amount = parseProtocolPriceAmount(body.price_label) ?? undefined;
  }
  if (amount == null || !Number.isFinite(amount) || amount < 0.01) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_amount" },
      422,
    );
  }

  try {
    await assertChartOwnsEncounter({
      email: session.email,
      patientChartId: session.patientChartId,
      encounterId,
    });
  } catch (err) {
    if (err instanceof OwnershipError) {
      return authJson(
        { success: false, message: GENERIC_VALIDATION, code: "ownership_failed" },
        403,
      );
    }
    return mapAuthError(err);
  }

  const entrySlug =
    new URL(request.url).searchParams.get("entry")?.trim() || "executives";
  const entry = resolveClinicalEntry(entrySlug);

  try {
    const statusRaw = await prescribeRxFetch(
      `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
    );
    const statusData = unwrapEncounterStatus(statusRaw);
    const access = evaluateProtocolAccess(statusData?.status, entry.visitGateDefault);
    if (access !== "allow") {
      return authJson(
        {
          success: false,
          code: "protocol_not_ready",
          message: "Payment is available after physician approval.",
        },
        409,
      );
    }
  } catch (err) {
    return errorResponse(err);
  }

  const host = request.headers.get("host");

  if (collectorEnabled) {
    const opaque = parseOpaque(body.opaque_data);
    const billing = parseBilling(body.billing_address);
    const lastFour = body.last_four?.replace(/\D/g, "").slice(-4);
    const expMonth = body.exp_month;
    const expYear = body.exp_year;
    const brand = body.card_brand?.trim();

    if (!opaque || !billing || !lastFour || lastFour.length !== 4) {
      return authJson(
        {
          success: false,
          code: "missing_card_token",
          message: GENERIC_VALIDATION,
        },
        422,
      );
    }
    if (
      !brand ||
      typeof expMonth !== "number" ||
      expMonth < 1 ||
      expMonth > 12 ||
      typeof expYear !== "number" ||
      expYear < 2024
    ) {
      return authJson(
        { success: false, message: GENERIC_VALIDATION, code: "invalid_card_meta" },
        422,
      );
    }

    try {
      const collected = await collectPrxProtocolPayment({
        patientChartId: session.patientChartId,
        encounterId,
        amount,
        payMethod: body.pay_method,
        billedOnDomain: host,
        opaqueData: opaque,
        cardBrand: brand,
        lastFour,
        expMonth,
        expYear,
        billingAddress: billing,
      });
      return authJson(
        {
          success: true,
          data: {
            ...collected,
            prx_collector: true,
            record_only: false,
          },
        },
        200,
      );
    } catch (err) {
      return errorResponse(err);
    }
  }

  if (!sandboxRecordOnly) {
    return authJson(
      {
        success: false,
        code: "payment_not_enabled",
        message: "Payment path is not configured for this environment.",
      },
      503,
    );
  }

  try {
    const recorded = await recordExternalPayment({
      encounterId,
      amount,
      payMethod: body.pay_method,
      billedOnDomain: host,
    });
    return authJson(
      {
        success: true,
        data: {
          ...recorded,
          sandbox: true,
          record_only: true,
        },
      },
      200,
    );
  } catch (err) {
    return errorResponse(err);
  }
}
