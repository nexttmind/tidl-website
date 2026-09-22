import { CatalogNotecard } from "@/components/category/CatalogNotecard";
import { CategoryPairing } from "@/components/category/CategoryPairing";
import {
  catalogCopy,
  catalogItemsByKind,
} from "@/content/fixtures/catalog";
import type { ValueFieldCard } from "@/content/fixtures/value-fields";
import styles from "./CategoryIndex.module.css";

function CatalogSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: readonly ValueFieldCard[];
}) {
  const headingId = `${id}-title`;

  return (
    <section className={styles.section} id={id} aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        {title}
      </h2>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.id}>
            <CatalogNotecard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CategoryIndex() {
  const healthGoals = catalogItemsByKind("treatment");
  const treatments = catalogItemsByKind("program");

  return (
    <div className={styles.root}>
      <div className={styles.catalog}>
        <CatalogSection
          id={catalogCopy.healthGoals.id}
          title={catalogCopy.healthGoals.title}
          items={healthGoals}
        />
        <CatalogSection
          id={catalogCopy.treatments.id}
          title={catalogCopy.treatments.title}
          items={treatments}
        />
      </div>
      <div className={styles.section}>
        <CategoryPairing />
      </div>
    </div>
  );
}
