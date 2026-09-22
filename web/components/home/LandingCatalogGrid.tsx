"use client";

import Link from "next/link";
import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./LandingCatalogGrid.module.css";

export type CatalogGridItem = {
  id: string;
  label: string;
  accent?: string;
  href: string;
  mediaSrc: string;
  tone?: "mist" | "sand" | "sky" | "ice" | "guide";
};

export type CatalogGridFeature = {
  id: string;
  title: string;
  titleAccent: string;
  href: string;
  cta: string;
  mediaSrc: string;
  tone?: "night" | "warm";
};

type LandingCatalogGridProps = {
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  /** Stack every row. Used in the mobile menu overlay. */
  stacked?: boolean;
};

function IconChevron() {
  return (
    <svg
      className={styles.chevron}
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <path
        d="M6.75 4.5 11.25 9l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Hims-style catalog: two large entry cards, then four launch performers in a row.
 */
export function LandingCatalogGrid({
  features,
  items,
  stacked = false,
}: LandingCatalogGridProps) {
  return (
    <nav
      className={[styles.root, stacked ? styles.stacked : ""].filter(Boolean).join(" ")}
      aria-label="Browse catalog"
    >
      <div className={styles.features}>
        {features.map((feature) => (
          <Link
            key={feature.id}
            href={feature.href}
            className={[
              styles.feature,
              feature.tone === "warm" ? styles.featureWarm : styles.featureNight,
            ].join(" ")}
          >
            <span className={styles.featureCopy}>
              <span className={styles.featureTitle}>
                <span>{feature.title}</span>
                <em>{feature.titleAccent}</em>
              </span>
              <span className={styles.featureCta}>
                {feature.cta}
                <IconChevron />
              </span>
            </span>
            <span className={styles.featureMedia} aria-hidden>
              <MarketingImage
                src={feature.mediaSrc}
                alt=""
                sizes="(width < 721px) 100vw, (width < 1025px) 50vw, 520px"
                loading="eager"
              />
            </span>
          </Link>
        ))}
      </div>

      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={[
                styles.item,
                item.tone ? styles[`item_${item.tone}`] : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.itemLabel}>
                {item.label}
                {item.accent ? (
                  <>
                    {" "}
                    <em>{item.accent}</em>
                  </>
                ) : null}
              </span>
              <span
                className={styles.itemMedia}
                aria-hidden
                data-pill={
                  item.mediaSrc.includes("/brand/pills/") ? "true" : undefined
                }
              >
                <MarketingImage
                  src={item.mediaSrc}
                  alt=""
                  sizes="(width < 721px) 28vw, 120px"
                  loading="lazy"
                />
              </span>
              <IconChevron />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
