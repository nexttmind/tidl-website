import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { HashSection } from "@/components/chrome/HashSection";
import { LandingCare } from "@/components/home/LandingCare";
import { LandingSection2 } from "@/components/home/LandingSection2";
import { LandingShop } from "@/components/home/LandingShop";
import { LandingStage } from "@/components/home/LandingTop";
import { LandingPen } from "@/components/home/LandingPen";
import { LandingSocial } from "@/components/home/LandingSocial";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { landing } from "@/content/fixtures/landing";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · The Longevity Company",
  description:
    "Physician guided therapy. Made in the USA. Available if prescribed after clinical review.",
};

export default function HomePage() {
  const data = landing;

  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <HashSection />
      <main id="main" className={styles.main}>
        <div className={styles.shopBand}>
          <LandingStage
            promo={data.promo}
            features={data.catalogGrid.features}
            items={data.catalogGrid.items}
            menuGuide={data.catalogGrid.menuGuide}
            slides={data.hero.slides}
            loopsBeforeAdvance={data.hero.loopsBeforeAdvance}
            startMode={data.hero.startMode}
            afterHero={
              <ScrollReveal threshold={0} rootMargin="0px 0px 45% 0px">
                <LandingShop />
              </ScrollReveal>
            }
          />
          <ScrollReveal>
            <LandingSection2 />
          </ScrollReveal>
          <ScrollReveal>
            <LandingPen
              tags={data.pen.tags}
              slides={data.pen.slides}
              details={data.pen.details}
            />
          </ScrollReveal>
        </div>
        <div className={styles.careBand}>
          <ScrollReveal>
            <LandingCare
              title={data.care.title}
              body={data.care.body}
              areas={data.care.areas}
              providers={data.care.providers}
              ringTreatments={data.care.ringTreatments}
              ringProviders={data.care.ringProviders}
              initialAreaId={data.care.initialAreaId}
            />
          </ScrollReveal>
          <ScrollReveal>
            <LandingSocial
              title={data.social.title}
              columns={data.social.columns}
            />
          </ScrollReveal>
        </div>
      </main>
      <FooterGlobal />
    </>
  );
}
