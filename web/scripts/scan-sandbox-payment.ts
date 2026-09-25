/**
 * Scan PrescribeRx sandbox: org context, merchants, payment-related probes.
 * Usage: npx tsx scripts/scan-sandbox-payment.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of [".env.local", ".env"]) {
    try {
      const text = readFileSync(resolve(process.cwd(), name), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i < 1) continue;
        const key = t.slice(0, i);
        let val = t.slice(i + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!out[key]) out[key] = val;
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

async function getJson(
  base: string,
  token: string,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body };
}

type ScanReport = {
  env_pins: Record<string, string>;
  probes: Record<string, unknown>;
  token_identity?: Record<string, unknown> | null;
  transaction_probes?: Record<string, unknown>;
  recommendation?: Record<string, unknown>;
};

async function main() {
  const env = loadEnv();
  const base = env.PRESCRIBERX_API_BASE;
  const token = env.PRESCRIBERX_API_TOKEN;
  if (!base || !token) {
    console.error("Missing PRESCRIBERX_API_BASE or PRESCRIBERX_API_TOKEN");
    process.exit(1);
  }

  const report: ScanReport = {
    env_pins: {
      PRESCRIBERX_SANDBOX: env.PRESCRIBERX_SANDBOX ?? "(unset)",
      PRESCRIBERX_CLIENT_ID: env.PRESCRIBERX_CLIENT_ID || "(unset)",
      PRESCRIBERX_SALES_ORG_ID: env.PRESCRIBERX_SALES_ORG_ID || "(unset)",
      PRESCRIBERX_MERCHANT_ACCOUNT_ID:
        env.PRESCRIBERX_MERCHANT_ACCOUNT_ID || "(unset)",
    },
    probes: {},
  };

  const endpoints = [
    ["GET", "/auth/me"],
    ["GET", "/merchant-accounts"],
    ["GET", "/health"],
  ] as const;

  for (const [method, path] of endpoints) {
    const r = await getJson(base, token, path, { method });
    report.probes[path] = { status: r.status, body: r.body };
  }

  const merchants = (
    (report.probes["/merchant-accounts"] as { body?: { data?: unknown[] } })
      ?.body as { data?: Array<Record<string, unknown>> }
  )?.data;

  const me = (
    (report.probes["/auth/me"] as { body?: { data?: unknown } })?.body as {
      data?: Record<string, unknown>;
    }
  )?.data;

  report.token_identity = me
    ? {
        user_id: me.id,
        email: me.email,
        user_type: me.user_type,
        sales_organization_id: me.sales_organization_id,
        client_id: me.client_id,
        organization_name: me.organization_name ?? me.org_name,
      }
    : null;

  // Fresh encounter for linkage tests
  const encType =
    env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID ||
    "019ce396-46a1-73ab-87d6-c40310555401";
  const productsR = await getJson(
    base,
    token,
    `/telehealth/products?encounter_type_id=${encodeURIComponent(encType)}`,
  );
  const productId = (
    productsR.body as { data?: Array<{ product_id?: string }> }
  )?.data?.[0]?.product_id;

  let encounterId: string | null = null;
  if (productId) {
    const stamp = Date.now().toString(36);
    const intakeR = await getJson(base, token, "/telehealth/intake/unified", {
      method: "POST",
      body: JSON.stringify({
        is_sandbox: true,
        encounter_type_id: encType,
        patient: {
          first_name: "Pay",
          last_name: `Scan${stamp}`,
          email: `tidl-pay-scan-${stamp}@example.com`,
          date_of_birth: "1990-01-15",
          phone: "5551234567",
          gender: "male",
          address: {
            street: "1 Test St",
            city: "Miami",
            state: "FL",
            zip: "33101",
            country: "US",
          },
        },
        products: [{ product_id: productId, quantity: 1 }],
      }),
    });
    const enc = (intakeR.body as { data?: { encounter_id?: string } })?.data
      ?.encounter_id;
    encounterId = enc ?? null;
    report.probes.intake = { status: intakeR.status, encounter_id: encounterId };
  }

  const txTests: Record<string, unknown> = {};
  const amount = 1.0;
  const txnId = () => `tidl-scan-${Date.now()}`;

  if (encounterId && Array.isArray(merchants)) {
    for (const m of merchants) {
      const mid = String(m.id ?? "");
      const gw = String(m.gateway_provider ?? "authorize_net");
      const body = {
        encounter_id: encounterId,
        amount,
        currency: "USD",
        type: "sale",
        gateway_provider: gw,
        gateway_transaction_id: txnId(),
        merchant_account_id: mid,
        authorization_code: "SCAN",
        external_reference: `scan-${mid.slice(0, 8)}`,
      };
      const r = await getJson(base, token, "/transactions/external", {
        method: "POST",
        body: JSON.stringify(body),
      });
      txTests[`with_merchant_${mid}`] = {
        merchant_name: m.name,
        gateway: gw,
        is_default: m.is_default,
        status: r.status,
        message: (r.body as { message?: string })?.message,
        has_merchant: (r.body as { data?: { has_merchant_account?: boolean } })
          ?.data?.has_merchant_account,
      };
    }

    const noMerchant = {
      encounter_id: encounterId,
      amount,
      currency: "USD",
      type: "sale",
      gateway_provider: "authorize_net",
      gateway_transaction_id: txnId(),
    };
    const r2 = await getJson(base, token, "/transactions/external", {
      method: "POST",
      body: JSON.stringify(noMerchant),
    });
    txTests.encounter_no_merchant = {
      status: r2.status,
      message: (r2.body as { message?: string })?.message,
      data: (r2.body as { data?: unknown })?.data,
    };

    const auditOnly = {
      amount,
      currency: "USD",
      type: "sale",
      gateway_provider: "authorize_net",
      gateway_transaction_id: txnId(),
      external_reference: `enc-${encounterId}`,
    };
    const r3 = await getJson(base, token, "/transactions/external", {
      method: "POST",
      body: JSON.stringify(auditOnly),
    });
    txTests.amount_only = {
      status: r3.status,
      data: (r3.body as { data?: unknown })?.data,
    };
  }

  report.transaction_probes = txTests;

  report.recommendation = {
    use_merchant_id:
      env.PRESCRIBERX_MERCHANT_ACCOUNT_ID ||
      (Array.isArray(merchants)
        ? (
            merchants.find((m) => m.is_default) ?? merchants[0]
          )?.id
        : null),
    note: "Set PRESCRIBERX_MERCHANT_ACCOUNT_ID to the merchant that returns 201 with encounter_id. If all return 403, ask Andrew to align token org with merchant + encounter tenancy.",
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
