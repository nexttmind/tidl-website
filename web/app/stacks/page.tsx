import { AssistBand } from "@/components/category/AssistBand";
import { ProductCarousel } from "@/components/category/ProductCarousel";
import { ProductCarouselHero } from "@/components/category/ProductCarouselHero";
import { ProductTwoUp } from "@/components/category/ProductTwoUp";
import { RecommendedReading } from "@/components/category/RecommendedReading";
import { SubcategoryStrip } from "@/components/category/SubcategoryStrip";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { ImageHeader } from "@/components/chrome/ImageHeader";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { TickerBar } from "@/components/chrome/TickerBar";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { stacksCatalog } from "@/content/fixtures/hand-and-body";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Stacks",
  description:
    "Physician guided peptide therapy stacks. Available if prescribed after clinical review.",
};

export default function StacksPage() {
  const data = stacksCatalog;
  const hero = data.carouselHero;

  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <TickerBar />
      <SiteHeader announcement={data.navAnnouncement} />
      <main id="main" className={styles.main}>
        <div className={styles.heroShell}>
          <ImageHeader mediaSlot={data.hero.mediaSlot} alt="TIDL stacks" />
        </div>
        <ScrollReveal>
          <SubcategoryStrip items={data.subcategories} />
        </ScrollReveal>
        <ScrollReveal>
          <ProductCarousel
            id="core"
            eyebrow={data.carousel.eyebrow}
            title={data.carousel.title}
            products={data.carousel.products}
          />
        </ScrollReveal>
        <ScrollReveal>
          <ProductTwoUp title={data.compare.title} products={data.compare.products} />
        </ScrollReveal>
        <ScrollReveal>
          <ProductCarousel
            id="renewal"
            title={data.bathing.title}
            products={data.bathing.products}
          />
        </ScrollReveal>
        <ScrollReveal>
          <ProductCarousel
            id="longevity"
            title={data.seasonal.title}
            products={data.seasonal.products}
          />
        </ScrollReveal>
        <ScrollReveal>
          <ProductCarouselHero
            titleLines={hero.titleLines}
            subtitle={hero.subtitle}
            primaryCta={hero.primaryCta}
            secondaryCta={hero.secondaryCta}
            products={hero.products}
          />
        </ScrollReveal>
        <ScrollReveal>
          <div id="assist">
            <AssistBand
              title={data.assist.title}
              body={data.assist.body}
              cta={data.assist.cta}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <RecommendedReading title={data.reading.title} items={data.reading.items} />
        </ScrollReveal>
      </main>
      <FooterGlobal />
    </>
  );
}
