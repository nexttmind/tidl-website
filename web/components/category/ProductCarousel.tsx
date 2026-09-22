import { ProductCard } from "./ProductCard";
import type { ProductFixture } from "@/content/fixtures/hand-and-body";
import styles from "./ProductCarousel.module.css";

type ProductCarouselProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  products: readonly ProductFixture[];
};

export function ProductCarousel({ id, eyebrow, title, products }: ProductCarouselProps) {
  return (
    <section className={styles.root} id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="layout-container">
        <header className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 id={id ? `${id}-title` : undefined} className={styles.title}>
            {title}
          </h2>
        </header>
        <div className={styles.track}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
