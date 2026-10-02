"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { formHeroSrc } from "@/components/home/shop-catalog";
import {
  defaultLaunchForm,
  defaultLaunchMolecule,
  type LaunchForm,
  type LaunchMolecule,
} from "@/content/pdp/launch-pricing";

type PdpFormContextValue = {
  catalogId: string;
  form: LaunchForm;
  setForm: (form: LaunchForm) => void;
  molecule?: LaunchMolecule;
  setMolecule: (molecule: LaunchMolecule) => void;
  heroSrc: string;
};

const PdpFormContext = createContext<PdpFormContextValue | null>(null);

export function PdpFormProvider({
  catalogId,
  fallbackHero,
  children,
}: {
  catalogId: string;
  fallbackHero: string;
  children: ReactNode;
}) {
  const [form, setForm] = useState<LaunchForm>(() =>
    defaultLaunchForm(catalogId, defaultLaunchMolecule(catalogId)),
  );
  const [molecule, setMolecule] = useState<LaunchMolecule | undefined>(() =>
    defaultLaunchMolecule(catalogId),
  );
  const heroSrc = formHeroSrc(catalogId, form) ?? fallbackHero;
  const value = useMemo(
    () => ({ catalogId, form, setForm, molecule, setMolecule, heroSrc }),
    [catalogId, form, molecule, heroSrc],
  );
  return <PdpFormContext.Provider value={value}>{children}</PdpFormContext.Provider>;
}

export function usePdpForm(): PdpFormContextValue | null {
  return useContext(PdpFormContext);
}
