"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CareMoment } from "@/components/care/CareMoment";
import {
  resolveClinicalEntry,
  type ClinicalEntry,
} from "@/content/clinical/entry-map";
import {
  classifyWaitingBranch,
  encounterStatusLabel,
  unwrapEncounterStatus,
  type EncounterStatusData,
} from "@/lib/prescriberx/encounter-status";
import {
  readIntakeHandoff,
  type IntakeHandoff,
} from "@/lib/prescriberx/intake-flow";
import {
  nextWaitPollMs,
  waitingPollTimedOut,
} from "@/lib/prescriberx/waiting-poll";
import styles from "./WaitingReview.module.css";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of ["data", "items", "results", "messages", "labs", "orders"]) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

function pickString(
  rec: Record<string, unknown> | null,
  keys: readonly string[],
): string {
  if (!rec) return "";
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function messagePreview(raw: unknown): string | null {
  const rows = asArray(raw);
  const first = asRecord(rows[0]) ?? asRecord(raw);
  const text = pickString(first, ["content", "body", "text", "message"]);
  return text || null;
}

function labsPreview(raw: unknown): string | null {
  const rows = asArray(raw);
  if (!rows.length) {
    const rec = asRecord(raw);
    const required = pickString(rec, ["status", "summary", "message"]);
    return required || null;
  }
  const first = asRecord(rows[0]);
  const status = pickString(first, ["status", "status_label", "state"]);
  const name = pickString(first, ["name", "panel_name", "title"]);
  const bits = [name, status].filter(Boolean).join(" · ");
  if (rows.length === 1 && bits) return `Lab: ${bits}`;
  if (rows.length > 1) {
    return bits
      ? `Labs: ${rows.length} orders · ${bits}`
      : `Labs: ${rows.length} orders`;
  }
  return bits ? `Lab: ${bits}` : null;
}

const HOLD_FIELDS: Array<{ key: string; label: string }> = [
  { key: "address_zip", label: "ZIP code" },
  { key: "address_street1", label: "Street" },
  { key: "address_city", label: "City" },
  { key: "address_state", label: "State" },
  { key: "phone", label: "Phone" },
  { key: "weight", label: "Weight" },
  { key: "height_feet", label: "Height (feet)" },
  { key: "height_inches", label: "Height (inches)" },
];

function HoldReply({
  encounterId,
  status,
}: {
  encounterId: string;
  status: EncounterStatusData | null;
}) {
  const hold = status?.hold_requirements;
  const missing = new Set(
    (hold?.missing ?? []).map((item) => item.toLowerCase()),
  );
  const fields = HOLD_FIELDS.filter(
    (field) => missing.size === 0 || missing.has(field.key),
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!encounterId || !hold) return null;
  if (hold.items?.every((item) => item.satisfied)) return null;

  return (
    <form
      className={styles.holdForm}
      onSubmit={(e) => {
        e.preventDefault();
        const payload: Record<string, string> = {};
        for (const field of fields) {
          const value = (values[field.key] ?? "").trim();
          if (value) payload[field.key] = value;
        }
        if (!Object.keys(payload).length) {
          setNote("Enter the details still needed.");
          return;
        }
        setBusy(true);
        setNote(null);
        void fetch("/api/prescriberx/patient/actions", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "provide_information",
            encounter_id: encounterId,
            fields: payload,
          }),
        })
          .then(async (res) => {
            const json = (await res.json().catch(() => ({}))) as {
              message?: string;
            };
            setBusy(false);
            setNote(
              res.ok
                ? "Sent. We'll refresh your status."
                : json.message || "Could not send that.",
            );
          })
          .catch(() => {
            setBusy(false);
            setNote("Could not send that.");
          });
      }}
    >
      <p className={styles.quiet}>Send the missing details for this visit.</p>
      {fields.map((field) => (
        <label key={field.key} className={styles.holdField}>
          <span>{field.label}</span>
          <input
            value={values[field.key] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          />
        </label>
      ))}
      {note ? <p className={styles.quiet}>{note}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send details"}
      </Button>
    </form>
  );
}

type Props = {
  entrySlug: string;
  encounterId?: string;
  /** Sandbox designers only: ?demo=1 and PRESCRIBERX_SANDBOX. */
  demoAllowed?: boolean;
};

/**
 * Waiting for physician review.
 * Polls encounter status and auto-advances only when prescribed / visit-ready.
 * Demo continue is off unless the server passed demoAllowed.
 */
export function WaitingReview({
  entrySlug,
  encounterId,
  demoAllowed = false,
}: Props) {
  const router = useRouter();
  const entry: ClinicalEntry = useMemo(
    () => resolveClinicalEntry(entrySlug),
    [entrySlug],
  );
  const [handoff, setHandoff] = useState<IntakeHandoff | null>(null);
  const [statusData, setStatusData] = useState<EncounterStatusData | null>(
    null,
  );
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const advancedRef = useRef(false);

  useEffect(() => {
    setHandoff(readIntakeHandoff());
  }, []);

  const resolvedEncounter = encounterId || handoff?.encounterId || "";

  const continueParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("entry", entry.slug);
    if (resolvedEncounter) params.set("encounter", resolvedEncounter);
    return params.toString();
  }, [entry.slug, resolvedEncounter]);

  const goProtocol = useCallback(() => {
    router.push(`/care/protocol?${continueParams()}`);
  }, [router, continueParams]);

  const goVisit = useCallback(() => {
    router.push(`/care/visit?${continueParams()}`);
  }, [router, continueParams]);

  const advanceFromStatus = useCallback(
    (data: EncounterStatusData) => {
      if (advancedRef.current) return;
      const branch = classifyWaitingBranch(
        data.status,
        entry.visitGateDefault,
      );
      if (branch === "protocol") {
        advancedRef.current = true;
        goProtocol();
      } else if (branch === "visit") {
        advancedRef.current = true;
        goVisit();
      }
    },
    [entry.visitGateDefault, goProtocol, goVisit],
  );

  useEffect(() => {
    if (!resolvedEncounter) return;

    let cancelled = false;
    let timer: number | null = null;
    let inFlight = false;
    let backoffStep = 0;
    const startedAt = Date.now();

    const clearTimer = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const markTimedOut = () => {
      if (cancelled) return;
      setPollTimedOut(true);
      clearTimer();
    };

    const scheduleNext = () => {
      clearTimer();
      if (cancelled || advancedRef.current) return;
      if (document.visibilityState === "hidden") return;
      if (waitingPollTimedOut(startedAt)) {
        markTimedOut();
        return;
      }
      const delay = nextWaitPollMs(backoffStep);
      timer = window.setTimeout(() => {
        void poll();
      }, delay);
    };

    const poll = async () => {
      if (cancelled || inFlight || advancedRef.current) return;
      if (document.visibilityState === "hidden") return;
      if (waitingPollTimedOut(startedAt)) {
        markTimedOut();
        return;
      }

      inFlight = true;
      try {
        const res = await fetch(
          `/api/prescriberx/encounters/${encodeURIComponent(resolvedEncounter)}/status`,
          {
            headers: { Accept: "application/json" },
            credentials: "include",
          },
        );
        if (cancelled) return;

        if (res.status === 401) {
          clearTimer();
          const login = new URLSearchParams();
          login.set("mode", "login");
          login.set("entry", entry.slug);
          login.set("encounter", resolvedEncounter);
          login.set("next", `/care/waiting?${continueParams()}`);
          router.replace(`/care/account?${login.toString()}`);
          return;
        }

        if (!res.ok) {
          scheduleNext();
          return;
        }

        const json: unknown = await res.json();
        const data = unwrapEncounterStatus(json);
        if (!data) {
          scheduleNext();
          return;
        }

        setStatusData(data);
        const branch = classifyWaitingBranch(
          data.status,
          entry.visitGateDefault,
        );
        if (branch === "protocol" || branch === "visit") {
          clearTimer();
          advanceFromStatus(data);
          return;
        }

        backoffStep += 1;
        scheduleNext();
      } catch {
        scheduleNext();
      } finally {
        inFlight = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearTimer();
        return;
      }
      if (cancelled || advancedRef.current) return;
      if (waitingPollTimedOut(startedAt)) {
        markTimedOut();
        return;
      }
      void poll();
    };

    document.addEventListener("visibilitychange", onVisibility);
    void poll();

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    resolvedEncounter,
    advanceFromStatus,
    continueParams,
    entry.slug,
    entry.visitGateDefault,
    router,
  ]);

  const statusLabel = encounterStatusLabel(statusData);
  const latestMessage = messagePreview(statusData?.messages);
  const labsNote = labsPreview(statusData?.labs ?? statusData?.lab_requirements);

  return (
    <CareMoment
      eyebrow="Physician review"
      title="Waiting for the physician to review your information"
      lede="No action needed on your side. We will move you forward when the review is complete. If a live visit is required for your care path, you will see that next."
      mediaSrc={entry.brandPoster ?? entry.brandImage}
    >
      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>Care path</dt>
          <dd>{entry.label}</dd>
        </div>
        {statusData?.encounter_number || resolvedEncounter ? (
          <div className={styles.metaRow}>
            <dt>Encounter</dt>
            <dd>
              {statusData?.encounter_number ?? resolvedEncounter.slice(0, 8)}
            </dd>
          </div>
        ) : null}
        {statusLabel ? (
          <div className={styles.metaRow}>
            <dt>Status</dt>
            <dd>{statusLabel}</dd>
          </div>
        ) : null}
        {statusData?.scheduled_at ? (
          <div className={styles.metaRow}>
            <dt>Visit</dt>
            <dd>
              {new Date(statusData.scheduled_at).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </dd>
          </div>
        ) : null}
      </dl>
      {statusData?.hold_requirements?.info_request_message ? (
        <p className={styles.quiet}>
          {statusData.hold_requirements.info_request_message}
        </p>
      ) : null}
      {statusData?.hold_requirements?.missing?.length ? (
        <p className={styles.quiet}>
          Still needed: {statusData.hold_requirements.missing.join(", ")}.
        </p>
      ) : null}
      {latestMessage ? (
        <p className={styles.quiet}>Latest message: {latestMessage}</p>
      ) : null}
      {labsNote ? <p className={styles.quiet}>{labsNote}</p> : null}
      <HoldReply encounterId={resolvedEncounter} status={statusData} />
      <p className={styles.quiet}>
        {pollTimedOut
          ? "Refresh this page later to check again. There is no estimated wait time on this screen."
          : "Status updates arrive when the care team finishes review. There is no estimated wait time on this screen."}
      </p>
      {demoAllowed ? (
        <div className={styles.demo}>
          <p className={styles.demoNote}>
            Sandbox demo only. Production waits for physician review.
          </p>
          {entry.visitGateDefault ? (
            <Button onClick={goVisit} className={styles.cta}>
              Continue to visit
            </Button>
          ) : (
            <Button onClick={goProtocol} className={styles.cta}>
              Continue to protocol
            </Button>
          )}
        </div>
      ) : null}
    </CareMoment>
  );
}
