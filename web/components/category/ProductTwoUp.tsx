import { ProductCard } from "./ProductCard";
import type { ProductFixture } from "@/content/fixtures/hand-and-body";
import styles from "./ProductTwoUp.module.css";

type ProductTwoUpProps = {
  title: string;
  products: readonly ProductFixture[];
};

export function ProductTwoUp({ title, products }: ProductTwoUpProps) {
  return (
    <section className={styles.root} aria-labelledby="compare-title">
      <div className="layout-container">
        <h2 id="compare-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
