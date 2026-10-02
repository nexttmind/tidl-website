import { CatalogNotecard } from "@/components/category/CatalogNotecard";
import { CategoryPairing } from "@/components/category/CategoryPairing";
import { SHOP_CATALOG } from "@/components/home/shop-catalog";
import type { ShopKind } from "@/components/home/shop-catalog";
import { catalogCopy } from "@/content/fixtures/catalog";
import styles from "./CategoryIndex.module.css";

const KIND_COPY: Record<ShopKind, { id: string; title: string }> = {
  product: { id: "products", title: "Products" },
  bundle: { id: "bundles", title: "Product Bundles" },
  treatment: { id: "treatments", title: catalogCopy.treatments.title },
};

function CatalogSection({
  kind,
  title,
}: {
  kind: ShopKind;
  title: string;
}) {
  const headingId = `${kind}-title`;
  const items = SHOP_CATALOG.filter((item) => item.kind === kind);

  return (
    <section className={styles.section} id={KIND_COPY[kind].id} aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        {title}
      </h2>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.id}>
            <CatalogNotecard id={item.id} label={item.label} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CategoryIndex({
  kinds = ["product", "bundle", "treatment"],
  pairing = true,
}: {
  kinds?: readonly ShopKind[];
  pairing?: boolean;
}) {
  return (
    <div className={styles.root}>
      <div className={styles.catalog}>
        {kinds.map((kind) => (
          <CatalogSection key={kind} kind={kind} title={KIND_COPY[kind].title} />
        ))}
      </div>
      {pairing ? (
        <div className={styles.section}>
          <CategoryPairing />
        </div>
      ) : null}
    </div>
  );
}
