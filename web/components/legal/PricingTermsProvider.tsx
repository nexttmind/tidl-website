"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PricingTermsModal } from "./PricingTermsModal";

type PricingTermsContextValue = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const PricingTermsContext = createContext<PricingTermsContextValue | null>(null);

export function PricingTermsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, openModal, closeModal }),
    [open, openModal, closeModal],
  );

  return (
    <PricingTermsContext.Provider value={value}>
      {children}
      <PricingTermsModal open={open} onClose={closeModal} />
    </PricingTermsContext.Provider>
  );
}

export function usePricingTerms() {
  const ctx = useContext(PricingTermsContext);
  if (!ctx) {
    throw new Error("usePricingTerms must be used within PricingTermsProvider");
  }
  return ctx;
}
