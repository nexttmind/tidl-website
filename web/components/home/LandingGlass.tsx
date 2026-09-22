"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { shopPlate } from "./ShopBloomPair";
import {
  valueFields,
  type ValueFieldCard,
} from "@/content/fixtures/value-fields";
import styles from "./LandingGlass.module.css";

const FOOTNOTE = "Available if prescribed after clinical review.";
const AUTO_MS = 10000;

function GlassSlide({ item }: { item: ValueFieldCard }) {
  const plate = shopPlate(item.id);
  const headingId = `${item.id}-glass`;
  const [noteCap, noteLabel, noteBase] = item.notes;

  return (
    <article
      className={styles.panel}
      aria-labelledby={headingId}
      style={{ "--field-image": `url(${item.fieldSrc})` } as CSSProperties}
    >
      <div className={styles.glass}>
        <div className={styles.frost} aria-hidden />
        <div className={styles.scrim} aria-hidden />
        <div className={styles.copy}>
          <div className={styles.intro}>
            <p className={styles.kicker}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.iconSrc} alt="" width={20} height={20} />
              {item.pill}
            </p>
            <h3 id={headingId} className={styles.headline}>
              {item.title}
            </h3>
            <p className={styles.lede}>{item.claim}</p>
          </div>
          <div className={styles.foot}>
            <Button
              href={item.href}
              styleVariant="Ghost"
              className={styles.shopBtn}
            >
              {`Shop ${item.pill}`}
            </Button>
            <p className={styles.footnote}>{FOOTNOTE}</p>
          </div>
        </div>
        <div className={styles.product}>
          <div className={styles.vialStage}>
            <MarketingImage
              className={styles.vial}
              src={plate.vialSrc}
              alt=""
              width={1024}
              height={1024}
              sizes="(width < 721px) 55vw, 280px"
            />
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
        </div>
      </div>
    </article>
  );
}

function JumpIcon({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={dir === -1 ? "M10 3.5 5.5 8 10 12.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingGlass({ lockId = null }: { lockId?: string | null }) {
  const items = valueFields.items;
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [incoming, setIncoming] = useState<{
    index: number;
    dir: 1 | -1;
  } | null>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const incomingRef = useRef(incoming);
  incomingRef.current = incoming;

  const item = items[index] ?? items[0];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lockId) return;
    const next = items.findIndex((entry) => entry.id === lockId);
    if (next < 0) return;
    incomingRef.current = null;
    busyRef.current = false;
    setIncoming(null);
    setIndex(next);
  }, [items, lockId]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockId || busyRef.current || count < 2) return;
      const next = (index + dir + count) % count;
      if (reducedMotion) {
        setIndex(next);
        return;
      }
      busyRef.current = true;
      setIncoming({ index: next, dir });
    },
    [count, index, lockId, reducedMotion],
  );

  useEffect(() => {
    if (lockId || !inView || incoming || count < 2) return;
    const id = window.setTimeout(() => go(1), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [count, go, inView, incoming, lockId]);

  const settle = () => {
    const current = incomingRef.current;
    if (!current) {
      busyRef.current = false;
      return;
    }
    incomingRef.current = null;
    setIndex(current.index);
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

  return (
    <div className={styles.root} ref={rootRef}>
      <ScrollReveal>
        <div
          className={styles.frame}
          aria-roledescription="carousel"
          aria-label="Stack details"
        >
          <div className={styles.viewport}>
            <GlassSlide item={item} />
            {incoming && incomingItem ? (
              <div
                className={styles.incoming}
                data-dir={incoming.dir}
                aria-hidden
                onAnimationEnd={onIncomingEnd}
              >
                <GlassSlide item={incomingItem} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`${styles.jump} ${styles.jumpLeft}`}
            aria-label="Previous stack"
            onClick={() => go(-1)}
          >
            <JumpIcon dir={-1} />
          </button>
          <button
            type="button"
            className={`${styles.jump} ${styles.jumpRight}`}
            aria-label="Next stack"
            onClick={() => go(1)}
          >
            <JumpIcon dir={1} />
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}
