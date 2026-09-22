import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  for (const line of fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)) {
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

const TRT = "019d000e-a554-721d-a727-08f65de4fd0b";
const GLP = "019ce396-46a1-73ab-87d6-c40310555401";

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  const clientId = process.env.PRESCRIBERX_CLIENT_ID;

  const list = await fetch(`${base}/telehealth/encounter-types?per_page=50`, {
    headers: h,
  });
  const listJson = (await list.json()) as {
    data?: Array<{ id?: string; slug?: string; name?: string }>;
  };
  const rows = Array.isArray(listJson.data) ? listJson.data : [];
  console.log("encounter-types status", list.status, "count", rows.length);
  const ids = new Set(rows.map((r) => r.id));
  console.log("trt_in_list", ids.has(TRT));
  console.log("glp_in_list", ids.has(GLP));
  console.log(
    "listed",
    rows.map((r) => `${r.slug ?? "?"} ${r.id}`),
  );

  const patient = {
    first_name: "Tidl",
    last_name: "Tester",
    email: `tidl-avail-${Date.now()}@example.com`,
    date_of_birth: "1990-06-15",
    phone: "5551234567",
  };

  for (const [label, extra] of [
    ["trt-no-client", { encounter_type_id: TRT, is_sandbox: true, patient }],
    [
      "trt-with-client",
      {
        encounter_type_id: TRT,
        is_sandbox: true,
        client_id: clientId,
        patient,
      },
    ],
    ["trt-by-slug", { encounter_type_slug: "male-trt-consult", is_sandbox: true, patient }],
    ["glp-no-client", { encounter_type_id: GLP, is_sandbox: true, patient }],
    [
      "glp-with-client",
      {
        encounter_type_id: GLP,
        is_sandbox: true,
        client_id: clientId,
        patient,
      },
    ],
  ] as const) {
    const r = await fetch(`${base}/telehealth/intake/unified`, {
      method: "POST",
      headers: h,
      body: JSON.stringify(extra),
    });
    const j = (await r.json()) as { message?: string; errors?: unknown };
    console.log(label, r.status, j.message ?? "", JSON.stringify(j.errors ?? null));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
