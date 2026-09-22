import { PeptideGuide } from "@/components/guide/PeptideGuide";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Peptide Guide",
  description:
    "A guide to TIDL health goals and treatments. Physician guided care, available if prescribed after clinical review.",
};

export default function PeptideGuidePage() {
  return (
    <div className={styles.page}>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <SiteHeader pinOnScroll={false} />
      <main id="main" className={`layout-bleed ${styles.main}`}>
        <PeptideGuide />
      </main>
      <FooterGlobal />
    </div>
  );
}
