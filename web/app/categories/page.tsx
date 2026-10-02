import { CategoriesChrome } from "@/components/category/CategoriesChrome";
import { CategoryBrowse } from "@/components/category/CategoryBrowse";
import { CategoryDiscover } from "@/components/category/CategoryDiscover";
import { CategoryIndex } from "@/components/category/CategoryIndex";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { HashSection } from "@/components/chrome/HashSection";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · Catalog",
  description:
    "Browse TIDL products, bundles, and treatments. Physician guided care, available if prescribed after clinical review.",
};

export default function CategoriesPage() {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <CategoriesChrome />
      <HashSection />
      <div className={styles.desktop}>
        <CategoryBrowse />
      </div>
      <main id="main" className={styles.main}>
        <div className={styles.desktop} data-catalog="desktop">
          <CategoryIndex />
        </div>
        <div className={styles.compact} data-catalog="compact">
          <CategoryDiscover />
        </div>
      </main>
      <FooterGlobal />
    </>
  );
}
