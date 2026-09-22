"use client";

import { usePricingTerms } from "@/components/legal/PricingTermsProvider";
import styles from "./FooterGlobal.module.css";

export function FooterActionLink({ label }: { label: string }) {
  const { openModal } = usePricingTerms();

  return (
    <button type="button" className={styles.action} onClick={openModal}>
      {label}
    </button>
  );
}
