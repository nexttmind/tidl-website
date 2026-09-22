import { useId } from "react";
import styles from "./AskAiIcon.module.css";

const SPARK =
  "M0 -3.75c.22 2.35 1.4 3.53 3.75 3.75C1.4 .22 .22 1.4 0 3.75C-.22 1.4 -1.4 .22 -3.75 0C-1.4 -.22 -.22 -1.4 0 -3.75Z";

export function AskAiIcon({ className }: { className?: string }) {
  const gradId = `askai${useId().replace(/:/g, "")}`;

  return (
    <span className={[styles.aiIcon, className].filter(Boolean).join(" ")} aria-hidden>
      {(["0", "1", "2"] as const).map((i) => (
        <span key={i} className={styles.aiStar} data-i={i}>
          <svg viewBox="-3.75 -3.75 7.5 7.5" fill="none">
            <defs>
              <linearGradient id={`${gradId}${i}`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--ask-ai-from)" />
                <stop offset="48%" stopColor="var(--ask-ai-mid)" />
                <stop offset="100%" stopColor="var(--ask-ai-to)" />
              </linearGradient>
            </defs>
            <path d={SPARK} fill={`url(#${gradId}${i})`} />
          </svg>
        </span>
      ))}
    </span>
  );
}
