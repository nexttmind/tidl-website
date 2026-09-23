import type { ReactNode } from "react";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import styles from "./CarePortalChrome.module.css";

type Props = {
  children: ReactNode;
};

/** Overlay header + footer. Same chrome as the restyled PDP. */
export function CarePortalChrome({ children }: Props) {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <div className={styles.heroChrome}>
        <SiteHeader overlay />
      </div>
      <div id="main">{children}</div>
      <FooterGlobal />
    </>
  );
}
