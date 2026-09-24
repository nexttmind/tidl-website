/**
 * One-shot sandbox intake via TIDL proxy (for ops verification).
 * Usage: npx tsx scripts/verify-sandbox-intake-once.ts
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let v = t.slice(i + 1);
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = v;
  }
}

async function main() {
  loadEnvLocal();
  const prxBase = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const orgHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };
  const encounterTypeId =
    process.env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID ||
    "019ce396-46a1-73ab-87d6-c40310555401";
  const productsRes = await fetch(
    `${prxBase}/telehealth/products?encounter_type_id=${encodeURIComponent(encounterTypeId)}`,
    { headers: orgHeaders },
  );
  const productsJson = (await productsRes.json()) as {
    data?: Array<{ product_id?: string }>;
  };
  const productId = productsJson.data?.[0]?.product_id;
  if (!productId) throw new Error("No products for encounter type");

  const stamp = randomBytes(3).toString("hex");
  const email = `tidl-verify-${stamp}@example.com`;
  const smokeBase = (process.env.SMOKE_BASE || "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );

  const payload = {
    prebuilt: true,
    encounter_type_id: encounterTypeId,
    is_sandbox: true,
    patient: {
      first_name: "Tidl",
      last_name: `Verify${stamp}`,
      email,
      date_of_birth: "1990-06-15",
      phone: "5551234567",
      gender: "male",
      address: {
        street: "123 Main St",
        city: "Miami",
        state: "FL",
        zip: "33101",
        country: "US",
      },
    },
    products: [{ product_id: productId, quantity: 1 }],
  };

  const res = await fetch(`${smokeBase}/api/prescriberx/intake`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as {
    success?: boolean;
    message?: string;
    errors?: unknown;
    data?: {
      encounter_id?: string;
      encounter_number?: string;
      patient_number?: string;
      patient_chart_id?: string;
    };
  };

  if (!res.ok) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error(`Intake failed HTTP ${res.status}: ${json.message ?? "unknown"}`);
  }

  const d = json.data ?? {};
  console.log(
    JSON.stringify(
      {
        email,
        encounter_number: d.encounter_number ?? null,
        patient_number: d.patient_number ?? null,
        encounter_id: d.encounter_id ?? null,
        patient_chart_id: d.patient_chart_id ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
