/**
 * Ownership verification for post-intake account bind.
 * Uses organization token only. Fail closed. Generic errors to callers.
 */

import { prescribeRxFetch, PrescribeRxError } from "./client";

export class OwnershipError extends Error {
  constructor(message = "ownership_failed") {
    super(message);
    this.name = "OwnershipError";
  }
}

type LookupData = {
  canonical_patient_chart_id?: string | null;
  patient_id?: string | null;
  chart?: { id?: string; email?: string } | null;
};

type EncounterData = {
  id?: string;
  patient_chart_id?: string | null;
  patient?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  } | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapData<T extends Record<string, unknown>>(
  envelope: unknown,
): T | null {
  const root = asRecord(envelope);
  if (!root) return null;
  const data = asRecord(root.data);
  return (data ?? root) as T;
}

function emailsMatch(a: string, b: string | null | undefined): boolean {
  if (!b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export type OwnershipInput = {
  email: string;
  patientChartId: string;
  encounterId: string;
};

/**
 * Verify email ↔ chart ↔ encounter binding via:
 * 1) GET /patients/lookup?email=
 * 2) GET /encounters/{id}
 * Fail closed on any mismatch or missing field.
 */
async function fetchEncounterChartId(encounterId: string): Promise<string> {
  let encounterEnv: unknown;
  try {
    encounterEnv = await prescribeRxFetch(
      `/encounters/${encodeURIComponent(encounterId)}`,
    );
  } catch (err) {
    if (err instanceof PrescribeRxError && (err.status === 404 || err.status === 403)) {
      throw new OwnershipError("encounter_miss");
    }
    throw err;
  }

  const encounter = unwrapData<EncounterData>(encounterEnv);
  if (!encounter) throw new OwnershipError("encounter_empty");

  const chartOnEncounter =
    typeof encounter.patient_chart_id === "string"
      ? encounter.patient_chart_id
      : encounter.patient && typeof encounter.patient.id === "string"
        ? encounter.patient.id
        : null;

  if (!chartOnEncounter) throw new OwnershipError("encounter_chart_missing");
  return chartOnEncounter;
}

/**
 * Resolve chart id from encounter when session handoff is missing, then verify
 * email ↔ chart ↔ encounter.
 */
export async function resolveRegisterOwnership(input: {
  email: string;
  encounterId: string;
  patientChartId?: string;
}): Promise<{ patientChartId: string }> {
  const encounterId = input.encounterId.trim();
  let patientChartId = String(input.patientChartId ?? "").trim();
  if (!encounterId) throw new OwnershipError("invalid_input");
  if (!patientChartId) {
    patientChartId = await fetchEncounterChartId(encounterId);
  }
  return assertChartOwnsEncounter({
    email: input.email,
    patientChartId,
    encounterId,
  });
}

export async function assertChartOwnsEncounter(
  input: OwnershipInput,
): Promise<{ patientChartId: string }> {
  const email = input.email.trim().toLowerCase();
  const patientChartId = input.patientChartId.trim();
  const encounterId = input.encounterId.trim();

  if (!email || !email.includes("@") || !patientChartId || !encounterId) {
    throw new OwnershipError("invalid_input");
  }

  let lookupEnv: unknown;
  try {
    lookupEnv = await prescribeRxFetch("/patients/lookup", {
      query: { email },
    });
  } catch (err) {
    if (err instanceof PrescribeRxError && err.status === 404) {
      throw new OwnershipError("lookup_miss");
    }
    throw err;
  }

  const lookup = unwrapData<LookupData>(lookupEnv);
  if (!lookup) throw new OwnershipError("lookup_empty");

  const canonical =
    (typeof lookup.canonical_patient_chart_id === "string" &&
      lookup.canonical_patient_chart_id) ||
    (lookup.chart && typeof lookup.chart.id === "string"
      ? lookup.chart.id
      : null);

  if (!canonical || canonical !== patientChartId) {
    throw new OwnershipError("chart_mismatch");
  }

  let encounterEnv: unknown;
  try {
    // Do not pass include=patient. Sandbox returns 500 for that include
    // (verified 2026-09-22). Chart id is on the bare encounter. Email match
    // is the lookup step above; encounter.patient.email is checked only if
    // the bare payload already includes it.
    encounterEnv = await prescribeRxFetch(
      `/encounters/${encodeURIComponent(encounterId)}`,
    );
  } catch (err) {
    if (err instanceof PrescribeRxError && (err.status === 404 || err.status === 403)) {
      throw new OwnershipError("encounter_miss");
    }
    throw err;
  }

  const encounter = unwrapData<EncounterData>(encounterEnv);
  if (!encounter) throw new OwnershipError("encounter_empty");

  const chartOnEncounter =
    typeof encounter.patient_chart_id === "string"
      ? encounter.patient_chart_id
      : encounter.patient && typeof encounter.patient.id === "string"
        ? encounter.patient.id
        : null;

  if (!chartOnEncounter || chartOnEncounter !== patientChartId) {
    throw new OwnershipError("encounter_chart_mismatch");
  }

  const encounterEmail = encounter.patient?.email;
  if (encounterEmail && !emailsMatch(email, encounterEmail)) {
    throw new OwnershipError("email_mismatch");
  }

  return { patientChartId };
}

function intakeEmail(encounter: Record<string, unknown>): string | null {
  const snap = asRecord(encounter.patient_intake_snapshot);
  const tier = asRecord(snap?.tier1_demographics);
  return typeof tier?.email === "string" ? tier.email : null;
}

/**
 * Same email can get a new chart on a later intake. The canonical lookup
 * still points at the first chart, so chart-id ownership fails. If the
 * encounter's own email matches the signed-in patient, the encounter chart
 * is theirs.
 */
export async function encounterChartForSessionEmail(input: {
  email: string;
  encounterId: string;
}): Promise<string | null> {
  const email = input.email.trim();
  const encounterId = input.encounterId.trim();
  if (!email.includes("@") || !encounterId) return null;

  let encounterEnv: unknown;
  try {
    encounterEnv = await prescribeRxFetch(
      `/encounters/${encodeURIComponent(encounterId)}`,
    );
  } catch {
    return null;
  }
  const encounter = unwrapData<Record<string, unknown>>(encounterEnv);
  if (!encounter) return null;

  const patient = asRecord(encounter.patient);
  const onFile =
    (typeof patient?.email === "string" && patient.email) ||
    intakeEmail(encounter);
  if (!emailsMatch(email, onFile)) return null;

  const chart =
    typeof encounter.patient_chart_id === "string"
      ? encounter.patient_chart_id
      : null;
  return chart && chart.trim() ? chart.trim() : null;
}

/** Pure helper for unit tests — same rules without network. */
export function evaluateOwnershipMatch(args: {
  email: string;
  patientChartId: string;
  lookupCanonicalId: string | null;
  encounterChartId: string | null;
  encounterEmail: string | null | undefined;
}): "ok" | "fail" {
  const email = args.email.trim().toLowerCase();
  if (!args.lookupCanonicalId || args.lookupCanonicalId !== args.patientChartId) {
    return "fail";
  }
  if (!args.encounterChartId || args.encounterChartId !== args.patientChartId) {
    return "fail";
  }
  if (
    args.encounterEmail &&
    !emailsMatch(email, args.encounterEmail)
  ) {
    return "fail";
  }
  return "ok";
}
