import type { ReactNode } from "react";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { TickerBar } from "@/components/chrome/TickerBar";
import styles from "../care.module.css";

export function CareShell({
  eyebrow,
  title,
  lede,
  children,
  hideNote = false,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
  hideNote?: boolean;
}) {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <TickerBar />
      <SiteHeader />
      <main id="main" className={styles.shell}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{lede}</p>
        {children}
        {hideNote ? null : (
          <p className={styles.note}>
            Shell for the design and build pass. Wired to PrescribeRx proxies under
            /api/prescriberx and Ask Tidl under /api/ask-tidl. Spec:
            docs/specs/clinical-flow.md.
          </p>
        )}
      </main>
      <FooterGlobal />
    </>
  );
}
