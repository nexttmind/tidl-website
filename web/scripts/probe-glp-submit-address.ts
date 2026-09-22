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

const GLP = "019ce396-46a1-73ab-87d6-c40310555401";

async function post(label: string, body: unknown, base: string, h: Record<string, string>) {
  const r = await fetch(`${base}/telehealth/intake/unified`, {
    method: "POST",
    headers: h,
    body: JSON.stringify(body),
  });
  const j = (await r.json()) as { message?: string; errors?: unknown };
  console.log(label, r.status, j.message ?? "", JSON.stringify(j.errors ?? null));
}

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  const products = await (
    await fetch(`${base}/telehealth/products?encounter_type_id=${GLP}`, {
      headers: h,
    })
  ).json();
  const productId = (products as { data?: Array<{ product_id?: string }> }).data?.[0]
    ?.product_id;
  const patientBase = {
    first_name: "Tidl",
    last_name: "Tester",
    email: `tidl-addr-${Date.now()}@example.com`,
    date_of_birth: "1990-06-15",
    phone: "5551234567",
  };
  const addr = {
    street: "123 Main St",
    city: "Miami",
    state: "FL",
    zip: "33101",
    country: "US",
  };

  const schema = await (
    await fetch(`${base}/telehealth/encounter-types/${GLP}/schema`, { headers: h })
  ).json();
  const steps = (schema as { data?: { steps?: Array<{ step_name?: string; step_type?: number; fields?: Array<{ slug?: string }> }> } }).data?.steps ?? [];
  const addrStep = steps.find((s) =>
    (s.fields ?? []).some((f) => f.slug === "patient_address"),
  );
  console.log("address_step", addrStep?.step_name, "type", addrStep?.step_type);

  await post(
    "address-only",
    {
      encounter_type_id: GLP,
      is_sandbox: true,
      patient: { ...patientBase, address: addr },
      products: [{ product_id: productId, quantity: 1 }],
    },
    base,
    h,
  );
  await post(
    "shipping-only",
    {
      encounter_type_id: GLP,
      is_sandbox: true,
      patient: { ...patientBase, shipping_address: addr },
      products: [{ product_id: productId, quantity: 1 }],
    },
    base,
    h,
  );
  await post(
    "both",
    {
      encounter_type_id: GLP,
      is_sandbox: true,
      patient: {
        ...patientBase,
        address: addr,
        shipping_address: addr,
        billing_same_as_shipping: true,
      },
      products: [{ product_id: productId, quantity: 1 }],
    },
    base,
    h,
  );
}

main();
