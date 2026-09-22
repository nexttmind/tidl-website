import { MediaSlot } from "@/components/media/MediaSlot";
import styles from "./BenefitsSection.module.css";

type BenefitMedia = {
  id: string;
  label?: string;
  swatch?: string;
  note?: string;
  src?: string;
  videoSrc?: string;
  poster?: string;
};

type BenefitItem = {
  title: string;
  description: string;
  /** Legacy slot id. */
  mediaSlot?: string;
  media?: BenefitMedia;
};

type BenefitsSectionProps = {
  headline: string;
  subtitle: string;
  items: readonly BenefitItem[];
  lift?: boolean;
};

/**
 * Full-bleed sticky-split: title stack pins left, benefit rows live only
 * in the right column (same 50/50 seam as lead / quality / how-it-works).
 */
export function BenefitsSection({
  headline,
  subtitle,
  items,
  lift = false,
}: BenefitsSectionProps) {
  return (
    <section className={`section-bg ${styles.root}`} aria-labelledby="benefits-title">
      <div className={styles.intro}>
        <div className={styles.pin}>
          <h2 id="benefits-title" className={styles.headline}>
            {headline}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
      <div className={styles.listCol}>
        <ul className={styles.list}>
          {items.map((item) => {
            const mediaId = item.media?.id ?? item.mediaSlot ?? item.title;
            return (
              <li key={item.title} className={styles.row}>
                <MediaSlot
                  id={mediaId}
                  aspect="1 / 1"
                  label={item.media?.label ?? item.title}
                  swatch={item.media?.swatch}
                  note={item.media?.note}
                  src={item.media?.src}
                  videoSrc={item.media?.videoSrc}
                  poster={item.media?.poster}
                  lift={lift}
                  className={styles.media}
                />
                <div className={styles.copy}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.body}>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
