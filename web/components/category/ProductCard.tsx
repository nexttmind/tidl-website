import { Button } from "@/components/ui/Button";
import { MediaSlot } from "@/components/media/MediaSlot";
import { SoldOutTitle } from "@/components/category/SoldOutTitle";
import type { ProductFixture } from "@/content/fixtures/hand-and-body";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: ProductFixture }) {
  const href = product.href ?? `#${product.id}`;
  const fit = product.mediaFit ?? "cover";
  return (
    <article className={styles.root} id={product.id}>
      <div className={[styles.media, fit === "contain" ? styles.cutout : ""]
        .filter(Boolean)
        .join(" ")}>
        <a href={href} className={styles.mediaLink}>
          <MediaSlot
            id={product.mediaSlot}
            aspect={product.mediaAspect ?? "3 / 4"}
            fit={fit}
            plain={fit === "contain"}
            label={product.name}
            src={product.mediaSrc}
          />
        </a>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          {product.soldOut ? (
            <SoldOutTitle>
              <a href={href}>{product.name}</a>
            </SoldOutTitle>
          ) : (
            <a href={href}>{product.name}</a>
          )}
        </h3>
        <p className={styles.meta}>{product.meta}</p>
        <p className={styles.price}>{product.price}</p>
        <div className={styles.actions}>
          <Button
            href={product.soldOut ? undefined : href}
            disabled={product.soldOut}
            className={styles.cta}
          >
            {product.soldOut ? "Sold out" : "Shop"}
          </Button>
        </div>
      </div>
    </article>
  );
}
