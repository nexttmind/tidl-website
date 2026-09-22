"use client";

import { useId, useState } from "react";
import styles from "./FaqAccordion.module.css";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

export function FaqAccordion({
  items,
  heading,
  intro,
}: {
  items: readonly FaqItem[];
  heading?: string;
  intro?: string;
}) {
  const baseId = useId();
  const [openId, setOpenId] = useState(
    () => items.find((item) => item.defaultOpen)?.id ?? null,
  );

  return (
    <section className={styles.root} aria-labelledby={heading ? `${baseId}-h` : undefined}>
      {heading ? (
        <h2 id={`${baseId}-h`} className={styles.heading}>
          {heading}
        </h2>
      ) : null}
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      <div className={styles.list}>
        {items.map((item) => {
          const expanded = openId === item.id;
          const panelId = `${baseId}-${item.id}-panel`;
          const buttonId = `${baseId}-${item.id}-btn`;
          return (
            <div key={item.id} className={styles.item}>
              <button
                type="button"
                id={buttonId}
                className={styles.question}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenId(expanded ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className={styles.glyph} aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
              {expanded ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={styles.answer}
                >
                  <p>{item.answer}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
