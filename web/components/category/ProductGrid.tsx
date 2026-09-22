import { ProductCard } from "./ProductCard";
import type { ProductFixture } from "@/content/fixtures/hand-and-body";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  id?: string;
  title: string;
  products: readonly ProductFixture[];
};

export function ProductGrid({ id, title, products }: ProductGridProps) {
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section className={styles.root} id={id} aria-labelledby={headingId}>
      <div className="layout-container">
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.grid} data-count={products.length}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
