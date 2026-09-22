"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { painReliefCopy } from "@/content/fixtures/pain-relief";
import styles from "./PainReliefChrome.module.css";

/**
 * Overlay chrome sits on the full-bleed hero and scrolls off with it.
 * Once that chrome leaves, the landing pinned pill takes over.
 */
export function PainReliefChrome() {
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
        <SiteHeader
          overlay
          inverse
          pinOnScroll={false}
          announcement={painReliefCopy.announcement}
        />
      </div>
      {postScroll ? (
        <div className={styles.postScroll}>
          <SiteHeader forcePinned pinOnScroll={false} />
        </div>
      ) : null}
    </>
  );
}
