"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type PatientSessionState = {
  email: string | null;
  busy: boolean;
  logout: () => Promise<void>;
};

/** Client session for header chrome. Returns null email when signed out. */
export function usePatientSession(): PatientSessionState {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/prescriberx/auth/session", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = (await res.json()) as {
          authenticated?: boolean;
          email?: string | null;
        };
        if (cancelled || !res.ok || !json.authenticated) return;
        setEmail(typeof json.email === "string" ? json.email : "Signed in");
      } catch {
        /* stay signed out */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/prescriberx/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
    } catch {
      /* still leave */
    }
    setEmail(null);
    router.replace("/care/account?mode=login");
    router.refresh();
  }, [router]);

  return { email, busy, logout };
}
