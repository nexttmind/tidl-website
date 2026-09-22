"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CarePortalSession.module.css";

export function CarePortalSession() {
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
        /* stay hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/prescriberx/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
    } catch {
      /* still leave */
    }
    router.replace("/care/account?mode=login");
    router.refresh();
  };

  if (!email) return null;

  return (
    <div className={styles.bar}>
      <p className={styles.email}>{email}</p>
      <button
        type="button"
        className={styles.logout}
        onClick={() => void onLogout()}
        disabled={busy}
      >
        {busy ? "Leaving…" : "Log out"}
      </button>
    </div>
  );
}
