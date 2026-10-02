"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { MarketingImage } from "@/components/media/MarketingImage";
import { CAPTURE_COPY } from "@/content/fixtures/email-capture";
import styles from "./EmailCaptureModal.module.css";

function subscribePhone(onChange: () => void) {
  const mq = window.matchMedia("(width < 721px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readPhone() {
  return window.matchMedia("(width < 721px)").matches;
}

/** SSR and first paint assume phone so the sheet image is not in the HTML. */
function usePhoneSheet() {
  return useSyncExternalStore(subscribePhone, readPhone, () => true);
}

type Step = "email" | "phone" | "success";

type EmailCaptureModalProps = {
  open: boolean;
  onClose: (reason: "dismiss" | "complete") => void;
};

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailCaptureModalContent({
  onClose,
}: {
  onClose: (reason: "dismiss" | "complete") => void;
}) {
  const titleId = useId();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneSheet = usePhoneSheet();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sync = () => {
      const face = document.querySelector("#buy [data-assessment]");
      const control = face?.closest("a, button");
      if (!(control instanceof HTMLElement)) {
        root.style.clipPath = "";
        return;
      }
      const rect = control.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const visible =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < height &&
        rect.left < width;
      if (!visible) {
        root.style.clipPath = "";
        return;
      }
      const pad = 6;
      const x1 = Math.max(0, rect.left - pad);
      const y1 = Math.max(0, rect.top - pad);
      const x2 = Math.min(width, rect.right + pad);
      const y2 = Math.min(height, rect.bottom + pad);
      root.style.clipPath = `polygon(evenodd, 0px 0px, ${width}px 0px, ${width}px ${height}px, 0px ${height}px, 0px 0px, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px)`;
    };

    sync();
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
      root.style.clipPath = "";
    };
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      if (step === "email") emailRef.current?.focus();
      if (step === "phone") phoneRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.cancelAnimationFrame(frame);
    };
  }, [step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(leadId || step === "success" ? "complete" : "dismiss");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leadId, onClose, step]);

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
  }, [step, busy, error]);

  const submitEmail = async (event: FormEvent) => {
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
          source: "capture-modal",
          path: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { id: string };
      };
      if (!res.ok || !json.success || !json.data?.id) {
        setError(
          res.status === 503
            ? CAPTURE_COPY.errors.storage
            : json.message || CAPTURE_COPY.errors.generic,
        );
        return;
      }
      setLeadId(json.data.id);
      setStep("phone");
    } catch {
      setError(CAPTURE_COPY.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const submitPhone = async (event: FormEvent) => {
    event.preventDefault();
    if (!leadId) {
      setStep("success");
      return;
    }
    if (!smsConsent) {
      setError(CAPTURE_COPY.errors.consent);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: leadId,
          phone,
          smsConsent: true,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!res.ok || !json.success) {
        setError(json.message || CAPTURE_COPY.errors.phone);
        return;
      }
      setStep("success");
    } catch {
      setError(CAPTURE_COPY.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const copy =
    step === "email"
      ? CAPTURE_COPY.stepEmail
      : step === "phone"
        ? CAPTURE_COPY.stepPhone
        : CAPTURE_COPY.success;

  const closeReason = (): "dismiss" | "complete" =>
    leadId || step === "success" ? "complete" : "dismiss";

  return (
    <div ref={rootRef} className={styles.root} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label={CAPTURE_COPY.a11y.close}
        onClick={() => onClose(closeReason())}
      />
      <div
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className={styles.media}>
          {phoneSheet ? null : (
            <MarketingImage
              src={CAPTURE_COPY.media.src}
              alt={CAPTURE_COPY.media.alt}
              sizes="(width < 1025px) 44vw, 440px"
              className={styles.mediaImage}
              loading="eager"
              fetchPriority="high"
            />
          )}
          <div className={styles.mediaWash} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CAPTURE_COPY.media.logoSrc}
            alt={CAPTURE_COPY.media.logoAlt}
            width={132}
            height={24}
            className={styles.mediaLogo}
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTop}>
            <button
              type="button"
              className={styles.close}
              onClick={() => onClose(closeReason())}
              aria-label={CAPTURE_COPY.a11y.close}
            >
              <IconClose />
            </button>
          </div>

          <div className={styles.panelBody}>
            {"eyebrow" in copy ? (
              <p className={styles.eyebrow}>{copy.eyebrow}</p>
            ) : null}
            <h2 id={titleId} className={styles.title}>
              {copy.title}
            </h2>
            <p id={descId} className={styles.body}>
              {copy.body}
            </p>

            {step === "email" ? (
              <form className={styles.form} onSubmit={submitEmail}>
                <label className="sr-only" htmlFor="tidl-capture-email">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="tidl-capture-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={CAPTURE_COPY.stepEmail.placeholder}
                  disabled={busy}
                />
                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}
                <button type="submit" className={styles.submit} disabled={busy || !email.trim()}>
                  {busy ? "Saving…" : CAPTURE_COPY.stepEmail.submit}
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => onClose("dismiss")}
                  disabled={busy}
                >
                  {CAPTURE_COPY.stepEmail.dismiss}
                </button>
              </form>
            ) : null}

            {step === "phone" ? (
              <form className={styles.form} onSubmit={submitPhone}>
                <label className="sr-only" htmlFor="tidl-capture-phone">
                  Phone
                </label>
                <input
                  ref={phoneRef}
                  id="tidl-capture-phone"
                  className={styles.input}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={CAPTURE_COPY.stepPhone.placeholder}
                  disabled={busy}
                />
                <label className={styles.consent}>
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(event) => setSmsConsent(event.target.checked)}
                    disabled={busy}
                  />
                  <span>{CAPTURE_COPY.stepPhone.consent}</span>
                </label>
                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={busy || !phone.trim() || !smsConsent}
                >
                  {busy ? "Saving…" : CAPTURE_COPY.stepPhone.submit}
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setStep("success")}
                  disabled={busy}
                >
                  {CAPTURE_COPY.stepPhone.skip}
                </button>
              </form>
            ) : null}

            {step === "success" ? (
              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.submit}
                  onClick={() => onClose("complete")}
                >
                  {CAPTURE_COPY.success.close}
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles.steps} aria-hidden>
            <span className={step === "email" ? styles.stepActive : styles.stepDone} />
            <span className={step === "phone" ? styles.stepActive : step === "success" ? styles.stepDone : styles.stepIdle} />
            <span className={step === "success" ? styles.stepActive : styles.stepIdle} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailCaptureModal({ open, onClose }: EmailCaptureModalProps) {
  if (!open) return null;
  return <EmailCaptureModalContent onClose={onClose} />;
}
