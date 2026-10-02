import { catalogHasPenLockup } from "@/components/home/shop-catalog";
import { painReliefStartsAt } from "@/content/fixtures/pain-relief";
import pricing from "@/content/pdp/tidl-launch-pricing.json";

export type LaunchForm = "vial" | "vial-pen" | "capsule" | "kit" | "fixed";
export type LaunchMolecule = "tirzepatide" | "semaglutide";
export type LaunchBilling = "one_time" | "monthly";
export type LaunchVisit = "async" | "video";
export type LaunchKind = "product" | "bundle" | "treatment";

export type LaunchSku = {
  slug: string;
  kind: LaunchKind;
  marketable: string;
  form: LaunchForm;
  molecule: LaunchMolecule | null;
  months: number;
  billing: LaunchBilling;
  price_one_time: number | null;
  per_month: number | null;
  discount_vs_1_month: number | null;
  saves_vs_1_month: number | null;
  saves_pct_vs_1_month: number | null;
  full_price_if_bought_monthly: number | null;
  monthly_installment: number | null;
  monthly_billing_total: number | null;
  baseline_kit_priced_in: boolean;
  retest_kits: number;
  retests_billed_on_shipment: number;
  total_spend_over_pack: number | null;
  testing_add_on_1_month: number | null;
  visit_mode: LaunchVisit | string;
  visit_requirement: string;
  labs_included: boolean;
  lab_kit: string | null;
  reassessment: string | null;
  tidl_includes: readonly string[];
  ships_with: readonly string[];
  protocol_dose: string | null;
  coupon_tag: string;
  /** Exact `form` string on the SKU. Pages match this, they do not parse prose. */
  formValue: string;
  formLabel: string;
  /** Retest schedule name. Absent on supply plans, which stay "N months". */
  plan_label: string | null;
};

type RawSku = {
  slug: string;
  kind: string;
  marketable: string;
  form: string;
  months: number;
  billing: string;
  visit_mode: string;
  visit_requirement: string;
  products_included?: string;
  plan_label?: string | null;
  ships_with?: readonly string[] | null;
  protocol_dose: string | null;
  labs_included: string;
  lab_kit: string | null;
  reassessment: string | null;
  price_one_time: number | null;
  per_month: number | null;
  discount_vs_1_month: number | null;
  monthly_installment: number | null;
  monthly_billing_total: number | null;
  baseline_kit_priced_in: number;
  retest_kits: number;
  retests_billed_on_shipment: number;
  total_spend_over_pack: number | null;
  testing_add_on_1_month: number | string | null;
  tidl_includes?: string;
  coupon_tag: string;
  full_price_if_bought_monthly?: number | null;
  saves_vs_1_month: number | null;
  saves_pct_vs_1_month?: number | null;
};

/** File slug to the catalog id the site already renders. */
const FILE_SLUG_TO_ID: Readonly<Record<string, string>> = {
  semaglutide: "semaglutide",
  tirzepatide: "tirzepatide",
  tesamorelin: "tesamorelin",
  sermorelin: "sermorelin",
  "methylene-blue": "methylene-blue",
  b12: "b12",
  "lipo-c": "lipo-c",
  "blood-test": "at-home-lab",
  "at-home-blood-test": "at-home-lab",
  "treatments/weight-loss": "weight-loss",
  "treatments/mens-health": "mens-peak-performance",
  "treatments/recovery-and-performance": "repair-mobility",
  "treatments/sexual-health": "sexual-health",
  "treatments/womens-balance": "womens-total-balance",
  "treatments/skin-and-hair": "hair-skin-nails",
  "programs/healthspan": "longevity",
  "programs/athletes": "rest-rebuild",
  "programs/parents": "stress-mood",
  "programs/creators-and-builders": "focus",
  "stacks/transformation": "appetite-balance",
  "bundles/complete-stack": "complete-stack",
  "bundles/lean-and-cut": "lean-cut",
  "bundles/body-composition": "body-composition",
  "bundles/rest-and-rise": "rest-rise",
  "bundles/energy-lift": "energy-lift",
  "bundles/head-start": "head-start",
};

const FORM_COPY: Record<LaunchForm, { label: string; hint: string }> = {
  vial: { label: "Vial", hint: "Multi dose vial" },
  "vial-pen": { label: "Pre-loaded pen", hint: "Pre-dosed pen" },
  capsule: { label: "Capsule", hint: "Oral Tablet" },
  kit: { label: "Kit", hint: "" },
  fixed: { label: "", hint: "" },
};

/**
 * Exact SKU `form` values. Unknown strings are dropped.
 * Nothing here is read out of description, products_included, or ships_with.
 */
const FORM_VALUE: Readonly<
  Record<string, { form: LaunchForm; label: string; molecule?: LaunchMolecule }>
> = {
  Pen: { form: "vial-pen", label: "Pre-loaded pen" },
  "Flow Pen": { form: "vial-pen", label: "Pre-loaded pen" },
  MDV: { form: "vial", label: "Vial" },
  Vial: { form: "vial", label: "Vial" },
  Oral: { form: "capsule", label: "Capsule" },
  "Semaglutide, Oral": { form: "capsule", label: "Capsule", molecule: "semaglutide" },
  Kit: { form: "kit", label: "Kit" },
  Fixed: { form: "fixed", label: "" },
  "Semaglutide, Flow Pen": {
    form: "vial-pen",
    label: "Pre-loaded pen",
    molecule: "semaglutide",
  },
  "Semaglutide, Vial": { form: "vial", label: "Vial", molecule: "semaglutide" },
  "Tirzepatide, Flow Pen": {
    form: "vial-pen",
    label: "Pre-loaded pen",
    molecule: "tirzepatide",
  },
  "Tirzepatide, Vial": { form: "vial", label: "Vial", molecule: "tirzepatide" },
};

/** Head Start is semaglutide only. Tirzepatide rows stay in the file and off the page. */
const PAGE_FORM_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  "head-start": new Set([
    "Semaglutide, Flow Pen",
    "Semaglutide, Vial",
    "Semaglutide, Oral",
  ]),
};

/** Bundle molecule row. Vial art only. Product names, not a selector. */
const BUNDLE_COMPONENTS: Readonly<Record<string, readonly string[]>> = {
  "head-start": ["semaglutide", "lipo-c", "b12"],
  focus: ["methylene-blue", "sermorelin"],
  "appetite-balance": ["tirzepatide", "tesamorelin"],
  "body-composition": ["tesamorelin", "sermorelin"],
  "rest-rise": ["sermorelin", "b12"],
  "energy-lift": ["b12", "lipo-c"],
};

const MOLECULE_ORDER: readonly LaunchMolecule[] = ["tirzepatide", "semaglutide"];

const FORM_ORDER: readonly LaunchForm[] = ["vial", "vial-pen", "capsule", "kit"];

export const LAUNCH_PER_KIT_PRICE = pricing.meta.per_kit_price;

export type LaunchRefill = {
  name: string;
  slug: string;
  contents: string;
  price_with_reorder: number;
  price_alone: number | null;
  who: string;
  where: string;
};

/** Portal only. Not listed on the storefront. */
export const LAUNCH_REFILLS = pricing.refills as readonly LaunchRefill[];

function catalogIdForSku(slug: string): string | undefined {
  return FILE_SLUG_TO_ID[slug];
}

function formFromValue(
  raw: string,
): { form: LaunchForm; label: string; molecule: LaunchMolecule | null } | undefined {
  const parsed = FORM_VALUE[raw];
  if (!parsed) return undefined;
  return { form: parsed.form, label: parsed.label, molecule: parsed.molecule ?? null };
}

function visitMode(raw: string): LaunchVisit | string {
  if (raw === "Synchronous") return "video";
  if (raw === "Async") return "async";
  return raw;
}

function kindOf(raw: string): LaunchKind {
  if (raw === "bundle") return "bundle";
  if (raw === "treatment") return "treatment";
  return "product";
}

function panelAddOn(value: number | string | null): number | null {
  return typeof value === "number" ? value : null;
}

function normalize(raw: RawSku): LaunchSku[] {
  const id = catalogIdForSku(raw.slug);
  if (!id || raw.marketable !== "Yes") return [];
  const allow = PAGE_FORM_VALUES[id];
  if (allow && !allow.has(raw.form)) return [];
  const parsed = formFromValue(raw.form);
  if (!parsed) return [];
  const base: Omit<LaunchSku, "billing"> = {
    slug: id,
    kind: kindOf(raw.kind),
    marketable: raw.marketable,
    form: parsed.form,
    formValue: raw.form,
    formLabel: parsed.label,
    molecule: parsed.molecule,
    months: raw.months,
    price_one_time: raw.price_one_time,
    per_month: raw.per_month,
    discount_vs_1_month: raw.discount_vs_1_month,
    saves_vs_1_month: raw.saves_vs_1_month,
    saves_pct_vs_1_month: raw.saves_pct_vs_1_month ?? null,
    full_price_if_bought_monthly: raw.full_price_if_bought_monthly ?? null,
    monthly_installment: raw.monthly_installment,
    monthly_billing_total: raw.monthly_billing_total,
    baseline_kit_priced_in: raw.baseline_kit_priced_in > 0,
    retest_kits: raw.retest_kits,
    retests_billed_on_shipment: raw.retests_billed_on_shipment,
    total_spend_over_pack: raw.total_spend_over_pack,
    testing_add_on_1_month: panelAddOn(raw.testing_add_on_1_month),
    visit_mode: visitMode(raw.visit_mode),
    visit_requirement: raw.visit_requirement,
    labs_included: raw.labs_included === "Yes",
    lab_kit: raw.lab_kit,
    reassessment: raw.reassessment,
    tidl_includes: raw.tidl_includes ? [raw.tidl_includes] : [],
    ships_with: raw.ships_with ?? [],
    protocol_dose: raw.protocol_dose,
    coupon_tag: raw.coupon_tag,
    plan_label: raw.plan_label ?? null,
  };
  if (raw.billing === "One time or monthly") {
    return [
      { ...base, billing: "one_time" },
      { ...base, billing: "monthly" },
    ];
  }
  return [{ ...base, billing: "one_time" }];
}

const SKUS: LaunchSku[] = (pricing.skus as RawSku[]).flatMap(normalize);

export type LaunchPageForm = {
  value: string;
  form: LaunchForm;
  label: string;
};

export type LaunchPage = {
  id: string;
  kind: LaunchKind;
  formControl: boolean;
  defaultForm?: LaunchForm;
  forms: readonly LaunchPageForm[];
  components: readonly string[];
};

const PRODUCT_IDS = new Set([
  "semaglutide",
  "tirzepatide",
  "tesamorelin",
  "sermorelin",
  "methylene-blue",
  "b12",
  "lipo-c",
]);

function componentId(value: string): string | undefined {
  if (PRODUCT_IDS.has(value)) return value;
  const mapped = FILE_SLUG_TO_ID[value];
  return mapped && PRODUCT_IDS.has(mapped) ? mapped : undefined;
}

function componentList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const ids: string[] = [];
  for (const item of raw) {
    const value =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
          ? String(
              (item as { id?: unknown }).id ?? (item as { slug?: unknown }).slug ?? "",
            )
          : "";
    const id = componentId(value);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids.length > 0 ? ids : undefined;
}

function formsFromValues(values: readonly string[]): LaunchPageForm[] {
  const seen = new Map<string, LaunchPageForm>();
  for (const value of values) {
    const parsed = formFromValue(value);
    if (!parsed || seen.has(value)) continue;
    seen.set(value, { value, form: parsed.form, label: parsed.label });
  }
  return [...FORM_ORDER, "fixed" as const].flatMap((form) =>
    [...seen.values()].filter((row) => row.form === form),
  );
}

/**
 * A vial or fixed price with a pen lockup and no pen row still offers a pen.
 * That choice has to count, or the control stays hidden while the page opens on the pen.
 */
function offersSyntheticPen(id: string, forms: readonly LaunchPageForm[]): boolean {
  if (
    forms.some(
      (row) => row.form === "vial-pen" || row.form === "capsule" || row.form === "kit",
    )
  ) {
    return false;
  }
  if (!catalogHasPenLockup(id)) return false;
  return (
    forms.length === 0 || forms.some((row) => row.form === "vial" || row.form === "fixed")
  );
}

function pageFromSkus(id: string, rows: readonly LaunchSku[]): LaunchPage {
  let forms = formsFromValues(rows.map((row) => row.formValue));
  const hasPen = forms.some((row) => row.form === "vial-pen");
  const hasVial = forms.some((row) => row.form === "vial");
  if (hasPen && !hasVial) {
    forms = forms.map((row) =>
      row.form === "fixed" ? { ...row, form: "vial", label: "Vial" } : row,
    );
  }
  const kind = rows[0]?.kind ?? "product";
  return {
    id,
    kind,
    formControl: forms.length > 1 || offersSyntheticPen(id, forms),
    forms,
    components: kind === "bundle" ? (BUNDLE_COMPONENTS[id] ?? []) : [],
  };
}

type RawPage = {
  slug?: string;
  id?: string;
  form_control?: boolean;
  default_form?: string;
  forms?: readonly { value?: string; form?: string; label?: string }[];
  components?: unknown;
};

function pagesFromFile(fallback: Map<string, LaunchPage>): Map<string, LaunchPage> | undefined {
  const rawPages = (pricing as { pages?: unknown }).pages;
  if (!Array.isArray(rawPages)) return undefined;
  const next = new Map(fallback);
  for (const item of rawPages) {
    if (!item || typeof item !== "object") continue;
    const raw = item as RawPage;
    const key = raw.id ?? raw.slug;
    if (!key) continue;
    const id = FILE_SLUG_TO_ID[key] ?? key;
    const base = fallback.get(id);
    if (!base) continue;
    const values = (raw.forms ?? []).flatMap((form) => {
      if (typeof form.value === "string") return [form.value];
      if (typeof form.form === "string") return [form.form];
      return [];
    });
    const live = new Set(base.forms.map((form) => form.value));
    const forms = (values.length > 0 ? formsFromValues(values) : [...base.forms]).filter(
      (form) => live.has(form.value),
    );
    const labeled = forms.map((form) => {
      const given = raw.forms?.find(
        (row) => row.value === form.value || row.form === form.value,
      )?.label;
      return typeof given === "string" && given.length > 0 ? { ...form, label: given } : form;
    });
    const preferred = raw.default_form ? formFromValue(raw.default_form)?.form : undefined;
    const formControl =
      typeof raw.form_control === "boolean"
        ? raw.form_control
        : labeled.length > 1 || offersSyntheticPen(id, labeled);
    next.set(id, {
      id,
      kind: base.kind,
      formControl,
      defaultForm: preferred,
      forms: labeled,
      components:
        base.kind === "bundle"
          ? (componentList(raw.components) ?? base.components)
          : [],
    });
  }
  return next;
}

function buildPages(): LaunchPage[] {
  const byId = new Map<string, LaunchSku[]>();
  for (const sku of SKUS) {
    const rows = byId.get(sku.slug) ?? [];
    rows.push(sku);
    byId.set(sku.slug, rows);
  }
  const computed = new Map(
    [...byId.entries()].map(([id, rows]) => [id, pageFromSkus(id, rows)]),
  );
  return [...(pagesFromFile(computed) ?? computed).values()];
}

const PAGES = buildPages();
const PAGE_BY_ID = new Map(PAGES.map((page) => [page.id, page]));

export function launchPage(slug: string): LaunchPage | undefined {
  return PAGE_BY_ID.get(slug);
}

export function launchComponentIds(slug: string): readonly string[] {
  return launchPage(slug)?.components ?? [];
}

export function isMarketable(sku: LaunchSku): boolean {
  return sku.marketable === "Yes";
}

export function launchSkusFor(slug: string): LaunchSku[] {
  const values = launchPage(slug)?.forms.map((form) => form.value) ?? [];
  const allowed = values.length > 0 ? new Set(values) : undefined;
  return SKUS.filter(
    (sku) =>
      sku.slug === slug &&
      isMarketable(sku) &&
      (allowed == null || allowed.has(sku.formValue)),
  );
}

export function launchPageExists(slug: string): boolean {
  return launchSkusFor(slug).length > 0;
}

export function launchMoleculesFor(slug: string): LaunchMolecule[] {
  const seen = new Set<LaunchMolecule>();
  for (const sku of launchSkusFor(slug)) {
    if (sku.molecule) seen.add(sku.molecule);
  }
  return MOLECULE_ORDER.filter((molecule) => seen.has(molecule));
}

export function defaultLaunchMolecule(slug: string): LaunchMolecule | undefined {
  const molecules = launchMoleculesFor(slug);
  if (molecules.includes("tirzepatide")) return "tirzepatide";
  return molecules[0];
}

function moleculeMatches(sku: LaunchSku, molecule: LaunchMolecule | undefined): boolean {
  if (!sku.molecule) return true;
  const chosen = molecule ?? defaultLaunchMolecule(sku.slug);
  return sku.molecule === chosen;
}

/**
 * The price file has a vial or one fixed injectable price and no pen row.
 * The pen lockup exists, so the form offers a pre-loaded pen on that same price.
 */
function syntheticPen(slug: string): boolean {
  const page = launchPage(slug);
  if (!page || page.forms.some((row) => row.form === "vial-pen")) return false;
  return catalogHasPenLockup(slug);
}

export function launchFormsFor(slug: string, molecule?: LaunchMolecule): LaunchForm[] {
  const seen = new Set<LaunchForm>();
  let hasFixed = false;
  for (const sku of launchSkusFor(slug)) {
    if (!moleculeMatches(sku, molecule)) continue;
    if (sku.form === "fixed") hasFixed = true;
    else seen.add(sku.form);
  }
  if (
    syntheticPen(slug) &&
    (seen.has("vial") || hasFixed) &&
    !seen.has("capsule") &&
    !seen.has("kit")
  ) {
    seen.add("vial");
    seen.add("vial-pen");
  }
  if (hasFixed && seen.has("vial-pen") && !seen.has("vial")) {
    seen.add("vial");
  }
  return FORM_ORDER.filter((form) => seen.has(form));
}

export function defaultLaunchForm(slug: string, molecule?: LaunchMolecule): LaunchForm {
  const forms = launchFormsFor(slug, molecule);
  const preferred = launchPage(slug)?.defaultForm;
  if (forms.includes("vial")) return "vial";
  if (preferred && forms.includes(preferred)) return preferred;
  return forms[0] ?? "fixed";
}

function skuMatches(
  sku: LaunchSku,
  form: LaunchForm,
  molecule: LaunchMolecule | undefined,
): boolean {
  if (!moleculeMatches(sku, molecule)) return false;
  if (syntheticPen(sku.slug) && (form === "vial" || form === "vial-pen")) {
    return sku.form === "vial" || sku.form === "fixed";
  }
  const value = launchPage(sku.slug)?.forms.find((row) => row.form === form)?.value;
  return value ? sku.formValue === value : sku.form === form;
}

export function launchMonthsFor(
  slug: string,
  form: LaunchForm,
  molecule?: LaunchMolecule,
): number[] {
  const months = new Set<number>();
  for (const sku of launchSkusFor(slug)) {
    if (skuMatches(sku, form, molecule)) months.add(sku.months);
  }
  return [...months].sort((a, b) => a - b);
}

export function launchSku(
  slug: string,
  form: LaunchForm,
  months: number,
  billing: LaunchBilling,
  molecule?: LaunchMolecule,
): LaunchSku | undefined {
  return launchSkusFor(slug).find(
    (sku) =>
      skuMatches(sku, form, molecule) && sku.months === months && sku.billing === billing,
  );
}

export function planCardSku(
  slug: string,
  form: LaunchForm,
  months: number,
  molecule?: LaunchMolecule,
): LaunchSku | undefined {
  return launchSku(slug, form, months, "one_time", molecule);
}

export function formCopy(form: LaunchForm): { label: string; hint: string } {
  return FORM_COPY[form] ?? { label: "", hint: "" };
}

export function launchFormLabel(slug: string, form: LaunchForm): string {
  return launchPage(slug)?.forms.find((row) => row.form === form)?.label ?? formCopy(form).label;
}

export function moleculeCopy(molecule: LaunchMolecule): { label: string; hint: string } {
  if (molecule === "tirzepatide") return { label: "Tirzepatide", hint: "" };
  return { label: "Semaglutide", hint: "" };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function retestUnitPrice(sku: LaunchSku): number | null {
  if (sku.retest_kits <= 0) return null;
  return Math.round(sku.retests_billed_on_shipment / sku.retest_kits);
}

/** One month price on the form the purchase module opens. */
export function launchStartsAt(slug: string): number | undefined {
  const molecule = defaultLaunchMolecule(slug);
  const form = defaultLaunchForm(slug, molecule);
  const sku = launchSku(slug, form, 1, "one_time", molecule);
  return sku?.price_one_time ?? undefined;
}

/** One month price of the cheapest form the PDP offers. */
export function launchLowestStartsAt(slug: string): number | undefined {
  const molecules = launchMoleculesFor(slug);
  const ladder = molecules.length > 0 ? molecules : [undefined];
  let lowest: number | undefined;
  for (const molecule of ladder) {
    for (const form of launchFormsFor(slug, molecule)) {
      const amount = launchSku(slug, form, 1, "one_time", molecule)?.price_one_time;
      if (amount == null) continue;
      lowest = lowest == null ? amount : Math.min(lowest, amount);
    }
    if (launchFormsFor(slug, molecule).length === 0) {
      const amount = launchSku(slug, "fixed", 1, "one_time", molecule)?.price_one_time;
      if (amount == null) continue;
      lowest = lowest == null ? amount : Math.min(lowest, amount);
    }
  }
  return lowest ?? launchStartsAt(slug);
}

export function launchStartsAtLabel(slug: string): string | undefined {
  const amount = launchStartsAt(slug);
  return amount == null ? undefined : formatUsd(amount);
}

export function catalogPriceLine(id: string): string | undefined {
  if (id === "pain-relief") return `Starting at ${painReliefStartsAt()}`;
  const amount = launchStartsAtLabel(id);
  return amount ? `Starting at ${amount}` : undefined;
}

/**
 * Dollar save on a plan tile versus buying the same term at the 1 month plan price.
 * Uses the monthly rate printed on the tile when that tile shows one.
 * A longer plan that prices in a baseline panel is compared with that panel removed,
 * so both sides carry the same blood test count as the 1 month plan, which includes none.
 */
export function planSaveLabel(
  oneMonthPrice: number | null | undefined,
  months: number,
  prepaid: number | null,
  includedPanel = 0,
): string | null {
  if (oneMonthPrice == null || prepaid == null || months <= 1) return null;
  const saves = Math.round(oneMonthPrice * months - (prepaid - includedPanel));
  if (saves <= 0) return null;
  return `Save ${formatUsd(saves)}`;
}

export type PurchaseAddOns = {
  panel?: boolean;
  b12?: boolean;
  lipoC?: boolean;
  methylene?: boolean;
  form?: LaunchForm;
  molecule?: LaunchMolecule;
};

export type OrderAddOn = {
  id: "b12" | "lipo-c" | "methylene-blue";
  label: string;
  monthly: number;
};

const ADD_B12: OrderAddOn = { id: "b12", label: "B12", monthly: 29 };
const ADD_LIPO: OrderAddOn = { id: "lipo-c", label: "Lipo C", monthly: 49 };
const ADD_METHYLENE: OrderAddOn = {
  id: "methylene-blue",
  label: "Methylene blue",
  monthly: 119,
};

type AddOnRule = {
  b12?: "any" | "pen";
  lipo?: "any" | "pen";
  methylene?: "any" | "pen";
};

/** Launch List column H. An add on already inside the selected form is omitted. */
const ADD_ON_RULES: Readonly<Record<string, AddOnRule>> = {
  tirzepatide: { lipo: "any", b12: "pen" },
  semaglutide: { lipo: "any", b12: "pen" },
  b12: { lipo: "any" },
  sermorelin: { b12: "any", methylene: "any" },
  tesamorelin: { b12: "any", lipo: "any" },
  "methylene-blue": { b12: "any" },
  "appetite-balance": { lipo: "any", b12: "pen" },
  "lean-cut": { lipo: "any", b12: "pen" },
  "complete-stack": { lipo: "any", b12: "pen" },
  "body-composition": { b12: "any", lipo: "any" },
  focus: { b12: "any" },
  "repair-mobility": { b12: "any" },
  "rest-rebuild": { b12: "any" },
  longevity: { b12: "any" },
};

export function orderAddOns(slug: string, form?: LaunchForm): OrderAddOn[] {
  const rule = ADD_ON_RULES[slug];
  if (!rule) return [];
  const items: OrderAddOn[] = [];
  const allow = (when: "any" | "pen" | undefined) =>
    when === "any" || (when === "pen" && form === "vial-pen");
  if (allow(rule.b12)) items.push(ADD_B12);
  if (allow(rule.lipo)) items.push(ADD_LIPO);
  if (allow(rule.methylene)) items.push(ADD_METHYLENE);
  return items;
}

export function purchaseHref(
  base: string,
  sku: LaunchSku,
  addOns: boolean | PurchaseAddOns,
): string {
  const extras = typeof addOns === "boolean" ? { panel: addOns } : addOns;
  const url = new URL(base, "https://tidl.local");
  url.searchParams.set("form", extras.form ?? sku.form);
  url.searchParams.set("months", String(sku.months));
  url.searchParams.set("billing", sku.billing);
  if (sku.molecule) url.searchParams.set("molecule", extras.molecule ?? sku.molecule);
  if (extras.panel) url.searchParams.set("panel", "1");
  if (extras.b12) url.searchParams.set("b12", "1");
  if (extras.lipoC) url.searchParams.set("lipo-c", "1");
  if (extras.methylene) url.searchParams.set("methylene-blue", "1");
  return `${url.pathname}${url.search}`;
}

export const MONTHLY_CANCEL_COPY =
  "Monthly billing is a recurring charge for the term you selected. Cancel in the portal or by writing care before the next monthly charge and you are not charged for the next period. There is no cancellation fee. The current period is not refunded once the pharmacy has released the fill.";

export const PAYMENT_AFTER_REVIEW =
  "Payment is collected after a clinician reviews your intake and, if prescribed, the pharmacy is ready to fill.";
