import { CareersForm } from "@/components/careers/CareersForm";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { careersPage } from "@/content/fixtures/careers";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Careers",
  description: "We're interested in hearing from you.",
};

export default function CareersPage() {
  return (
    <div className={styles.page}>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <SiteHeader pinOnScroll={false} />
      <main id="main" className={styles.main}>
        <h1 className={styles.title}>{careersPage.title}</h1>
        <p className={styles.note}>{careersPage.note}</p>
        <p className={styles.lede}>{careersPage.lede}</p>
        <CareersForm />
      </main>
      <FooterGlobal />
    </div>
  );
}
