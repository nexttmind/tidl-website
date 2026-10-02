"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { SiteHeader, PERSONA_NAV } from "@/components/chrome/SiteHeader";
import { playMenuBarrage } from "@/components/chrome/menu-barrage-session";
import { useMenuCompress, useMenuExpand } from "@/components/chrome/menu-compress";
import { OptionEDesktopLoadMega } from "@/components/chrome/OptionEMega";
import { TickerBar } from "@/components/chrome/TickerBar";
import type {
  CatalogGridFeature,
  CatalogGridItem,
} from "@/components/home/LandingCatalogGrid";
import {
  LandingHero,
  type HeroSlide,
} from "@/components/home/LandingHero";
import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./LandingTop.module.css";
import mountFade from "@/components/motion/MountFade.module.css";

export const LANDING_HERO_ID = "landing-hero";
export const LANDING_CATALOG_ID = "landing-catalog";
const LANDING_PLAY_BEACONS = [LANDING_CATALOG_ID] as const;

function findHeroVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>(
    `#${LANDING_HERO_ID} video[data-landing-hero-video="true"]`,
  );
}

function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dw: number,
  dh: number,
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return false;
  const scale = Math.max(dw / vw, dh / vh);
  const sw = dw / scale;
  const sh = dh / scale;
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, dw, dh);
  return true;
}

function LandingHeroCapture({
  id,
  className,
  posterSrc,
  enabled,
  aligned = false,
}: {
  id?: string;
  className?: string;
  posterSrc?: string;
  enabled: boolean;
  /** Phone: sample the hero already on the page. No second poster. */
  aligned?: boolean;
}) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive(false);
      return;
    }

    const media = mediaRef.current;
    const canvas = canvasRef.current;
    if (!media || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let painted = false;
    let lastPaint = 0;

    const paint = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - lastPaint < (aligned ? 280 : 100)) {
        raf = window.requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;
      const source = findHeroVideo();
      if (source && source.readyState >= 2) {
        if (aligned && (source.paused || source.readyState < 3)) {
          raf = window.requestAnimationFrame(paint);
          return;
        }
        const width = aligned
          ? Math.max(1, Math.round(window.innerWidth * 0.35))
          : Math.max(1, Math.round(canvas.clientWidth * 0.35));
        const height = aligned
          ? Math.max(1, Math.round(420 * 0.35))
          : Math.max(1, Math.round(canvas.clientHeight * 0.35));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        const drew = drawVideoCover(ctx, source, width, height);
        if (drew && !painted) {
          painted = true;
          setLive(true);
        }
      }
      raf = window.requestAnimationFrame(paint);
    };

    const start = () => {
      if (!raf) raf = window.requestAnimationFrame(paint);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (!visible) {
          if (aligned) painted = false;
          return;
        }
        start();
      },
      { rootMargin: "80px" },
    );
    io.observe(media);

    const onVisibility = () => {
      if (!document.hidden && visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [aligned, enabled]);

  return (
    <div
      id={id}
      ref={mediaRef}
      className={[styles.sheetMedia, className].filter(Boolean).join(" ")}
      aria-hidden
    >
      {posterSrc ? (
        <MarketingImage
          className={styles.sheetPoster}
          src={posterSrc}
          alt=""
          sizes={aligned ? "100vw" : "400px"}
          loading={aligned ? "eager" : "lazy"}
        />
      ) : null}
      {enabled ? (
        <canvas
          ref={canvasRef}
          className={styles.sheetVideo}
          data-active={live ? "true" : "false"}
        />
      ) : null}
      <span className={styles.sheetWash} />
    </div>
  );
}

type CatalogMode = "desktop" | "tablet" | null;

function subscribeCatalogMode(onChange: () => void) {
  const phone = window.matchMedia("(width < 721px)");
  const compact = window.matchMedia("(width < 1025px)");
  phone.addEventListener("change", onChange);
  compact.addEventListener("change", onChange);
  return () => {
    phone.removeEventListener("change", onChange);
    compact.removeEventListener("change", onChange);
  };
}

function readCatalogMode(): CatalogMode {
  if (window.matchMedia("(width < 1025px)").matches) return null;
  return "desktop";
}

/** SSR ships no catalog images so a phone does not download the desktop sheet. */
function useCatalogMode(): CatalogMode {
  return useSyncExternalStore(subscribeCatalogMode, readCatalogMode, () => null);
}

type LandingTopProps = {
  promo: string;
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  slides?: readonly HeroSlide[];
  activeSlideIndex?: number;
  /** Treatments index uses Pain Relief in the Shop All slot. */
  menuEndTab?: "shop-all" | "pain-relief";
};

type LandingStageProps = {
  promo: string;
  features: readonly CatalogGridFeature[];
  items: readonly CatalogGridItem[];
  slides: readonly HeroSlide[];
  loopsBeforeAdvance: number;
  startMode: "random" | "fixed";
  afterHero?: ReactNode;
};

/**
 * Promo + catalog sheet + hero. Hero stays below the menu.
 * A blurred copy of the same video extends up under the sheet.
 * On phone the sheet peeks after the hero. Overlay chrome sits on the video.
 */
export function LandingStage({
  promo,
  features,
  items,
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
          playWhileVisibleId={LANDING_PLAY_BEACONS}
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
 * The sheet header scrolls away with the menu. On phone and tablet the
 * catalog overlay starts closed. The menu button opens it.
 */
export function LandingTop({
  promo,
  slides = [],
  activeSlideIndex = 0,
  menuEndTab = "shop-all",
}: LandingTopProps) {
  const router = useRouter();
  const [postScroll, setPostScroll] = useState(false);
  const [tabletPinned, setTabletPinned] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [megaCollapsed, setMegaCollapsed] = useState(false);
  const catalogMode = useCatalogMode();
  const megaRef = useRef<HTMLDivElement>(null);
  const sheetHeaderRef = useRef<HTMLDivElement>(null);
  const megaOpenRef = useRef(0);

  useMenuCompress(megaRef, catalogMode === "tablet" && !megaCollapsed, (openHeight) => {
    megaOpenRef.current = openHeight;
    setMegaCollapsed(true);
  });

  useMenuExpand(
    sheetHeaderRef,
    megaRef,
    catalogMode === "tablet" && megaCollapsed,
    () => megaOpenRef.current,
    () => setMegaCollapsed(false),
  );

  useEffect(() => {
    if (catalogMode !== "tablet") setMegaCollapsed(false);
  }, [catalogMode]);

  useEffect(() => {
    if (catalogMode !== "tablet") {
      setTabletPinned(false);
      return;
    }
    const sync = () => setTabletPinned(window.scrollY > 40);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [catalogMode]);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById(LANDING_HERO_ID);
    if (!hero) return;
    const compact = window.matchMedia("(width < 1025px)");

    const phoneHeader = () =>
      document.querySelector<HTMLElement>('[class*="mobileChrome"] header');

    const sync = () => {
      const header = phoneHeader();
      const chrome = header?.parentElement ?? null;
      if (!compact.matches) {
        hero.style.removeProperty("--hero-curve-top");
        hero.style.removeProperty("--menu-band");
        hero.style.removeProperty("--menu-extra");
        hero.style.removeProperty("--menu-open");
        delete hero.dataset.menuOpen;
        header?.style.removeProperty("background-color");
        header?.removeAttribute("data-video-under");
        chrome?.removeAttribute("data-video-under");
        chrome?.style.removeProperty("--landing-bar-h");
        hero.removeAttribute("data-video-under");
        hero.style.removeProperty("--hero-copy-top");
        chrome?.style.removeProperty("--menu-scrim-end");
        return;
      }
      if (!header) {
        hero.style.setProperty("--hero-curve-top", "0px");
        hero.style.setProperty("--menu-band", "0px");
        hero.style.setProperty("--menu-extra", "0px");
        hero.style.setProperty("--menu-open", "0");
        delete hero.dataset.menuOpen;
        return;
      }
      const bar = header.querySelector<HTMLElement>('[class*="bar"]');
      const shell = header.querySelector<HTMLElement>('[class*="shell"]');
      const panel = header.querySelector<HTMLElement>('[class*="mobileLoadPanel"]');
      const card = hero.querySelector<HTMLElement>('[class*="card"]');
      const shellH = shell ? Math.ceil(shell.getBoundingClientRect().height) : 0;
      if (chrome && shellH) {
        const held = Number.parseFloat(chrome.style.getPropertyValue("--landing-bar-h")) || 0;
        chrome.style.setProperty("--landing-bar-h", `${Math.max(held, shellH)}px`);
      }
      const cardTop = card?.getBoundingClientRect().top ?? hero.getBoundingClientRect().top;
      const shellBox = shell?.getBoundingClientRect();
      const edge = shellBox?.bottom ?? bar?.getBoundingClientRect().bottom ?? 0;
      const panelRect = panel?.getBoundingClientRect();
      const panelH = panel?.offsetHeight ?? 0;
      let fullH = panelH;
      if (panel) {
        const stored = Number.parseFloat(panel.dataset.fullH || "") || 0;
        if (panelH > stored) {
          panel.dataset.fullH = String(Math.ceil(panelH));
          fullH = panelH;
        } else if (stored > 8) {
          fullH = stored;
        }
      }
      const panelBottom = panelRect && panelH > 8 ? panelRect.bottom : edge;
      const coverBottom = Math.max(edge, panelBottom);
      const origin = Math.max(cardTop, 0);
      const band = Math.max(0, Math.ceil(coverBottom - origin));
      let openAmt = 0;
      if (panelRect && panelH > 8 && fullH > 8) {
        const visible = Math.min(fullH, Math.max(0, panelRect.bottom - edge));
        openAmt = visible / fullH;
      }
      hero.style.setProperty("--hero-curve-top", "0px");
      hero.style.setProperty("--menu-band", `${band}px`);
      hero.style.setProperty("--menu-extra", `${Math.max(0, Math.ceil(panelH))}px`);
      hero.style.setProperty("--menu-open", openAmt.toFixed(4));
      if (openAmt > 0.02) hero.dataset.menuOpen = "true";
      else delete hero.dataset.menuOpen;
      header.style.backgroundColor = "transparent";
      header.setAttribute("data-video-under", "true");
      chrome?.setAttribute("data-video-under", "true");
      hero.setAttribute("data-video-under", "true");
      hero.style.removeProperty("--hero-copy-top");
      chrome?.style.removeProperty("--menu-scrim-end");
    };

    let follow = 0;
    const followMenu = () => {
      window.cancelAnimationFrame(follow);
      const start = performance.now();
      const step = () => {
        sync();
        if (performance.now() - start < 700) {
          follow = window.requestAnimationFrame(step);
        }
      };
      follow = window.requestAnimationFrame(step);
    };

    const mo = new MutationObserver(followMenu);
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-mobile-open", "data-open", "data-mobile-load"],
    });

    const watch = new ResizeObserver(sync);
    const header = phoneHeader();
    if (header) {
      watch.observe(header);
      if (header.parentElement) watch.observe(header.parentElement);
    }

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", followMenu, { passive: true });
    compact.addEventListener("change", sync);
    return () => {
      window.cancelAnimationFrame(follow);
      watch.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", followMenu);
      compact.removeEventListener("change", sync);
      hero.style.removeProperty("--hero-curve-top");
      hero.style.removeProperty("--hero-copy-top");
      hero.style.removeProperty("--menu-band");
      hero.style.removeProperty("--menu-extra");
      hero.style.removeProperty("--menu-open");
      hero.style.removeProperty("transition");
      delete hero.dataset.menuOpen;
      document
        .querySelector("[class*='mobileChrome']")
        ?.removeAttribute("data-video-under");
      document
        .querySelector<HTMLElement>("[class*='mobileChrome']")
        ?.style.removeProperty("--menu-scrim-end");
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

  const promoRef = useRef<HTMLDivElement>(null);
  const posterSrc = slides[activeSlideIndex]?.posterSrc;

  useEffect(() => {
    const slot = promoRef.current;
    const stage = slot?.closest<HTMLElement>("[class*='stage']");
    if (!slot || !stage) return;
    const compact = window.matchMedia("(width < 1025px)");
    const timeline = CSS.supports("animation-timeline", "scroll()");
    let promoH = 0;

    const measure = () => {
      if (!compact.matches) {
        promoH = 0;
        stage.style.removeProperty("--promo-pin");
        stage.style.removeProperty("--promo-h");
        slot.removeAttribute("data-away");
        return;
      }
      promoH = Math.ceil(slot.getBoundingClientRect().height);
      if (promoH > 0) stage.style.setProperty("--promo-h", `${promoH}px`);
    };

    const sync = () => {
      if (!compact.matches || promoH <= 0) return;
      const away = window.scrollY >= promoH - 0.5;
      if (slot.hasAttribute("data-away") !== away) {
        slot.toggleAttribute("data-away", away);
      }
      if (timeline) {
        stage.style.removeProperty("--promo-pin");
        return;
      }
      const offset = Math.max(0, promoH - window.scrollY);
      stage.style.setProperty("--promo-pin", `${offset}px`);
    };

    measure();
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    const onResize = () => {
      measure();
      sync();
    };
    window.addEventListener("resize", onResize);
    compact.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", onResize);
      compact.removeEventListener("change", onResize);
      stage.style.removeProperty("--promo-pin");
      stage.style.removeProperty("--promo-h");
      slot.removeAttribute("data-away");
    };
  }, []);

  return (
    <div
      className={[
        styles.frame,
        menuEndTab === "pain-relief" ? styles.flowMenu : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.promoSlot} ref={promoRef}>
        <TickerBar variant="promo" promo={promo} bleed={false} />
      </div>
      <section
        className={[styles.root, mountFade.mount].join(" ")}
        aria-label="Start here"
      >
        <div className={styles.sheet}>
          {slides.length > 0 ? (
            <LandingHeroCapture
              posterSrc={posterSrc}
              enabled={!reduceMotion && catalogMode === "desktop"}
            />
          ) : null}
          <div className={styles.headerSticky} ref={sheetHeaderRef}>
            <SiteHeader
              embedded
              desktopLoadState
              overlay
              inverse
              pinOnScroll={false}
              navLinks={PERSONA_NAV}
              landingBar
              menuEndTab={menuEndTab}
              tabletCatalogOpen={catalogMode === "tablet" && !megaCollapsed}
            />
          </div>
          <div className={styles.body} id={LANDING_CATALOG_ID}>
            {catalogMode === "desktop" || catalogMode === "tablet" ? (
              <div
                className={styles.desktopLoadMega}
                ref={megaRef}
                data-collapsed={megaCollapsed ? "true" : "false"}
              >
                <OptionEDesktopLoadMega
                  onCatalogTap={(id, href) => playMenuBarrage(router, id, href)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.mobileChrome}>
        <div className={styles.promoRow} ref={promoRef}>
          <TickerBar variant="promo" promo={promo} bleed={false} />
        </div>
        <SiteHeader
          overlay
          inverse
          menuGlass
          mobileLoadState
          pinOnScroll={false}
          navLinks={PERSONA_NAV}
          landingBar
          menuEndTab={menuEndTab}
        />
      </div>

      {(catalogMode === "desktop" && postScroll) ||
      (catalogMode === "tablet" && tabletPinned) ? (
        <div className={styles.postScroll} aria-hidden={false}>
          <SiteHeader
            forcePinned
            pinOnScroll={false}
            navLinks={PERSONA_NAV}
            landingBar
            overlay={catalogMode === "tablet"}
            inverse={catalogMode === "tablet"}
            menuGlass={catalogMode === "tablet"}
            glassPlate={catalogMode === "tablet"}
            menuEndTab={menuEndTab}
          />
        </div>
      ) : null}
    </div>
  );
}
