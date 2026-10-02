import type { ReactElement } from "react";
import type { ShopKind } from "./shop-catalog";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

/** Vial plus. Two crossing bars with round caps. */
function IconProduct() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M9.8 5.4c0-1.2 1-2.2 2.2-2.2s2.2 1 2.2 2.2v13.2c0 1.2-1 2.2-2.2 2.2s-2.2-1-2.2-2.2V5.4ZM5.4 9.8c-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2h13.2c1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2H5.4Z"
      />
    </svg>
  );
}

/** Two offset faces. A set, not a single SKU. */
function IconBundle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.6" y="6.4" width="11.2" height="13.2" rx="2" {...stroke} />
      <rect x="9.2" y="4.4" width="11.2" height="13.2" rx="2" {...stroke} />
    </svg>
  );
}

/** Vial plus. Outlined TIDL mark with inner fillets. */
function IconTreatment() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8.9 3.8H15.1V6.8A2.1 2.1 0 0 1 17.2 8.9H20.2V15.1H17.2A2.1 2.1 0 0 1 15.1 17.2V20.2H8.9V17.2A2.1 2.1 0 0 1 6.8 15.1H3.8V8.9H6.8A2.1 2.1 0 0 1 8.9 6.8V3.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS: Record<ShopKind, () => ReactElement> = {
  product: IconProduct,
  bundle: IconBundle,
  treatment: IconTreatment,
};

export function CatalogKindIcon({
  kind,
  className,
}: {
  kind: ShopKind;
  className?: string;
}) {
  const Icon = ICONS[kind];
  return (
    <span className={className} aria-hidden>
      <Icon />
    </span>
  );
}
