import {
  LandingCatalogGrid,
  type CatalogGridFeature,
  type CatalogGridItem,
} from "@/components/home/LandingCatalogGrid";
import styles from "./LandingIntro.module.css";

type LandingIntroProps = {
  headline: string;
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
};

/**
 * White rounded sheet under the sticky header: headline + hims-style catalog.
 * Video hero mounts beneath this section.
 */
export function LandingIntro({ headline, features, items }: LandingIntroProps) {
  return (
    <section className={styles.root} aria-label="Start here">
      <div className={styles.sheet}>
        <div className={styles.body}>
          <h1 className={styles.headline}>{headline}</h1>
          <LandingCatalogGrid features={features} items={items} />
        </div>
      </div>
    </section>
  );
}
