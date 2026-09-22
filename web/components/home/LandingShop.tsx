"use client";

import { useEffect, useRef, useState } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { themeField, type ThemeId } from "@/content/brand/peptide-identity";
import {
  SHOP_PLATES,
  ShopBloomPair,
  bloomSeatScale,
  bloomStyle,
} from "./ShopBloomPair";
import styles from "./LandingShop.module.css";

/** Goal framed shop routes. No molecule names in the CTA. */
const SHOP_HREF: Readonly<Record<ThemeId, string>> = {
  creative: "/programs/creators-and-builders",
  transformation: "/stacks/transformation",
  "mens-health": "/treatments/mens-health",
  traveler: "/programs/travelers",
  "weight-loss": "/treatments/weight-loss",
  executive: "/programs/ceos-and-executives",
  athlete: "/programs/athletes",
  parents: "/programs/parents",
  legacy: "/programs/healthspan",
  "recovery-performance": "/treatments/recovery-and-performance",
  "womens-balance": "/treatments/womens-balance",
  "sexual-health": "/treatments/sexual-health",
  "skin-hair": "/treatments/skin-and-hair",
};

const AUTO_PX_PER_SEC = 56;
const LOOP_COPIES = 2;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

type PlantPose = {
  vialO: number;
  vialY: number;
  vialS: number;
  vialR: number;
  bloomO: number;
  bloomS: number;
};

const APEX_Y = -8;
const APEX_S = 1.08;
const APEX_R = -7;
const APEX_BLOOM_MULT = 1.32;
const APEX_AT = 0.2;
const FLOURISH_MS = 2800;
const CENTER_BAND = 0.28;
const SEAT_OVERSCAN = 1.15;
const SEAT_MIN = 0.86;
const SEAT_MAX = 1.32;

const IDLE: PlantPose = {
  vialO: 1,
  vialY: 0,
  vialS: 1,
  vialR: 0,
  bloomO: 0,
  bloomS: 0.88,
};

function seatedPose(seat: number): PlantPose {
  return {
    vialO: 1,
    vialY: 0,
    vialS: 1,
    vialR: 0,
    bloomO: 1,
    bloomS: seat,
  };
}

/** Sharp pop at center, then ease down to a seated bloom that stays. */
function flourishPose(p: number, seat: number): PlantPose {
  const t = clamp01(p);
  const apex = seat * APEX_BLOOM_MULT;
  if (t <= APEX_AT) {
    const u = easeOut(t / APEX_AT);
    return {
      vialO: 1,
      vialY: APEX_Y * u,
      vialS: 1 + (APEX_S - 1) * u,
      vialR: APEX_R * u,
      bloomO: u,
      bloomS: IDLE.bloomS + (apex - IDLE.bloomS) * u,
    };
  }
  const u = easeOut((t - APEX_AT) / (1 - APEX_AT));
  return {
    vialO: 1,
    vialY: APEX_Y * (1 - u),
    vialS: APEX_S + (1 - APEX_S) * u,
    vialR: APEX_R * (1 - u),
    bloomO: 1,
    bloomS: apex + (seat - apex) * u,
  };
}

function applyEnterPose(card: HTMLElement, pose: PlantPose) {
  card.style.setProperty("--plant-o", pose.vialO.toFixed(3));
  card.style.setProperty("--plant-y", `${pose.vialY.toFixed(2)}px`);
  card.style.setProperty("--plant-s", pose.vialS.toFixed(3));
  card.style.setProperty("--plant-r", `${pose.vialR.toFixed(2)}deg`);
  card.style.setProperty("--bloom-o", pose.bloomO.toFixed(3));
  card.style.setProperty("--bloom-s", pose.bloomS.toFixed(3));
}
const DRAG_SLOP_PX = 10;

export function LandingShop() {
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const [swayOk, setSwayOk] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: number;
    moved: boolean;
  } | null>(null);
  const ignoreClickRef = useRef(false);
  const syncOffsetRef = useRef((_updater: number | ((n: number) => number)) => {});
  const [hotKeys, setHotKeys] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        SHOP_PLATES.slice(0, 4).map((plate) => `0-${plate.id}`),
      ),
  );

  const jumpBy = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const step =
      track.querySelector<HTMLElement>(`.${styles.card}`)?.offsetWidth ?? 330;
    syncOffsetRef.current((n) => n + dir * (step + 45));
  };

  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(width < 1025px)");
    const sync = () =>
      setSwayOk(desktop.matches && !reduce.matches && !compact.matches);
    sync();
    desktop.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    compact.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      compact.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const rail = railRef.current;
    if (!root || !track || !rail) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let loopWidth = 0;

    const measureLoop = () => {
      const cards = rail.querySelectorAll<HTMLElement>(`.${styles.card}`);
      const count = SHOP_PLATES.length;
      if (cards.length < count * 2) return 0;
      const first = cards[0];
      const next = cards[count];
      if (!first || !next) return 0;
      return next.offsetLeft - first.offsetLeft;
    };

    const refreshLoop = () => {
      loopWidth = measureLoop();
    };

    const wrapOffset = (value: number) => {
      if (loopWidth <= 0) refreshLoop();
      if (loopWidth <= 0) return value;
      const wrapped = value % loopWidth;
      return wrapped < 0 ? wrapped + loopWidth : wrapped;
    };

    const apply = () => {
      rail.style.setProperty("--rail-x", `${-offsetRef.current}px`);
    };

    const flourishStarted = new WeakMap<HTMLElement, number>();
    const seatCache = new WeakMap<HTMLElement, number>();

    const fallbackSeat = (card: HTMLElement) => {
      const id = card.dataset.bloom as ThemeId | undefined;
      if (!id) return 1.06;
      const plate = SHOP_PLATES.find((item) => item.id === id);
      return plate ? bloomSeatScale(id, plate.bloom) : 1.06;
    };

    const measureSeat = (card: HTMLElement) => {
      const plateEl = card.querySelector<HTMLElement>(`.${styles.plate}`);
      const stageEl = card.querySelector<HTMLElement>(`.${styles.bloomStage}`);
      if (!plateEl || !stageEl) return null;
      const plateBox = plateEl.getBoundingClientRect();
      const stageBox = stageEl.getBoundingClientRect();
      if (plateBox.width < 8 || stageBox.width < 8) return null;
      const raw = Number.parseFloat(card.style.getPropertyValue("--bloom-s"));
      const current = Number.isFinite(raw) && raw > 0.05 ? raw : 0.88;
      const natW = stageBox.width / current;
      const natH = stageBox.height / current;
      if (natW < 8 || natH < 8) return null;
      const seat =
        Math.min(plateBox.width / natW, plateBox.height / natH) * SEAT_OVERSCAN;
      return Math.max(SEAT_MIN, Math.min(SEAT_MAX, seat));
    };

    const seatOf = (card: HTMLElement) => {
      const cached = seatCache.get(card);
      if (cached !== undefined) return cached;
      const measured = measureSeat(card);
      if (measured === null) return fallbackSeat(card);
      seatCache.set(card, measured);
      return measured;
    };

    const syncBlooms = () => {
      const trackBox = track.getBoundingClientRect();
      const screenCenter = window.innerWidth / 2;
      const cards = rail.querySelectorAll<HTMLElement>(`.${styles.card}`);
      const now = performance.now();
      const pad = track.clientWidth + 80;

      let closest: HTMLElement | null = null;
      let closestDist = Infinity;
      const boxes = new Map<HTMLElement, DOMRect>();
      for (const card of cards) {
        const approx = card.offsetLeft - offsetRef.current;
        if (approx + card.offsetWidth < -pad || approx > track.clientWidth + pad) {
          continue;
        }
        const box = card.getBoundingClientRect();
        boxes.set(card, box);
        const dist = Math.abs((box.left + box.right) / 2 - screenCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = card;
        }
      }

      for (const card of cards) {
        const box = boxes.get(card);
        if (!box) {
          if (card.dataset.bloomed) delete card.dataset.bloomed;
          flourishStarted.delete(card);
          applyEnterPose(card, IDLE);
          continue;
        }
        const fullyOut = box.right < trackBox.left || box.left > trackBox.right;
        const seat = seatOf(card);

        if (fullyOut) {
          if (card.dataset.bloomed) delete card.dataset.bloomed;
          flourishStarted.delete(card);
          applyEnterPose(card, IDLE);
          continue;
        }

        if (reduceMotion) {
          card.dataset.bloomed = "true";
          applyEnterPose(card, seatedPose(seat));
          continue;
        }

        if (card.dataset.bloomed === "true") {
          applyEnterPose(card, seatedPose(seat));
          continue;
        }

        const started = flourishStarted.get(card);
        if (started !== undefined) {
          const s = clamp01((now - started) / FLOURISH_MS);
          applyEnterPose(card, flourishPose(s, seat));
          if (s >= 1) card.dataset.bloomed = "true";
          continue;
        }

        const inCenter =
          card === closest && closestDist <= box.width * CENTER_BAND;
        if (inCenter) {
          flourishStarted.set(card, now);
          applyEnterPose(card, flourishPose(0, seat));
          continue;
        }

        applyEnterPose(card, IDLE);
      }
    };

    const setOffset = (updater: number | ((n: number) => number)) => {
      const next = typeof updater === "function" ? updater(offsetRef.current) : updater;
      offsetRef.current = wrapOffset(next);
      apply();
      syncBlooms();
    };

    syncOffsetRef.current = setOffset;

    let visible = false;
    let touching = false;
    let raf = 0;
    let last = 0;

    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
      last = performance.now();
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd);
    track.addEventListener("touchcancel", onTouchEnd);

    const tick = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(tick);

      if (document.hidden) {
        last = now;
        return;
      }

      if (reduceMotion || dragRef.current || touching) {
        last = now;
        syncBlooms();
        return;
      }

      if (loopWidth <= 0) refreshLoop();
      if (loopWidth <= 0) {
        last = now;
        return;
      }

      const dt = Math.min(now - last, 48);
      last = now;
      setOffset((n) => n + AUTO_PX_PER_SEC * (dt / 1000));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible) {
          last = performance.now();
          if (!raf) raf = window.requestAnimationFrame(tick);
        } else if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );

    io.observe(root);

    const hotIo = new IntersectionObserver(
      (entries) => {
        setHotKeys((current) => {
          let changed = false;
          const next = new Set(current);
          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.shopCard;
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
      { root: track, rootMargin: "0px 80% 0px 80%", threshold: 0 },
    );
    rail.querySelectorAll<HTMLElement>("[data-shop-card]").forEach((card) => {
      hotIo.observe(card);
    });

    refreshLoop();
    apply();
    syncBlooms();

    const ro = new ResizeObserver(() => {
      refreshLoop();
      rail.querySelectorAll<HTMLElement>(`.${styles.card}`).forEach((card) => {
        seatCache.delete(card);
      });
      setOffset(offsetRef.current);
    });
    ro.observe(track);
    ro.observe(rail);

    const onVisibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      syncOffsetRef.current = () => {};
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
      hotIo.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.root}>
      {swayOk ? (
      <svg className={styles.swayFilter} aria-hidden>
        <defs>
          <filter
            id="tidl-shop-bloom-sway"
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.02"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feOffset in="noise" dx="0" dy="0" result="drift">
              <animate
                attributeName="dx"
                dur="16s"
                repeatCount="indefinite"
                values="0;52;0;-40;0"
              />
              <animate
                attributeName="dy"
                dur="22s"
                repeatCount="indefinite"
                values="0;22;8;-18;0"
              />
            </feOffset>
            <feDisplacementMap
              in="SourceGraphic"
              in2="drift"
              scale="11"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      ) : null}
      <div className={styles.inner}>
        <div className={styles.notecard}>
          <div
            ref={trackRef}
            className={styles.track}
            tabIndex={0}
            aria-label="Treatment fields"
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              ignoreClickRef.current = false;
              dragRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                startOffset: offsetRef.current,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              const track = trackRef.current;
              if (!drag || drag.pointerId !== event.pointerId || !track) return;
              const dx = drag.startX - event.clientX;
              const dy = drag.startY - event.clientY;
              if (Math.hypot(dx, dy) > DRAG_SLOP_PX) drag.moved = true;
              if (!drag.moved || Math.abs(dx) < Math.abs(dy)) return;
              if (!track.hasPointerCapture(event.pointerId)) {
                track.setPointerCapture(event.pointerId);
              }
              event.preventDefault();
              track.dataset.dragging = "true";
              syncOffsetRef.current(drag.startOffset + dx);
            }}
            onPointerUp={(event) => {
              const track = trackRef.current;
              ignoreClickRef.current = !!dragRef.current?.moved;
              if (track?.hasPointerCapture(event.pointerId)) {
                track.releasePointerCapture(event.pointerId);
              }
              dragRef.current = null;
              if (track) delete track.dataset.dragging;
            }}
            onPointerCancel={(event) => {
              const track = trackRef.current;
              ignoreClickRef.current = false;
              if (track?.hasPointerCapture(event.pointerId)) {
                track.releasePointerCapture(event.pointerId);
              }
              dragRef.current = null;
              if (track) delete track.dataset.dragging;
            }}
            onClick={(event) => {
              if (!ignoreClickRef.current) return;
              event.preventDefault();
              ignoreClickRef.current = false;
            }}
            onKeyDown={(event) => {
              const track = trackRef.current;
              if (!track) return;
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                jumpBy(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            <div ref={railRef} className={styles.rail}>
            {Array.from({ length: LOOP_COPIES }, (_, copy) =>
              SHOP_PLATES.map(({ id, plateSrc, vialSrc, bloomSrc, bloom }, plateIndex) => (
              <a
                key={`${copy}-${id}`}
                className={styles.card}
                href={SHOP_HREF[id]}
                data-bloom={id}
                data-shop-card={`${copy}-${id}`}
                style={bloomStyle(bloom)}
                aria-hidden={copy === 1 ? true : undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                draggable={false}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  if (dragRef.current?.moved) return;
                  const href = event.currentTarget.href;
                  if (!href) return;
                  window.location.assign(href);
                }}
                onClick={(event) => {
                  if (!ignoreClickRef.current) return;
                  event.preventDefault();
                  ignoreClickRef.current = false;
                }}
              >
                {hotKeys.has(`${copy}-${id}`) ? (
                  <div className={styles.plate}>
                    <MarketingImage
                      className={styles.plateImg}
                      src={plateSrc}
                      alt=""
                      sizes="(width < 721px) 70vw, (width < 1025px) 40vw, 260px"
                      loading={copy === 0 && plateIndex < 3 ? "eager" : "lazy"}
                    />
                  </div>
                ) : (
                  <div className={styles.plate} />
                )}
                <ShopBloomPair
                  vialSrc={vialSrc}
                  bloomSrc={bloomSrc}
                  sway={swayOk && id === "creative"}
                  loading={copy === 0 && plateIndex < 3 ? "eager" : "lazy"}
                  active={hotKeys.has(`${copy}-${id}`)}
                />
                <span className={styles.shopCta}>
                  <span className={styles.shopCtaBtn}>
                    {`Shop ${themeField(id).label}`}
                  </span>
                </span>
              </a>
              )),
            )}
            </div>
          </div>
          <button
            type="button"
            className={`${styles.jump} ${styles.jumpLeft}`}
            aria-label="Show previous vials"
            onClick={() => jumpBy(-1)}
            onPointerDown={(event) => event.stopPropagation()}
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
            className={`${styles.jump} ${styles.jumpRight}`}
            aria-label="Show more vials"
            onClick={() => jumpBy(1)}
            onPointerDown={(event) => event.stopPropagation()}
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
    </section>
  );
}
