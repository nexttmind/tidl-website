import type { CSSProperties } from "react";
import { themeField } from "@/content/brand/peptide-identity";
import { footerCopy } from "@/content/fixtures/footer";
import styles from "./TickerBar.module.css";

const TICKER_ITEMS = [
  "Board certified physicians",
  "Made in the USA",
  "Personalized protocols",
  "Physician guided therapy",
  "US pharmacies",
  "Clinical review before any prescription",
] as const;

/** Enough copies that one segment shorter than the viewport never leaves a gap. */
const SEGMENT_COPIES = 6;

function TickerSegment({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className={styles.segment} aria-hidden={ariaHidden || undefined}>
      {TICKER_ITEMS.map((item) => (
        <span key={item} className={styles.item}>
          <span className={styles.sep} aria-hidden>
            ✦
          </span>
          <span className={styles.text}>{item}</span>
        </span>
      ))}
    </div>
  );
}

type PromoTone = "sky" | "sand" | "parents" | "executive";

type TickerBarProps = {
  /**
   * Static value prop (hims-style promo). Landing uses this.
   * Marquee trust signals remain the default for other surfaces.
   */
  variant?: "marquee" | "promo";
  /** Promo copy when variant is promo. */
  promo?: string;
  /** Promo wash. Sky is the landing bar. Sand is warm paper. Parents and executive use theme fields. */
  tone?: PromoTone;
  /** Break out of layout-frame. Off when already inside a bleed parent. */
  bleed?: boolean;
};

/** Pattern/Ticker Bar — promo strip or continuous trust marquee */
export function TickerBar({
  variant = "marquee",
  promo = "$100 off your first order",
  tone = "sky",
  bleed = true,
}: TickerBarProps) {
  const field = tone === "parents" ? themeField("parents") : null;
  const rootClass = [
    bleed ? "layout-bleed" : "",
    styles.root,
    variant === "promo" ? styles.promo : "",
    variant === "promo" && tone === "sand" ? styles.promoSand : "",
    variant === "promo" && tone === "parents" ? styles.promoParents : "",
    variant === "promo" && tone === "executive" ? styles.promoExecutive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const promoStyle = field
    ? ({
        backgroundColor: field.atmosphere.wash,
        backgroundImage: field.atmosphere.css,
      } as CSSProperties)
    : undefined;

  if (variant === "promo") {
    const brand = footerCopy.tagline;
    return (
      <div
        className={rootClass}
        style={promoStyle}
        role="region"
        aria-label={`${brand}. ${promo}`}
      >
        <div className={styles.promoViewport} aria-hidden="true">
          <div className={styles.promoTrack}>
            <p className={styles.promoText}>{promo}</p>
            <p className={styles.promoText}>{brand}</p>
          </div>
        </div>
      </div>
    );
  }

  const trackStyle = {
    "--ticker-copies": SEGMENT_COPIES,
    "--ticker-duration": `${SEGMENT_COPIES * 20}s`,
  } as CSSProperties;

  return (
    <div
      className={[bleed ? "layout-bleed" : "", styles.root].filter(Boolean).join(" ")}
      role="region"
      aria-label="Trust signals"
    >
      <div className={styles.track} style={trackStyle}>
        {Array.from({ length: SEGMENT_COPIES }, (_, i) => (
          <TickerSegment key={i} ariaHidden={i > 0} />
        ))}
      </div>
    </div>
  );
}
