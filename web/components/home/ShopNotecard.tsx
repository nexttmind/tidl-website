import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./ShopNotecard.module.css";

export type ShopNotecardProps = {
  name: string;
  code: string;
  price: string;
  vialSrc: string;
  href: string;
  badge?: string;
  ctaLabel?: string;
};

export function ShopNotecard({
  name,
  code,
  price,
  vialSrc,
  href,
  badge,
  ctaLabel = "Shop Now",
}: ShopNotecardProps) {
  return (
    <a className={styles.root} href={href}>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
      <span className={styles.code}>{code}</span>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.media}>
        <MarketingImage src={vialSrc} alt="" width={720} height={720} sizes="220px" />
      </div>
      <span className={styles.cta}>
        {ctaLabel}
        <span className={styles.ctaArrow} aria-hidden>
          →
        </span>
      </span>
      <p className={styles.price}>{price}</p>
    </a>
  );
}
