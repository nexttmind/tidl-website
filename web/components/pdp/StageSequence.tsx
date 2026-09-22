"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MediaSlot } from "@/components/media/MediaSlot";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import styles from "./StageSequence.module.css";

export type StageMedia = {
  id: string;
  src: string;
  label: string;
  swatch?: string;
  fit?: "cover" | "contain";
  vivid?: boolean;
  /** Product vial on the category night field + bloom. */
  bloom?: boolean;
};

export type StageStep = {
  marker: string;
  title: string;
  body: string;
  /** Lower contrast, like a later chapter in the sequence. */
  later?: boolean;
};

export type StageCollage = {
  hero: StageMedia;
  round: StageMedia;
  inset: StageMedia;
};

type StageSequenceProps = {
  id: string;
  headline: string;
  subtitle?: string;
  stages: readonly StageStep[];
  collage: StageCollage;
  themeId?: ThemeId;
  className?: string;
  liftStills?: boolean;
};

/**
 * Care path: olive week pills on a node spine, sticky collage.
 */
export function StageSequence({
  id,
  headline,
  subtitle,
  stages,
  collage,
  themeId,
  className,
  liftStills = false,
}: StageSequenceProps) {
  const titleId = `${id}-title`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const field = themeId ? heroTheme(themeId) : null;
  const plate = themeId ? shopPlate(themeId) : null;
  const roundBloom = Boolean(collage.round.bloom && plate && field);

  useEffect(() => {
    const wrap = wrapRef.current;
    const list = listRef.current;
    const fill = fillRef.current;
    if (!wrap || !list || !fill) return;

    const steps = [
      ...list.querySelectorAll<HTMLElement>("[data-step]"),
    ];
    let raf = 0;

    const apply = () => {
      raf = 0;
      const probe = window.innerHeight * 0.4;
      let current = 0;
      steps.forEach((step, index) => {
        if (step.getBoundingClientRect().top < probe) current = index;
      });
      steps.forEach((step, index) => {
        step.dataset.state =
          index < current ? "done" : index === current ? "active" : "wait";
      });
      const active = steps[current];
      const mark = active?.querySelector<HTMLElement>("[data-index]");
      if (!active || !mark) return;
      const y =
        mark.getBoundingClientRect().top +
        mark.offsetHeight / 2 -
        wrap.getBoundingClientRect().top;
      fill.style.height = `${Math.max(y, 8)}px`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [stages.length]);

  return (
    <section
      className={[styles.root, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
      id={id}
    >
      <div className={styles.frame}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.headline}>
            {headline}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>

        <div className={styles.grid}>
          <div className={styles.narrative}>
            <div ref={wrapRef} className={styles.timelineWrap}>
              <span className={styles.spine} aria-hidden />
              <span ref={fillRef} className={styles.spineFill} aria-hidden />
              <span className={styles.spineArrow} aria-hidden />
              <ol ref={listRef} className={styles.timeline}>
                {stages.map((stage) => (
                  <li
                    key={stage.marker}
                    className={styles.step}
                    data-step=""
                    data-later={stage.later ? "true" : undefined}
                  >
                    <span className={styles.node} data-index aria-hidden />
                    <div className={styles.stepCopy}>
                      <div className={styles.stepHead}>
                        <span className={styles.badge}>{stage.marker}</span>
                        <h3 className={styles.stepTitle}>{stage.title}</h3>
                      </div>
                      <p className={styles.stepBody}>{stage.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className={styles.collage}>
            <MediaSlot
              id={collage.hero.id}
              fill
              src={collage.hero.src}
              label={collage.hero.label}
              swatch={collage.hero.swatch}
              fit={collage.hero.fit}
              vivid={collage.hero.vivid}
              lift={liftStills}
              className={styles.hero}
            />
            {roundBloom && plate && field ? (
              <div
                className={`${styles.round} ${styles.bloomCell}`}
                data-bloom={plate.id}
                aria-label={collage.round.label}
                style={
                  {
                    ...bloomStyle(plate.bloom),
                    "--theme-night": field.night.css,
                  } as CSSProperties
                }
              >
                <span className={styles.bloomField} aria-hidden />
                <span className={styles.bloomGrain} aria-hidden />
                <div className={styles.bloomStage}>
                  <ShopBloomPair
                    vialSrc={collage.round.src}
                    bloomSrc={plate.bloomSrc}
                    alt={collage.round.label}
                  />
                </div>
              </div>
            ) : (
              <MediaSlot
                id={collage.round.id}
                fill
                src={collage.round.src}
                label={collage.round.label}
                swatch={collage.round.swatch}
                fit={collage.round.fit}
                vivid={collage.round.vivid}
                className={[
                  styles.round,
                  collage.round.fit === "contain" ? styles.plate : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
            <MediaSlot
              id={collage.inset.id}
              fill
              src={collage.inset.src}
              label={collage.inset.label}
              swatch={collage.inset.swatch}
              fit={collage.inset.fit}
              vivid={collage.inset.vivid}
              lift={liftStills}
              className={[
                styles.inset,
                collage.inset.fit === "contain" ? styles.plate : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
