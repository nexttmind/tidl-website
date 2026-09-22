import { ProductGrid } from "@/components/category/ProductGrid";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { LandingHero } from "@/components/home/LandingHero";
import { LandingSocial } from "@/components/home/LandingSocial";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  painReliefByGroup,
  painReliefCopy,
  painReliefGroups,
  painReliefHeroSlides,
  painReliefSocial,
} from "@/content/fixtures/pain-relief";
import { DayRail } from "./DayRail";
import { PainReliefChrome } from "./PainReliefChrome";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Pain Relief",
  description:
    "TIDL sprays, roll ons, and creams for sore days, training days, and the hours in between.",
};

export default function PainReliefPage() {
  return (
    <div className={styles.page}>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <PainReliefChrome />
      <main id="main" className={styles.main}>
        <LandingHero
          flush
          id="pain-relief-hero"
          ariaLabel={painReliefCopy.title}
          slides={painReliefHeroSlides}
        />

        <DayRail />

        {painReliefGroups.map((group) => (
          <ScrollReveal key={group.id}>
            <ProductGrid
              id={group.id}
              title={group.title}
              products={painReliefByGroup(group.id)}
            />
          </ScrollReveal>
        ))}

        <ScrollReveal>
          <LandingSocial
            title={painReliefSocial.title}
            columns={painReliefSocial.columns}
          />
        </ScrollReveal>

        <p className={styles.disclaimer}>{painReliefCopy.disclaimer}</p>
      </main>
      <FooterGlobal />
    </div>
  );
}
