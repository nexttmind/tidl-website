import styles from "./DiscountNotecard.module.css";

export type DiscountNotecardProps = {
  /** Primary savings line, e.g. "Save $100". */
  amount: string;
  /** Short eyebrow, e.g. "Limited time". */
  eyebrow?: string;
  /** Offer name under the amount, e.g. "First order pricing". */
  title?: string;
  /** Supporting line under the title. */
  body?: string;
  /** Optional code chip. */
  code?: string;
};

/** Gradient paper notecard sitting above PDP value props. */
export function DiscountNotecard({
  amount,
  eyebrow,
  title,
  body,
  code,
}: DiscountNotecardProps) {
  return (
    <aside className={styles.root} aria-label="Current offer">
      <div className={styles.grain} aria-hidden />
      <div className={styles.inner}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <p className={styles.amount}>{amount}</p>
        {title ? <p className={styles.title}>{title}</p> : null}
        {body ? <p className={styles.body}>{body}</p> : null}
        {code ? (
          <p className={styles.codeRow}>
            <span className={styles.codeLabel}>Code</span>
            <span className={styles.code}>{code}</span>
          </p>
        ) : null}
      </div>
    </aside>
  );
}

/** Pull a dollar integer savings amount from compare-at vs price strings. */
export function savingsAmount(price: string, compareAt?: string): string | null {
  if (!compareAt) return null;
  const parse = (value: string) => {
    const n = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const current = parse(price);
  const was = parse(compareAt);
  if (current == null || was == null || was <= current) return null;
  const dollars = Math.round(was - current);
  return `Save $${dollars}`;
}
