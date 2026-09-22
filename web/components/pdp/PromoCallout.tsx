import styles from "./PromoCallout.module.css";

/** Molecule/Promo Callout — DS-STUB: no icon library yet */
export function PromoCallout({ text }: { text: string }) {
  return (
    <div className={styles.root} data-ds-stub="true">
      <span className={styles.mark} aria-hidden>
        *
      </span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
