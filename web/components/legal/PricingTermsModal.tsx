"use client";

import { useEffect, useId, useRef } from "react";
import { FaqAccordion } from "@/components/pdp/FaqAccordion";
import { pricingTerms } from "@/content/fixtures/pricing";
import styles from "./PricingTermsModal.module.css";

type PricingTermsModalProps = {
  open: boolean;
  onClose: () => void;
};

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PricingTermsModalContent({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const descId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const focusable = node.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    node.addEventListener("keydown", onTab);
    return () => node.removeEventListener("keydown", onTab);
  }, []);

  return (
    <div className={styles.root} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label={pricingTerms.close}
        onClick={onClose}
      />
      <div
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={pricingTerms.close}
        >
          <IconClose />
        </button>
        <div className={styles.body}>
          <h2 id={titleId} className={styles.title}>
            {pricingTerms.title}
          </h2>
          <p id={descId} className={styles.intro}>
            {pricingTerms.memberDefined}
          </p>
          <p className={styles.intro}>{pricingTerms.commitmentIntro}</p>
          <FaqAccordion items={pricingTerms.items} />
          <p className={styles.disclaimer}>{pricingTerms.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

export function PricingTermsModal({ open, onClose }: PricingTermsModalProps) {
  if (!open) return null;
  return <PricingTermsModalContent onClose={onClose} />;
}
