import type { ReactNode } from "react";
import styles from "./TrustBadge.module.css";

export type TrustIconId = "pharmacy" | "supply" | "pricing";

type TrustBadgeProps = {
  text: string;
  icon?: TrustIconId;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function IconPharmacy() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      {/* Clinic / pharmacy building */}
      <path d="M2.5 14V5.5L8 2l5.5 3.5V14" {...stroke} />
      <path d="M6 14V9h4v5" {...stroke} />
      <path d="M8 5.5v1.5M7.25 6.25h1.5" {...stroke} />
    </svg>
  );
}

function IconSupply() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      {/* Multi-month supply: stacked packs */}
      <rect x="3" y="8.5" width="10" height="4.5" rx="1" {...stroke} />
      <path d="M4.5 8.5V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1.5" {...stroke} />
      <path d="M5.5 6V4.75A1 1 0 0 1 6.5 3.75h3A1 1 0 0 1 10.5 4.75V6" {...stroke} />
    </svg>
  );
}

function IconPricing() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      {/* Price tag */}
      <path d="M8.2 2.5h4.3a1 1 0 0 1 1 1v4.3L7.8 13.5a1 1 0 0 1-1.4 0L2.5 9.6a1 1 0 0 1 0-1.4L8.2 2.5z" {...stroke} />
      <circle cx="11" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS: Record<TrustIconId, ReactNode> = {
  pharmacy: <IconPharmacy />,
  supply: <IconSupply />,
  pricing: <IconPricing />,
};

export function TrustBadge({ text, icon = "pharmacy" }: TrustBadgeProps) {
  return (
    <div className={styles.root}>
      <span className={styles.icon} aria-hidden>
        {ICONS[icon]}
      </span>
      <span className={styles.text}>{text}</span>
    </div>
  );
}
