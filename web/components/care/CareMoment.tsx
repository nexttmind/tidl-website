import type { ReactNode } from "react";
import styles from "./CareMoment.module.css";

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  mediaSrc: string;
  children?: ReactNode;
};

/** Paper copy left, sticky lifestyle plate right. Same seam as PdpLeadSplit. */
export function CareMoment({
  eyebrow,
  title,
  lede,
  mediaSrc,
  children,
}: Props) {
  return (
    <section className={`layout-bleed ${styles.root}`} aria-labelledby="care-moment-title">
      <div className={styles.copy}>
        <div className={styles.pin}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="care-moment-title" className={styles.title}>
            {title}
          </h1>
          <hr className={styles.rule} />
          <p className={styles.lede}>{lede}</p>
          {children}
        </div>
      </div>
      <div className={styles.mediaCol}>
        <div className={styles.mediaStage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.media} src={mediaSrc} alt="" />
        </div>
      </div>
    </section>
  );
}
