"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./ScrollReveal.module.css";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay before the settle starts, in ms. */
  delayMs?: number;
  /**
   * How much of the element must enter before revealing.
   * Lower = earlier trigger.
   */
  threshold?: number;
  /**
   * IntersectionObserver rootMargin. Positive bottom inset starts the
   * settle before the block reaches the fold.
   */
  rootMargin?: string;
};

/**
 * Apple Ads style scroll settle: opacity + translateY into place.
 * Re-triggers after you scroll back up past the block, then down again.
 * Respects reduced motion. Progressive: visible without JS.
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  threshold = 0.06,
  rootMargin = "0px 0px 0px 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMq.matches) {
      setVisible(true);
      return;
    }

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          setVisible(true);
          return;
        }

        // Left through the bottom (scrolled back up past this block).
        // Snap to pending so the next scroll down can settle in again.
        // Left through the top (scrolled down past): keep settled.
        if (entry.boundingClientRect.top > 0) {
          setVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const pending = armed && !visible;
  const style: CSSProperties | undefined =
    delayMs > 0 && visible
      ? { transitionDelay: `${delayMs}ms` }
      : undefined;

  return (
    <div
      ref={ref}
      className={[
        styles.root,
        pending ? styles.pending : "",
        visible || !armed ? styles.settled : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
