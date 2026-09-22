"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  resolveClinicalEntry,
  type ClinicalEntry,
} from "@/content/clinical/entry-map";
import {
  readIntakeHandoff,
  type IntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import styles from "./AccountWizard.module.css";

type Mode = "create" | "login";

type Props = {
  entrySlug: string;
  encounterId?: string;
  initialMode?: Mode;
  nextPath?: string;
};

type AuthJson = {
  success?: boolean;
  message?: string;
  email?: string;
  data?: {
    password?: {
      status?: string;
    };
  };
};

const GENERIC_AUTH =
  "Unable to complete authentication. Check your details and try again.";

const ALLOWED_NEXT = [
  "/care/waiting",
  "/care/protocol",
  "/care/visit",
  "/care/confirmation",
  "/care/home",
] as const;

function safeCareNext(raw: string | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/care/")) return null;
  if (raw.startsWith("//")) return null;
  if (
    raw.includes("://") ||
    raw.includes("\\") ||
    raw.includes("\0") ||
    raw.includes("..")
  ) {
    return null;
  }
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? "";
  if (!ALLOWED_NEXT.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`))) {
    return null;
  }
  return raw;
}

async function readAuthJson(res: Response): Promise<AuthJson> {
  try {
    return (await res.json()) as AuthJson;
  } catch {
    return {};
  }
}

function authMessage(json: AuthJson): string {
  return typeof json.message === "string" && json.message.trim()
    ? json.message
    : GENERIC_AUTH;
}

export function AccountWizard({
  entrySlug,
  encounterId,
  initialMode = "create",
  nextPath,
}: Props) {
  const router = useRouter();
  const entry: ClinicalEntry = useMemo(
    () => resolveClinicalEntry(entrySlug),
    [entrySlug],
  );

  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);
  const [continueHref, setContinueHref] = useState<string | null>(null);
  const [alreadySignedIn, setAlreadySignedIn] = useState(false);

  useEffect(() => {
    const data = readIntakeHandoff();
    setHandoff(data);
    if (data?.email) setEmail(data.email);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/prescriberx/auth/session", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await readAuthJson(res);
        if (cancelled || !res.ok || json.success === false) return;
        if (json.email) setEmail(json.email);
        setAlreadySignedIn(true);
        const params = new URLSearchParams();
        params.set("entry", entry.slug);
        if (encounterId || handoff?.encounterId) {
          params.set("encounter", encounterId || handoff?.encounterId || "");
          setContinueHref(`/care/waiting?${params.toString()}`);
        } else {
          setContinueHref(`/care/home?${params.toString()}`);
        }
        setNotice("You are already signed in. Continue to physician review.");
      } catch {
        /* stay on create / login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entry.slug, encounterId, handoff?.encounterId]);

  const resolvedEncounter = encounterId || handoff?.encounterId || "";
  const chartId = handoff?.patientChartId?.trim() ?? "";
  const passwordUnset = Boolean(continueHref) && !alreadySignedIn;
  const signedInContinue = alreadySignedIn && Boolean(continueHref);
  const canContinue =
    Boolean(email.trim() && email.includes("@")) &&
    password.length >= 8 &&
    (mode === "login" || (confirm.length > 0 && password === confirm));

  const destination = () => {
    const safeNext = safeCareNext(nextPath);
    if (safeNext) return safeNext;
    const params = new URLSearchParams();
    params.set("entry", entry.slug);
    if (resolvedEncounter) {
      params.set("encounter", resolvedEncounter);
      return `/care/waiting?${params.toString()}`;
    }
    return `/care/home?${params.toString()}`;
  };

  const finishSession = () => {
    setPassword("");
    setConfirm("");
    // Keep the intake encounter in localStorage so header Sign up still
    // has the chart link if the patient returns to this page.
  };

  const onForgot = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setForgotBusy(true);
    try {
      const res = await fetch("/api/prescriberx/auth/forgot", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await readAuthJson(res);
      if (!res.ok || json.success === false) {
        setError(authMessage(json));
        return;
      }
      setNotice(
        authMessage(json) === GENERIC_AUTH
          ? "If an account exists for that email, password reset instructions were sent."
          : authMessage(json),
      );
    } catch {
      setError(GENERIC_AUTH);
    } finally {
      setForgotBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs at least eight characters.");
      return;
    }
    if (mode === "create" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (mode === "create" && !resolvedEncounter) {
      setError(
        "This Sign up page has no intake attached. Open it from the page after you submit intake, or use Log in / Email me a reset link.",
      );
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/prescriberx/auth/register", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            password_confirmation: confirm,
            encounter_id: resolvedEncounter,
            ...(chartId ? { patient_chart_id: chartId } : {}),
          }),
        });
        const json = await readAuthJson(res);
        if (!res.ok || json.success === false) {
          setError(authMessage(json));
          return;
        }

        const href = destination();
        finishSession();
        const passwordStatus = json.data?.password?.status;
        if (passwordStatus === "failed") {
          setContinueHref(href);
          setNotice(
            "Your session is active. This password was not saved. Email a reset link, or continue to physician review.",
          );
          return;
        }
        router.push(href);
        return;
      }

      const res = await fetch("/api/prescriberx/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const json = await readAuthJson(res);
      if (!res.ok || json.success === false) {
        setError(authMessage(json));
        setNotice(
          "If this is your first sign-in, your password may not be saved yet. Use Email me a reset link to set one.",
        );
        return;
      }
      const href = destination();
      finishSession();
      router.push(href);
    } catch {
      setError(GENERIC_AUTH);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <div className={styles.modeSwitch} role="tablist" aria-label="Account">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "create"}
            className={`${styles.modeBtn} ${mode === "create" ? styles.modeBtnActive : ""}`}
            onClick={() => {
              setMode("create");
              setError(null);
              setNotice(null);
            }}
            disabled={passwordUnset || signedInContinue}
          >
            Create account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`${styles.modeBtn} ${mode === "login" ? styles.modeBtnActive : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
              setNotice(null);
            }}
            disabled={passwordUnset || signedInContinue}
          >
            Log in
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {signedInContinue
            ? "You're signed in"
            : passwordUnset
              ? "Account started"
              : mode === "create"
                ? "Create your TIDL account"
                : "Welcome back"}
        </h2>
        <p className={styles.lede}>
          {signedInContinue
            ? "Your intake is already with the care team. Continue to physician review — you do not need to create another account."
            : passwordUnset
              ? "Physician review can continue. The password you entered was not saved."
              : mode === "create"
                ? resolvedEncounter || handoff
                  ? "Your answers are with the care team. Create an account so physician review and your care protocol stay with you."
                  : "Create an account after intake so physician review stays with you. Header Sign up alone cannot create one."
                : resolvedEncounter || handoff
                  ? "Log in to continue to physician review for your submitted intake."
                  : "Log in to see your orders and care. If this is your first visit, the password from create account may not be saved yet — use Email me a reset link."}
        </p>

        {(handoff?.firstName || resolvedEncounter) &&
          !passwordUnset &&
          !signedInContinue && (
          <div className={styles.summary}>
            {handoff?.firstName ? (
              <p className={styles.summaryLine}>
                {handoff.firstName}
                {handoff.lastName ? ` ${handoff.lastName}` : ""}
              </p>
            ) : null}
            <p className={styles.summaryMeta}>
              {entry.label}
              {resolvedEncounter
                ? ` · Encounter ${resolvedEncounter.slice(0, 8)}`
                : ""}
            </p>
          </div>
        )}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {!passwordUnset && !signedInContinue ? (
            <>
              <label className={styles.field}>
                <span className={styles.label}>
                  Email
                  <span className={styles.req}>Required</span>
                </span>
                <input
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>
                  Password
                  <span className={styles.req}>Required</span>
                </span>
                <input
                  className={styles.input}
                  type="password"
                  autoComplete={
                    mode === "create" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least eight characters"
                />
              </label>

              {mode === "create" ? (
                <label className={styles.field}>
                  <span className={styles.label}>
                    Confirm password
                    <span className={styles.req}>Required</span>
                  </span>
                  <input
                    className={styles.input}
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                  />
                </label>
              ) : null}
            </>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {notice ? <p className={styles.notice}>{notice}</p> : null}

          <div className={styles.footer}>
            {(passwordUnset || signedInContinue) && continueHref ? (
              <Button
                type="button"
                styleVariant="Ghost"
                className={`${styles.submitBtn} ${styles.submitBtnReady}`}
                onClick={() => router.push(continueHref)}
              >
                Continue to physician review
              </Button>
            ) : (
              <Button
                type="submit"
                styleVariant="Ghost"
                className={`${styles.submitBtn} ${canContinue ? styles.submitBtnReady : ""}`}
                disabled={submitting || forgotBusy || !canContinue}
              >
                {submitting
                  ? "Continuing…"
                  : mode === "create"
                    ? "Create account"
                    : "Log in"}
              </Button>
            )}

            {mode === "login" || passwordUnset || signedInContinue ? (
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => void onForgot()}
                disabled={forgotBusy || submitting || !email.includes("@")}
              >
                {forgotBusy ? "Sending…" : "Email me a reset link"}
              </button>
            ) : null}

            <p className={styles.footHint}>
              A licensed provider reviews your information before anything is
              prescribed.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
