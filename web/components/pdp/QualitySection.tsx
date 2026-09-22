import type { CSSProperties, ReactNode } from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { heroTheme, type ThemeId } from "@/content/brand/peptide-identity";
import styles from "./QualitySection.module.css";

type Metric = {
  metric: string;
  description: string;
};

type PlateCallout = {
  chip: string;
  body: string;
  side: "left" | "right";
  anchor: "cap" | "label" | "base";
};

type QualityPlate = {
  fieldSrc: string;
  vialSrc: string;
  callouts: readonly PlateCallout[];
};

type QualitySectionProps = {
  titleLines: readonly string[];
  body: readonly string[];
  metrics: readonly Metric[];
  /** Full-bleed pin background (product pen plate). */
  backgroundSrc?: string;
  /** Cover fills the pin. Contain keeps a studio still fully visible. */
  mediaFit?: "cover" | "contain";
  /** Skin & Hair field wash behind the pen (Figma 645:189). */
  wash?: "skin-hair";
  /** Composed 2:3 category plate (field, vial, callouts). */
  plate?: QualityPlate;
  themeId?: ThemeId;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Concentration window: cuvette with an acceptance band. Not the testing flask. */
function IconPotency() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <rect x="9" y="3.5" width="10" height="21" rx="2" {...stroke} />
      <path d="M9 11.5h10" {...stroke} />
      <path d="M9 16.5h10" {...stroke} />
      <path d="M19 11.5h3.2" {...stroke} />
      <path d="M19 16.5h3.2" {...stroke} />
      <circle cx="14" cy="14" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Sealed ampule. Distinct from the testing shield and droplet. */
function IconSterility() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <path d="M11.5 8.5V6.2A2.5 2.5 0 0 1 14 3.7a2.5 2.5 0 0 1 2.5 2.5V8.5" {...stroke} />
      <path d="M10 8.5h8v11.2a4 4 0 0 1-8 0V8.5Z" {...stroke} />
      <path d="M10 12.5h8" {...stroke} />
      <path d="M14 3.7V2.2" {...stroke} />
    </svg>
  );
}

/** Acid base balance on a fulcrum. */
function IconPh() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <path d="M3.5 15h21" {...stroke} />
      <path d="M14 15 10.6 25.5h6.8L14 15Z" {...stroke} />
      <path
        d="M8 4.8c0 0-2.7 4.4-2.7 6.7a2.7 2.7 0 1 0 5.4 0C10.7 9.2 8 4.8 8 4.8Z"
        {...stroke}
      />
      <path d="M8 11.5V15" {...stroke} />
      <circle cx="20" cy="8.4" r="3.1" {...stroke} />
      <path d="M20 11.5V15" {...stroke} />
    </svg>
  );
}

/** Cell screen. Distinct from the testing set. */
function IconEndotoxin() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <path d="M14 4 23.5 9.5v9L14 24 4.5 18.5v-9L14 4Z" {...stroke} />
      <circle cx="14" cy="14" r="3.2" {...stroke} />
      <path d="M14 10.8v6.4" {...stroke} />
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  Potency: <IconPotency />,
  Sterility: <IconSterility />,
  pH: <IconPh />,
  Endotoxicity: <IconEndotoxin />,
};

/**
 * Full-bleed quality band: sticky pin left, metrics list on the right.
 * Pin is either a category 2:3 plate or a still on a wash.
 */
export function QualitySection({
  titleLines,
  body,
  metrics,
  backgroundSrc = "/landing/pen.png",
  mediaFit = "cover",
  wash,
  plate,
  themeId,
}: QualitySectionProps) {
  const field = themeId ? heroTheme(themeId) : null;
  const pinStyle = field
    ? ({ "--theme-night": field.night.css } as CSSProperties)
    : undefined;

  return (
    <section className={styles.root} aria-labelledby="quality-title">
      <div
        className={styles.pin}
        data-wash={wash && !plate ? wash : undefined}
        data-plate={plate ? "true" : undefined}
        data-theme={themeId}
        style={pinStyle}
      >
        {plate ? (
          <QualityPlateView plate={plate} />
        ) : (
          <>
            {wash ? (
              <>
                {mediaFit === "contain" ? (
                  <div className={styles.pinField} aria-hidden />
                ) : null}
                <div className={styles.pinGrain} aria-hidden />
              </>
            ) : null}
            <div
              className={[
                styles.pinMedia,
                mediaFit === "contain" ? styles.pinMediaContain : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ backgroundImage: `url(${backgroundSrc})` }}
              aria-hidden
            />
            <div className={styles.copy}>
              <h2 id="quality-title" className={styles.title}>
                {titleLines.map((line) => (
                  <span key={line} className={styles.titleLine}>
                    {line}
                  </span>
                ))}
              </h2>
              {body.map((paragraph) => (
                <p key={paragraph} className={styles.body}>
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
      <div className={styles.metricsCol}>
        {plate ? (
          <div className={styles.metricsIntro}>
            <h2 id="quality-title" className={styles.title}>
              {titleLines.map((line) => (
                <span key={line} className={styles.titleLine}>
                  {line}
                </span>
              ))}
            </h2>
            {body.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        <ul className={styles.metrics}>
          {metrics.map((item) => (
            <li key={item.metric} className={styles.metric}>
              {ICONS[item.metric] ? (
                <span className={styles.icon} aria-hidden>
                  {ICONS[item.metric]}
                </span>
              ) : null}
              <div className={styles.metricCopy}>
                <h3 className={styles.metricName}>{item.metric}</h3>
                <p className={styles.metricBody}>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function QualityPlateView({ plate }: { plate: QualityPlate }) {
  return (
    <>
      <MarketingImage
        className={styles.plateField}
        src={plate.fieldSrc}
        alt=""
        sizes="(width < 721px) 100vw, (width < 1025px) 80vw, 720px"
      />
      <div className={styles.plateStage}>
        <MarketingImage
          className={styles.plateVial}
          src={plate.vialSrc}
          alt=""
          width={1024}
          height={1024}
          sizes="(width < 721px) 55vw, 240px"
          dataBloomVial
        />
      </div>
      <ul className={styles.plateCallouts} aria-hidden>
        {plate.callouts.map((item) => (
          <li
            key={item.chip}
            className={styles.plateCallout}
            data-side={item.side}
            data-anchor={item.anchor}
          >
            <span className={styles.plateChip}>{item.chip}</span>
            <span className={styles.plateStem} />
            <p className={styles.plateCalloutBody}>{item.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
