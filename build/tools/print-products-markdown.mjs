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

function inferCategory(name, links) {
  if (links.length) {
    const primary = links[0].encounter_name;
    return `Clinical: ${primary}`;
  }
  const n = name.toLowerCase();
  if (/tirzepatide|semaglutide|retatrutide|glp|liraglutide|zepbound|wegovy|mounjaro/.test(n))
    return "Weight loss / GLP-1";
  if (/testosterone|trt|cypionate|enanthate|hcg|anastrozole|clomiphene|gonadorelin/.test(n))
    return "Men's health / TRT";
  if (/estradiol|progesterone|hrt|dhea|bi-est|estriol/.test(n)) return "Women's health / HRT";
  if (/sildenafil|tadalafil|pt-141|oxytocin|ed |viagra|cialis/.test(n)) return "Sexual health";
  if (/bpc|tb-500|tb500|peptide|sermorelin|tesamorelin|ipamorelin|ghk|aod|melanotan|nad\+|glutathione|mots-c|ss-31|epitalon|kisspeptin|dihexa|selank|semax|thymosin|ll-37|kpv|snap-8|argireline|matrixyl|ghrp|igf|mgf|follistatin|hexarelin|mod grf|dsip|vip|oxytocin|pinealon|humanin|elamipretide|foxo4|epithalon/.test(n))
    return "Peptides & longevity";
  if (/b12|lipo|methylene|vitamin|mineral|coq10|nad |nmn|creatine|omega|magnesium|zinc|iron|folate|biotin|collagen|probiotic|ashwagandha|berberine|metformin|naltrexone|ldn|low dose|pregnenolone|d-ribose|taurine|theanine|l-carnitine|alpha lipoic|acetyl/.test(n))
    return "Supplements & wellness";
  if (/lidocaine|diclofenac|ketoprofen|pain|topical|cream|gel patch/.test(n)) return "Pain / topicals";
  if (/lab|blood|test kit|panel|diagnostic|saliva|urine|culture|swab/.test(n)) return "Labs & diagnostics";
  if (/syringe|needle|alcohol|swab|supply|shipping|consult|visit|fee|service/.test(n))
    return "Supplies & services";
  return "Other / uncategorized in API";
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
      interaction_type: t.interaction_type_label ?? t.interaction_type ?? "",
    });
  }
}

const products = (cat.products ?? []).map((p) => {
  const links = encByProduct.get(p.id) ?? [];
  const pr = p.pricing ?? {};
  return {
    id: p.id,
    sku: p.sku ?? "—",
    name: p.name ?? "",
    category: inferCategory(p.name ?? "", links),
    short_description: p.short_description ?? "—",
    description: stripHtml(p.description) || "—",
    product_class_id: p.product_class_id ?? "—",
    product_type_id: p.product_type_id ?? "—",
    rx_required: p.rx_required === true ? "Yes" : p.rx_required === false ? "No" : "—",
    is_active: p.is_active === true ? "Active" : p.is_active === false ? "Inactive" : "—",
    price: pr.price ?? "—",
    retail_price: pr.retail_price ?? "—",
    wholesale_price: pr.wholesale_price ?? "—",
    cost: pr.cost ?? "—",
    price_type: pr.price_type ?? "—",
    has_image: p.image_url ? "Yes" : "No",
    encounter_links: links,
  };
});

products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

const byCat = new Map();
for (const p of products) {
  if (!byCat.has(p.category)) byCat.set(p.category, []);
  byCat.get(p.category).push(p);
}

const lines = [];
lines.push("# PrescribeRx sandbox catalog — products (detailed)");
lines.push("");
lines.push(`**Exported:** ${new Date().toISOString()} · **API:** demo.prescribe-rx.com · **Total products:** ${products.length}`);
lines.push("");
lines.push("Category column combines API encounter linkage (when present) with name-based grouping for products not linked to an encounter type.");
lines.push("");

for (const [category, items] of [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`## ${category} (${items.length})`);
  lines.push("");
  for (const p of items) {
    lines.push(`### ${p.name}`);
    lines.push("");
    lines.push(`| Field | Value |`);
    lines.push(`| --- | --- |`);
    lines.push(`| **Product ID** | \`${p.id}\` |`);
    lines.push(`| **SKU** | ${p.sku} |`);
    lines.push(`| **Category (grouped)** | ${p.category} |`);
    lines.push(`| **Product class ID** | ${p.product_class_id} |`);
    lines.push(`| **Product type ID** | ${p.product_type_id} |`);
    lines.push(`| **Rx required** | ${p.rx_required} |`);
    lines.push(`| **Status** | ${p.is_active} |`);
    lines.push(`| **Short description** | ${p.short_description} |`);
    lines.push(`| **Price** | ${p.price} |`);
    lines.push(`| **Retail** | ${p.retail_price} |`);
    lines.push(`| **Wholesale** | ${p.wholesale_price} |`);
    lines.push(`| **Cost** | ${p.cost} |`);
    lines.push(`| **Price type** | ${p.price_type} |`);
    lines.push(`| **Image in catalog** | ${p.has_image} |`);
    if (p.description !== "—") lines.push(`| **Description** | ${p.description.slice(0, 400)}${p.description.length > 400 ? "…" : ""} |`);
    if (p.encounter_links.length) {
      lines.push(`| **Linked encounter types** | ${p.encounter_links.map((l) => `${l.encounter_name} (\`${l.encounter_slug}\`, id \`${l.encounter_type_id}\`)`).join("; ")} |`);
    } else {
      lines.push(`| **Linked encounter types** | None in sandbox API |`);
    }
    lines.push("");
  }
}

const mdPath = path.join(REPO_ROOT, "docs/exports/presciberx-products-detailed.md");
fs.mkdirSync(path.dirname(mdPath), { recursive: true });
fs.writeFileSync(mdPath, lines.join("\n"), "utf8");

const jsonPath = path.join(REPO_ROOT, "docs/exports/presciberx-products-detail.json");
fs.writeFileSync(jsonPath, JSON.stringify({ exported_at: new Date().toISOString(), products }, null, 2), "utf8");

console.log(mdPath);
console.log(jsonPath);
console.log("categories", byCat.size);
