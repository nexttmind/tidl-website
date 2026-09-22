"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { Button } from "@/components/ui/Button";
import {
  valueFields,
  type ValueFieldCard,
} from "@/content/fixtures/value-fields";
import {
  bloomStyle,
  ShopBloomPair,
  shopPlate,
} from "./ShopBloomPair";
import { LandingGlass } from "./LandingGlass";
import styles from "./LandingSection2.module.css";
import shop from "./LandingShop.module.css";

function fieldTitle(lead: string, accent: string) {
  return `${lead} ${accent}`;
}

function contentBounds() {
  const root = getComputedStyle(document.documentElement);
  const layoutMax =
    Number.parseFloat(root.getPropertyValue("--layout-max")) || 1728;
  const gutter =
    Number.parseFloat(root.getPropertyValue("--layout-gutter")) || 16;
  const vw = document.documentElement.clientWidth;
  if (vw < 1025) {
    return {
      left: gutter,
      right: vw - gutter,
      width: Math.max(0, vw - gutter * 2),
    };
  }
  const inset = Math.max(0, (vw - layoutMax) / 2);
  return { left: inset, right: vw - inset, width: Math.min(layoutMax, vw) };
}

function FieldCard({
  item,
  open,
  onToggle,
  eager,
}: {
  item: ValueFieldCard;
  open: boolean;
  onToggle: () => void;
  eager?: boolean;
}) {
  const headingId = useId();
  const plate = shopPlate(item.id);
  const [seated, setSeated] = useState(false);

  useEffect(() => {
    if (!open) {
      const reset = window.setTimeout(() => setSeated(false), 480);
      return () => window.clearTimeout(reset);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeated(true);
      return;
    }
    setSeated(false);
    const walk = window.setTimeout(() => setSeated(true), 80);
    return () => window.clearTimeout(walk);
  }, [open]);

  return (
    <article
      className={styles.card}
      data-open={open ? "true" : "false"}
      data-id={item.id}
      aria-labelledby={headingId}
      onClick={onToggle}
    >
      <MarketingImage
        className={styles.cardPhoto}
        src={item.cardSrc}
        alt=""
        width={820}
        height={1024}
        sizes="(width < 721px) 80vw, (width < 1025px) 42vw, 280px"
        loading={eager ? "eager" : "lazy"}
      />
      {open ? (
        <>
          <MarketingImage
            className={styles.widePhoto}
            src={item.wideSrc}
            alt=""
            width={1536}
            height={1024}
            sizes="(width < 721px) 100vw, (width < 1025px) 90vw, 1020px"
          />
          <div className={styles.wideBlur} aria-hidden>
            <MarketingImage
              className={styles.blurHard}
              src={item.wideSrc}
              alt=""
              width={1536}
              height={1024}
              sizes="(width < 721px) 40vw, 320px"
            />
          </div>
        </>
      ) : null}
      <div className={styles.scrim} aria-hidden />
      <div className={styles.top}>
        <p className={styles.pill}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.iconSrc} alt="" width={22} height={22} />
          {item.pill}
        </p>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-label={
            open ? `Close ${item.pill}` : `Expand ${item.pill}`
          }
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <span aria-hidden />
        </button>
      </div>
      <div className={styles.collapsedCopy} aria-hidden={open}>
        <h3 id={open ? undefined : headingId} className={styles.cardTitle}>
          {item.title}
        </h3>
      </div>
      <div className={styles.expandedCopy} aria-hidden={!open}>
        <div className={styles.intro}>
          <p className={styles.kicker}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.iconSrc} alt="" width={14} height={14} />
            {item.pill}
          </p>
          <h3 id={open ? headingId : undefined} className={styles.expandedTitle}>
            {item.title}
          </h3>
          <p className={styles.lede}>{item.claim}</p>
        </div>
        <ul className={styles.notes}>
          {item.notes.map((note) => (
            <li key={note.title} className={styles.note}>
              <span className={styles.noteChip}>{note.chip}</span>
              <p className={styles.noteTitle}>{note.title}</p>
            </li>
          ))}
        </ul>
        <div className={styles.shopWrap} onClick={(event) => event.stopPropagation()}>
          <Button
            href={item.href}
            styleVariant="Ghost"
            className={styles.shopBtn}
            tabIndex={open ? undefined : -1}
          >
            {`Shop ${item.pill}`}
          </Button>
          <p className={styles.footnote}>
            Available if prescribed after clinical review.
          </p>
        </div>
      </div>
      {open ? (
        <div className={styles.product} aria-hidden>
          <div
            className={shop.card}
            data-bloom={plate.id}
            data-settled="true"
            data-entrance="expand"
            data-seated={seated ? "true" : "false"}
            style={bloomStyle(plate.bloom)}
          >
            <ShopBloomPair vialSrc={plate.vialSrc} bloomSrc={plate.bloomSrc} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function LandingSection2() {
  const data = valueFields;
  const titleId = useId();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef(0);
  const openLayoutRef = useRef<{
    targetLeft: number;
    width: number;
  } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [frontId, setFrontId] = useState<string>(data.items[0].id);
  const frontIdRef = useRef<string>(data.items[0].id);

  const cardsInTrack = () =>
    trackRef.current
      ? [...trackRef.current.querySelectorAll<HTMLElement>(`.${styles.card}`)]
      : [];

  const scrollToIndex = (
    index: number,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const track = trackRef.current;
    const cards = cardsInTrack();
    const next = Math.max(0, Math.min(cards.length - 1, index));
    const card = cards[next];
    if (!track || !card) return;
    frontRef.current = next;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollTo({
      left: card.offsetLeft,
      behavior: reduceMotion ? "auto" : behavior,
    });
  };

  const jumpBy = (dir: -1 | 1) => {
    scrollToIndex(frontRef.current + dir);
  };

  const openCard = (id: string, index: number) => {
    const card = cardsInTrack()[index];
    if (card) {
      const bounds = contentBounds();
      const left = card.getBoundingClientRect().left;
      const width = Math.min(1020, bounds.width);
      const targetLeft =
        left + width > bounds.right
          ? Math.max(bounds.left, bounds.right - width)
          : left;
      openLayoutRef.current = { targetLeft, width };
      frontRef.current = index;
    }
    frontIdRef.current = id;
    setFrontId(id);
    setOpenId(id);
  };

  const closeCard = () => {
    openLayoutRef.current = null;
    const cards = cardsInTrack();
    const closing = cards.find((card) => card.dataset.open === "true");
    closing?.style.removeProperty("--card-w-open");
    setOpenId(null);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const syncFront = () => {
      raf = 0;
      const cards = cardsInTrack();
      const x = track.scrollLeft;
      let best = 0;
      let dist = Number.POSITIVE_INFINITY;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - x);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      frontRef.current = best;
      const id = cards[best]?.dataset.id;
      if (id && id !== frontIdRef.current) {
        frontIdRef.current = id;
        setFrontId(id);
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(syncFront);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const cards = cardsInTrack();
    if (!track) return;

    if (!openId) {
      cards.forEach((card) => card.style.removeProperty("--card-w-open"));
      const x = track.scrollLeft;
      let best: HTMLElement | null = cards[0] ?? null;
      let dist = Number.POSITIVE_INFINITY;
      cards.forEach((card) => {
        const d = Math.abs(card.offsetLeft - x);
        if (d < dist) {
          dist = d;
          best = card;
        }
      });
      if (best && dist > 1) {
        track.scrollTo({ left: best.offsetLeft, behavior: "auto" });
      }
      return;
    }

    const card = cards.find((entry) => entry.dataset.id === openId);
    const layout = openLayoutRef.current;
    if (!card || !layout) return;

    card.style.setProperty("--card-w-open", `${layout.width}px`);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 0 : 480;
    const start = performance.now();
    const targetLeft = layout.targetLeft;
    let raf = 0;

    const hold = () => {
      const delta = card.getBoundingClientRect().left - targetLeft;
      if (Math.abs(delta) > 0.5) {
        track.scrollLeft += delta;
      }
      if (performance.now() - start < duration + 32) {
        raf = window.requestAnimationFrame(hold);
      }
    };

    hold();
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [openId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className={styles.root} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {fieldTitle(data.titleLead, data.titleAccent)}
        </h2>
      </header>
      <div className={styles.rail}>
        <div
          ref={trackRef}
          className={`${styles.track} hide-scrollbar`}
          tabIndex={0}
          aria-label="Care categories"
          data-open={openId ? "true" : "false"}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              jumpBy(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          {data.items.map((item, index) => (
            <FieldCard
              key={item.id}
              item={item}
              eager={index < 2}
              open={openId === item.id}
              onToggle={() => {
                if (openId === item.id) {
                  closeCard();
                  return;
                }
                openCard(item.id, index);
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className={`${styles.jump} ${styles.jumpLeft}`}
          aria-label="Show previous cards"
          onClick={() => jumpBy(-1)}
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
          aria-label="Show more cards"
          onClick={() => jumpBy(1)}
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
      <LandingGlass lockId={openId} />
    </section>
  );
}
