import { Button } from "@/components/ui/Button";
import { ProductNotecard, type ProductNotecardProps } from "./ProductNotecard";
import styles from "./ProductCarouselHero.module.css";

export type CarouselHeroProduct = ProductNotecardProps;

type ProductCarouselHeroProps = {
  titleLines: readonly [string, string];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  products: readonly CarouselHeroProduct[];
};

/** Pattern/Product Carousel Hero */
export function ProductCarouselHero({
  titleLines,
  subtitle,
  primaryCta,
  secondaryCta,
  products,
}: ProductCarouselHeroProps) {
  return (
    <section className={styles.root} aria-labelledby="carousel-hero-title">
      <div className={styles.bg} aria-hidden />
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 id="carousel-hero-title" className={styles.title}>
            <span>{titleLines[0]}</span>
            <span>{titleLines[1]}</span>
          </h1>

          <div className={styles.ctaRow}>
            <Button styleVariant="Ghost" href={primaryCta.href}>
              {primaryCta.label}
            </Button>
            {secondaryCta ? (
              <Button
                styleVariant="Ghost"
                href={secondaryCta.href}
                className={styles.secondaryCta}
              >
                {secondaryCta.label}
              </Button>
            ) : null}
          </div>

          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.carousel} role="list" tabIndex={0} aria-label="Featured stacks">
          {products.map((product) => (
            <div key={product.name} className={styles.card} role="listitem">
              <ProductNotecard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
