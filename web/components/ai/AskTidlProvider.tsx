"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AskTidlModal } from "./AskTidlModal";

type AskTidlContextValue = {
  open: boolean;
  openModal: (seedQuery?: string) => void;
  closeModal: () => void;
};

const AskTidlContext = createContext<AskTidlContextValue | null>(null);

export function AskTidlProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [seedQuery, setSeedQuery] = useState<string | undefined>();

  const openModal = useCallback((nextSeed?: string) => {
    setSeedQuery(nextSeed);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setSeedQuery(undefined);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta || event.key.toLowerCase() !== "k") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      setOpen((prev) => !prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ open, openModal, closeModal }),
    [open, openModal, closeModal],
  );

  return (
    <AskTidlContext.Provider value={value}>
      {children}
      <AskTidlModal
        open={open}
        onClose={closeModal}
        seedQuery={seedQuery}
      />
    </AskTidlContext.Provider>
  );
}

export function useAskTidl() {
  const ctx = useContext(AskTidlContext);
  if (!ctx) {
    throw new Error("useAskTidl must be used within AskTidlProvider");
  }
  return ctx;
}
