"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { menuTapStartsBarrage } from "@/components/chrome/MenuBarrage";
import { playMenuBarrage } from "@/components/chrome/menu-barrage-session";
import { MarketingImage } from "@/components/media/MarketingImage";
import { optEntry, optImgSrc, splitMediaSrc, srcset } from "@/lib/media/opt-manifest";
import { FALLBACK_INK, sampleImageInk } from "@/lib/media/sample-ink";
import { ShopBloomPair, bloomStyle } from "./ShopBloomPair";
import type { ShopCatalogItem, ShopKind } from "./shop-catalog";
import styles from "./LandingShop.module.css";

const AUTO_PX_PER_SEC = 56;
const LOOP_COPIES = 2;
/** Keep each transformed strip under the iOS texture limit. */
const CHUNK_CARDS = 3;
/** How long a flick takes to ease back into the slow drift. */
const COAST_TAU_MS = 680;
const COAST_MAX_PX_PER_SEC = 2400;
const COAST_SETTLE_PX_PER_SEC = 6;
const PLATE_SIZES = "(width < 721px) 72vw, (width < 1025px) 48vw, 380px";
const BLOOM_SIZES = "(width < 721px) 80vw, (width < 1025px) 56vw, 440px";
const VIAL_SIZES = "(width < 721px) 72vw, (width < 1025px) 48vw, 320px";

/** Decoded bitmaps, kept for the life of the page so a remount paints from memory. */
const shopBitmaps = new Map<string, HTMLImageElement>();

function warmShopBitmap(src: string, sizes: string): Promise<void> {
  const key = `${sizes}\n${src}`;
  const existing = shopBitmaps.get(key);
  if (existing) {
    if (existing.complete && existing.naturalWidth > 0) return Promise.resolve();
    return existing.decode().then(
      () => undefined,
      () => undefined,
    );
  }
  const img = new Image();
  shopBitmaps.set(key, img);
  const { query } = splitMediaSrc(src);
  const entry = optEntry(src);
  const webp = entry?.webp ?? [];
  const raster = entry?.raster ?? [];
  if (webp.length > 0) {
    img.sizes = sizes;
    img.srcset = srcset(webp, query);
  } else if (raster.length > 0) {
    img.sizes = sizes;
    img.srcset = srcset(raster, query);
  } else {
    img.src = optImgSrc(src, 800);
  }
  return img.decode().then(
    () => undefined,
    () => undefined,
  );
}

const CENTER_BAND = 0.28;

function chunkItems<T>(list: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
const DRAG_SLOP_PX = 10;

function shopCtaLabel(kind: ShopKind, label: string) {
  return `Shop ${label}${
    kind === "bundle" ? " Bundle" : kind === "treatment" ? " Treatments" : ""
  }`;
}

function ShopCta({ ink, children }: { ink: string; children: string }) {
  return (
    <span className={styles.shopCta}>
      <span
        className={styles.shopCtaBtn}
        style={{ "--cta-ink": ink } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

export function ShopVialRail({
  items,
  onPick,
  enableSway = true,
  fixedCards = false,
  ariaLabel = "Treatment fields",
}: {
  items: readonly ShopCatalogItem[];
  onPick?: (id: string) => void;
  enableSway?: boolean;
  fixedCards?: boolean;
  ariaLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
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
    axis: "x" | "y" | null;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);
  const coastRef = useRef<number | null>(null);
  const compactRef = useRef(false);
  const ignoreClickRef = useRef(false);
  const barrageFromPointerRef = useRef(false);
  const router = useRouter();
  const syncOffsetRef = useRef((_updater: number | ((n: number) => number)) => {});
  const [hotKeys, setHotKeys] = useState<ReadonlySet<string>>(
    () =>
      new Set(items.slice(0, 4).map((plate) => `0-${plate.id}`)),
  );
  const [railNear, setRailNear] = useState(false);
  const [shown, setShown] = useState(false);
  const [inkBySrc, setInkBySrc] = useState<Record<string, string>>({});

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setRailNear(Boolean(entry?.isIntersecting)),
      { rootMargin: "360px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (railNear) setShown(true);
  }, [railNear]);

  useEffect(() => {
    if (!railNear) return;
    let cancelled = false;
    const warm = async () => {
      const windowItems = items.slice(0, 4);
      await Promise.all(
        windowItems.map((item) =>
          Promise.all([
            warmShopBitmap(item.plateSrc, PLATE_SIZES),
            warmShopBitmap(item.vialSrc, VIAL_SIZES),
            warmShopBitmap(item.bloomSrc, BLOOM_SIZES),
          ]),
        ),
      );
      if (cancelled) return;
    };
    let idle = 0;
    let timer = 0;
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(() => void warm(), { timeout: 800 });
    } else {
      timer = window.setTimeout(() => void warm(), 400);
    }
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [items, railNear]);

  useEffect(() => {
    if (!railNear) return;
    let cancelled = false;
    const unique = [...new Set(items.map((item) => item.plateSrc))];
    if (unique.length === 0) return;
    Promise.all(
      unique.map(async (src) => {
        try {
          return [src, await sampleImageInk(optImgSrc(src, 512))] as const;
        } catch {
          return [src, FALLBACK_INK] as const;
        }
      }),
    ).then((pairs) => {
      if (!cancelled) {
        setInkBySrc((current) => ({ ...current, ...Object.fromEntries(pairs) }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items, railNear]);

  const jumpBy = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [
      ...track.querySelectorAll<HTMLElement>(`.${styles.card}`),
    ];
    if (cards.length < 2) return;
    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let current = 0;
    let closest = Infinity;
    for (let i = 0; i < cards.length; i += 1) {
      const box = cards[i].getBoundingClientRect();
      const dist = Math.abs((box.left + box.right) / 2 - mid);
      if (dist < closest) {
        closest = dist;
        current = i;
      }
    }
    const target = cards[current + dir];
    if (!target) return;
    const here = cards[current].getBoundingClientRect();
    const next = target.getBoundingClientRect();
    syncOffsetRef.current(
      (n) => n + ((next.left + next.right) / 2 - (here.left + here.right) / 2),
    );
  };

  useEffect(() => {
    if (!enableSway) {
      setSwayOk(false);
      return;
    }
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
  }, [enableSway]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const rail = railRef.current;
    if (!root || !track || !rail) return;

    offsetRef.current = 0;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const compactMq = window.matchMedia("(width < 1025px)");
    const syncCompact = () => {
      compactRef.current = compactMq.matches;
      if (!compactMq.matches) coastRef.current = null;
    };
    syncCompact();
    compactMq.addEventListener("change", syncCompact);

    const count = items.length;
    let loopWidth = 0;

    const layoutLeft = (el: HTMLElement) => {
      const parent = el.offsetParent as HTMLElement | null;
      if (parent && parent !== rail && rail.contains(parent)) {
        return parent.offsetLeft + el.offsetLeft;
      }
      return el.offsetLeft;
    };

    const measureLoop = () => {
      const cards = rail.querySelectorAll<HTMLElement>(`.${styles.card}`);
      if (cards.length < count * 2) return 0;
      const first = cards[0];
      const next = cards[count];
      if (!first || !next) return 0;
      return layoutLeft(next) - layoutLeft(first);
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
      const x = `translate3d(${-offsetRef.current}px, 0, 0)`;
      const chunks = rail.querySelectorAll<HTMLElement>("[data-rail-chunk]");
      for (const chunk of chunks) chunk.style.transform = x;
    };

    const flourishCleanup = new WeakMap<HTMLElement, () => void>();

    const clearCard = (card: HTMLElement) => {
      flourishCleanup.get(card)?.();
      flourishCleanup.delete(card);
      delete card.dataset.flourish;
      delete card.dataset.bloomed;
    };

    const seatCard = (card: HTMLElement) => {
      if (card.dataset.bloomed === "true" || card.dataset.flourish === "1") return;
      if (reduceMotion) {
        card.dataset.bloomed = "true";
        return;
      }
      const onEnd = (event: AnimationEvent) => {
        if (!event.animationName.includes("bloom")) return;
        card.dataset.bloomed = "true";
        delete card.dataset.flourish;
        card.removeEventListener("animationend", onEnd);
        flourishCleanup.delete(card);
      };
      card.addEventListener("animationend", onEnd);
      flourishCleanup.set(card, () =>
        card.removeEventListener("animationend", onEnd),
      );
      card.dataset.flourish = "1";
    };

    let bloomAt = 0;
    const syncBlooms = () => {
      if (!compactRef.current) return;
      const now = performance.now();
      if (now - bloomAt < 120) return;
      bloomAt = now;
      const screenCenter = window.innerWidth / 2;
      const trackBox = track.getBoundingClientRect();
      const cards = rail.querySelectorAll<HTMLElement>(`.${styles.card}`);
      let closest: HTMLElement | null = null;
      let closestDist = Infinity;
      let closestWidth = 0;
      for (const card of cards) {
        const box = card.getBoundingClientRect();
        if (box.right < trackBox.left - 80 || box.left > trackBox.right + 80) {
          if (card.dataset.bloomed || card.dataset.flourish) clearCard(card);
          continue;
        }
        if (box.right < trackBox.left || box.left > trackBox.right) {
          if (card.dataset.bloomed || card.dataset.flourish) clearCard(card);
          continue;
        }
        const dist = Math.abs((box.left + box.right) / 2 - screenCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = card;
          closestWidth = box.width;
        }
      }
      if (closest && closestDist <= closestWidth * CENTER_BAND) {
        seatCard(closest);
      }
    };

    const setOffset = (updater: number | ((n: number) => number)) => {
      const next =
        typeof updater === "function" ? updater(offsetRef.current) : updater;
      offsetRef.current = wrapOffset(next);
      apply();
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

    const onTouchMove = (event: TouchEvent) => {
      const drag = dragRef.current;
      const touch = event.touches[0];
      if (!drag || !touch) return;
      const dx = drag.startX - touch.clientX;
      const dy = drag.startY - touch.clientY;
      if (!drag.axis) {
        if (Math.hypot(dx, dy) < DRAG_SLOP_PX) return;
        drag.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      }
      if (drag.axis === "x" && event.cancelable) event.preventDefault();
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: false });
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
        apply();
        syncBlooms();
        return;
      }

      const coast = compactRef.current ? coastRef.current : null;
      if (coast !== null) {
        const dt = Math.min(now - last, 48);
        last = now;
        setOffset((n) => n + coast * (dt / 1000));
        const decayed =
          AUTO_PX_PER_SEC +
          (coast - AUTO_PX_PER_SEC) * Math.exp(-dt / COAST_TAU_MS);
        coastRef.current =
          Math.abs(decayed - AUTO_PX_PER_SEC) < COAST_SETTLE_PX_PER_SEC
            ? null
            : decayed;
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
      syncBlooms();
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
            if (entry.isIntersecting && !next.has(key)) {
              next.add(key);
              changed = true;
            }
          }
          return changed ? next : current;
        });
      },
      { root: track, rootMargin: "0px 360px 0px 360px", threshold: 0 },
    );
    rail.querySelectorAll<HTMLElement>("[data-shop-card]").forEach((card) => {
      hotIo.observe(card);
    });

    refreshLoop();
    apply();
    syncBlooms();

    const ro = new ResizeObserver(() => {
      refreshLoop();
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
      compactMq.removeEventListener("change", syncCompact);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
      hotIo.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <div
      ref={rootRef}
      className={
        fixedCards ? `${styles.railShell} ${styles.cardFixed}` : styles.railShell
      }
    >
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
      <div
        ref={trackRef}
        className={styles.track}
        data-shop-track=""
        tabIndex={0}
        aria-label={ariaLabel}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          ignoreClickRef.current = false;
          coastRef.current = null;
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startOffset: offsetRef.current,
            moved: false,
            axis: null,
            lastX: event.clientX,
            lastT: performance.now(),
            velocity: 0,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          const track = trackRef.current;
          if (!drag || drag.pointerId !== event.pointerId || !track) return;
          const dx = drag.startX - event.clientX;
          const dy = drag.startY - event.clientY;
          if (!drag.axis) {
            if (Math.hypot(dx, dy) <= DRAG_SLOP_PX) return;
            drag.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
            drag.moved = drag.axis === "x";
            drag.lastX = event.clientX;
            drag.lastT = performance.now();
            drag.velocity = 0;
          }
          if (drag.axis !== "x") return;
          if (!track.hasPointerCapture(event.pointerId)) {
            try {
              track.setPointerCapture(event.pointerId);
            } catch {
              /* Capture can fail if the pointer already ended. Keep tracking. */
            }
          }
          track.dataset.dragging = "true";
          const now = performance.now();
          const stepX = event.clientX - drag.lastX;
          const dt = Math.max(8, now - drag.lastT);
          const instant = (-stepX / dt) * 1000;
          drag.velocity = drag.velocity * 0.62 + instant * 0.38;
          drag.lastX = event.clientX;
          drag.lastT = now;
          syncOffsetRef.current(drag.startOffset + dx);
        }}
        onPointerUp={(event) => {
          const track = trackRef.current;
          const drag = dragRef.current;
          ignoreClickRef.current = !!drag?.moved;
          if (
            drag &&
            drag.pointerId === event.pointerId &&
            drag.axis === "x" &&
            compactRef.current &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            const idle = performance.now() - drag.lastT;
            const releaseV = idle > 90 ? 0 : drag.velocity;
            coastRef.current = Math.max(
              -COAST_MAX_PX_PER_SEC,
              Math.min(COAST_MAX_PX_PER_SEC, releaseV),
            );
          }
          if (track?.hasPointerCapture(event.pointerId)) {
            track.releasePointerCapture(event.pointerId);
          }
          dragRef.current = null;
          if (track) delete track.dataset.dragging;
        }}
        onPointerCancel={(event) => {
          const track = trackRef.current;
          const drag = dragRef.current;
          ignoreClickRef.current = !!drag?.moved;
          if (
            drag &&
            drag.pointerId === event.pointerId &&
            drag.axis === "x" &&
            compactRef.current &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            const idle = performance.now() - drag.lastT;
            const releaseV = idle > 90 ? 0 : drag.velocity;
            coastRef.current = Math.max(
              -COAST_MAX_PX_PER_SEC,
              Math.min(COAST_MAX_PX_PER_SEC, releaseV),
            );
          }
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
            chunkItems(items, CHUNK_CARDS).map((group, groupIndex) => (
            <div
              key={`${copy}-c${groupIndex}`}
              className={styles.railChunk}
              data-rail-chunk=""
            >
            {group.map(({ id, kind, label, href, plateSrc, vialSrc, bloomSrc, bloom }, plateIndex) => {
              const index = groupIndex * CHUNK_CARDS + plateIndex;
              return (
              <a
                key={`${copy}-${id}`}
                className={styles.card}
                href={href}
                data-bloom={id}
                data-kind={kind}
                data-shop-card={`${copy}-${id}`}
                style={bloomStyle(bloom)}
                aria-hidden={copy === 1 ? true : undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                draggable={false}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  if (dragRef.current?.moved) return;
                  if (onPick) {
                    onPick(id);
                    return;
                  }
                  if (menuTapStartsBarrage(id, event)) {
                    event.preventDefault();
                    barrageFromPointerRef.current = true;
                    playMenuBarrage(router, id, href);
                    return;
                  }
                  const next = event.currentTarget.href;
                  if (!next) return;
                  window.location.assign(next);
                }}
                onClick={(event) => {
                  if (barrageFromPointerRef.current) {
                    event.preventDefault();
                    barrageFromPointerRef.current = false;
                    return;
                  }
                  if (ignoreClickRef.current) {
                    event.preventDefault();
                    ignoreClickRef.current = false;
                    return;
                  }
                  if (onPick) {
                    event.preventDefault();
                    onPick(id);
                    return;
                  }
                  if (!menuTapStartsBarrage(id, event)) return;
                  event.preventDefault();
                  playMenuBarrage(router, id, href);
                }}
              >
                {shown && hotKeys.has(`${copy}-${id}`) ? (
                  <div className={styles.plate}>
                    <MarketingImage
                      className={styles.plateImg}
                      src={plateSrc}
                      alt=""
                      sizes={PLATE_SIZES}
                      loading="eager"
                      fetchPriority={
                        copy === 0 && index < 4 ? "high" : "low"
                      }
                    />
                  </div>
                ) : (
                  <div className={styles.plate} />
                )}
                <ShopBloomPair
                  vialSrc={vialSrc}
                  bloomSrc={bloomSrc}
                  sway={swayOk && railNear && id === "tirzepatide"}
                  loading="eager"
                  fetchPriority={copy === 0 && index < 4 ? "high" : "low"}
                  active={shown && hotKeys.has(`${copy}-${id}`)}
                  sizes={BLOOM_SIZES}
                  vialSizes={VIAL_SIZES}
                />
                <ShopCta ink={inkBySrc[plateSrc] ?? FALLBACK_INK}>
                  {shopCtaLabel(kind, label)}
                </ShopCta>
              </a>
            );
            })}
            </div>
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
  );
}
