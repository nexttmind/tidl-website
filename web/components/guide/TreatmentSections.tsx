"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SECTION_TABS = [
  { id: "product-guide", label: "Products" },
  { id: "bundle-guide", label: "Product Bundles" },
  { id: "treatment-guide", label: "Treatments" },
  { id: "pain-guide", label: "Pain Relief" },
] as const;

export type SectionId = (typeof SECTION_TABS)[number]["id"];

type TreatmentSectionValue = {
  id: SectionId;
  index: number;
  compact: boolean;
  select: (id: SectionId) => void;
};

const TreatmentSectionContext = createContext<TreatmentSectionValue | null>(null);

const PHONE = "(width < 721px)";
const TABLET = "(721px <= width < 1025px)";

export function useTreatmentSection(): TreatmentSectionValue {
  const value = useContext(TreatmentSectionContext);
  if (value) return value;
  return {
    id: SECTION_TABS[0].id,
    index: 0,
    compact: false,
    select: () => {},
  };
}

function sectionFromHash(hash: string): SectionId | null {
  const id = hash.replace("#", "");
  return SECTION_TABS.some((tab) => tab.id === id) ? (id as SectionId) : null;
}

export function TreatmentSections({ children }: { children: ReactNode }) {
  const [id, setId] = useState<SectionId>(SECTION_TABS[0].id);
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const fromHash = sectionFromHash(window.location.hash);
    if (fromHash) setId(fromHash);
  }, []);

  useLayoutEffect(() => {
    const phone = window.matchMedia(PHONE);
    const tablet = window.matchMedia(TABLET);
    const sync = () => setCompact(phone.matches || tablet.matches);
    sync();
    phone.addEventListener("change", sync);
    tablet.addEventListener("change", sync);
    return () => {
      phone.removeEventListener("change", sync);
      tablet.removeEventListener("change", sync);
    };
  }, []);

  const select = useCallback((next: SectionId) => {
    setId(next);
  }, []);

  const index = Math.max(
    0,
    SECTION_TABS.findIndex((tab) => tab.id === id),
  );

  const value = useMemo(
    () => ({ id, index, compact, select }),
    [id, index, compact, select],
  );

  return (
    <TreatmentSectionContext.Provider value={value}>{children}</TreatmentSectionContext.Provider>
  );
}
