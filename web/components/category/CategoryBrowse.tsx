"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { MarketingImage } from "@/components/media/MarketingImage";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import {
  catalogCopy,
  catalogStackItems,
} from "@/content/fixtures/catalog";
import type { ValueFieldCard } from "@/content/fixtures/value-fields";
import styles from "./CategoryBrowse.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function StackCard({
  item,
  inert = false,
  cardKey,
  active,
}: {
  item: ValueFieldCard;
  inert?: boolean;
  cardKey: string;
  active: boolean;
}) {
  const plate = shopPlate(item.id);

  return (
    <a
      className={`${styles.card} ${shop.bloomHost}`}
      href={item.href}
      aria-label={item.pill}
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert || undefined}
      data-bloom={item.id}
      data-browse-card={cardKey}
      style={bloomStyle(plate.bloom)}
    >
      <span className={styles.cardBloom} aria-hidden>
        <span className={styles.cardKicker}>
          <span className={styles.cardIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.iconSrc} alt="" width={20} height={20} />
          </span>
          {item.pill}
        </span>
        <ShopBloomPair
          vialSrc={plate.vialSrc}
          bloomSrc={plate.bloomSrc}
          active={active}
        />
      </span>
    </a>
  );
}

/** Full-bleed browse header that scrubs into a landing-matched notecard on scroll. */
export function CategoryBrowse() {
  const scrollRootRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const items = catalogStackItems();
  const [hotKeys, setHotKeys] = useState<ReadonlySet<string>>(
    () => new Set(items.slice(0, 4).map((item) => `a-${item.id}`)),
  );

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => motionMq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || reduceMotion) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const bleedW = document.documentElement.clientWidth;
      root.style.setProperty("--bleed-w", `${bleedW}px`);
      const rect = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      const chrome = document.querySelector("[data-hero-chrome]");
      const chromeH = chrome instanceof HTMLElement ? chrome.offsetHeight : 0;
      const next = clamp01((-rect.top - chromeH) / travel);
      setProgress(next);
      root.style.setProperty("--hero-p", next.toFixed(4));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const io = new IntersectionObserver(
      (entries) => {
        setHotKeys((current) => {
          let changed = false;
          const next = new Set(current);
          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.browseCard;
            if (!key) continue;
            if (entry.isIntersecting) {
              if (!next.has(key)) {
                next.add(key);
                changed = true;
              }
            } else if (next.has(key)) {
              next.delete(key);
              changed = true;
            }
          }
          return changed ? next : current;
        });
      },
      { root: stack, rootMargin: "80% 0px", threshold: 0 },
    );
    stack.querySelectorAll<HTMLElement>("[data-browse-card]").forEach((card) => {
      io.observe(card);
    });
    return () => io.disconnect();
  }, [items]);

  const condensed = progress >= 0.98;
  const frameStyle = {
    "--hero-p": progress.toFixed(4),
  } as CSSProperties;

  return (
    <header
      ref={scrollRootRef}
      className={[
        styles.scrollRoot,
        reduceMotion ? styles.reduceMotion : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="categories-hero-title"
      data-condensed={condensed ? "true" : "false"}
    >
      <div className={styles.sticky}>
        <div
          className={[styles.frame, mountFade.mount].join(" ")}
          style={frameStyle}
        >
          <h1 id="categories-hero-title" className="sr-only">
            {catalogCopy.titleLead} {catalogCopy.titleAccent}
          </h1>
          <MarketingImage
            className={styles.field}
            src="/landing/categories/biker.png"
            alt=""
            width={1920}
            height={1080}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <div className={styles.wash} aria-hidden />

          <div
            className={styles.layout}
            aria-hidden={condensed || undefined}
          >
            <nav className={styles.menu} aria-label="Categories">
              {items.map((item) => (
                <a key={item.id} className={styles.menuItem} href={item.href}>
                  {item.pill}
                </a>
              ))}
            </nav>

            <div ref={stackRef} className={styles.stack}>
              <div className={styles.track}>
                <div className={styles.segment}>
                  {items.map((item) => (
                    <StackCard
                      key={item.id}
                      item={item}
                      cardKey={`a-${item.id}`}
                      active={hotKeys.has(`a-${item.id}`)}
                    />
                  ))}
                </div>
                <div className={styles.segment} aria-hidden>
                  {items.map((item) => (
                    <StackCard
                      key={`${item.id}-loop`}
                      item={item}
                      cardKey={`b-${item.id}`}
                      inert
                      active={hotKeys.has(`b-${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
