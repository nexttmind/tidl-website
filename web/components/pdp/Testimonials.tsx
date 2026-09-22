"use client";

import { useRef } from "react";
import styles from "./Testimonials.module.css";

type Item = {
  quote: string;
  body: string;
  name: string;
};

type TestimonialsProps = {
  title: string;
  subtitle?: string;
  items: readonly Item[];
};

function IconVerified() {
  return (
    <svg
      className={styles.verifiedIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="8" fill="#3f4f3c" />
      <path
        d="M4.75 8.1 6.85 10.2 11.4 5.65"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {dir === "prev" ? (
        <path
          d="M10 3.5 5.5 8 10 12.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3.5 10.5 8 6 12.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function Testimonials({ title, subtitle, items }: TestimonialsProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  function scrollByCard(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card
      ? card.getBoundingClientRect().width + 20
      : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section className={styles.root} aria-labelledby="stories-title">
      <div className={styles.frame}>
        <header className={styles.header}>
          <h2 id="stories-title" className={styles.title}>
            {title}
          </h2>
          {subtitle ? (
            <p className={styles.subtitle}>
              <span className={styles.subtitleLead}>{subtitle}</span>
              <span className={styles.verified}>
                <IconVerified />
                Verified customers
              </span>
            </p>
          ) : (
            <p className={styles.subtitle}>
              <span className={styles.verified}>
                <IconVerified />
                Verified customers
              </span>
            </p>
          )}
        </header>

        <ul
          ref={scrollerRef}
          className={[styles.list, "hide-scrollbar"].join(" ")}
        >
          {items.map((item) => (
            <li key={item.name} className={styles.card}>
              <p className={styles.stars} aria-label="5 out of 5 stars">
                <span aria-hidden>★★★★★</span>
              </p>
              <p className={styles.quote}>{item.quote}</p>
              <p className={styles.body}>{item.body}</p>
              <p className={styles.name}>{item.name}</p>
            </li>
          ))}
        </ul>

        <div className={styles.nav} role="group" aria-label="Reviews">
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollByCard(-1)}
            aria-label="Previous reviews"
          >
            <IconArrow dir="prev" />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scrollByCard(1)}
            aria-label="Next reviews"
          >
            <IconArrow dir="next" />
          </button>
        </div>
      </div>
    </section>
  );
}
