/**
 * Create a sandbox unified intake via TIDL proxy for browser Phase B audit.
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
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = v;
  }
}

async function main() {
  loadEnvLocal();
  const base = process.env.SMOKE_BASE || "http://127.0.0.1:3000";
  const stamp = randomBytes(4).toString("hex");
  const email = `tidl-audit-${stamp}@example.com`;
  const encounterTypeId =
    process.env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID ||
    "019ce396-46a1-73ab-87d6-c40310555401";

  const prxBase = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const orgHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };
  const productsRes = await fetch(
    `${prxBase}/telehealth/products?encounter_type_id=${encodeURIComponent(encounterTypeId)}`,
    { headers: orgHeaders },
  );
  const productsJson = (await productsRes.json()) as {
    data?: Array<{ product_id?: string }>;
  };
  const productId = productsJson.data?.[0]?.product_id;
  if (!productId) throw new Error("No products for encounter type");

  const payload = {
    prebuilt: true,
    encounter_type_id: encounterTypeId,
    is_sandbox: true,
    patient: {
      first_name: "Tidl",
      last_name: `Audit${stamp.slice(0, 4)}`,
      email,
      date_of_birth: "1990-06-15",
      phone: "5551234567",
      gender: "male",
    },
    vitals: { height_inches: 70, weight_lbs: 180 },
    answers: {},
    products: [{ product_id: productId, quantity: 1 }],
  };

  const res = await fetch(`${base}/api/prescriberx/intake`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: {
      encounter_id?: string;
      patient_chart_id?: string;
      encounter_number?: string;
      user_id?: string;
    };
    message?: string;
  };
  if (!res.ok || !json.data?.encounter_id || !json.data?.patient_chart_id) {
    throw new Error(
      `Intake failed ${res.status}: ${json.message ?? JSON.stringify(json).slice(0, 300)}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        email,
        password: `AuditPass-${stamp}9`,
        encounterId: json.data.encounter_id,
        patientChartId: json.data.patient_chart_id,
        encounterNumber: json.data.encounter_number ?? null,
        userId: json.data.user_id ?? null,
        entrySlug: "weight-loss",
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
