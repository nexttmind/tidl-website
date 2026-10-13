import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WEB = path.join(REPO_ROOT, "web");
const envText = fs.readFileSync(path.join(WEB, ".env.local"), "utf8");
const envGet = (k) => envText.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

let base = envGet("PRESCRIBERX_API_BASE");
let token = envGet("PRESCRIBERX_API_TOKEN");

function headers() {
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

async function prxGet(pathname) {
  let res = await fetch(`${base.replace(/\/$/, "")}${pathname}`, { headers: headers() });
  if (res.status === 401) {
    token = (await (await fetch("https://demo.prescribe-rx.com/api/docs/tokens")).json()).tokens
      .system_admin;
    res = await fetch(`${base.replace(/\/$/, "")}${pathname}`, { headers: headers() });
  }
  const json = await res.json();
  if (!res.ok) throw new Error(`${pathname} ${res.status}`);
  return json.data ?? json;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const cat = await prxGet("/catalog");
const types = await prxGet("/telehealth/encounter-types");
const typeList = Array.isArray(types) ? types : [];

const encByProduct = new Map();
for (const t of typeList) {
  const linked = await prxGet(
    `/telehealth/products?encounter_type_id=${encodeURIComponent(t.id)}`,
  );
  const list = Array.isArray(linked) ? linked : linked.products ?? [];
  for (const p of list) {
    const id = p.product_id ?? p.id;
    if (!encByProduct.has(id)) encByProduct.set(id, []);
    encByProduct.get(id).push({
      encounter_type_id: t.id,
      encounter_name: t.name,
      encounter_slug: t.slug,
      product_class: t.product_class ?? "",
      product_type: t.product_type ?? "",
      interaction_type: t.interaction_type_label ?? t.interaction_type ?? "",
    });
  }
}

const products = (cat.products ?? []).map((p) => ({
  product_id: p.id,
  sku: p.sku ?? "",
  name: p.name ?? "",
  short_description: p.short_description ?? "",
  description: stripHtml(p.description),
  product_class_id: p.product_class_id ?? "",
  product_type_id: p.product_type_id ?? "",
  rx_required: p.rx_required,
  is_active: p.is_active,
  image_url: p.image_url ?? "",
  pricing: p.pricing ?? null,
  encounter_links: encByProduct.get(p.id) ?? [],
}));

products.sort((a, b) => a.name.localeCompare(b.name));

const out = path.join(REPO_ROOT, "docs/exports/presciberx-products-detail.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ exported_at: new Date().toISOString(), count: products.length, products }, null, 2));
console.log(out, products.length);
