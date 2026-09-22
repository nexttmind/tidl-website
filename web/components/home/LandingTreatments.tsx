"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import { symptomsCta } from "@/content/clinical/entry-map";
import { landing } from "@/content/fixtures/landing";
import styles from "./LandingTreatments.module.css";

const openCareCta = symptomsCta();

type TreatmentItem = (typeof landing.treatments.items)[number];

type LandingTreatmentsProps = {
  eyebrow?: string;
  disclaimer?: string;
  items?: readonly TreatmentItem[];
  initialId?: string;
};

const lumCache = new Map<string, number>();

/** Average luminance (0–1) of the lower half — where the notecard rail sits. */
async function sampleRailLuminance(src: string): Promise<number> {
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

  const sy = img.naturalHeight * 0.55;
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

/** Brighter rails need a taller, denser top scrim behind card type. */
function cardScrimFromLuminance(lum: number) {
  const t = Math.min(1, Math.max(0, (lum - 0.15) / 0.7));
  return {
    height: `${Math.round(38 + t * 18)}%`,
    top: Number((0.55 + t * 0.28).toFixed(2)),
    mid: Number((0.28 + t * 0.22).toFixed(2)),
  };
}

type CardScrim = ReturnType<typeof cardScrimFromLuminance>;

/** Same Figma plus-mark grid as the Programs / Pen sections (1440 frame). */
const PLUS_COLUMNS = [87, 507, 927, 1347] as const;
/** Top row omits the leftmost mark — eyebrow starts there instead. */
const PLUS_COLUMNS_TOP = [507, 927, 1347] as const;
const PLUS_TOP = 40;
const FIGMA_FRAME = { w: 1440, h: 879 } as const;

function TreatmentIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.cardIcon}
      src="/landing/section-2/icons/cross.svg"
      alt=""
      width={16}
      height={16}
    />
  );
}

/**
 * Treatments Section — hims SHBento layout (hero + glass product rail),
 * without the bottom quiz/testimonial bento. Card select swaps background
 * and title / subtitle.
 */
export function LandingTreatments({
  eyebrow = landing.treatments.eyebrow,
  disclaimer = landing.treatments.disclaimer,
  items = landing.treatments.items,
  initialId = landing.treatments.initialId,
}: LandingTreatmentsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(initialId);
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const [canScrollMore, setCanScrollMore] = useState(true);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [cardScrim, setCardScrim] = useState<CardScrim>({
    height: "48%",
    top: 0.68,
    mid: 0.38,
  });
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
    captured: boolean;
  } | null>(null);
  const inertiaRef = useRef<number | null>(null);
  const springRef = useRef<number | null>(null);
  const overscrollRef = useRef(0);
  const wheelSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);
  const peekPlayedRef = useRef(false);
  const peekTimersRef = useRef<number[]>([]);

  const STOP_OVERSCROLL = 0.4;
  const RUBBER_LIMIT = 96;

  const stopInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const stopSpring = useCallback(() => {
    if (springRef.current !== null) {
      cancelAnimationFrame(springRef.current);
      springRef.current = null;
    }
  }, []);

  const applyOverscroll = useCallback((px: number) => {
    overscrollRef.current = px;
    const track = trackRef.current;
    if (track) track.style.setProperty("--overscroll", `${px}px`);
  }, []);

  /** iOS-style resistance: further past the edge, harder to pull. */
  const rubberBand = useCallback((offset: number) => {
    const sign = Math.sign(offset) || 1;
    const mag = Math.abs(offset);
    return sign * (1 - 1 / (mag / RUBBER_LIMIT + 1)) * RUBBER_LIMIT;
  }, []);

  /**
   * Spring settle back to 0. Optional initial velocity keeps the bounce
   * feeling continuous with the flick that hit the edge.
   */
  const springToRest = useCallback(
    (initialVelocity = 0) => {
      const track = trackRef.current;
      if (!track) return;
      if (reduceMotion) {
        applyOverscroll(0);
        return;
      }
      stopSpring();
      let x = overscrollRef.current;
      let v = initialVelocity;
      // Tuned for a short overshoot that reads as "pull back"
      const stiffness = 0.22;
      const damping = 0.78;

      const tick = () => {
        const force = -stiffness * x;
        v = (v + force) * damping;
        x += v;
        if (Math.abs(x) < STOP_OVERSCROLL && Math.abs(v) < STOP_OVERSCROLL) {
          applyOverscroll(0);
          springRef.current = null;
          return;
        }
        applyOverscroll(x);
        springRef.current = requestAnimationFrame(tick);
      };
      springRef.current = requestAnimationFrame(tick);
    },
    [applyOverscroll, reduceMotion, stopSpring],
  );

  /** Nudge past the edge then spring — used by arrows at ends. */
  const bounceEdge = useCallback(
    (direction: 1 | -1) => {
      if (reduceMotion) return;
      stopInertia();
      stopSpring();
      applyOverscroll(rubberBand(direction * 56));
      // Seed velocity back toward center so it springs the other way
      springToRest(-direction * 8);
    },
    [
      applyOverscroll,
      reduceMotion,
      rubberBand,
      springToRest,
      stopInertia,
      stopSpring,
    ],
  );

  useEffect(
    () => () => {
      stopInertia();
      stopSpring();
    },
    [stopInertia, stopSpring],
  );

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const active = items[activeIndex] ?? items[0];
  const railItems = items.filter((item) => item.id !== active.id);

  useEffect(() => {
    let cancelled = false;
    sampleRailLuminance(active.backgroundSrc)
      .then((lum) => {
        if (!cancelled) setCardScrim(cardScrimFromLuminance(lum));
      })
      .catch(() => {
        if (!cancelled) setCardScrim({ height: "48%", top: 0.68, mid: 0.38 });
      });
    return () => {
      cancelled = true;
    };
  }, [active.backgroundSrc]);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(motionMq.matches);
    syncMotion();
    motionMq.addEventListener("change", syncMotion);
    return () => motionMq.removeEventListener("change", syncMotion);
  }, []);

  /** One-shot peek when the rail enters view — hints horizontal overflow. */
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || reduceMotion || peekPlayedRef.current) return;

    const clearPeekTimers = () => {
      peekTimersRef.current.forEach(clearTimeout);
      peekTimersRef.current = [];
    };

    const playPeek = () => {
      if (peekPlayedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max < 24) return;
      peekPlayedRef.current = true;

      const card = cardRefs.current.find(Boolean);
      const peek = Math.min(
        Math.round((card?.offsetWidth ?? 280) * 0.42),
        Math.round(max * 0.55),
        140,
      );
      if (peek < 28) return;

      stopInertia();
      stopSpring();
      applyOverscroll(0);
      el.scrollTo({ left: 0, behavior: "auto" });

      const outward = window.setTimeout(() => {
        el.scrollTo({ left: peek, behavior: "smooth" });
      }, 180);
      const back = window.setTimeout(() => {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }, 780);
      peekTimersRef.current = [outward, back];
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        playPeek();
        io.disconnect();
      },
      { threshold: 0.42 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      clearPeekTimers();
    };
  }, [applyOverscroll, reduceMotion, stopInertia, stopSpring]);

  const syncScrollHint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const remaining = track.scrollWidth - track.scrollLeft - track.clientWidth;
    setCanScrollMore(remaining > 8);
    setCanScrollBack(track.scrollLeft > 8);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncScrollHint();
    track.addEventListener("scroll", syncScrollHint, { passive: true });
    const ro = new ResizeObserver(syncScrollHint);
    ro.observe(track);

    // Trackpad/wheel: rubber-band when already at an edge
    const onWheel = (event: WheelEvent) => {
      if (reduceMotion) return;
      const el = trackRef.current;
      if (!el) return;
      const dx =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.shiftKey
            ? event.deltaY
            : 0;
      if (!dx) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      if ((atStart && dx < 0) || (atEnd && dx > 0)) {
        event.preventDefault();
        stopSpring();
        const next = overscrollRef.current - dx * 0.35;
        applyOverscroll(rubberBand(next));
        if (wheelSettleRef.current) clearTimeout(wheelSettleRef.current);
        wheelSettleRef.current = setTimeout(() => {
          springToRest();
          wheelSettleRef.current = null;
        }, 80);
      }
    };
    track.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      track.removeEventListener("scroll", syncScrollHint);
      track.removeEventListener("wheel", onWheel);
      ro.disconnect();
      if (wheelSettleRef.current) clearTimeout(wheelSettleRef.current);
    };
  }, [
    applyOverscroll,
    items.length,
    railItems.length,
    reduceMotion,
    rubberBand,
    springToRest,
    stopSpring,
    syncScrollHint,
  ]);

  const scrollBounds = (track: HTMLDivElement) => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    return { max };
  };

  const runInertia = useCallback(
    (initialVelocity: number) => {
      const track = trackRef.current;
      if (!track || reduceMotion) {
        springToRest();
        return;
      }
      stopInertia();
      stopSpring();

      let velocity = initialVelocity;
      const friction = 0.935;
      const minVelocity = 0.4;

      const tick = () => {
        const el = trackRef.current;
        if (!el) {
          inertiaRef.current = null;
          return;
        }
        const { max } = scrollBounds(el);
        const next = el.scrollLeft + velocity;

        if (next < 0 || next > max) {
          // Convert leftover velocity into an overscroll spring bounce
          el.scrollLeft = next < 0 ? 0 : max;
          const spill = next < 0 ? next : next - max;
          applyOverscroll(rubberBand(spill + velocity * 4));
          inertiaRef.current = null;
          springToRest(-velocity * 0.45);
          return;
        }

        el.scrollLeft = next;
        velocity *= friction;
        if (Math.abs(velocity) < minVelocity) {
          inertiaRef.current = null;
          return;
        }
        inertiaRef.current = requestAnimationFrame(tick);
      };

      inertiaRef.current = requestAnimationFrame(tick);
    },
    [applyOverscroll, reduceMotion, rubberBand, springToRest, stopInertia, stopSpring],
  );

  const selectTreatment = useCallback(
    (id: string) => {
      if (id === activeId) return;
      setActiveId(id);
      const track = trackRef.current;
      if (track) {
        track.scrollTo({
          left: 0,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      }
    },
    [activeId, reduceMotion],
  );

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      peekPlayedRef.current = true;
      peekTimersRef.current.forEach(clearTimeout);
      peekTimersRef.current = [];
      stopInertia();
      const { max } = scrollBounds(track);
      const atStart = track.scrollLeft <= 8;
      const atEnd = track.scrollLeft >= max - 8;
      if ((direction < 0 && atStart) || (direction > 0 && atEnd)) {
        bounceEdge(direction);
        return;
      }
      applyOverscroll(0);
      const card = cardRefs.current.find(Boolean);
      const step = (card?.offsetWidth ?? 280) + 10;
      track.scrollBy({
        left: direction * step,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [applyOverscroll, bounceEdge, reduceMotion, stopInertia],
  );

  const onCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End" &&
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }
    event.preventDefault();
    if (event.key === "Enter" || event.key === " ") {
      selectTreatment(railItems[index].id);
      return;
    }
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % railItems.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + railItems.length) % railItems.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = railItems.length - 1;
    cardRefs.current[next]?.focus();
  };

  /* Mouse-only drag with rubber-band edges + inertia. Touch keeps native. */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    peekPlayedRef.current = true;
    peekTimersRef.current.forEach(clearTimeout);
    peekTimersRef.current = [];
    stopInertia();
    stopSpring();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
      captured: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (!drag.captured && Math.abs(delta) > 4) {
      drag.captured = true;
      drag.moved = true;
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = "true";
    }
    if (!drag.captured) return;

    const now = performance.now();
    const dt = Math.max(8, now - drag.lastT);
    const dx = event.clientX - drag.lastX;
    const instant = (-dx / dt) * 16.67;
    drag.velocity = drag.velocity * 0.7 + instant * 0.3;
    drag.lastX = event.clientX;
    drag.lastT = now;

    const { max } = scrollBounds(track);
    const desired = drag.startScroll - delta;
    if (desired < 0) {
      track.scrollLeft = 0;
      applyOverscroll(rubberBand(desired));
    } else if (desired > max) {
      track.scrollLeft = max;
      applyOverscroll(rubberBand(desired - max));
    } else {
      applyOverscroll(0);
      track.scrollLeft = desired;
    }
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    if (track) delete track.dataset.dragging;
    if (drag.moved) {
      suppressClickRef.current = true;
      if (Math.abs(overscrollRef.current) > 1) {
        springToRest(drag.velocity * 0.5);
      } else {
        runInertia(drag.velocity);
      }
    }
    dragRef.current = null;
  };

  const onCardClick = (id: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    selectTreatment(id);
  };

  return (
    <section
      ref={rootRef}
      className={[styles.root, reduceMotion ? styles.reduceMotion : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Health Goals"
    >
      <div
        className={styles.stage}
        style={
          {
            "--card-scrim-height": cardScrim.height,
            "--card-scrim-top": String(cardScrim.top),
            "--card-scrim-mid": String(cardScrim.mid),
          } as CSSProperties
        }
      >
        <div className={styles.mediaStack} aria-hidden>
          <div className={styles.bgLayer} data-active="true">
            <MarketingImage
              src={active.backgroundSrc}
              alt=""
              sizes="100vw"
              loading="eager"
            />
          </div>
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

        <div className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <div className={styles.heroCopy}>
            <p className={styles.treatmentLabel}>{active.name}</p>
            <h2 className={styles.title} id={`${baseId}-title`}>
              {active.title}
            </h2>
            <p className={styles.subtitle}>{active.lede}</p>
            <div className={styles.ctaRow}>
              <Button
                href={active.href}
                styleVariant="Ghost"
                className={styles.cta}
              >
                {`Shop ${active.name}`}
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

        <div className={styles.carouselSection}>
          <div className={styles.railHead}>
            <div className={styles.railControls}>
              <button
                type="button"
                className={styles.railBtn}
                aria-label="Scroll health goals left"
                aria-disabled={!canScrollBack}
                data-at-edge={!canScrollBack ? "true" : "false"}
                onClick={() => scrollByCard(-1)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
                className={styles.railBtn}
                aria-label="Scroll health goals right"
                aria-disabled={!canScrollMore}
                data-at-edge={!canScrollMore ? "true" : "false"}
                onClick={() => scrollByCard(1)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
          <div
            className={styles.carouselShell}
            data-more={canScrollMore ? "true" : "false"}
          >
            <div
              ref={trackRef}
              className={`${styles.track} hide-scrollbar`}
              role="list"
              aria-label="Other health goals"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {railItems.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                      cardRefs.current.length = railItems.length;
                    }}
                    role="listitem"
                    id={`${baseId}-card-${item.id}`}
                    tabIndex={index === 0 ? 0 : -1}
                    className={styles.card}
                    onClick={() => onCardClick(item.id)}
                    onFocus={() => {
                      cardRefs.current.forEach((card, i) => {
                        if (card) card.tabIndex = i === index ? 0 : -1;
                      });
                    }}
                    onKeyDown={(e) => onCardKeyDown(e, index)}
                  >
                    <div className={styles.cardScrim} aria-hidden />
                    <div className={styles.cardTop}>
                      <div className={styles.cardHead}>
                        <TreatmentIcon />
                        <h3 className={styles.cardName}>{item.name}</h3>
                      </div>
                      <p className={styles.cardBody}>{item.subtitle}</p>
                    </div>
                    <div className={styles.cardMedia}>
                      <MarketingImage
                        src={item.cardMediaSrc}
                        alt=""
                        className={styles.cardMediaImg}
                        sizes="(width < 721px) 40vw, 160px"
                      />
                      <div
                        className={styles.cardCtaWrap}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          href={item.href}
                          styleVariant="Ghost"
                          className={styles.cardCta}
                        >
                          {`Shop ${item.name}`}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className={styles.disclaimer}>{disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
