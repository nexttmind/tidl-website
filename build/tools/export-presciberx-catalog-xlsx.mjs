/**
 * Export PrescribeRx sandbox catalog + encounter types to Excel for product review.
 * Usage (from repo root): node build/tools/export-presciberx-catalog-xlsx.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const WEB = path.join(REPO_ROOT, "web");
const require = createRequire(path.join(WEB, "package.json"));
const XLSX = require("xlsx");
const ENV_FILE = path.join(WEB, ".env.local");
const ENTRY_MAP = path.join(WEB, "content/clinical/entry-map.ts");
const ROUTES_FILE = path.join(WEB, "content/catalog/routes.ts");

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i)] = t.slice(i + 1).trim();
  }
  return out;
}

function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s, max = 500) {
  const t = (s ?? "").toString();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

async function prxFetch(base, token, pathname) {
  const res = await fetch(`${base.replace(/\/$/, "")}${pathname}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${pathname} → ${res.status}: ${json.message ?? "failed"}`);
  }
  return json.data !== undefined ? json.data : json;
}

function parseClinicalEntries(ts) {
  const entries = [];
  const blocks = ts.split(/\n  \{\n/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const encounterTypeId = block.match(/encounterTypeId:\s*"([^"]+)"/)?.[1];
    if (!slug || !encounterTypeId) continue;
    entries.push({
      care_entry_slug: slug,
      care_label: block.match(/label:\s*"([^"]+)"/)?.[1] ?? "",
      care_kind: block.match(/kind:\s*"([^"]+)"/)?.[1] ?? "",
      source_href: block.match(/sourceHref:\s*"([^"]+)"/)?.[1] ?? "",
      encounter_type_id: encounterTypeId,
      encounter_type_slug: block.match(/encounterTypeSlug:\s*"([^"]+)"/)?.[1] ?? "",
      visit_gate_default: block.match(/visitGateDefault:\s*(true|false)/)?.[1] ?? "",
    });
  }
  return entries;
}

function parseCatalogRoutes(ts) {
  const rows = [];
  const re =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?kind:\s*"([^"]+)"[\s\S]*?themeId:\s*"([^"]+)"[\s\S]*?entrySlug:\s*"([^"]+)"(?:[\s\S]*?href:\s*"([^"]+)")?/g;
  let m;
  while ((m = re.exec(ts)) !== null) {
    rows.push({
      site_catalog_id: m[1],
      site_kind: m[2],
      site_theme: m[3],
      site_entry_slug: m[4],
      site_href: m[5] ?? "",
    });
  }
  return rows;
}

function autoWidthSheet(rows) {
  if (!rows.length) return [{ wch: 12 }];
  const keys = Object.keys(rows[0]);
  return keys.map((k) => {
    let max = k.length;
    for (const row of rows) {
      const len = String(row[k] ?? "").length;
      if (len > max) max = len;
    }
    return { wch: Math.min(Math.max(max + 2, 10), 60) };
  });
}

async function main() {
  const env = loadEnv(ENV_FILE);
  let token = env.PRESCRIBERX_API_TOKEN;
  const base = env.PRESCRIBERX_API_BASE || "https://demo.prescribe-rx.com/api/v1";
  const salesOrgId = env.PRESCRIBERX_SALES_ORG_ID || "";

  if (!token) throw new Error("Missing PRESCRIBERX_API_TOKEN in web/.env.local");

  let catalog;
  try {
    catalog = await prxFetch(base, token, "/catalog");
  } catch (e) {
    const msg = String(e.message || e);
    if (!msg.includes("401")) throw e;
    const tokensRes = await fetch("https://demo.prescribe-rx.com/api/docs/tokens");
    token = (await tokensRes.json()).tokens.system_admin;
    catalog = await prxFetch(base, token, "/catalog");
  }

  const products = Array.isArray(catalog.products) ? catalog.products : [];
  const packages = Array.isArray(catalog.packages) ? catalog.packages : [];

  let encounterTypesRaw = await prxFetch(base, token, "/telehealth/encounter-types");
  const encounterTypes = Array.isArray(encounterTypesRaw)
    ? encounterTypesRaw
    : encounterTypesRaw?.items ?? [];

  const entryMapText = fs.readFileSync(ENTRY_MAP, "utf8");
  const clinicalEntries = parseClinicalEntries(entryMapText);
  const catalogRoutes = fs.existsSync(ROUTES_FILE)
    ? parseCatalogRoutes(fs.readFileSync(ROUTES_FILE, "utf8"))
    : [];

  const typeById = new Map(encounterTypes.map((t) => [t.id, t]));
  const extraTypeIds = new Set(clinicalEntries.map((e) => e.encounter_type_id));
  for (const id of extraTypeIds) {
    if (!typeById.has(id)) {
      typeById.set(id, {
        id,
        name: "(not in encounter-types list; schema may still work)",
        slug: clinicalEntries.find((e) => e.encounter_type_id === id)?.encounter_type_slug ?? "",
      });
    }
  }

  const encounterProductRows = [];
  const encounterSummaryRows = [];

  for (const [typeId, meta] of typeById) {
    let linked = [];
    try {
      linked = await prxFetch(
        base,
        token,
        `/telehealth/products?encounter_type_id=${encodeURIComponent(typeId)}`,
      );
    } catch {
      linked = [];
    }
    const list = Array.isArray(linked) ? linked : linked?.products ?? [];
    encounterSummaryRows.push({
      encounter_type_id: typeId,
      encounter_name: meta.name ?? "",
      encounter_slug: meta.slug ?? "",
      interaction_type: meta.interaction_type ?? meta.interaction_type_label ?? "",
      requires_labs: meta.requires_labs ?? "",
      is_featured: meta.is_featured ?? "",
      linked_product_count: list.length,
      in_type_list_api: encounterTypes.some((t) => t.id === typeId) ? "yes" : "no",
    });
    if (list.length === 0) {
      encounterProductRows.push({
        encounter_type_id: typeId,
        encounter_name: meta.name ?? "",
        product_id: "",
        product_name: "(none linked)",
        sku: "",
      });
    } else {
      for (const p of list) {
        encounterProductRows.push({
          encounter_type_id: typeId,
          encounter_name: meta.name ?? "",
          product_id: p.product_id ?? p.id ?? "",
          product_name: p.product_name ?? p.name ?? "",
          sku: p.sku ?? "",
          rx_required: p.rx_required ?? "",
        });
      }
    }
  }

  encounterSummaryRows.sort((a, b) =>
    String(a.encounter_name).localeCompare(String(b.encounter_name)),
  );

  const encByProduct = new Map();
  for (const row of encounterProductRows) {
    if (!row.product_id) continue;
    if (!encByProduct.has(row.product_id)) encByProduct.set(row.product_id, row.encounter_name);
  }

  function productCategory(name, productId) {
    const enc = encByProduct.get(productId);
    if (enc) return `Clinical: ${enc}`;
    const n = (name ?? "").toLowerCase();
    if (/tirzepatide|semaglutide|retatrutide|glp/.test(n)) return "Weight loss / GLP-1";
    if (/testosterone|trt|cypionate/.test(n)) return "Men's health / TRT";
    if (/pt-141|sildenafil|tadalafil/.test(n)) return "Sexual health";
    if (/bpc|tb-500|peptide|sermorelin|tesamorelin|nad\+|glutathione|ss-31/.test(n))
      return "Peptides & longevity";
    if (/b12|methylcobalamin|lipo|methylene/.test(n)) return "Supplements & wellness";
    return "Other / uncategorized in API";
  }

  const productRows = products
    .map((p) => ({
      category_group: productCategory(p.name, p.id),
      product_id: p.id,
      sku: p.sku ?? "",
      name: p.name ?? "",
      short_description: p.short_description ?? "",
      description: truncate(stripHtml(p.description)),
      product_class_id: p.product_class_id ?? "",
      product_type_id: p.product_type_id ?? "",
      linked_encounter_type: encByProduct.get(p.id) ?? "",
      rx_required: p.rx_required ?? "",
      is_active: p.is_active ?? "",
      price: p.pricing?.price ?? "",
      retail_price: p.pricing?.retail_price ?? "",
      wholesale_price: p.pricing?.wholesale_price ?? "",
      cost: p.pricing?.cost ?? "",
      price_type: p.pricing?.price_type ?? "",
      has_image: p.image_url ? "yes" : "no",
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const packageRows = packages
    .map((pkg) => ({
      package_id: pkg.id,
      package_number: pkg.package_number ?? "",
      name: pkg.name ?? "",
      slug: pkg.slug ?? "",
      description: truncate(stripHtml(pkg.description)),
      is_active: pkg.is_active ?? "",
      retail_price: pkg.pricing?.retail_price ?? "",
      wholesale_price: pkg.pricing?.wholesale_price ?? "",
      consumer_price: pkg.pricing?.consumer_price ?? "",
      item_count: Array.isArray(pkg.items) ? pkg.items.length : 0,
    }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const packageItemRows = [];
  for (const pkg of packages) {
    for (const item of pkg.items ?? []) {
      packageItemRows.push({
        package_id: pkg.id,
        package_name: pkg.name ?? "",
        package_number: pkg.package_number ?? "",
        item_display_name: item.display_name ?? "",
        product_id: item.product_id ?? "",
        product_name: item.product_name ?? "",
        product_sku: item.product_sku ?? "",
        quantity: item.quantity ?? "",
        is_primary: item.is_primary ?? "",
        is_optional: item.is_optional ?? "",
        additional_price: item.additional_price ?? "",
      });
    }
  }

  const carePathRows = clinicalEntries.map((e) => {
    const type = typeById.get(e.encounter_type_id);
    const summary = encounterSummaryRows.find((r) => r.encounter_type_id === e.encounter_type_id);
    return {
      ...e,
      encounter_name: type?.name ?? "",
      linked_product_count: summary?.linked_product_count ?? "",
      in_type_list_api: summary?.in_type_list_api ?? "",
    };
  });

  const siteMerchRows = catalogRoutes.map((r) => ({
    ...r,
    note: "Marketing PDP — compare to PrescribeRx Products sheet for live SKU/price",
  }));

  const exportedAt = new Date().toISOString();
  const summaryRows = [
    { field: "Exported at (UTC)", value: exportedAt },
    { field: "API base", value: base },
    { field: "Environment", value: env.PRESCRIBERX_SANDBOX === "false" ? "production" : "sandbox (demo)" },
    { field: "TIDL Sandbox sales org ID", value: salesOrgId },
    { field: "Products in /catalog", value: products.length },
    { field: "Packages in /catalog", value: packages.length },
    { field: "Encounter types (API list + entry-map extras)", value: typeById.size },
    { field: "TIDL care paths (entry-map)", value: clinicalEntries.length },
    { field: "TIDL marketing catalog rows (routes.ts)", value: catalogRoutes.length },
    {
      field: "Notes",
      value:
        "Linked products = GET /telehealth/products?encounter_type_id=. Some encounter UUIDs work for intake/schema but do not appear in the type list. Packages may list display names without product_id.",
    },
  ];

  const wb = XLSX.utils.book_new();
  const addSheet = (name, rows) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = autoWidthSheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  };

  addSheet("Summary", summaryRows);
  addSheet("Products", productRows);
  addSheet("Packages", packageRows);
  addSheet("Package Items", packageItemRows);
  addSheet("Encounter Types", encounterSummaryRows);
  addSheet("Encounter Products", encounterProductRows);
  addSheet("TIDL Care Paths", carePathRows);
  addSheet("TIDL Site Catalog", siteMerchRows);

  const outDir = path.join(REPO_ROOT, "docs", "exports");
  fs.mkdirSync(outDir, { recursive: true });
  const date = exportedAt.slice(0, 10);
  const outFile = path.join(outDir, `prescriberx-sandbox-catalog-${date}.xlsx`);
  XLSX.writeFile(wb, outFile);

  console.log(JSON.stringify({ outFile, products: products.length, packages: packages.length, encounterTypes: typeById.size }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
