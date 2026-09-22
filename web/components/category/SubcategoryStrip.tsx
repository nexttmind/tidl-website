import { MediaSlot } from "@/components/media/MediaSlot";
import type { SubcategoryFixture } from "@/content/fixtures/hand-and-body";
import styles from "./SubcategoryStrip.module.css";

/** DS-STUB: assembled from Selection Chip + media until Molecule/Subcategory Strip exists */
export function SubcategoryStrip({ items }: { items: readonly SubcategoryFixture[] }) {
  return (
    <nav className={styles.root} aria-label="Subcategories" data-ds-stub="true">
      <ul className={`layout-container ${styles.list}`}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <a href={item.href} className={styles.link}>
              <MediaSlot id={item.mediaSlot} aspect="1 / 1" label={item.label} className={styles.thumb} />
              <span className={styles.label}>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
