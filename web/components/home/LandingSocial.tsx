"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import styles from "./LandingSocial.module.css";

export type SocialPersonNote = {
  name: string;
  text: string;
};

export type SocialQuoteTone = "paper" | "night" | "sage" | "forest" | "sand";

export type SocialStackTile =
  | {
      id: string;
      kind: "media";
      src: string;
      shape: "pill" | "oval";
      objectPosition?: string;
      note?: SocialPersonNote;
    }
  | {
      id: string;
      kind: "quote";
      tone: SocialQuoteTone;
      text: string;
    };

export type SocialColumn =
  | {
      id: string;
      kind: "circle";
      src: string;
      objectPosition?: string;
      note?: SocialPersonNote;
    }
  | {
      id: string;
      kind: "portrait";
      src: string;
      size?: "narrow" | "wide";
      objectPosition?: string;
      note?: SocialPersonNote;
    }
  | {
      id: string;
      kind: "quote";
      tone: SocialQuoteTone;
      text: string;
    }
  | {
      id: string;
      kind: "stack";
      tiles: readonly SocialStackTile[];
    };

type LandingSocialProps = {
  title: string;
  columns: readonly SocialColumn[];
};

function Media({
  src,
  objectPosition,
}: {
  src: string;
  objectPosition?: string;
}) {
  return (
    <MarketingImage
      className={styles.photo}
      src={src}
      alt=""
      width={1024}
      height={1536}
      sizes="(width < 721px) 72vw, (width < 1025px) 36vw, 320px"
      loading="lazy"
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
}

function QuoteCard({
  tone,
  text,
}: {
  tone: SocialQuoteTone;
  text: string;
}) {
  return (
    <blockquote className={styles.quote} data-tone={tone}>
      <p className={styles.quoteText}>{text}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.wordmark}
        src="/brand/tidl-wordmark.svg"
        alt="TIDL"
        width={183}
        height={33}
      />
    </blockquote>
  );
}

function PersonShot({
  src,
  objectPosition,
  note,
  className,
  size,
  shape,
  clone,
}: {
  src: string;
  objectPosition?: string;
  note?: SocialPersonNote;
  className: string;
  size?: "narrow" | "wide";
  shape?: "pill" | "oval";
  clone?: boolean;
}) {
  const interactive = Boolean(note);
  const [open, setOpen] = useState(false);

  return (
    <figure
      className={[className, interactive ? styles.person : ""]
        .filter(Boolean)
        .join(" ")}
      data-size={size}
      data-shape={shape}
      data-open={open || undefined}
      tabIndex={interactive && !clone ? 0 : undefined}
      onPointerEnter={
        interactive
          ? (event) => {
              if (event.pointerType === "mouse") setOpen(true);
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? (event) => {
              if (event.pointerType === "mouse") setOpen(false);
            }
          : undefined
      }
      onPointerUp={
        interactive && !clone
          ? (event) => {
              if (event.pointerType === "mouse") return;
              setOpen((value) => !value);
            }
          : undefined
      }
      onFocus={interactive && !clone ? () => setOpen(true) : undefined}
      onBlur={interactive && !clone ? () => setOpen(false) : undefined}
    >
      <Media src={src} objectPosition={objectPosition} />
      {note ? (
        <div className={styles.personNote}>
          <p className={styles.personQuote}>{note.text}</p>
          <p className={styles.personName}>{note.name}</p>
        </div>
      ) : null}
    </figure>
  );
}

function Column({
  column,
  clone,
}: {
  column: SocialColumn;
  clone?: boolean;
}) {
  if (column.kind === "circle") {
    return (
      <PersonShot
        className={styles.circle}
        src={column.src}
        objectPosition={column.objectPosition}
        note={column.note}
        clone={clone}
      />
    );
  }

  if (column.kind === "portrait") {
    return (
      <PersonShot
        className={styles.portrait}
        src={column.src}
        objectPosition={column.objectPosition}
        note={column.note}
        size={column.size}
        clone={clone}
      />
    );
  }

  if (column.kind === "quote") {
    return (
      <div className={styles.quoteCol}>
        <QuoteCard tone={column.tone} text={column.text} />
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {column.tiles.map((tile) =>
        tile.kind === "quote" ? (
          <QuoteCard key={tile.id} tone={tile.tone} text={tile.text} />
        ) : (
          <PersonShot
            key={tile.id}
            className={styles.wide}
            src={tile.src}
            objectPosition={tile.objectPosition}
            note={tile.note}
            shape={tile.shape}
            clone={clone}
          />
        ),
      )}
    </div>
  );
}

function ColumnSet({
  columns,
  clone,
}: {
  columns: readonly SocialColumn[];
  clone?: boolean;
}) {
  return (
    <div
      className={styles.set}
      aria-hidden={clone || undefined}
      data-clone={clone ? "true" : undefined}
    >
      {columns.map((column) => (
        <Column
          key={`${clone ? "b" : "a"}-${column.id}`}
          column={column}
          clone={clone}
        />
      ))}
    </div>
  );
}

const AUTO_PX_PER_SEC = 28;

/** Pattern/Social Proof — mixed mosaic, looping crawl. No product vials. */
export function LandingSocial({ title, columns }: LandingSocialProps) {
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startOffset: number;
    moved: boolean;
  } | null>(null);
  const syncOffsetRef = useRef((_updater: number | ((n: number) => number)) => {});

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    const rail = railRef.current;
    if (!root || !scroller || !rail) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let loopWidth = 0;
    let visible = false;
    let hovering = false;
    let raf = 0;
    let last = 0;

    const measureLoop = () => {
      const sets = rail.querySelectorAll<HTMLElement>(`.${styles.set}`);
      if (sets.length < 2) return 0;
      const first = sets[0];
      const next = sets[1];
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

    const setOffset = (updater: number | ((n: number) => number)) => {
      const next =
        typeof updater === "function" ? updater(offsetRef.current) : updater;
      offsetRef.current = wrapOffset(next);
      apply();
    };

    syncOffsetRef.current = setOffset;

    const tick = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(tick);

      if (
        reduceMotion ||
        document.hidden ||
        dragRef.current?.moved ||
        hovering
      ) {
        last = now;
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
        visible = Boolean(entry?.isIntersecting);
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

    const ro = new ResizeObserver(() => {
      refreshLoop();
      setOffset(offsetRef.current);
    });
    ro.observe(scroller);
    ro.observe(rail);

    const onPointerEnter = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "mouse") hovering = true;
    };
    const onPointerLeave = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "mouse") {
        hovering = false;
        last = performance.now();
      }
    };
    scroller.addEventListener("pointerenter", onPointerEnter);
    scroller.addEventListener("pointerleave", onPointerLeave);

    const onVisibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    refreshLoop();
    apply();

    return () => {
      syncOffsetRef.current = () => {};
      scroller.removeEventListener("pointerenter", onPointerEnter);
      scroller.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [columns]);

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    if (scroller) delete scroller.dataset.dragging;
  };

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-labelledby="social-title"
    >
      <div className={`layout-container ${styles.header}`}>
        <h2 id="social-title" className={styles.title}>
          {title}
        </h2>
      </div>

      <div
        ref={scrollerRef}
        className={`${styles.scroller} hide-scrollbar`}
        tabIndex={0}
        onPointerDown={(event) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
          }
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startOffset: offsetRef.current,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          const scroller = scrollerRef.current;
          if (!drag || drag.pointerId !== event.pointerId || !scroller) return;
          const delta = drag.startX - event.clientX;
          if (Math.abs(delta) <= 3) return;
          if (!drag.moved) {
            drag.moved = true;
            scroller.setPointerCapture(event.pointerId);
            scroller.dataset.dragging = "true";
          }
          event.preventDefault();
          syncOffsetRef.current(drag.startOffset + delta);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={railRef} className={styles.rail}>
          <ColumnSet columns={columns} />
          <ColumnSet columns={columns} clone />
        </div>
      </div>
    </section>
  );
}
