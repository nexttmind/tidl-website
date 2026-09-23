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
        {resolvedEncounter ? (
          <div className={styles.metaRow}>
            <dt>Encounter</dt>
            <dd>{resolvedEncounter.slice(0, 8)}</dd>
          </div>
        ) : null}
        {statusLabel ? (
          <div className={styles.metaRow}>
            <dt>Status</dt>
            <dd>{statusLabel}</dd>
          </div>
        ) : null}
      </dl>
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
