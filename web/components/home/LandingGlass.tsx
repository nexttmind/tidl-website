"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { menuTapStartsBarrage } from "@/components/chrome/MenuBarrage";
import { playMenuBarrage } from "@/components/chrome/menu-barrage-session";
import { MarketingImage } from "@/components/media/MarketingImage";
import { optCssImageSet, optImgSrc } from "@/lib/media/opt-manifest";
import { FALLBACK_INK, sampleImageInk } from "@/lib/media/sample-ink";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { catalogTileSrc, shopCatalogItem } from "./shop-catalog";
import {
  landingNotecards,
  type LandingNotecard,
  type LandingNote,
} from "@/content/fixtures/landing-notecards";
import styles from "./LandingGlass.module.css";

const AUTO_MS = 5000;

function splitWidow(text: string): { head: string; tail: string | null } {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return { head: text, tail: null };
  const last = parts.pop() as string;
  const prev = parts.pop() as string;
  return {
    head: parts.length ? `${parts.join(" ")} ` : "",
    tail: `${prev} ${last}`,
  };
}

function productVisual(id: string) {
  const visual = shopCatalogItem(id);
  if (!visual) return { src: "", form: "vial" as const, kind: undefined };
  const src = catalogTileSrc(id);
  return {
    src,
    form: src.includes("/pills/") ? ("pill" as const) : ("vial" as const),
    kind: visual.kind,
  };
}

function Callouts({
  notes,
  variant,
}: {
  notes: readonly [LandingNote, LandingNote, LandingNote];
  variant: "stage" | "preview";
}) {
  const [noteCap, noteLabel, noteBase] = notes;

  if (variant === "preview") {
    return (
      <ul className={styles.previewCallouts}>
        {notes.map((note) => {
          const { head, tail } = splitWidow(note.title);
          return (
            <li key={note.chip}>
              <span className={styles.previewLabel}>{note.chip}</span>
              <span className={styles.previewBody}>
                {head}
                {tail ? (
                  <span className={styles.previewTail}>{tail}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={styles.stageCallouts}>
      <div className={`${styles.callout} ${styles.calloutCap}`}>
        <div className={styles.calloutRow}>
          <span className={styles.chip}>{noteCap.chip}</span>
          <span className={styles.stem} aria-hidden />
        </div>
        <p className={styles.calloutBody}>{noteCap.title}</p>
      </div>
      <div className={`${styles.callout} ${styles.calloutLabel}`}>
        <div className={styles.calloutRow}>
          <span className={styles.stem} aria-hidden />
          <span className={styles.chip}>{noteLabel.chip}</span>
        </div>
        <p className={styles.calloutBody}>{noteLabel.title}</p>
      </div>
      <div className={`${styles.callout} ${styles.calloutBase}`}>
        <div className={styles.calloutRow}>
          <span className={styles.chip}>{noteBase.chip}</span>
          <span className={styles.stem} aria-hidden />
        </div>
        <p className={styles.calloutBody}>{noteBase.title}</p>
      </div>
    </div>
  );
}

/** White and grey fields. Colored photos stay on the lighter scrim. */
const LIGHT_FIELD = /\/(pain-relief|athletes|rest-rebuild|sexual-health)\.jpg$/;

function GlassSlide({
  item,
  fieldMax,
  ink,
  paintField,
}: {
  item: LandingNotecard;
  fieldMax: number;
  ink: string;
  paintField: boolean;
}) {
  const router = useRouter();
  const headingId = `${item.id}-glass`;
  const { src: productSrc, form, kind } = productVisual(item.id);

  return (
    <article
      className={styles.panel}
      data-light={LIGHT_FIELD.test(item.fieldSrc) ? "" : undefined}
      aria-labelledby={headingId}
      style={
        paintField
          ? ({
              "--field-image": optCssImageSet(item.fieldSrc, fieldMax),
            } as CSSProperties)
          : undefined
      }
    >
      <div className={styles.field} aria-hidden />
      <div className={styles.frost} aria-hidden />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.glass} data-glass-band>
        <div className={styles.copy}>
          <div className={styles.intro}>
            <div className={styles.heading}>
              <p className={styles.kicker}>{item.eyebrow}</p>
              <h3 id={headingId} className={styles.headline}>
                {item.headline}
              </h3>
            </div>
            <p className={styles.lede}>{item.body}</p>
          </div>
          <div className={styles.foot}>
            <a
              href={item.href}
              className={styles.shopBtn}
              style={{ "--cta-ink": ink } as CSSProperties}
              onClick={(event) => {
                if (!menuTapStartsBarrage(item.id, event)) return;
                event.preventDefault();
                playMenuBarrage(router, item.id, item.href);
              }}
            >
              {item.cta}
              {kind === "bundle" ? (
                <span className={styles.ctaKind}>Bundle</span>
              ) : null}
              {kind === "treatment" ? (
                <span className={styles.ctaKind}>Treatments</span>
              ) : null}
            </a>
          </div>
        </div>
        <div className={styles.product}>
          <div
            className={styles.vialStage}
            data-form={form}
            data-id={item.id}
            data-kind={kind}
          >
            {paintField && productSrc ? (
              <MarketingImage
                className={styles.vial}
                src={productSrc}
                alt=""
                width={1024}
                height={1024}
                sizes="(width < 721px) 42vw, (width < 1025px) 140px, 370px"
              />
            ) : null}
            <Callouts notes={item.notes} variant="stage" />
          </div>
          <Callouts notes={item.notes} variant="preview" />
        </div>
      </div>
    </article>
  );
}

export function LandingGlass({
  items = landingNotecards,
  activeId = null,
  onActiveIdChange,
  onSlideStart,
  className,
  lockId = null,
  autoMs = AUTO_MS,
}: {
  items?: readonly LandingNotecard[];
  activeId?: string | null;
  onActiveIdChange?: (id: string) => void;
  /** Fires when a slide begins, before the transition settles. */
  onSlideStart?: (id: string) => void;
  className?: string;
  lockId?: string | null;
  /** Dwell before the next automatic slide. Tile clicks pass a longer hold. */
  autoMs?: number;
}) {
  const count = items.length;
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [incoming, setIncoming] = useState<{
    index: number;
    dir: 1 | -1;
  } | null>(null);
  const [inView, setInView] = useState(false);
  const [mediaNear, setMediaNear] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [inkBySrc, setInkBySrc] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const incomingRef = useRef(incoming);
  incomingRef.current = incoming;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onActiveRef = useRef(onActiveIdChange);
  onActiveRef.current = onActiveIdChange;
  const onSlideStartRef = useRef(onSlideStart);
  onSlideStartRef.current = onSlideStart;

  const targetId = activeId ?? lockId;
  const [outgoingId, setOutgoingId] = useState<string | null>(null);
  const shownRef = useRef(targetId);
  const outgoingRef = useRef(outgoingId);
  outgoingRef.current = outgoingId;
  const visibleId = outgoingId ?? targetId;
  const derived = visibleId
    ? items.findIndex((entry) => entry.id === visibleId)
    : -1;
  const index = derived >= 0 ? derived : fallbackIndex;
  const item = items[index] ?? items[0];

  useEffect(() => {
    if (!inView || !item) return;
    let cancelled = false;
    const next = items[(index + 1) % count];
    const unique = [...new Set([item.fieldSrc, next?.fieldSrc].filter(Boolean))];
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
  }, [count, inView, index, item, items]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(width < 1025px)");
    const sync = () => setReducedMotion(mq.matches);
    const syncCompact = () => setIsCompact(compactMq.matches);
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
    const el = rootRef.current;
    if (!el) return;
    const compactMq = window.matchMedia("(width < 1025px)");
    let viewObserver: IntersectionObserver | null = null;
    const near = new IntersectionObserver(
      ([entry]) => setMediaNear(Boolean(entry?.isIntersecting)),
      { rootMargin: "480px 0px", threshold: 0 },
    );
    near.observe(el);

    const attach = () => {
      viewObserver?.disconnect();
      // Phone and tablet: run while the catalog card is on screen, not only
      // the preview band. Desktop still watches the glass at 35%.
      const compact = Boolean(className) && compactMq.matches;
      const watch = compact ? (el.parentElement ?? el) : el;
      viewObserver = new IntersectionObserver(
        ([entry]) => setInView(Boolean(entry?.isIntersecting)),
        { threshold: compact ? 0.2 : 0.35, rootMargin: "0px" },
      );
      viewObserver.observe(watch);
    };
    attach();
    compactMq.addEventListener("change", attach);
    return () => {
      compactMq.removeEventListener("change", attach);
      viewObserver?.disconnect();
      near.disconnect();
    };
  }, [className]);

  useLayoutEffect(() => {
    if (!targetId || targetId === shownRef.current) return;
    if (outgoingRef.current || incomingRef.current) return;
    const next = items.findIndex((entry) => entry.id === targetId);
    const prev = items.findIndex((entry) => entry.id === shownRef.current);
    if (next < 0 || prev < 0 || reducedMotion) {
      shownRef.current = targetId;
      return;
    }
    const fromRight =
      window.matchMedia("(width < 1025px)").matches || next >= prev;
    busyRef.current = true;
    setOutgoingId(shownRef.current);
    setIncoming({ index: next, dir: fromRight ? 1 : -1 });
  }, [items, reducedMotion, targetId]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !className) return;
    const band = root.querySelector("[data-glass-band]");
    if (!(band instanceof HTMLElement)) return;
    const sync = () => {
      root.style.setProperty("--catalog-band-h", `${band.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(band);
    return () => observer.disconnect();
  }, [className, item]);

  const commit = useCallback(
    (next: number) => {
      const nextId = itemsRef.current[next]?.id;
      if (onActiveRef.current && nextId) {
        onActiveRef.current(nextId);
        return;
      }
      setFallbackIndex(next);
    },
    [],
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockId || busyRef.current || count < 2) return;
      const next = (index + dir + count) % count;
      const nextId = itemsRef.current[next]?.id;
      if (nextId) shownRef.current = nextId;
      if (nextId) onSlideStartRef.current?.(nextId);
      if (reducedMotion) {
        commit(next);
        return;
      }
      busyRef.current = true;
      setIncoming({ index: next, dir });
    },
    [commit, count, index, lockId, reducedMotion],
  );

  useEffect(() => {
    if (!autoMs || lockId || !inView || incoming || count < 2) return;
    const id = window.setTimeout(() => go(1), autoMs);
    return () => window.clearTimeout(id);
  }, [autoMs, count, go, inView, incoming, lockId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || lockId || count < 2) return;
    const host = className ? root.parentElement : root;
    if (!host) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("a, button, [role='tab']")) return;
      const rect = host.getBoundingClientRect();
      go(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
    };
    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [className, count, go, lockId]);

  const settle = () => {
    const current = incomingRef.current;
    if (!current) {
      busyRef.current = false;
      return;
    }
    incomingRef.current = null;
    if (outgoingRef.current) {
      shownRef.current = targetId;
      outgoingRef.current = null;
      setOutgoingId(null);
      requestAnimationFrame(() => {
        setIncoming(null);
        busyRef.current = false;
      });
      return;
    }
    commit(current.index);
    requestAnimationFrame(() => {
      setIncoming(null);
      busyRef.current = false;
    });
  };

  useEffect(() => {
    if (!incoming) return;
    const id = window.setTimeout(settle, 820);
    return () => window.clearTimeout(id);
  }, [incoming]);

  const onIncomingEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    settle();
  };

  const incomingItem = incoming ? items[incoming.index] : undefined;

  const frame = (
    <div
      className={styles.frame}
      aria-roledescription="carousel"
      aria-label="Catalog"
    >
      <div className={styles.viewport}>
        <div className={styles.slide}>
          <GlassSlide
            item={item}
            fieldMax={isCompact ? 800 : 1200}
            ink={inkBySrc[item.fieldSrc] ?? FALLBACK_INK}
            paintField={mediaNear}
          />
        </div>
        {incoming && incomingItem ? (
          <div
            className={`${styles.slide} ${styles.incoming}`}
            data-dir={incoming.dir}
            aria-hidden
            onAnimationEnd={onIncomingEnd}
          >
            <GlassSlide
              item={incomingItem}
              fieldMax={isCompact ? 800 : 1200}
              ink={inkBySrc[incomingItem.fieldSrc] ?? FALLBACK_INK}
              paintField={mediaNear}
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={className ? `${styles.root} ${className}` : styles.root}
      data-nested={className ? "" : undefined}
      ref={rootRef}
    >
      {className ? frame : <ScrollReveal>{frame}</ScrollReveal>}
    </div>
  );
}
