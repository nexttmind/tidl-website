import type { ThemeId } from "@/content/brand/peptide-identity";
import { navHrefFor, navKindFor, type CatalogNavKind } from "@/content/catalog/navigation";

export type CatalogKind = CatalogNavKind;

export type CatalogRoute = {
  id: string;
  kind: CatalogKind;
  themeId: ThemeId;
  entrySlug: string;
  /** /labs is the shared PDP at a stable URL. /pain-relief stays its own template. */
  href?: string;
};

const ROUTES: readonly CatalogRoute[] = [
  { id: "tirzepatide", kind: "product", themeId: "transformation", entrySlug: "transformation" },
  { id: "semaglutide", kind: "product", themeId: "weight-loss", entrySlug: "weight-loss" },
  { id: "b12", kind: "product", themeId: "legacy", entrySlug: "healthspan" },
  { id: "lipo-c", kind: "product", themeId: "weight-loss", entrySlug: "weight-loss" },
  { id: "methylene-blue", kind: "product", themeId: "creative", entrySlug: "creators" },
  { id: "sermorelin", kind: "product", themeId: "legacy", entrySlug: "healthspan" },
  { id: "tesamorelin", kind: "product", themeId: "legacy", entrySlug: "healthspan" },
  { id: "testosterone", kind: "product", themeId: "mens-health", entrySlug: "testosterone" },
  {
    id: "at-home-lab",
    kind: "product",
    themeId: "legacy",
    entrySlug: "healthspan",
    href: "/labs",
  },
  { id: "head-start", kind: "bundle", themeId: "weight-loss", entrySlug: "weight-loss" },
  { id: "rest-rise", kind: "bundle", themeId: "legacy", entrySlug: "healthspan" },
  { id: "energy-lift", kind: "bundle", themeId: "mens-health", entrySlug: "healthspan" },
  { id: "appetite-balance", kind: "bundle", themeId: "transformation", entrySlug: "transformation" },
  { id: "body-composition", kind: "bundle", themeId: "transformation", entrySlug: "transformation" },
  { id: "focus", kind: "bundle", themeId: "creative", entrySlug: "creators" },
  { id: "complete-stack", kind: "treatment", themeId: "executive", entrySlug: "executives" },
  { id: "lean-cut", kind: "treatment", themeId: "weight-loss", entrySlug: "weight-loss" },
  { id: "sexual-health", kind: "treatment", themeId: "sexual-health", entrySlug: "sexual-health" },
  { id: "weight-loss", kind: "treatment", themeId: "weight-loss", entrySlug: "weight-loss" },
  {
    id: "mens-peak-performance",
    kind: "treatment",
    themeId: "mens-health",
    entrySlug: "testosterone",
  },
  {
    id: "repair-mobility",
    kind: "treatment",
    themeId: "recovery-performance",
    entrySlug: "recovery-performance",
  },
  { id: "rest-rebuild", kind: "treatment", themeId: "athlete", entrySlug: "athletes" },
  { id: "longevity", kind: "treatment", themeId: "legacy", entrySlug: "healthspan" },
  { id: "stress-mood", kind: "treatment", themeId: "parents", entrySlug: "parents" },
  {
    id: "womens-total-balance",
    kind: "treatment",
    themeId: "womens-balance",
    entrySlug: "womens-balance",
  },
  { id: "hair-skin-nails", kind: "treatment", themeId: "skin-hair", entrySlug: "skin-hair" },
  {
    id: "pain-relief",
    kind: "treatment",
    themeId: "recovery-performance",
    entrySlug: "recovery-performance",
    href: "/pain-relief",
  },
];

export const CATALOG_ROUTES: Readonly<Record<string, CatalogRoute>> = Object.fromEntries(
  ROUTES.map((row) => [row.id, row]),
);

/** Old merchandising slugs that still need to resolve. */
export const CATALOG_ALIASES: Readonly<Record<string, string>> = {
  "mens-health": "mens-peak-performance",
  "womens-balance": "womens-total-balance",
  "skin-hair": "hair-skin-nails",
  "skin-and-hair": "hair-skin-nails",
  "recovery-performance": "repair-mobility",
  "recovery-and-performance": "repair-mobility",
  transformation: "appetite-balance",
  athletes: "rest-rebuild",
  athlete: "rest-rebuild",
  travelers: "stress-mood",
  traveler: "stress-mood",
  "fast-start": "head-start",
  "steady-start": "head-start",
  "rest-and-rise": "rest-rise",
  "lean-and-cut": "lean-cut",
  healthspan: "longevity",
  legacy: "longevity",
  "creators-and-builders": "focus",
  creators: "focus",
  creative: "focus",
  parents: "stress-mood",
  "ceos-and-executives": "mens-peak-performance",
  executive: "mens-peak-performance",
};

export function catalogIdFor(id: string): string {
  return CATALOG_ALIASES[id] ?? id;
}

export function catalogRoute(id: string): CatalogRoute | undefined {
  const route = CATALOG_ROUTES[catalogIdFor(id)];
  if (!route) return undefined;
  return {
    ...route,
    kind: navKindFor(route.id) ?? route.kind,
    href: navHrefFor(route.id) ?? route.href,
  };
}

export function catalogHref(id: string): string {
  const route = catalogRoute(id);
  if (!route) return "/categories";
  if (route.href) return route.href;
  const base =
    route.kind === "product"
      ? "/products"
      : route.kind === "bundle"
        ? "/bundles"
        : "/treatments";
  return `${base}/${route.id}`;
}

/** URL slugs whose catalog href lives under a prefix, such as /bundles. */
export function catalogIdsUnder(prefix: string): string[] {
  return ROUTES.flatMap((row) => {
    const href = catalogHref(row.id);
    if (!href.startsWith(`${prefix}/`)) return [];
    return [href.slice(prefix.length + 1)];
  });
}

export function catalogKindHref(kind: CatalogKind): string {
  if (kind === "product") return "/products";
  if (kind === "bundle") return "/bundles";
  return "/treatments";
}

export const CATALOG_INDEX_HREF = {
  products: "/products",
  bundles: "/bundles",
  treatments: "/treatments",
  all: "/categories",
} as const;
