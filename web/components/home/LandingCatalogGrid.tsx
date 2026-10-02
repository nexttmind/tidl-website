"use client";

import Link from "next/link";
import { MarketingImage } from "@/components/media/MarketingImage";
import { catalogPlateStyle } from "@/lib/media/catalog-plate-style";
import { compoundPlateId } from "@/content/fixtures/ask-tidl";
import styles from "./LandingCatalogGrid.module.css";

export type CatalogGridItem = {
  id: string;
  label: string;
  accent?: string;
  subtitle?: string;
  href: string;
  mediaSrc: string;
  tone?: "mist" | "sand" | "sky" | "ice" | "guide" | "cell" | "lab";
};

export type CatalogGridFeature = {
  id: string;
  title: string;
  titleAccent: string;
  href: string;
  mediaSrc: string;
  tone?: "night" | "warm";
  mediaFit?: "cover" | "contain";
};

type LandingCatalogGridProps = {
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  /** Stack every row. Used in the mobile menu overlay. */
  stacked?: boolean;
};

/**
 * Product notecards, then the two large entry cards.
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
      <ul className={styles.items}>
        {items.map((item) => {
          const plateId = compoundPlateId(item.id);
          return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={[
                styles.item,
                item.subtitle ? styles.itemNote : "",
                item.tone ? styles[`item_${item.tone}`] : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-plate={plateId}
              style={plateId ? catalogPlateStyle(plateId) : undefined}
            >
              {plateId ? (
                <span className={styles.itemGrain} aria-hidden />
              ) : null}
              <span
                className={styles.itemMedia}
                aria-hidden
                data-pill={
                  item.mediaSrc.includes("/pills/") ? "true" : undefined
                }
                data-device={
                  item.mediaSrc.includes("/labs/") ? "true" : undefined
                }
                data-vial={
                  item.mediaSrc.includes("/vials/") ? "true" : undefined
                }
              >
                <MarketingImage
                  src={item.mediaSrc}
                  alt=""
                  sizes="(width < 721px) 28vw, 120px"
                  loading="lazy"
                />
              </span>
              <span className={styles.itemCopy}>
                <span className={styles.itemLabel}>
                  {item.label}
                  {item.accent ? (
                    <>
                      {" "}
                      <em>{item.accent}</em>
                    </>
                  ) : null}
                </span>
                {item.subtitle ? (
                  <span className={styles.itemSubtitle}>{item.subtitle}</span>
                ) : null}
              </span>
            </Link>
          </li>
          );
        })}
      </ul>

      <div className={styles.features}>
        {features.map((feature) => {
          const className = [
            styles.feature,
            feature.tone === "warm" ? styles.featureWarm : styles.featureNight,
          ].join(" ");
          const copy = (
            <>
            <span
              className={styles.featureMedia}
              data-fit={feature.mediaFit ?? "cover"}
              aria-hidden
            >
              <MarketingImage
                src={feature.mediaSrc}
                alt=""
                sizes="(width < 721px) 78vw, (width < 1025px) 50vw, 520px"
                loading="eager"
              />
            </span>
            <span className={styles.featureCopy}>
              <span className={styles.featureTitle}>
                <span>{feature.title}</span>
                <em>{feature.titleAccent}</em>
              </span>
            </span>
            </>
          );
          const isHash = feature.href.startsWith("#");
          return isHash ? (
            <a key={feature.id} href={feature.href} className={className}>
              {copy}
            </a>
          ) : (
          <Link
            key={feature.id}
            href={feature.href}
            className={className}
          >
            {copy}
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
