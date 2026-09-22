"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SiteHeader, PERSONA_NAV } from "@/components/chrome/SiteHeader";
import { TickerBar } from "@/components/chrome/TickerBar";
import {
  LandingCatalogGrid,
  type CatalogGridFeature,
  type CatalogGridItem,
} from "@/components/home/LandingCatalogGrid";
import {
  LandingHero,
  type HeroSlide,
} from "@/components/home/LandingHero";
import styles from "./LandingTop.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

export const LANDING_HERO_ID = "landing-hero";
export const LANDING_CATALOG_ID = "landing-catalog";

type LandingTopProps = {
  promo: string;
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  menuGuide?: CatalogGridItem;
  slides?: readonly HeroSlide[];
  activeSlideIndex?: number;
};

type LandingStageProps = {
  promo: string;
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  menuGuide?: CatalogGridItem;
  slides: readonly HeroSlide[];
  loopsBeforeAdvance: number;
  startMode: "random" | "fixed";
  afterHero?: ReactNode;
};

function CatalogMenu({
  features,
  items,
  menuGuide,
}: {
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  menuGuide?: CatalogGridItem;
}) {
  return (
    <LandingCatalogGrid
      stacked
      features={features.filter((feature) => feature.id !== "health-goals")}
      items={menuGuide ? [...items, menuGuide] : items}
    />
  );
}

/**
 * Promo + catalog sheet + hero. Hero stays below the menu.
 * A blurred copy of the same video extends up under the sheet.
 * On phone the sheet peeks after the hero. Overlay chrome sits on the video.
 */
export function LandingStage({
  promo,
  features,
  items,
  menuGuide,
  slides,
  loopsBeforeAdvance,
  startMode,
  afterHero,
}: LandingStageProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const onSlideChange = useCallback((index: number) => {
    setSlideIndex(index);
  }, []);

  return (
    <div className={styles.stage}>
      <LandingTop
        promo={promo}
        features={features}
        items={items}
        menuGuide={menuGuide}
        slides={slides}
        activeSlideIndex={slideIndex}
      />
      <div className={styles.heroShopField}>
        <LandingHero
          key="landing-hero"
          id={LANDING_HERO_ID}
          slides={slides}
          loopsBeforeAdvance={loopsBeforeAdvance}
          startMode={startMode}
          onSlideChange={onSlideChange}
        />
        {afterHero ? (
          <div key="after-hero" className={styles.afterHero}>
            {afterHero}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Full-bleed hims top: promo + sheet (in-flow header, catalog).
 * The sheet header scrolls away with the menu. Catalog nav lives only in
 * the floating header once the video reaches the top of the page.
 */
export function LandingTop({
  promo,
  features,
  items,
  menuGuide,
  slides = [],
  activeSlideIndex = 0,
}: LandingTopProps) {
  const [postScroll, setPostScroll] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sheetVideo, setSheetVideo] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const sheetVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const phoneMq = window.matchMedia("(width < 721px)");
    const compactMq = window.matchMedia("(width < 1025px)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    const syncSheet = () =>
      setSheetVideo(
        desktopMq.matches && !motionMq.matches && !compactMq.matches,
      );
    const syncPhone = () => setIsPhone(phoneMq.matches);
    syncMotion();
    syncSheet();
    syncPhone();
    motionMq.addEventListener("change", syncMotion);
    motionMq.addEventListener("change", syncSheet);
    desktopMq.addEventListener("change", syncSheet);
    compactMq.addEventListener("change", syncSheet);
    phoneMq.addEventListener("change", syncPhone);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      motionMq.removeEventListener("change", syncSheet);
      desktopMq.removeEventListener("change", syncSheet);
      compactMq.removeEventListener("change", syncSheet);
      phoneMq.removeEventListener("change", syncPhone);
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById(LANDING_HERO_ID);
    let raf = 0;

    const measure = () => {
      raf = 0;
      if (!hero) {
        setPostScroll(false);
        return;
      }
      setPostScroll(hero.getBoundingClientRect().top <= 0);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    const io = hero
      ? new IntersectionObserver(() => measure(), {
          threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
        })
      : null;
    if (hero && io) io.observe(hero);

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById(LANDING_HERO_ID);
    if (!hero) return;

    const syncFromHero = (event: Event) => {
      const source = event.target;
      if (!(source instanceof HTMLVideoElement)) return;
      const bg = sheetVideoRef.current;
      if (!bg) return;
      if (Math.abs(bg.currentTime - source.currentTime) > 0.1) {
        try {
          bg.currentTime = source.currentTime;
        } catch {
          /* ignore seek before ready */
        }
      }
      if (reduceMotion || source.paused) {
        bg.pause();
        return;
      }
      if (bg.paused) {
        void bg.play().catch(() => {});
      }
    };

    hero.addEventListener("timeupdate", syncFromHero, true);
    hero.addEventListener("play", syncFromHero, true);
    hero.addEventListener("pause", syncFromHero, true);
    hero.addEventListener("seeked", syncFromHero, true);
    return () => {
      hero.removeEventListener("timeupdate", syncFromHero, true);
      hero.removeEventListener("play", syncFromHero, true);
      hero.removeEventListener("pause", syncFromHero, true);
      hero.removeEventListener("seeked", syncFromHero, true);
    };
  }, [activeSlideIndex, reduceMotion]);

  return (
    <>
      <section
        className={[styles.root, mountFade.mount].join(" ")}
        aria-label="Start here"
      >
        <TickerBar variant="promo" promo={promo} bleed={false} />
        <div className={styles.sheet}>
          {slides.length > 0 ? (
            <div className={styles.sheetMedia} aria-hidden>
              {sheetVideo && slides[activeSlideIndex] ? (
                <video
                  key={slides[activeSlideIndex].id}
                  ref={(el) => {
                    sheetVideoRef.current = el;
                  }}
                  className={styles.sheetVideo}
                  data-active="true"
                  src={slides[activeSlideIndex].mediaSrc}
                  poster={slides[activeSlideIndex].posterSrc}
                  muted
                  playsInline
                  loop
                  preload="auto"
                />
              ) : slides[activeSlideIndex]?.posterSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.sheetVideo}
                  data-active="true"
                  src={slides[activeSlideIndex].posterSrc}
                  alt=""
                  decoding="async"
                  loading="lazy"
                />
              ) : null}
              <span className={styles.sheetWash} />
            </div>
          ) : null}
          <div className={styles.headerSticky}>
            <SiteHeader
              embedded
              pinOnScroll={false}
              navLinks={[]}
            />
          </div>
          <div className={styles.body} id={LANDING_CATALOG_ID}>
            <LandingCatalogGrid features={features} items={items} />
          </div>
        </div>
      </section>

      <div className={styles.mobileChrome}>
        <SiteHeader
          overlay
          inverse
          navLinks={[]}
          mobileMenu={
            <CatalogMenu
              features={features}
              items={items}
              menuGuide={menuGuide}
            />
          }
        />
      </div>

      {postScroll && !isPhone ? (
        <div className={styles.postScroll} aria-hidden={false}>
          <SiteHeader
            forcePinned
            pinOnScroll={false}
            navLinks={PERSONA_NAV}
            mobileMenu={
              <CatalogMenu
                features={features}
                items={items}
                menuGuide={menuGuide}
              />
            }
          />
        </div>
      ) : null}
    </>
  );
}
