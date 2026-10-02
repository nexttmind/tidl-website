import type { ReactNode } from "react";
import styles from "./SoldOutTitle.module.css";

/** Struck title. Pass mark false when the words sit on the tile instead. */
export function SoldOutTitle({
  children,
  mark = true,
}: {
  children: ReactNode;
  mark?: boolean;
}) {
  return (
    <span className={styles.row}>
      <span className={styles.name}>{children}</span>
      {mark ? <span className={styles.mark}>Sold out</span> : null}
    </span>
  );
}

/** Small all-caps mark for the top right corner of a tile. */
export function SoldOutBadge() {
  return (
    <span className={styles.badge} data-tone="inverse">
      Sold out
    </span>
  );
}
