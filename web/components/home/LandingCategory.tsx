"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  stackCategories,
  type CategorySlug,
  type StackCategory,
} from "@/content/fixtures/categories";
import { symptomsCta } from "@/content/clinical/entry-map";
import { Button } from "@/components/ui/Button";
import styles from "./LandingCategory.module.css";

const openCareCta = symptomsCta();

type LandingCategoryProps = {
  categories?: readonly StackCategory[];
  initialSlug?: CategorySlug;
};

/** Width expand duration — protocol slide waits for this beat. */
const WIDTH_MS = 320;
/** Protocol slide-up duration. */
const PROTOCOL_MS = 380;

/** Same Figma plus-mark grid as the pen section (1440 frame). */
const PLUS_COLUMNS = [87, 507, 927, 1347] as const;
/** Top row omits the leftmost mark — eyebrow starts there instead. */
const PLUS_COLUMNS_TOP = [507, 927, 1347] as const;
const PLUS_TOP = 40;
const FIGMA_FRAME = { w: 1440, h: 879 } as const;

const lumCache = new Map<string, number>();
const chipInkCache = new Map<string, string>();

/** Average luminance (0–1) of the bottom 30% of an image. */
async function sampleBottomLuminance(src: string): Promise<number> {
  const cached = lumCache.get(src);
  if (cached !== undefined) return cached;

  const img = new Image();
  img.src = src;
  await img.decode();

  const w = 64;
  const h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0.5;

  const sy = img.naturalHeight * 0.7;
  ctx.drawImage(
    img,
    0,
    sy,
    img.naturalWidth,
    img.naturalHeight - sy,
    0,
    0,
    w,
    h,
  );
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  const pixels = w * h;
  for (let i = 0; i < data.length; i += 4) {
    sum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
  }
  const lum = sum / pixels;
  lumCache.set(src, lum);
  return lum;
}

function srgbChannel(c: number) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number) {
  return (
    0.2126 * srgbChannel(r) +
    0.7152 * srgbChannel(g) +
    0.0722 * srgbChannel(b)
  );
}

/** Keep hue of the hero sample; darken only enough to read on white pills. */
function inkAgainstWhite(r: number, g: number, b: number) {
  let nr = r;
  let ng = g;
  let nb = b;
  for (let i = 0; i < 14; i += 1) {
    const contrast = 1.05 / (relativeLuminance(nr, ng, nb) + 0.05);
    if (contrast >= 4.5) break;
    nr = Math.round(nr * 0.88);
    ng = Math.round(ng * 0.88);
    nb = Math.round(nb * 0.88);
  }
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Sample the chip band of a hero (upper-left) for pill label ink.
 * Skips near-white / near-black outliers so photo grain doesn't wash the mean.
 */
async function sampleChipInk(src: string): Promise<string> {
  const cached = chipInkCache.get(src);
  if (cached !== undefined) return cached;

  const img = new Image();
  img.src = src;
  await img.decode();

  const w = 48;
  const h = 24;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#755f42";

  const sw = img.naturalWidth * 0.42;
  const sh = img.naturalHeight * 0.18;
  const sx = img.naturalWidth * 0.05;
  const sy = img.naturalHeight * 0.06;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum > 0.88 || lum < 0.08) continue;
    rSum += r;
    gSum += g;
    bSum += b;
    n += 1;
  }

  if (n === 0) {
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      n += 1;
    }
  }

  const ink = inkAgainstWhite(
    Math.round(rSum / n),
    Math.round(gSum / n),
    Math.round(bSum / n),
  );
  chipInkCache.set(src, ink);
  return ink;
}

/** Brighter bottoms need a taller, denser scrim for glass-card type. */
function scrimFromLuminance(lum: number) {
  const t = Math.min(1, Math.max(0, (lum - 0.12) / 0.72));
  return {
    fadePx: Math.round(24 + t * 80),
    mid: Number((0.48 + t * 0.32).toFixed(2)),
    end: Number((0.88 + t * 0.1).toFixed(2)),
  };
}

type ProtocolScrim = ReturnType<typeof scrimFromLuminance>;

const PROTOCOL_ICONS: Record<string, ReactNode> = {
  "metabolic health": (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3c2.5 4 7 6.5 7 11a7 7 0 1 1-14 0c0-4.5 4.5-7 7-11z" />
      <path d="M12 11v6M10 15h4" strokeLinecap="round" />
    </svg>
  ),
  "body repair": (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M7 6.5c0-1.4 1-2.5 2.3-2.5h.4c1 0 1.8.7 2.1 1.6L13 9.5l1.2-3.9c.3-.9 1.1-1.6 2.1-1.6h.4c1.3 0 2.3 1.1 2.3 2.5 0 .8-.4 1.5-1 2L16.5 12l1.5 2.5c.6.5 1 1.2 1 2 0 1.4-1 2.5-2.3 2.5h-.4c-1 0-1.8-.7-2.1-1.6L13 14.5l-1.2 3.9c-.3.9-1.1 1.6-2.1 1.6h-.4C8 20 7 18.9 7 17.5c0-.8.4-1.5 1-2L9.5 12 8 9.5c-.6-.5-1-1.2-1-2z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "mental health": (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M9.5 4.5c-2 0-3.5 1.4-3.5 3.2 0 .7.2 1.3.6 1.8A2.8 2.8 0 0 0 5 12c0 1.4 1 2.5 2.3 2.7V17c0 1.1.9 2 2 2h1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 4.5c2 0 3.5 1.4 3.5 3.2 0 .7-.2 1.3-.6 1.8A2.8 2.8 0 0 1 19 12c0 1.4-1 2.5-2.3 2.7V17c0 1.1-.9 2-2 2H13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 4.5v14.5" strokeLinecap="round" />
      <path d="M8.5 9.5h3M12.5 11.5h3M8.5 13.5h3" strokeLinecap="round" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5z" />
      <path d="M16 6l.6 1.4L18 8l-1.4.6L16 10l-.6-1.4L14 8l1.4-.6L16 6z" fill="currentColor" stroke="none" />
    </svg>
  ),
  longevity: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M8 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.5 0 2.6-.7 3.5-1.8L12 12l.5.2C13.4 13.3 14.5 14 16 14c2.2 0 4-1.8 4-4s-1.8-4-4-4c-1.5 0-2.6.7-3.5 1.8L12 12l-.5-.2C10.6 10.7 9.5 10 8 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/**
 * Program Section
 * Scroll into view → notecard widens, then protocol slides up (stays).
 * Arrow controls step through programs with the same expand sequence.
 */
export function LandingCategory({
  categories = stackCategories,
  initialSlug = "executive",
}: LandingCategoryProps) {
  const baseId = useId();
  const [activeSlug, setActiveSlug] = useState<CategorySlug>(initialSlug);
  const [wide, setWide] = useState(false);
  const [protocolOpen, setProtocolOpen] = useState(false);
  /** Skip transitions while snapping back to the default clip before replay. */
  const [instant, setInstant] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrim, setScrim] = useState<ProtocolScrim>({
    fadePx: 48,
    mid: 0.62,
    end: 0.94,
  });
  const [chipInk, setChipInk] = useState("#755f42");
  const [protocolBandPx, setProtocolBandPx] = useState(210);
  const rootRef = useRef<HTMLElement | null>(null);
  const notecardRef = useRef<HTMLDivElement | null>(null);
  const protocolRef = useRef<HTMLDivElement | null>(null);
  const seqRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteredRef = useRef(false);

  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.slug === activeSlug),
  );
  const active = categories[activeIndex];

  const clearSeq = useCallback(() => {
    if (seqRef.current !== null) {
      clearTimeout(seqRef.current);
      seqRef.current = null;
    }
  }, []);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => () => clearSeq(), [clearSeq]);

  /* Tune the black→clear scrim from the active hero's bottom brightness. */
  useEffect(() => {
    let cancelled = false;
    sampleBottomLuminance(active.heroSrc)
      .then((lum) => {
        if (!cancelled) setScrim(scrimFromLuminance(lum));
      })
      .catch(() => {
        if (!cancelled) setScrim({ fadePx: 48, mid: 0.62, end: 0.94 });
      });
    return () => {
      cancelled = true;
    };
  }, [active.heroSrc]);

  /* Chip label ink tracks the active hero's local background color. */
  useEffect(() => {
    let cancelled = false;
    sampleChipInk(active.heroSrc)
      .then((ink) => {
        if (!cancelled) setChipInk(ink);
      })
      .catch(() => {
        if (!cancelled) setChipInk("#755f42");
      });
    return () => {
      cancelled = true;
    };
  }, [active.heroSrc]);

  /* Keep copyLead clear of the protocol band as its height changes. */
  useEffect(() => {
    const el = protocolRef.current;
    if (!el) return;
    const sync = () => {
      setProtocolBandPx(Math.ceil(el.getBoundingClientRect().height));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrim.fadePx, activeSlug, protocolOpen]);

  const expandCard = useCallback(() => {
    clearSeq();
    setInstant(false);
    setWide(true);
    if (reduceMotion) {
      setProtocolOpen(true);
      return;
    }
    seqRef.current = setTimeout(() => {
      setProtocolOpen(true);
      seqRef.current = null;
    }, WIDTH_MS);
  }, [clearSeq, reduceMotion]);

  /**
   * Snap to the default (partial) clip with no transition, then replay:
   * width → full, then protocol slides up from the bottom.
   */
  const replayExpand = useCallback(
    (nextSlug?: CategorySlug) => {
      clearSeq();

      flushSync(() => {
        if (nextSlug !== undefined) setActiveSlug(nextSlug);
        setInstant(true);
        setWide(false);
        setProtocolOpen(false);
      });
      // Force layout so the browser locks the snapped width before we expand.
      void notecardRef.current?.offsetWidth;

      flushSync(() => {
        setInstant(false);
      });
      void notecardRef.current?.offsetWidth;

      expandCard();
    },
    [clearSeq, expandCard],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || enteredRef.current) return;
        enteredRef.current = true;
        expandCard();
      },
      { threshold: 0.35 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [expandCard]);

  const selectCategory = useCallback(
    (slug: CategorySlug) => {
      enteredRef.current = true;
      if (slug === activeSlug) {
        if (!wide || !protocolOpen) expandCard();
        return;
      }
      replayExpand(slug);
    },
    [activeSlug, expandCard, protocolOpen, replayExpand, wide],
  );

  const stepCategory = useCallback(
    (delta: number) => {
      const next =
        (activeIndex + delta + categories.length) % categories.length;
      selectCategory(categories[next].slug);
    },
    [activeIndex, categories, selectCategory],
  );

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label="Stacks"
    >
      <div
        className={[styles.stage, reduceMotion ? styles.reduceMotion : ""]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            "--cat-width-ms": `${WIDTH_MS}ms`,
            "--cat-protocol-ms": `${PROTOCOL_MS}ms`,
            "--protocol-fade": `${scrim.fadePx}px`,
            "--protocol-scrim-mid": String(scrim.mid),
            "--protocol-scrim-end": String(scrim.end),
            "--protocol-band": `${protocolBandPx}px`,
            "--chip-ink": chipInk,
          } as CSSProperties
        }
      >
        <div className={styles.card}>
          <div
            ref={notecardRef}
            className={styles.notecard}
            data-expanded={wide ? "true" : "false"}
            data-protocol={protocolOpen ? "true" : "false"}
            data-instant={instant ? "true" : "false"}
          >
            <div className={styles.notecardClip}>
              {categories.map((category) => {
                const isActive = category.slug === active.slug;
                return (
                <div
                  key={category.slug}
                  className={styles.heroLayer}
                  data-active={isActive ? "true" : "false"}
                  aria-hidden={!isActive}
                >
                  {category.heroVideo && !reduceMotion ? (
                    <video
                      key={category.heroVideo}
                      src={category.heroVideo}
                      poster={category.heroSrc}
                      muted
                      loop
                      playsInline
                      autoPlay={isActive}
                      ref={(el) => {
                        if (!el) return;
                        if (isActive) {
                          void el.play().catch(() => undefined);
                        } else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={category.heroSrc} alt="" />
                  )}
                </div>
                );
              })}
              <div className={styles.notecardScrim} aria-hidden />
            </div>

            <div className={styles.plusMarks} aria-hidden>
              {PLUS_COLUMNS_TOP.map((left) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`top-${left}`}
                  className={styles.plusMark}
                  src="/landing/plus-mark.svg"
                  alt=""
                  style={{
                    left: `${(left / FIGMA_FRAME.w) * 100}%`,
                    top: `${(PLUS_TOP / FIGMA_FRAME.h) * 100}%`,
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

            <div
              ref={protocolRef}
              className={styles.protocol}
              data-open={protocolOpen ? "true" : "false"}
              id={`${baseId}-protocol`}
              aria-hidden={!protocolOpen}
            >
              <ul className={styles.protocolGrid}>
                {active.protocol.map((item) => (
                  <li key={item.label}>
                    <div className={styles.protocolHead}>
                      <span className={styles.protocolIcon} aria-hidden>
                        {PROTOCOL_ICONS[item.label]}
                      </span>
                      <p className={styles.protocolLabel}>{item.label}</p>
                    </div>
                    <p className={styles.protocolBody}>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.copy}>
              <div className={styles.copyTop}>
                <p className={styles.eyebrow}>Prescribed by Physicians for:</p>
                <ul className={styles.chips}>
                  {active.chips.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.copyLead}>
                <h2 className={styles.title}>
                  <span>{active.titlePrimary}</span>{" "}
                  <span className={styles.titleFaded}>{active.titleFaded}</span>
                </h2>
                {active.body ? (
                  <p className={styles.body}>{active.body}</p>
                ) : null}
                <div className={styles.ctaRow}>
                  <Button
                    href={active.cta.href}
                    styleVariant="Ghost"
                    className={styles.cta}
                  >
                    {active.cta.label}
                  </Button>
                  <Button
                    href={openCareCta.href}
                    styleVariant="Ghost"
                    className={styles.ctaSecondary}
                  >
                    {openCareCta.label}
                  </Button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowPrev}`}
              aria-label="Previous treatment"
              onClick={() => stepCategory(-1)}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M10 3.5 5.5 8 10 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowNext}`}
              aria-label="Next treatment"
              onClick={() => stepCategory(1)}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M6 3.5 10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
