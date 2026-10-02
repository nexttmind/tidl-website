"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { optEntry, splitMediaSrc, srcset } from "@/lib/media/opt-manifest";
import type { BarrageFrame } from "@/content/pdp/barrage";
import styles from "./CampaignBarrage.module.css";

const BARRAGE_SIZES = "100vw";

/** Decoded stills for this page. A remount paints from memory. */
const barrageBitmaps = new Map<string, HTMLImageElement>();

function warmBarrageStill(src: string) {
  const existing = barrageBitmaps.get(src);
  if (existing) {
    if (existing.complete && existing.naturalWidth > 0) return;
    void existing.decode().then(
      () => undefined,
      () => undefined,
    );
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  barrageBitmaps.set(src, img);
  const { query } = splitMediaSrc(src);
  const entry = optEntry(src);
  const webp = entry?.webp ?? [];
  const raster = entry?.raster ?? [];
  if (webp.length > 0) {
    img.sizes = BARRAGE_SIZES;
    img.srcset = srcset(webp, query);
  } else if (raster.length > 0) {
    img.sizes = BARRAGE_SIZES;
    img.srcset = srcset(raster, query);
  } else {
    img.src = src;
  }
  void img.decode().then(
    () => undefined,
    () => undefined,
  );
}

/** Outpainted 16:9 plate, or the landscape type-field, when one exists. */
function wideSrc(src: string): string | null {
  let wide: string;
  if (
    src.includes("/landing/stills/graphics/") &&
    !src.includes("/graphics/wide/")
  ) {
    return src.replace(
      "/landing/stills/graphics/",
      "/landing/stills/graphics/wide/",
    );
  }
  if (src.startsWith("/landing/stills/") && !src.includes("/graphics/")) {
    wide = src.replace("/landing/stills/", "/landing/stills/wide/");
  } else if (src.startsWith("/pain-relief/lifestyle/")) {
    wide = src.replace(
      "/pain-relief/lifestyle/",
      "/pain-relief/lifestyle/wide/",
    );
  } else {
    return null;
  }
  return optEntry(wide) ? wide : null;
}

export function CampaignBarrage({
  frames,
  benefits,
}: {
  frames: readonly BarrageFrame[];
  /** Overlay captions. One shows per third of the scroll run. */
  benefits?: readonly string[];
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const captionsRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(motion.matches);
    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => motion.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const width = window.matchMedia("(width >= 1025px)");
    const syncWidth = () => setDesktop(width.matches);
    syncWidth();
    width.addEventListener("change", syncWidth);
    return () => width.removeEventListener("change", syncWidth);
  }, []);

  useEffect(() => {
    for (const frame of frames) {
      warmBarrageStill(frame.src);
      if (!desktop) continue;
      const wide = wideSrc(frame.src);
      if (wide) warmBarrageStill(wide);
    }
  }, [frames, desktop]);

  useEffect(() => {
    if (reduced || frames.length < 2) return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;

    const sync = () => {
      const run = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const progress = run <= 0 ? 0 : Math.min(1, Math.max(0, -top / run));
      const next = Math.min(
        frames.length - 1,
        Math.floor(progress * frames.length),
      );
      setIndex((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames.length, reduced]);

  /* Fit each caption so the line runs the full section width. Titles differ
     in length, so the size is measured per line, capped against the frame
     height, and re-run on resize and after fonts settle. */
  useEffect(() => {
    const wrap = captionsRef.current;
    if (!wrap || !benefits?.length) return;

    const fit = () => {
      const paddings =
        parseFloat(getComputedStyle(wrap).paddingLeft) +
        parseFloat(getComputedStyle(wrap).paddingRight);
      const width = (wrap.clientWidth - paddings) * 0.88;
      if (width <= 0) return;
      const cap = wrap.clientHeight * 0.46;
      wrap.querySelectorAll<HTMLElement>("[data-caption]").forEach((line) => {
        const ink = line.firstElementChild as HTMLElement | null;
        if (!ink) return;
        line.style.fontSize = "100px";
        const inkWidth = ink.offsetWidth;
        if (inkWidth <= 0) return;
        line.style.fontSize = `${Math.min((width / inkWidth) * 100, cap)}px`;
      });
    };

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    void document.fonts.ready.then(fit);
    fit();
    return () => ro.disconnect();
  }, [benefits]);

  if (frames.length === 0) return null;

  const mark = String(index + 1).padStart(2, "0");
  const total = String(frames.length).padStart(2, "0");
  const active = frames[index];
  const activeWide = desktop && active ? wideSrc(active.src) : null;
  const benefitIndex =
    benefits && benefits.length > 0
      ? Math.min(
          benefits.length - 1,
          Math.floor((index * benefits.length) / frames.length),
        )
      : 0;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={{ "--beats": frames.length } as CSSProperties}
      aria-label="Campaign stills"
    >
      <div className={styles.pin}>
        {(reduced ? frames : [active]).map((frame, i) => {
          if (!frame) return null;
          const realIndex = reduced ? i : index;
          const isActive = realIndex === index;
          const src = isActive && !reduced && activeWide ? activeWide : frame.src;
          return (
            <div key={`${src}-${realIndex}`} className={styles.frame}>
              <MarketingImage
                className={styles.still}
                src={src}
                alt={isActive ? frame.alt : ""}
                sizes="100vw"
                loading={isActive ? "eager" : "lazy"}
              />
            </div>
          );
        })}
        {benefits && benefits.length > 0 ? (
          <div ref={captionsRef} className={styles.captions}>
            {benefits.map((text, i) => (
              <p
                key={text}
                className={styles.caption}
                data-caption=""
                data-active={i === benefitIndex ? "true" : undefined}
              >
                <span className={styles.captionInk}>{text}</span>
              </p>
            ))}
          </div>
        ) : null}
        <p className={styles.mark} aria-hidden>
          {mark} / {total}
        </p>
      </div>
    </section>
  );
}
