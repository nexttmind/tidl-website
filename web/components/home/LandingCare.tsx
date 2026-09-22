"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { useRouter } from "next/navigation";
import type { ThemeId } from "@/content/brand/peptide-identity";
import { MarketingImage } from "@/components/media/MarketingImage";
import { bloomStyle, shopPlate, SHOP_PLATES } from "./shop-plates";
import styles from "./LandingCare.module.css";

export type CareArea = {
  id: string;
  label: string;
  href: string;
  icon:
    | "spark"
    | "clock"
    | "bolt"
    | "heart"
    | "nodes"
    | "moon"
    | "leaf"
    | "target"
    | "move";
  /** Isolated vial or product still. Used on the compact ring. */
  mediaSrc?: string;
};

export type CareProvider = {
  id: string;
  name: string;
  initials: string;
  /** Links fixture providers to a preferred care area when that area is selected. */
  areaId: string;
  avatarSrc: string;
  href: string;
};

type LandingCareProps = {
  title: string;
  body: string;
  areas: readonly CareArea[];
  providers: readonly CareProvider[];
  ringTreatments?: readonly CareArea[];
  ringProviders?: readonly CareProvider[];
  initialAreaId?: string;
};

/** Scout revolver fallback. Compact uses count * 2 so sides stay opposite. */
const RING_SLOTS = 10;

function compactSlots(count?: number) {
  return Math.max(count ?? RING_SLOTS / 2, 1) * 2;
}

/** Item row height including gap — keep in sync with CSS --dial-item. */
const ITEM_H = 46;
/** Time between auto advances. */
const CYCLE_MS = 2200;
/** Compact Scout orbit period. */
const ORBIT_MS = 26000;
/** Sharp attack into 12 o'clock. Treatment fade runs to 6; physician fade to 3. */
const BLOOM_ATTACK_DEG = 16;
const PHYSICIAN_FADE_DEG = 90;

function bloomPop(worldDeg: number, fadeDeg = 180) {
  const n = ((worldDeg % 360) + 360) % 360;
  if (n === 0) return 1;
  if (n <= fadeDeg) return 1 - n / fadeDeg;
  const toTop = 360 - n;
  if (toTop >= BLOOM_ATTACK_DEG) return 0;
  const lobe = Math.cos((toTop / BLOOM_ATTACK_DEG) * (Math.PI / 2));
  return lobe ** 5;
}
/** Track / ring slide duration — keep under CYCLE_MS. */
const TRANSITION_MS = 380;
/** Match-lock pulse after the slide settles. */
const MATCH_MS = 720;

const ICONS: Record<CareArea["icon"], ReactNode> = {
  spark: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12a8 8 0 1 1 8 8" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 3l-6 8h5l-2 10 8-11h-5l2-7z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21c5-3 8-7 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 4 3 8 8 11z" />
    </svg>
  ),
  nodes: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="8" r="2.5" />
      <circle cx="17" cy="8" r="2.5" />
      <circle cx="12" cy="16" r="2.5" />
      <path d="M9 9l2 5M15 9l-2 5" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5z" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 19c8-1 12-6 14-14-8 2-13 6-14 14z" />
      <path d="M5 19c2-4 5-7 9-9" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  move: (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
    </svg>
  ),
};

function ringBloomPlate(id: string) {
  return SHOP_PLATES.some((plate) => plate.id === id)
    ? shopPlate(id as ThemeId)
    : null;
}

/** Category bloom seated behind the compact-ring vial or pill. Hidden on desktop. */
function AreaBloom({ id }: { id: string }) {
  const plate = ringBloomPlate(id);
  if (!plate) return null;
  return (
    <span className={styles.areaBloom} style={bloomStyle(plate.bloom)} aria-hidden>
      <span className={styles.bloomStage}>
        <span className={styles.bloomSlot}>
          <span className={styles.bloomPair}>
            <MarketingImage
              className={styles.bloom}
              src={plate.bloomSrc}
              alt=""
              sizes="(width < 721px) 40vw, 160px"
            />
          </span>
        </span>
      </span>
    </span>
  );
}

/** Thin keyboard-style chevrons for the match lock. */
function KeyboardArrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className={dir === "left" ? styles.arrowLeft : styles.arrowRight}
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      {dir === "right" ? (
        <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
      ) : (
        <path d="M14.71 6.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59a.996.996 0 1 0 1.41-1.41L11.83 12l3.88-3.88c.38-.39.38-1.03 0-1.41z" />
      )}
    </svg>
  );
}

/** Ring radius used for list arc geometry (px). Keep near --ring-size / 2. */
const ARC_R = 304;

/** Shortest signed steps from selected index to item index on a loop. */
function shortestSigned(index: number, selected: number, count: number) {
  if (count <= 0) return 0;
  let s = index - selected;
  const half = count / 2;
  while (s > half) s -= count;
  while (s <= -half) s += count;
  return s;
}

/**
 * Place a dial item on the circle: y along the port, x inset from chord + tangent rotation.
 * signed: strip steps from the centered row (negative = above on the left column).
 * Right column mirrors Y so the two rails travel opposite directions.
 * Items are absolutely positioned on the port — no viewport clip box.
 */
function arcItemStyle(
  side: "left" | "right",
  signed: number,
  opts?: {
    reduceMotion?: boolean;
    arcR?: number;
    itemH?: number;
    tilt?: boolean;
    compact?: boolean;
    count?: number;
    orbitR?: number;
    slot?: number;
  },
): CSSProperties {
  const reduceMotion = opts?.reduceMotion ?? false;
  const transition = reduceMotion
    ? "none"
    : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease, background-color 200ms ease, border-color 200ms ease, box-shadow 220ms ease, color 200ms ease`;

  /* Phone + tablet: Scout revolver. Fixed slots; the dial spins them together. */
  if (opts?.compact) {
    const count = Math.max(opts.count ?? 1, 1);
    const step = 360 / count;
    const deg = (side === "left" ? 270 : 90) + (opts.slot ?? 0) * step;
    const r = Math.max(opts.orbitR ?? 140, 72);
    const grow = side === "right" ? " scale(var(--card-scale, 1))" : "";
    const compactTransition = reduceMotion
      ? "none"
      : "opacity 200ms ease, background-color 200ms ease, border-color 200ms ease, box-shadow 220ms ease, color 200ms ease";
    return {
      transform: `translate(-50%, -100%) rotate(${deg.toFixed(2)}deg) translateY(${-r}px)${grow}`,
      transition: compactTransition,
    };
  }

  const arcR = Math.max(opts?.arcR ?? ARC_R, 1);
  const itemH = opts?.itemH ?? ITEM_H;
  const tilt = opts?.tilt ?? true;
  // Left advances upward; right advances downward for the same index step.
  const visualSigned = side === "right" ? -signed : signed;
  const y = visualSigned * itemH;
  const maxY = arcR * 0.9;
  const clamped = Math.max(-maxY, Math.min(maxY, y));
  const xInset = arcR - Math.sqrt(arcR * arcR - clamped * clamped);
  const deg = (Math.asin(clamped / arcR) * 180) / Math.PI;
  const dist = Math.min(Math.abs(signed), 3);
  const scale =
    dist === 0 ? 1 : dist === 1 ? 0.97 : dist === 2 ? 0.93 : 0.88;
  const sideSign = side === "left" ? -1 : 1;
  const rotate = tilt ? deg * sideSign : 0;
  const tx = side === "left" ? xInset : -xInset;
  return {
    transform: `translate3d(${tx.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale})`,
    transition,
  };
}

const MOTIF_COUNT = 180;
const MOTIF_CX = 428;
const MOTIF_CY = 428;
const MOTIF_OUTER = 420;
const MOTIF_INNER = 372;
const MOTIF_COLOR = "rgb(175, 124, 84)";

/** Precomputed ring ticks — rounded once so SSR/client markup matches. */
const MOTIF_TICKS = Array.from({ length: MOTIF_COUNT }, (_, i) => {
  const deg = (i / MOTIF_COUNT) * 360;
  const rad = ((deg - 90) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return {
    key: i,
    x1: r(MOTIF_CX + cos * MOTIF_OUTER),
    y1: r(MOTIF_CY + sin * MOTIF_OUTER),
    x2: r(MOTIF_CX + cos * MOTIF_INNER),
    y2: r(MOTIF_CY + sin * MOTIF_INNER),
  };
});

type RadialMotifProps = {
  reduceMotion: boolean;
  matching: boolean;
  turn: number;
  stepDeg: number;
};

/**
 * Tick ring shares the chip step: same angle, same easing, chips stay on top.
 */
function RadialMotif({
  reduceMotion,
  matching,
  turn,
  stepDeg,
}: RadialMotifProps) {
  const rotate = reduceMotion ? 0 : -turn * stepDeg;
  return (
    <div
      className={`${styles.motifWrap} ${matching ? styles.motifMatching : ""}`}
      aria-hidden
      data-ds-stub="true"
      data-matching={matching ? "true" : undefined}
    >
      <svg
        className={styles.motif}
        viewBox="0 0 856 856"
        style={{
          transform: `rotate(${rotate.toFixed(3)}deg)`,
          transition: reduceMotion
            ? "none"
            : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <g
          className={styles.rays}
          stroke={MOTIF_COLOR}
          strokeWidth="1.35"
          strokeLinecap="butt"
          opacity={0.95}
        >
          {MOTIF_TICKS.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

type DialColumnProps = {
  side: "left" | "right";
  label: string;
  labelledBy?: string;
  matching: boolean;
  portRef?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/**
 * Fixed center notecard chrome. Items sit absolutely on the east–west port
 * (no height-clipped track — rotation was getting sliced by that box).
 */
function DialColumn({
  side,
  label,
  labelledBy,
  matching,
  portRef,
  children,
}: DialColumnProps) {
  return (
    <div
      className={side === "left" ? styles.columnLeft : styles.columnRight}
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      data-matching={matching ? "true" : undefined}
    >
      <div ref={portRef} className={styles.columnPort}>
        {children}
      </div>
    </div>
  );
}

/**
 * Care Dial — structure from tidldemo2 `#journey` (dual list + radial).
 * Paint: TIDL tokens. Pattern/Care Dial is a DS gap (stub).
 * Ring detents drive the match; east–west ports lock protocol ↔ provider.
 */
function ringDeg(side: "left" | "right", signed: number, slots = RING_SLOTS) {
  return (side === "left" ? 270 : 90) + signed * (360 / slots);
}

function ringIndexLabel(deg: number, slots = RING_SLOTS) {
  const norm = ((deg % 360) + 360) % 360;
  const slot = Math.round(norm / (360 / slots)) % slots;
  return String(slot + 1).padStart(2, "0");
}

export function LandingCare({
  title,
  body,
  areas,
  providers,
  ringTreatments,
  ringProviders,
  initialAreaId,
}: LandingCareProps) {
  const baseId = useId();
  const router = useRouter();
  const [compact, setCompact] = useState(false);
  const viewAreas =
    compact && ringTreatments && ringTreatments.length > 0
      ? ringTreatments
      : areas;
  const viewProviders =
    compact && ringProviders && ringProviders.length > 0
      ? ringProviders
      : providers;
  const areaCount = viewAreas.length;
  const providerCount = viewProviders.length;

  const defaultAreaIndex = Math.max(
    0,
    areas.findIndex((a) => a.id === (initialAreaId ?? areas[0]?.id)),
  );
  const defaultProviderIndex = Math.max(
    0,
    providers.findIndex((p) => p.areaId === areas[defaultAreaIndex]?.id),
  );

  const [areaIndex, setAreaIndex] = useState(defaultAreaIndex);
  const [providerIndex, setProviderIndex] = useState(defaultProviderIndex);
  const [ringTurn, setRingTurn] = useState(0);
  const [matching, setMatching] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  const matchTimer = useRef<number | null>(null);
  const compactRef = useRef(compact);
  const stageRef = useRef<HTMLDivElement>(null);
  const areaPortRef = useRef<HTMLDivElement>(null);
  const providerPortRef = useRef<HTMLDivElement>(null);
  const [arcR, setArcR] = useState(ARC_R);
  const [itemH, setItemH] = useState(ITEM_H);
  const [orbitR, setOrbitR] = useState(140);
  const areaId = viewAreas[areaIndex]?.id;
  const providerId = viewProviders[providerIndex]?.id;

  const pulseMatch = () => {
    if (reduceMotion) return;
    setMatching(true);
    if (matchTimer.current) window.clearTimeout(matchTimer.current);
    matchTimer.current = window.setTimeout(() => {
      setMatching(false);
    }, MATCH_MS);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(width < 1025px)");
    const sync = () => setReduceMotion(mq.matches);
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
    if (compactRef.current === compact) return;
    compactRef.current = compact;
    const fromAreas = compact ? areas : (ringTreatments ?? areas);
    const toAreas = compact ? (ringTreatments ?? areas) : areas;
    const fromProviders = compact ? providers : (ringProviders ?? providers);
    const toProviders = compact ? (ringProviders ?? providers) : providers;
    setAreaIndex((current) => {
      const id = fromAreas[current]?.id ?? initialAreaId;
      const found = toAreas.findIndex((item) => item.id === id);
      return found >= 0 ? found : 0;
    });
    setProviderIndex((current) => {
      const id = fromProviders[current]?.id;
      const found = toProviders.findIndex((item) => item.id === id);
      if (found >= 0) return found;
      const linked = toProviders.findIndex(
        (item) => item.areaId === (toAreas[0]?.id ?? ""),
      );
      return linked >= 0 ? linked : 0;
    });
  }, [compact, areas, providers, ringTreatments, ringProviders, initialAreaId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => {
      const wrap = stage.querySelector<HTMLElement>(`.${styles.motifWrap}`);
      const col = stage.querySelector<HTMLElement>(`.${styles.columnLeft}`);
      const ring = wrap?.getBoundingClientRect().width ?? 0;
      const row = col
        ? Number.parseFloat(getComputedStyle(col).getPropertyValue("--dial-item"))
        : ITEM_H;
      if (ring > 0) setArcR(ring / 2);
      if (Number.isFinite(row) && row > 0) setItemH(row);
      const box = getComputedStyle(stage);
      const inset =
        Number.parseFloat(box.paddingLeft) + Number.parseFloat(box.paddingRight);
      const stageW = stage.getBoundingClientRect().width - (Number.isFinite(inset) ? inset : 0);
      const sample = stage.querySelector<HTMLElement>(`.${styles.area}`);
      const cardH = sample?.offsetHeight ?? 80;
      if (stageW > 0) setOrbitR(Math.max(64, stageW / 2 - cardH * 1.1));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [compact]);

  useEffect(() => {
    pulseMatch();
    return () => {
      if (matchTimer.current) window.clearTimeout(matchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only settle
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const dial = stage?.querySelector<HTMLElement>(`.${styles.dial}`);
    if (!compact || !dial) return;
    const items =
      ringTreatments && ringTreatments.length > 0 ? ringTreatments : areas;
    const count = items.length;
    if (count === 0) return;
    const treatCards = () =>
      dial.querySelectorAll<HTMLElement>(`.${styles.columnLeft} .${styles.area}`);
    const providerCards = () =>
      dial.querySelectorAll<HTMLElement>(
        `.${styles.columnRight} .${styles.provider}`,
      );

    const applyApex = (card: HTMLElement, pop: number) => {
      card.style.setProperty("--bloom-pop", pop.toFixed(3));
      if (pop > 0) card.setAttribute("data-apex", "true");
      else card.removeAttribute("data-apex");
    };

    const paint = (spin: number) => {
      const left = treatCards();
      const right = providerCards();
      const leftStep = 360 / Math.max(left.length, 1);
      const rightStep = 360 / Math.max(right.length, 1);
      left.forEach((card, index) => {
        const world = (((270 + index * leftStep + spin) % 360) + 360) % 360;
        applyApex(card, bloomPop(world));
      });
      right.forEach((card, index) => {
        const world = (((90 + index * rightStep + spin) % 360) + 360) % 360;
        applyApex(card, bloomPop(world, PHYSICIAN_FADE_DEG));
      });
    };

    if (reduceMotion) {
      dial.style.setProperty("--care-spin", "0deg");
      paint(0);
      return () => {
        dial.style.removeProperty("--care-spin");
      };
    }

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const spin = (((now - start) / ORBIT_MS) % 1) * 360;
      dial.style.setProperty("--care-spin", `${spin.toFixed(3)}deg`);
      paint(spin);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      dial.style.removeProperty("--care-spin");
      treatCards().forEach((card) => {
        card.style.removeProperty("--bloom-pop");
        card.removeAttribute("data-apex");
      });
      providerCards().forEach((card) => {
        card.style.removeProperty("--bloom-pop");
        card.removeAttribute("data-apex");
      });
    };
  }, [compact, reduceMotion, ringTreatments, areas]);

  useEffect(() => {
    if (compact || reduceMotion || paused || areaCount === 0 || providerCount === 0) return;
    const timer = window.setInterval(() => {
      setAreaIndex((i) => (i + 1) % areaCount);
      setProviderIndex((i) => (i + 1) % providerCount);
      setRingTurn((turn) => turn + 1);
      pulseMatch();
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pulseMatch closes over reduceMotion
  }, [compact, areaCount, providerCount, reduceMotion, paused]);

  const selectArea = (id: string) => {
    setPaused(true);
    const index = viewAreas.findIndex((a) => a.id === id);
    if (index < 0) return;
    const area = viewAreas[index];
    if (id === areaId && area?.href) {
      router.push(area.href);
      return;
    }
    setRingTurn((turn) => turn + shortestSigned(index, areaIndex, areaCount));
    setAreaIndex(index);
    const linked = viewProviders.findIndex((p) => p.areaId === id);
    if (linked >= 0) setProviderIndex(linked);
    pulseMatch();
  };

  const selectProvider = (id: string) => {
    setPaused(true);
    const index = viewProviders.findIndex((p) => p.id === id);
    if (index < 0) return;
    const provider = viewProviders[index];
    if (id === providerId && provider?.href) {
      router.push(provider.href);
      return;
    }
    setRingTurn((turn) => turn + shortestSigned(index, providerIndex, providerCount));
    setProviderIndex(index);
    pulseMatch();
  };

  return (
    <section className={styles.root} aria-label="Care" data-ds-stub="true">
      <div
        ref={stageRef}
        className={styles.stage}
        data-matching={matching ? "true" : undefined}
        style={
          compact
            ? ({ ["--orbit-r" as string]: `${orbitR}px` } as CSSProperties)
            : undefined
        }
      >
        <div className={styles.center}>
          <h2 className={styles.title} id={`${baseId}-title`}>
            {title}
          </h2>
          <p className={styles.body}>{body}</p>
        </div>

        <div className={styles.dial}>
          <RadialMotif
            reduceMotion={reduceMotion}
            matching={matching}
            turn={ringTurn}
            stepDeg={(itemH / Math.max(arcR, 1)) * (180 / Math.PI)}
          />

          <div
            className={styles.matchBridge}
            aria-hidden
            data-matching={matching ? "true" : undefined}
          >
            <KeyboardArrow dir="right" />
            <KeyboardArrow dir="left" />
          </div>

          <DialColumn
          side="left"
          label="Care areas"
          labelledBy={`${baseId}-title`}
          matching={matching}
          portRef={areaPortRef}
        >
          {viewAreas.map((area, index) => {
            const signed = shortestSigned(index, areaIndex, areaCount);
            const selected = index === areaIndex;
            const distance = Math.min(Math.abs(signed), 3);
            const near = compact || distance <= 2;
            const slots = compactSlots(areaCount);
            const deg = ringDeg("left", signed, slots);
            return (
              <button
                key={area.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={
                  selected ? `Open ${area.label}` : `Select ${area.label}`
                }
                tabIndex={near ? 0 : -1}
                className={styles.area}
                data-bloom={area.id}
                data-active={selected ? "true" : undefined}
                data-distance={distance}
                style={arcItemStyle("left", signed, {
                  reduceMotion,
                  arcR,
                  itemH,
                  compact,
                  count: areaCount,
                  orbitR,
                  slot: index,
                })}
                onClick={() => selectArea(area.id)}
              >
                <span className={styles.cardIndex} aria-hidden>
                  {compact ? ringIndexLabel(deg, slots) : String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.areaIcon}>
                  {compact && distance <= 2 ? <AreaBloom id={area.id} /> : null}
                  {compact && area.mediaSrc && distance <= 2 ? (
                    <MarketingImage
                      className={styles.areaMedia}
                      src={area.mediaSrc}
                      alt=""
                      width={64}
                      height={64}
                      sizes="64px"
                    />
                  ) : compact && area.mediaSrc ? null : (
                    ICONS[area.icon]
                  )}
                </span>
                <span className={styles.areaLabel}>{area.label}</span>
              </button>
            );
          })}
        </DialColumn>

        <DialColumn
          side="right"
          label="Care providers"
          matching={matching}
          portRef={providerPortRef}
        >
          {viewProviders.map((provider, index) => {
            const signed = shortestSigned(index, providerIndex, providerCount);
            const selected = index === providerIndex;
            const distance = Math.min(Math.abs(signed), 3);
            const near = compact || distance <= 2;
            const slots = compactSlots(providerCount);
            const deg = ringDeg("right", signed, slots);
            return (
              <button
                key={provider.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={
                  selected
                    ? `Open ${provider.name}`
                    : `Select ${provider.name}`
                }
                tabIndex={near ? 0 : -1}
                className={styles.provider}
                data-active={selected ? "true" : undefined}
                data-distance={distance}
                style={arcItemStyle("right", signed, {
                  reduceMotion,
                  arcR,
                  itemH,
                  compact,
                  count: providerCount,
                  orbitR,
                  slot: index,
                })}
                onClick={() => selectProvider(provider.id)}
              >
                <span className={styles.cardIndex} aria-hidden>
                  {compact ? ringIndexLabel(deg, slots) : String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.avatar} aria-hidden>
                  <MarketingImage
                    className={styles.avatarImg}
                    src={provider.avatarSrc}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                  />
                  <span className={styles.avatarFallback}>
                    {provider.initials}
                  </span>
                </span>
                <span className={styles.providerName}>{provider.name}</span>
              </button>
            );
          })}
        </DialColumn>
        </div>
      </div>
    </section>
  );
}
