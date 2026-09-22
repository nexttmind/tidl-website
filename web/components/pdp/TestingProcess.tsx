import type { ReactNode } from "react";
import styles from "./TestingProcess.module.css";

export type TestingPillar = {
  id: string;
  icon: TestingIconId;
  title: string;
  body?: string;
};

type TestingProcessProps = {
  eyebrow?: string;
  headline: string;
  lede: string;
  items: readonly TestingPillar[];
};

export type TestingIconId =
  | "analytic"
  | "batch"
  | "sterility"
  | "licensed";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Pipette over an open palm. */
function IconBatch() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      <path d="M24 6.5v4" {...stroke} />
      <path d="M20.5 10.5h7v5.5l1.6 2.4H18.9l1.6-2.4V10.5Z" {...stroke} />
      <path d="M24 18.4v7.2" {...stroke} />
      <circle cx="24" cy="27.8" r="1.35" fill="currentColor" stroke="none" />
      <path
        d="M14 32.5c2.2-3.2 5.4-5 10-5s7.8 1.8 10 5c1.4 2 2.2 4.4 1.6 6.6-.4 1.6-1.8 2.6-3.6 2.6H16c-1.8 0-3.2-1-3.6-2.6-.6-2.2.2-4.6 1.6-6.6Z"
        {...stroke}
      />
      <path d="M18.5 36.5h11" {...stroke} />
    </svg>
  );
}

/** Erlenmeyer flask. */
function IconAnalytic() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      <path d="M19 7h10" {...stroke} />
      <path d="M21 7v9.2L11.5 39.2A3.2 3.2 0 0 0 14.4 43.5h19.2a3.2 3.2 0 0 0 2.9-4.3L27 16.2V7" {...stroke} />
      <path d="M16.2 28.5h15.6" {...stroke} />
    </svg>
  );
}

/** Capsule with a check on the upper half. */
function IconLicensed() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 6.5c4.6 0 8.3 3.4 8.3 9.6v15.8c0 6.2-3.7 9.6-8.3 9.6s-8.3-3.4-8.3-9.6V16.1c0-6.2 3.7-9.6 8.3-9.6Z"
        {...stroke}
      />
      <path d="M15.7 24h16.6" {...stroke} />
      <path d="M20.2 16.2 22.8 18.7 27.6 13.4" {...stroke} />
    </svg>
  );
}

/** Shield with a droplet. Unused in the three-up, kept for older fixtures. */
function IconSterility() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 6.5 38 12v12.2c0 10-6.4 16.8-14 20.2-7.6-3.4-14-10.2-14-20.2V12L24 6.5Z"
        {...stroke}
      />
      <path d="M24 18c2.6 0 4.6 2 4.6 4.8 0 3.6-4.6 8-4.6 8s-4.6-4.4-4.6-8c0-2.8 2-4.8 4.6-4.8Z" {...stroke} />
    </svg>
  );
}

const ICONS: Record<TestingIconId, ReactNode> = {
  analytic: <IconAnalytic />,
  batch: <IconBatch />,
  sterility: <IconSterility />,
  licensed: <IconLicensed />,
};

export function TestingProcess({
  headline,
  lede,
  items,
}: TestingProcessProps) {
  return (
    <section className={styles.root} aria-labelledby="testing-title">
      <div className={styles.inner}>
        <header className={styles.copy}>
          <h2 id="testing-title" className={styles.headline}>
            {headline}
          </h2>
          <p className={styles.lede}>{lede}</p>
        </header>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id} className={styles.card}>
              <span className={styles.icon} aria-hidden>
                {ICONS[item.icon]}
              </span>
              <p className={styles.title}>{item.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
