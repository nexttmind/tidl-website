"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { TickerBar } from "@/components/chrome/TickerBar";
import styles from "./CategoriesChrome.module.css";

type CategoriesChromeProps = {
  /** Hide Products / Bundles / Treatments in the overlay bar until the browse header scrolls off. */
  hidePreScrollNav?: boolean;
  /** Compact header ink follows the dark browse hero. Treatments only. */
  contrastInk?: boolean;
  /** Phone and tablet catalog uses the landing glass sheet. Treatments only. */
  menuGlass?: boolean;
  /** Treatments does not show the promo strip. */
  hidePromo?: boolean;
};

/** Overlay chrome on the browse header, then the pinned pill after it scrolls off. */
function BrowseChrome({
  hidePreScrollNav = false,
  hidePromo = false,
}: CategoriesChromeProps) {
  const [postScroll, setPostScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const chrome = document.querySelector("[data-hero-chrome]");
      const chromeH = chrome instanceof HTMLElement ? chrome.offsetHeight : 96;
      setPostScroll(window.scrollY > chromeH);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className={styles.heroChrome} data-hero-chrome>
        {hidePromo ? null : <TickerBar variant="promo" bleed={false} />}
        <SiteHeader
          overlay
          inverse
          pinOnScroll={false}
          navLinks={hidePreScrollNav ? [] : undefined}
          hideAskAi={hidePreScrollNav}
        />
      </div>
      {postScroll ? (
        <div className={styles.postScroll} data-fixed-chrome>
          <SiteHeader forcePinned pinOnScroll={false} />
        </div>
      ) : null}
    </>
  );
}

export function CategoriesChrome({
  hidePreScrollNav = false,
  contrastInk = false,
  menuGlass = false,
  hidePromo = false,
}: CategoriesChromeProps) {
  const compactHeader = (
    <SiteHeader
      askAiAccent="electric"
      contrastInk={contrastInk}
      menuGlass={menuGlass}
      glassPlate={menuGlass}
    />
  );

  return (
    <>
      <div className={styles.desktop}>
        <BrowseChrome hidePreScrollNav={hidePreScrollNav} hidePromo={hidePromo} />
      </div>
      <div className={styles.compact}>
        {menuGlass ? (
          <div className={styles.glassHost}>{compactHeader}</div>
        ) : (
          compactHeader
        )}
      </div>
    </>
  );
}
