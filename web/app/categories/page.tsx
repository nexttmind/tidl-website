import { CategoriesChrome } from "@/components/category/CategoriesChrome";
import { CategoryDiscover } from "@/components/category/CategoryDiscover";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { HashSection } from "@/components/chrome/HashSection";
import styles from "./page.module.css";

export const metadata = {
  title: "TIDL · All treatments",
  description:
    "Browse TIDL treatments by family. Physician guided care, available if prescribed after clinical review.",
};

export default function CategoriesPage() {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <CategoriesChrome />
      <HashSection />
      <main id="main" className={styles.main}>
        <CategoryDiscover />
      </main>
      <FooterGlobal />
    </>
  );
}
