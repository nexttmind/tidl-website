import { LandingCatalog } from "./LandingCatalog";
import styles from "./LandingSection2.module.css";

export function LandingSection2() {
  return (
    <section className={styles.root} aria-label="Catalog">
      <LandingCatalog />
    </section>
  );
}
