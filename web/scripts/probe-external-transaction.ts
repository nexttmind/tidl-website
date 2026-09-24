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
      /* missing file */
    }
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const base = env.PRESCRIBERX_API_BASE;
  const token = env.PRESCRIBERX_API_TOKEN;
  const enc = process.argv[2] ?? "01a0cd2f-3230-7227-9dba-5cf64cc5c28d";
  if (!base || !token) {
    console.error("missing PRESCRIBERX_API_BASE or token");
    process.exit(1);
  }
  const listRes = await fetch(`${base}/merchant-accounts`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const listJson = (await listRes.json()) as {
    data?: Array<{ id: string; is_default?: boolean }>;
  };
  const accounts = listJson.data ?? [];
  const merchant =
    env.PRESCRIBERX_MERCHANT_ACCOUNT_ID ??
    accounts.find((a) => a.is_default)?.id ??
    accounts[0]?.id;
  if (!merchant) {
    console.error("no merchant accounts on org");
    process.exit(1);
  }
  console.log("merchant", merchant, "accounts", accounts.length);
  const withMerchant = process.argv.includes("--with-merchant");
  const useStripe = process.argv.includes("--stripe");
  const pick = useStripe
    ? accounts.find((a) => a.id !== merchant) ?? accounts[0]
    : accounts.find((a) => a.is_default) ?? accounts[0];
  const gatewayProvider = useStripe ? "stripe" : "authorize_net";
  const body: Record<string, unknown> = {
    encounter_id: enc,
    amount: 349,
    currency: "USD",
    type: "sale",
    gateway_provider: gatewayProvider,
    gateway_transaction_id: `tidl-sandbox-${Date.now()}`,
    authorization_code: "SANDBOX",
    billed_on_domain: "localhost",
    external_reference: "tidl-probe",
    customer_profile_id: "500000001",
    payment_profile_id: "500000002",
  };
  if (withMerchant && pick?.id) body.merchant_account_id = pick.id;
  const res = await fetch(`${base}/transactions/external`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(res.status, await res.text());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
