import { formHeroSrc, shopCatalogItem } from "@/components/home/shop-catalog";
import { CATALOG_VIAL_REV } from "@/content/fixtures/catalog";
import {
  formatUsd,
  launchComponentIds,
  launchFormsFor,
  retestUnitPrice,
  type LaunchForm,
  type LaunchSku,
} from "@/content/pdp/launch-pricing";

const BLOOD_KIT_SRC = `/landing/shop/catalog/addon-frames/blood-panel.png?v=${CATALOG_VIAL_REV}`;

export type IncludedRow = {
  id: string;
  title: string;
  detail: string;
  thumb: string;
  /** Headshot fills the frame. Product stills stay contained. */
  cover?: boolean;
  /** Full product in frame. Vial, pen lockup, and oral tablet are not cropped. */
  contain?: boolean;
};

export type WhatsIncluded = {
  rows: IncludedRow[];
  shipping: string;
};

const COLD_SHIPPING = "Ships in cold storage next day delivery via FedEx.";
const AMBIENT_SHIPPING = "Ships next day delivery via FedEx.";
const SUPPLY_DETAIL = "Included with every shipment.";

/** Same ambient set as the launch price builder. These do not ship cold. */
const AMBIENT_SHIP = new Set([
  "sexual-health",
  "hair-skin-nails",
  "focus",
  "methylene-blue",
]);

type SupplyKey = "syringes" | "bacteriostatic-water" | "alcohol-wipes" | "pen-needles";

const SUPPLY_BY_LABEL: Record<string, SupplyKey> = {
  Syringes: "syringes",
  "Bacteriostatic water": "bacteriostatic-water",
  "Pen needles": "pen-needles",
  "Alcohol wipes": "alcohol-wipes",
};

function supplySrc(key: SupplyKey): string {
  return `/landing/shop/catalog/included/${key}.png`;
}

export function whatsIncluded(
  catalogId: string,
  form: LaunchForm,
  sku: LaunchSku,
): WhatsIncluded {
  if (form === "kit") {
    return {
      rows: [
        {
          id: "panel-kit",
          title: "Panel kit",
          detail: "One panel kit ships now.",
          thumb: formHeroSrc(catalogId, "kit") || BLOOD_KIT_SRC,
          contain: true,
        },
        {
          id: "provider",
          title: "Provider Review",
          detail: "A provider message reviewing your results.",
          thumb: "/landing/providers/jensen.png",
          cover: true,
        },
      ],
      shipping: AMBIENT_SHIPPING,
    };
  }

  const meds = medications(catalogId, form, sku);
  const forms = new Set(meds.map((med) => med.form));
  const rows: IncludedRow[] = meds.map((med) => ({
    id: `med-${med.id}`,
    title: med.title,
    detail: medicationDetail(catalogId, med.id, med.form, sku.months),
    thumb: med.thumb,
    contain: true,
  }));

  for (const key of suppliesFor(sku, form)) {
    rows.push({
      id: `supply-${key}`,
      title: SUPPLY_TITLE[key],
      detail: SUPPLY_DETAIL,
      thumb: supplySrc(key),
    });
  }

  if (sku.labs_included) {
    const unit = retestUnitPrice(sku);
    rows.push({
      id: "blood-kit",
      title: "Blood test kit",
      detail:
        unit == null
          ? "Baseline panel included."
          : `Baseline panel included. Retests ship before each 90 day check in, ${formatUsd(unit)} each when they ship.`,
      thumb: BLOOD_KIT_SRC,
    });
  }

  rows.push({
    id: "provider",
    title: "Provider Review",
    detail: providerDetail(sku),
    thumb: "/landing/providers/jensen.png",
    cover: true,
  });

  return { rows, shipping: shippingNote(catalogId, forms) };
}

function medicationDetail(
  catalogId: string,
  medId: string,
  form: LaunchForm,
  months: number,
): string {
  const supply = `${months} month supply`;
  if (catalogId === "testosterone" && medId === "testosterone" && form === "vial-pen") {
    return `${supply}. Pen and multi dose vial.`;
  }
  if (form === "vial") return `${supply}. Multi dose vial.`;
  if (form === "vial-pen") return `${supply}. Pre dosed, no vials or powders.`;
  if (form === "capsule") return `${supply}. Oral tablet.`;
  return supply;
}

function shippingNote(catalogId: string, forms: Set<LaunchForm>): string {
  if (AMBIENT_SHIP.has(catalogId)) return AMBIENT_SHIPPING;
  const cold = [...forms].some((form) => form === "vial" || form === "vial-pen");
  return cold ? COLD_SHIPPING : AMBIENT_SHIPPING;
}

function medications(
  catalogId: string,
  form: LaunchForm,
  sku: LaunchSku,
): { id: string; title: string; form: LaunchForm; thumb: string }[] {
  if (sku.kind === "bundle") {
    return launchComponentIds(catalogId).flatMap((id) => {
      const named = shopCatalogItem(id);
      if (!named) return [];
      const medForm = componentForm(id, form);
      return [
        {
          id,
          title: named.label,
          form: medForm,
          thumb: formHeroSrc(id, medForm) || named.vialSrc || named.pillSrc || "",
        },
      ];
    });
  }
  return [pageMedication(catalogId, form)];
}

function pageMedication(catalogId: string, form: LaunchForm) {
  const chosen = componentForm(catalogId, form);
  return {
    id: catalogId,
    title: shopCatalogItem(catalogId)?.label ?? catalogId,
    form: chosen,
    thumb: thumbFor(catalogId, catalogId, chosen),
  };
}

/** Capsule and vial-only products stay on their form. The selected form wins when the product offers it. */
function componentForm(id: string, selected: LaunchForm): LaunchForm {
  const forms = launchFormsFor(id);
  if (selected === "vial-pen" && forms.includes("vial-pen")) return "vial-pen";
  if (forms.includes("capsule") && !forms.includes("vial") && !forms.includes("vial-pen")) {
    return "capsule";
  }
  if (selected === "capsule" && forms.includes("capsule")) return "capsule";
  if (selected === "kit" && forms.includes("kit")) return "kit";
  if (forms.includes("vial")) return "vial";
  return forms[0] ?? selected;
}

function thumbFor(pageId: string, artId: string, form: LaunchForm): string {
  return formHeroSrc(artId, form) ?? formHeroSrc(pageId, form) ?? "";
}

const SUPPLY_TITLE: Record<SupplyKey, string> = {
  syringes: "Syringes",
  "bacteriostatic-water": "Bacteriostatic water",
  "pen-needles": "Pen needles",
  "alcohol-wipes": "Alcohol wipes",
};

function suppliesFor(sku: LaunchSku, form: LaunchForm): SupplyKey[] {
  let labels = [...sku.ships_with];
  if (form === "vial-pen" && sku.form !== "vial-pen") {
    labels = labels.filter(
      (label) => label !== "Syringes" && label !== "Bacteriostatic water",
    );
    if (!labels.includes("Pen needles")) labels.unshift("Pen needles");
    if (!labels.includes("Alcohol wipes")) labels.push("Alcohol wipes");
  }
  const keys: SupplyKey[] = [];
  for (const label of labels) {
    const key = SUPPLY_BY_LABEL[label];
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

function providerDetail(sku: LaunchSku): string {
  if (sku.visit_mode === "async") {
    return "A licensed provider reviews your intake. No appointment needed.";
  }
  if (sku.visit_mode === "video") {
    return "A short video visit before your first shipment and before each quarterly shipment.";
  }
  return sku.visit_requirement;
}

