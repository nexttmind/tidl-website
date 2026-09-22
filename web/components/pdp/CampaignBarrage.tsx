"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import type { BarrageFrame } from "@/content/pdp/barrage";
import styles from "./CampaignBarrage.module.css";

const NARROW = "(width < 1025px)";

export function CampaignBarrage({ frames }: { frames: readonly BarrageFrame[] }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia(NARROW);
    const syncMotion = () => setReduced(motion.matches);
    const syncWidth = () => setNarrow(width.matches);
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
    if (reduced || !narrow || frames.length < 2) return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;

    const sync = () => {
      const run = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const progress = run <= 0 ? 0 : Math.min(1, Math.max(0, -top / run));
      const next = Math.min(
        frames.length - 1,
        Math.floor(progress * frames.length),
      );
      setIndex((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames.length, reduced, narrow]);

  if (frames.length === 0) return null;
  if (!narrow) return null;

  const mark = String(index + 1).padStart(2, "0");
  const total = String(frames.length).padStart(2, "0");

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={{ "--beats": frames.length } as CSSProperties}
      aria-label="Campaign stills"
    >
      <div className={styles.pin}>
        {(reduced ? frames : [frames[index]]).map((frame, i) => {
          if (!frame) return null;
          const realIndex = reduced ? i : index;
          return (
            <MarketingImage
              key={`${frame.src}-${realIndex}`}
              className={styles.still}
              src={frame.src}
              alt={realIndex === index ? frame.alt : ""}
              sizes="100vw"
              loading={realIndex === index ? "eager" : "lazy"}
            />
          );
        })}
        <p className={styles.mark} aria-hidden>
          {mark} / {total}
        </p>
      </div>
    </section>
  );
}
