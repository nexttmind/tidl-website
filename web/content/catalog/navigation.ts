import pricing from "@/content/pdp/tidl-launch-pricing.json";

export type CatalogNavKind = "product" | "bundle" | "treatment";

export type CatalogNavTile = {
  id: string;
  name: string;
  kind: CatalogNavKind;
  group: string;
  href: string;
};

type TreatmentRow = {
  treatment: string;
  path: string;
};

type NavGroup = {
  group: string;
  items: readonly string[];
};

type NavRow = {
  groups: readonly NavGroup[];
};

const NAME_TO_ID: Readonly<Record<string, string>> = {
  Tirzepatide: "tirzepatide",
  Semaglutide: "semaglutide",
  B12: "b12",
  "Lipo C": "lipo-c",
  "Methylene Blue": "methylene-blue",
  Sermorelin: "sermorelin",
  Tesamorelin: "tesamorelin",
  Testosterone: "testosterone",
  "MD Reviewed Blood Test": "at-home-lab",
  "Head Start": "head-start",
  "Rest & Rise": "rest-rise",
  "Energy Lift": "energy-lift",
  "Appetite Balance": "appetite-balance",
  "Body Composition": "body-composition",
  Focus: "focus",
  "Weight Loss": "weight-loss",
  "Women's Total Balance": "womens-total-balance",
  "Lean & Cut": "lean-cut",
  "Complete Stack": "complete-stack",
  "Men's Peak Performance": "mens-peak-performance",
  "Sexual Health": "sexual-health",
  "Repair & Mobility": "repair-mobility",
  "Rest & Rebuild": "rest-rebuild",
  Longevity: "longevity",
  "Stress & Mood": "stress-mood",
  "Hair, Skin & Nails": "hair-skin-nails",
};

const GROUP_KIND: Readonly<Record<string, CatalogNavKind>> = {
  Products: "product",
  "Product Bundles": "bundle",
  Treatments: "treatment",
};

function normalizePath(path: string): string {
  const trimmed = path.replace(/\s*\(new\)\s*$/i, "").trim();
  if (trimmed.startsWith("http")) {
    return new URL(trimmed).pathname;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const TREATMENT_PATH = new Map<string, string>(
  (pricing.treatments as TreatmentRow[]).map((row) => [
    row.treatment,
    normalizePath(row.path),
  ]),
);

function hrefFor(id: string, name: string, kind: CatalogNavKind): string {
  if (id === "at-home-lab") return "/labs";
  const fromTreatment = TREATMENT_PATH.get(name);
  if (fromTreatment && kind !== "product") return fromTreatment;
  if (kind === "product") return `/products/${id}`;
  if (kind === "bundle") return `/bundles/${id}`;
  return `/treatments/${id}`;
}

const TILES: readonly CatalogNavTile[] = (pricing.navigation.rows as NavRow[]).flatMap(
  (row) =>
    row.groups.flatMap((group) => {
      const kind = GROUP_KIND[group.group];
      if (!kind) return [];
      return group.items.flatMap((name) => {
        const id = NAME_TO_ID[name];
        if (!id) return [];
        return [
          {
            id,
            name,
            kind,
            group: group.group,
            href: hrefFor(id, name, kind),
          },
        ];
      });
    }),
);

const TILE_BY_ID = new Map(TILES.map((tile) => [tile.id, tile]));

export function catalogNavTiles(): readonly CatalogNavTile[] {
  return TILES;
}

export function catalogNavTile(id: string): CatalogNavTile | undefined {
  return TILE_BY_ID.get(id);
}

export function navHrefFor(id: string): string | undefined {
  return TILE_BY_ID.get(id)?.href;
}

export function navKindFor(id: string): CatalogNavKind | undefined {
  return TILE_BY_ID.get(id)?.kind;
}

export function navNameFor(id: string): string | undefined {
  return TILE_BY_ID.get(id)?.name;
}

export const CATALOG_REDIRECTS: Readonly<Record<string, string>> = pricing.meta
  .redirects as Readonly<Record<string, string>>;
