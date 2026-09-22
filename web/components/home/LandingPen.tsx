"use client";

import { useEffect, useRef, useState } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./LandingPen.module.css";

/** Tip target on the pen, as % of the section. */
export type LandingPenTarget = {
  x: number;
  y: number;
};

export type LandingPenSlide = {
  id: string;
  mediaSrc: string;
  lines?: readonly string[];
  stepLabel?: string;
  title?: string;
  body?: string;
  /** When set, shows the shared callout stem + branch to this tip. */
  target?: LandingPenTarget;
};

type LandingPenProps = {
  tags: readonly string[];
  slides: readonly LandingPenSlide[];
  /** Right-rail detail stills from Figma Pen 2–4. Shown on step slides. */
  details?: readonly string[];
};

const AUTO_MS = 4800;
/** Chevron ends this far left of the hotspot so the pulse sits on the pen. */
const TIP_GAP = 52;
const FINAL_ARM_MIN = 48;

/**
 * Shared stem — identical on Prepare / Dial / Inject.
 * Placed in the gutter between copy and pen so the path never runs under type.
 * Only the branch to the tip morphs (prefer 45° when room allows).
 */
const STEM = {
  origin: { x: 34, y: 56 },
  end: { x: 40, y: 56 },
} as const;

/** Figma plus-mark columns on the 1440 frame. */
const PLUS_COLUMNS = [87, 507, 927, 1347] as const;
/** Top row omits the leftmost mark — tags start there instead. */
const PLUS_COLUMNS_TOP = [507, 927, 1347] as const;

const FIGMA_FRAME = { w: 1440, h: 879 } as const;

function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M5.25 4.25h2.1v9.5h-2.1v-9.5Z" fill="currentColor" />
      <path d="M10.65 4.25h2.1v9.5h-2.1v-9.5Z" fill="currentColor" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M6.5 4.2v9.6L14.5 9 6.5 4.2Z" fill="currentColor" />
    </svg>
  );
}

function PenCallout({
  target,
  reducedMotion,
}: {
  target: LandingPenTarget | null;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1440, h: 879 });
  const [tipGap, setTipGap] = useState(TIP_GAP);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const sync = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: rect.width, h: rect.height });
      }
      const raw = getComputedStyle(el).getPropertyValue("--pen-tip-gap").trim();
      const next = Number.parseFloat(raw);
      setTipGap(Number.isFinite(next) ? next : TIP_GAP);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const active = Boolean(target);
  const tip = target ?? { x: STEM.end.x + 16, y: STEM.origin.y };

  const ox = (STEM.origin.x / 100) * size.w;
  const oy = (STEM.origin.y / 100) * size.h;
  const e1x = (STEM.end.x / 100) * size.w;
  const e1y = oy;
  // Hotspot on the pen feature
  const tipX = (tip.x / 100) * size.w;
  const tipY = (tip.y / 100) * size.h;
  // Arrow stops short of the pulse
  const tipEndX = tipX - tipGap;

  const dy = tipY - e1y;
  const room = Math.max(tipEndX - e1x - FINAL_ARM_MIN, 0);
  // Prefer 45° when room allows; otherwise steeper but still continuous
  const dx = Math.min(Math.abs(dy), room);
  const e2x = e1x + dx;
  const e2y = tipY;

  const pathD = `M ${ox} ${oy} L ${e1x} ${e1y} L ${e2x} ${e2y} L ${tipEndX} ${tipY}`;
  // Chevron pointing right into the pen
  const chevron = `${tipEndX},${tipY - 5} ${tipEndX + 9},${tipY} ${tipEndX},${tipY + 5}`;

  return (
    <div
      ref={rootRef}
      className={styles.callout}
      data-active={active ? "true" : "false"}
      aria-hidden
    >
      <svg
        className={styles.calloutSvg}
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
      >
        <circle cx={ox} cy={oy} r={3} className={styles.calloutStroke} />
        <path d={pathD} className={styles.calloutPath} />
        <polygon points={chevron} className={styles.calloutStroke} />
      </svg>
      <span
        className={styles.hotspot}
        data-reduced={reducedMotion ? "true" : "false"}
        style={{ left: tipX, top: tipY }}
      >
        <span className={styles.hotspotCore} />
        <span className={styles.hotspotRing} />
        <span className={styles.hotspotRing} data-delay="true" />
      </span>
    </div>
  );
}

export function LandingPen({ tags, slides, details = [] }: LandingPenProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const [inView, setInView] = useState(false);
  /** Sticky user pause; survives scroll away / back. Manual advance does not clear it. */
  const [userPaused, setUserPaused] = useState(false);
  const [compact, setCompact] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slideCount = slides.length;
  const safeIndex = slideCount > 0 ? index % slideCount : 0;
  const slide = slides[safeIndex];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(width < 1025px)");
    const sync = () => setReducedMotion(mq.matches);
    const syncCompact = () => setCompact(compactMq.matches);
    sync();
    syncCompact();
    mq.addEventListener("change", sync);
    compactMq.addEventListener("change", syncCompact);
    return () => {
      mq.removeEventListener("change", sync);
      compactMq.removeEventListener("change", syncCompact);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      {
        // Start once a meaningful share is on screen; pause when it leaves
        threshold: 0.35,
        rootMargin: "0px",
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reducedMotion || userPaused || slideCount < 2) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil) return;
      setIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [inView, reducedMotion, userPaused, slideCount, pausedUntil]);

  const goTo = (next: number) => {
    setIndex(next);
    setPausedUntil(Date.now() + AUTO_MS);
  };

  const advance = () => {
    if (slideCount < 2) return;
    goTo((safeIndex + 1) % slideCount);
  };

  const togglePlayback = () => {
    setUserPaused((prev) => !prev);
  };

  if (!slide) return null;

  const activeMedia = slide.mediaSrc;
  const target = slide.target ?? null;
  const showDetails = Boolean(target) && details.length > 0;
  const showThumbs = details.length > 0 && (showDetails || compact);
  // Icon tracks sticky user intent; off-screen freeze does not flip the control
  const playing = !userPaused && !reducedMotion && slideCount >= 2;
  // Freeze hotspot pulse while off-screen or user-paused
  const motionPaused = reducedMotion || !inView || userPaused;

  return (
    <section
      ref={sectionRef}
      className={styles.root}
      aria-label="Flow pen"
      id="how-it-works"
      data-in-view={inView ? "true" : "false"}
    >
      <div className={styles.stage}>
        <div
          className={styles.frame}
          data-clickable={slideCount > 1 ? "true" : "false"}
          data-details={showDetails ? "true" : "false"}
          onClick={advance}
        >
          <div className={styles.mediaStack} aria-hidden>
            <MarketingImage
              className={styles.media}
              src={activeMedia}
              alt=""
              sizes="(width < 721px) 100vw, (width < 1025px) 80vw, 720px"
              loading="eager"
            />
          </div>
          <div className={styles.scrim} aria-hidden />

          <div className={styles.plusMarks} aria-hidden>
            {PLUS_COLUMNS_TOP.map((left) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`top-${left}`}
                className={`${styles.plusMark} ${styles.plusMarkTop}`}
                src="/landing/plus-mark.svg"
                alt=""
                style={{
                  left: `${(left / FIGMA_FRAME.w) * 100}%`,
                }}
              />
            ))}
            {PLUS_COLUMNS.map((left) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`bottom-${left}`}
                className={`${styles.plusMark} ${styles.plusMarkBottom}`}
                src="/landing/plus-mark.svg"
                alt=""
                style={{
                  left: `${(left / FIGMA_FRAME.w) * 100}%`,
                }}
              />
            ))}
          </div>

          <ul className={styles.tags} aria-label="Pen attributes">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          {showThumbs ? (
            <div
              className={styles.details}
              aria-hidden
              data-reduced={motionPaused ? "true" : "false"}
            >
              {details.map((src, i) => (
                <MarketingImage
                  key={src}
                  className={styles.detailCard}
                  src={src}
                  alt=""
                  width={291}
                  height={185}
                  sizes="180px"
                  style={
                    motionPaused
                      ? undefined
                      : {
                          animationDelay: `${(details.length - 1 - i) * 0.1}s`,
                        }
                  }
                />
              ))}
            </div>
          ) : null}

          <PenCallout target={target} reducedMotion={motionPaused} />

          <div
            className={styles.inner}
            data-mode={target ? "step" : "intro"}
          >
            <div className={styles.copy} key={slide.id}>
              {slide.lines ? (
                <h2 className={styles.title}>
                  {slide.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h2>
              ) : (
                <>
                  <h2 className={styles.stepTitle}>
                    {slide.stepLabel ? (
                      <span className={styles.stepLabel}>{slide.stepLabel}</span>
                    ) : null}
                    {slide.title ? (
                      <span className={styles.stepName}>{slide.title}</span>
                    ) : null}
                  </h2>
                  {slide.body ? <p className={styles.body}>{slide.body}</p> : null}
                </>
              )}
            </div>

            <div
              className={styles.dots}
              role="tablist"
              aria-label="Pen steps"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {slides.map((item, i) => {
                const active = i === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Show ${item.stepLabel ?? item.id}`}
                    className={styles.dot}
                    data-active={active ? "true" : "false"}
                    onClick={() => goTo(i)}
                  />
                );
              })}
            </div>
          </div>

          {slideCount > 1 && !reducedMotion ? (
            <button
              type="button"
              className={styles.playback}
              aria-label={playing ? "Pause animation" : "Play animation"}
              onClick={(event) => {
                event.stopPropagation();
                togglePlayback();
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {playing ? <IconPause /> : <IconPlay />}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
