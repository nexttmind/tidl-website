import { CategoriesChrome } from "@/components/category/CategoriesChrome";
import { CategoryBrowse } from "@/components/category/CategoryBrowse";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { PeptideGuide } from "@/components/guide/PeptideGuide";
import { TreatmentSectionNav } from "@/components/guide/TreatmentSectionNav";
import { TreatmentSections } from "@/components/guide/TreatmentSections";
import chrome from "../categories/page.module.css";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Treatments",
  description:
    "Browse TIDL treatments. Goal framed care plans. A physician reviews what, if anything, is prescribed.",
};

export default function TreatmentsIndexPage() {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <CategoriesChrome hidePreScrollNav contrastInk menuGlass hidePromo />
      <div className={chrome.showBrowse}>
        <div className={chrome.desktop}>
          <CategoryBrowse names="catalog" />
        </div>
      </div>
      <TreatmentSections>
        <main id="main" className={styles.main}>
          <TreatmentSectionNav />
          <PeptideGuide />
        </main>
      </TreatmentSections>
      <FooterGlobal />
    </>
  );
}
