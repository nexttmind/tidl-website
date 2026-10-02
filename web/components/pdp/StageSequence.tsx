"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MediaSlot } from "@/components/media/MediaSlot";
import { ShopBloomPair } from "@/components/home/ShopBloomPair";
import { catalogFieldId, shopCatalogItem } from "@/components/home/shop-catalog";
import { bloomStyle, shopPlate } from "@/components/home/shop-plates";
import shop from "@/components/home/LandingShop.module.css";
import { optCssImageSet } from "@/lib/media/opt-manifest";
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
  catalogId?: string;
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
  catalogId,
  className,
  liftStills = false,
}: StageSequenceProps) {
  const titleId = `${id}-title`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const field = themeId ? heroTheme(themeId) : null;
  const catalog = catalogId ? shopCatalogItem(catalogId) : undefined;
  const plate = themeId ? shopPlate(themeId) : null;
  const bloom = catalog?.bloom ?? plate?.bloom;
  const bloomSrc = catalog?.bloomSrc ?? plate?.bloomSrc ?? "";
  const plateSrc = catalog?.plateSrc ?? plate?.plateSrc;
  const fieldKey = catalogFieldId(catalogId, themeId);
  const fieldPaint = fieldKey
    ? undefined
    : plateSrc
      ? ({ backgroundImage: optCssImageSet(plateSrc, 800) } as CSSProperties)
      : field
        ? ({ backgroundImage: field.night.css } as CSSProperties)
        : undefined;
  const roundBloom = Boolean(collage.round.bloom && bloom && (fieldKey || fieldPaint));

  useEffect(() => {
    const wrap = wrapRef.current;
    const list = listRef.current;
    const fill = fillRef.current;
    if (!wrap || !list || !fill) return;

    const steps = [
      ...list.querySelectorAll<HTMLElement>("[data-step]"),
    ];
    let raf = 0;
    let full = 1;
    let marks: { step: HTMLElement; docTop: number; center: number }[] = [];

    const measure = () => {
      const wrapTop = wrap.getBoundingClientRect().top;
      full = Math.max(wrap.clientHeight - 24, 8);
      fill.style.height = `${full}px`;
      marks = steps.map((step) => {
        const mark = step.querySelector<HTMLElement>("[data-index]");
        const box = step.getBoundingClientRect();
        const center = mark
          ? mark.getBoundingClientRect().top + mark.offsetHeight / 2 - wrapTop
          : box.top - wrapTop;
        return { step, docTop: box.top + window.scrollY, center };
      });
    };

    const apply = () => {
      raf = 0;
      const probeDoc = window.scrollY + window.innerHeight * 0.4;
      let current = 0;
      for (let index = 0; index < marks.length; index += 1) {
        if (marks[index].docTop < probeDoc) current = index;
      }
      for (let index = 0; index < marks.length; index += 1) {
        const state =
          index < current ? "done" : index === current ? "active" : "wait";
        if (marks[index].step.dataset.state !== state) {
          marks[index].step.dataset.state = state;
        }
      }
      const y = Math.max(marks[current]?.center ?? 8, 8);
      fill.style.transform = `scaleY(${Math.min(1, y / full)})`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    measure();
    apply();
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    ro.observe(wrap);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
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
            {roundBloom && bloom ? (
              <div
                className={`${styles.round} ${styles.bloomCell} ${shop.bloomSeated}`}
                data-bloom={catalog?.id ?? plate?.id}
                data-kind={catalog?.kind}
                aria-label={collage.round.label}
                style={bloomStyle(bloom)}
              >
                <span
                  className={styles.bloomField}
                  data-catalog-field={fieldKey}
                  style={fieldPaint}
                  aria-hidden
                />
                {fieldKey ? null : <span className={styles.bloomGrain} aria-hidden />}
                <div className={styles.bloomStage}>
                  <span className={shop.bloomFrame}>
                    <ShopBloomPair
                      vialSrc={collage.round.src}
                      bloomSrc={bloomSrc}
                      alt={collage.round.label}
                      sizes="(width < 721px) 88vw, (width < 1025px) 44vw, 480px"
                      vialSizes="(width < 721px) 72vw, (width < 1025px) 36vw, 400px"
                    />
                  </span>
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
