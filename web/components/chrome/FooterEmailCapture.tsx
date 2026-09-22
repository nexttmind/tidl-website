"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useEmailCapture } from "@/components/marketing/EmailCaptureProvider";
import { CAPTURE_COPY } from "@/content/fixtures/email-capture";
import { footerCopy } from "@/content/fixtures/footer";
import styles from "./FooterEmailCapture.module.css";

export function FooterEmailCapture() {
  const { markComplete } = useEmailCapture();
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const copy = footerCopy.capture;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "footer",
          path: window.location.pathname,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!res.ok || !json.success) {
        setError(
          res.status === 503
            ? CAPTURE_COPY.errors.storage
            : json.message || CAPTURE_COPY.errors.generic,
        );
        return;
      }
      markComplete();
      setDone(true);
    } catch {
      setError(CAPTURE_COPY.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      {done ? (
        <p className={styles.success}>{copy.success}</p>
      ) : (
        <form className={styles.form} onSubmit={onSubmit} aria-label={copy.label}>
          <label className="sr-only" htmlFor={inputId}>
            {copy.label}
          </label>
          <input
            id={inputId}
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.placeholder}
            disabled={busy}
          />
          <Button
            type="submit"
            styleVariant="Ghost"
            className={styles.submit}
            disabled={busy || !email.trim()}
          >
            {busy ? "Saving..." : copy.submit}
          </Button>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
