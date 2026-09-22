import type { PdpPlanOption } from "@/content/pdp/types";
import { priceLineRows } from "@/content/pdp/pricing";
import styles from "./PriceBreakdown.module.css";

export function PriceBreakdown({
  plan,
  tone = "page",
}: {
  plan: PdpPlanOption;
  tone?: "page" | "field";
}) {
  if (!plan.first) return null;

  return (
    <div className={styles.root} data-tone={tone}>
      <section className={styles.block} aria-label={plan.first.label}>
        <p className={styles.heading}>{plan.first.label}</p>
        <dl className={styles.rows}>
          {priceLineRows(plan.first).map((row) => (
            <div
              key={row.label}
              className={row.label === "Total" ? styles.total : styles.row}
            >
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {plan.ongoing ? (
        <section className={styles.block} aria-label={plan.ongoing.label}>
          <p className={styles.heading}>{plan.ongoing.label}</p>
          <dl className={styles.rows}>
            {priceLineRows(plan.ongoing).map((row) => (
              <div
                key={row.label}
                className={row.label === "Total" ? styles.total : styles.row}
              >
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <p className={styles.none}>No renewal on a single order.</p>
      )}

      {plan.commitment ? (
        <p className={styles.commitment}>
          <span className={styles.commitmentLabel}>Total commitment</span>
          {plan.commitment}
        </p>
      ) : null}
    </div>
  );
}
