import Link from "next/link";
import styles from "./TidlLogoLockup.module.css";

type TidlLogoLockupProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function TidlLogoLockup({
  href = "/",
  className,
  compact = false,
}: TidlLogoLockupProps) {
  const inner = (
    <span
      className={[styles.lockup, compact ? styles.compact : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/tidl-wordmark.svg"
        alt=""
        width={183}
        height={33}
        className={styles.wordmark}
      />
      {!compact ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/tidl-tagline.svg"
          alt=""
          width={183}
          height={10}
          className={styles.tagline}
        />
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link} aria-label="TIDL home">
        {inner}
      </Link>
    );
  }

  return inner;
}
