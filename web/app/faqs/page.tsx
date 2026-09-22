import { FaqAccordion } from "@/components/pdp/FaqAccordion";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { faqsPage } from "@/content/fixtures/faqs";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · FAQs",
  description:
    "Common questions about TIDL care, pricing, quality, and clinical review. Available if prescribed.",
};

export default function FaqsPage() {
  return (
    <div className={styles.page}>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <SiteHeader pinOnScroll={false} />
      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{faqsPage.title}</h1>
        <p className={styles.intro}>{faqsPage.intro}</p>

        <section className={styles.section} aria-labelledby="faq-pricing-title">
          <h2 id="faq-pricing-title" className={styles.sectionTitle}>
            {faqsPage.pricing.title}
          </h2>
          {faqsPage.pricing.paragraphs.map((text) => (
            <p key={text} className={styles.sectionIntro}>
              {text}
            </p>
          ))}
          <FaqAccordion items={faqsPage.pricing.items} />
        </section>

        <section className={styles.section} aria-labelledby="faq-more-title">
          <h2 id="faq-more-title" className={styles.sectionTitle}>
            {faqsPage.more.title}
          </h2>
          <FaqAccordion items={faqsPage.more.items} />
        </section>

        <p id="safety" className={styles.disclaimer}>
          {faqsPage.disclaimer}
        </p>
      </main>
      <FooterGlobal />
    </div>
  );
}
