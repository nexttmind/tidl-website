"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { barrageFrames } from "@/content/pdp/barrage";
import { CATALOG_PDP_BY_ID } from "@/content/pdp/catalog-specs";
import { painReliefBarrageWords } from "@/content/pdp/pain-relief";
import { optCssImageSet, optEntry, optImgSrc } from "@/lib/media/opt-manifest";
import styles from "./CatalogBarrage.module.css";

const FRAME_MS = 130;
const FRAME_COUNT = 9;
const WORD_SPAN = 3;
const FADE_MS = 680;

function wideSrc(src: string): string | null {
  let wide: string;
  if (
    src.includes("/landing/stills/graphics/") &&
    !src.includes("/graphics/wide/")
  ) {
    return src.replace(
      "/landing/stills/graphics/",
      "/landing/stills/graphics/wide/",
    );
  }
  if (src.startsWith("/landing/stills/") && !src.includes("/graphics/")) {
    wide = src.replace("/landing/stills/", "/landing/stills/wide/");
  } else if (src.startsWith("/pain-relief/lifestyle/")) {
    wide = src.replace(
      "/pain-relief/lifestyle/",
      "/pain-relief/lifestyle/wide/",
    );
  } else {
    return null;
  }
  return optEntry(wide) ? wide : null;
}

export function CatalogBarrage({
  catalogId,
  onDone,
  cut = false,
}: {
  catalogId: string;
  onDone: () => void;
  /** End on the last frame. No fade plate after it. */
  cut?: boolean;
}) {
  const frames = barrageFrames(catalogId).slice(0, FRAME_COUNT);
  const words: readonly string[] =
    CATALOG_PDP_BY_ID[catalogId]?.chips ??
    painReliefBarrageWords(catalogId) ??
    [];
  const last = Math.max(0, frames.length - 1);

  const [phase, setPhase] = useState<"load" | "run" | "out">("load");
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const captionsRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  const cutRef = useRef(cut);
  doneRef.current = onDone;
  cutRef.current = cut;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(width >= 1025px)");
    const syncMotion = () => setReduced(motion.matches);
    const syncWidth = () => setDesktop(width.matches);
    syncMotion();
    syncWidth();
    motion.addEventListener("change", syncMotion);
    width.addEventListener("change", syncWidth);
    return () => {
      motion.removeEventListener("change", syncMotion);
      width.removeEventListener("change", syncWidth);
    };
  }, []);

  useEffect(() => {
    const wrap = captionsRef.current;
    if (!wrap || words.length === 0) return;

    const fit = () => {
      const paddings =
        parseFloat(getComputedStyle(wrap).paddingLeft) +
        parseFloat(getComputedStyle(wrap).paddingRight);
      const width = (wrap.clientWidth - paddings) * 0.88;
      if (width <= 0) return;
      const cap = wrap.clientHeight * 0.46;
      wrap.querySelectorAll<HTMLElement>("[data-caption]").forEach((line) => {
        const ink = line.firstElementChild as HTMLElement | null;
        if (!ink) return;
        line.style.fontSize = "100px";
        const inkWidth = ink.offsetWidth;
        if (inkWidth <= 0) return;
        line.style.fontSize = `${Math.min((width / inkWidth) * 100, cap)}px`;
      });
    };

    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    void document.fonts.ready.then(fit);
    fit();
    return () => observer.disconnect();
  }, [words.length]);

  useEffect(() => {
    if (phase !== "load" || frames.length === 0) return;
    const root = rootRef.current;
    if (!root) return;

    const imgs = [...root.querySelectorAll<HTMLImageElement>("img")];
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      if (reduced) {
        if (cutRef.current) {
          doneRef.current();
          return;
        }
        setIndex(last);
        setPhase("out");
        return;
      }
      setPhase("run");
    };

    const onReady = () => {
      const first = imgs[0];
      if (first?.complete && first.naturalWidth > 0) arm();
    };

    imgs.forEach((img) => {
      img.addEventListener("load", onReady);
      img.addEventListener("error", arm);
    });
    onReady();
    const fallback = window.setTimeout(arm, 700);
    return () => {
      window.clearTimeout(fallback);
      imgs.forEach((img) => {
        img.removeEventListener("load", onReady);
        img.removeEventListener("error", arm);
      });
    };
  }, [frames.length, last, phase, reduced]);

  useEffect(() => {
    if (frames.length === 0) {
      doneRef.current();
      return;
    }

    if (phase === "load") return;

    if (phase === "run") {
      const id = window.setTimeout(() => {
        if (index >= last) {
          if (cutRef.current) {
            doneRef.current();
            return;
          }
          setPhase("out");
          return;
        }
        setIndex((current) => current + 1);
      }, FRAME_MS);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => doneRef.current(), FADE_MS);
    return () => window.clearTimeout(id);
  }, [frames.length, index, last, phase]);

  if (frames.length === 0) return null;

  const wordIndex =
    words.length > 0
      ? Math.min(words.length - 1, Math.floor(index / WORD_SPAN))
      : -1;
  const live = phase !== "load" && wordIndex >= 0 ? words[wordIndex] : "";

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-phase={phase}
      data-stacked={reduced ? "" : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      {frames.map((frame, i) => {
        const isActive = i === index;
        const ready = i <= Math.min(last, index + 2);
        const src =
          isActive && desktop ? (wideSrc(frame.src) ?? frame.src) : frame.src;
        return (
          <div
            key={`${frame.src}-${i}`}
            className={`${styles.still} ${isActive ? styles.stillOn : ""}`}
            style={
              ready
                ? ({
                    backgroundImage: optCssImageSet(src, desktop ? 1600 : 800),
                  } as CSSProperties)
                : undefined
            }
          />
        );
      })}
      <div className={styles.preload} aria-hidden>
        <img
          src={optImgSrc(frames[0].src, desktop ? 1600 : 800)}
          alt=""
          width={1}
          height={1}
        />
      </div>
      {words.length > 0 ? (
        <div ref={captionsRef} className={styles.captions}>
          {words.map((text, i) => (
            <p
              key={text}
              className={`${styles.caption} ${
                reduced || (phase !== "load" && i === wordIndex)
                  ? styles.captionOn
                  : ""
              }`}
              data-caption=""
            >
              <span className={styles.captionInk}>{text}</span>
            </p>
          ))}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
