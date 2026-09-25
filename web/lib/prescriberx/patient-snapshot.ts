/**
 * One patient-token snapshot of every PrescribeRx GET TIDL can take.
 * Write/admin endpoints stay out. Failures on a single path omit that key.
 */

import { prescribeRxPatientFetch } from "./patient-client";

export const PATIENT_SNAPSHOT_PATHS = {
  chart: "/me/patient",
  dashboard: "/me/patient/dashboard",
  encounters: "/me/patient/encounters",
  orders: "/me/patient/orders",
  prescriptions: "/me/patient/prescriptions",
  approvals: "/me/patient/approvals",
  vitals: "/me/patient/vitals",
  vitalGoals: "/me/patient/vitals/goals",
  vitalTrends: "/me/patient/vitals/trends",
  allergies: "/me/patient/allergies",
  medications: "/me/patient/medications",
  conditions: "/me/patient/conditions",
  paymentMethods: "/me/patient/payment-methods",
  conversations: "/me/patient/conversations",
  communicationPreferences: "/me/patient/communication-preferences",
  profile: "/me",
  settings: "/me/settings",
} as const;

export type PatientSnapshotKey = keyof typeof PATIENT_SNAPSHOT_PATHS;

export type PatientSnapshot = Record<PatientSnapshotKey, unknown> & {
  conversationMessages: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of ["data", "items", "results", "conversations"]) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  return [];
}

function unwrapPayload(envelope: unknown): unknown {
  if (!envelope || typeof envelope !== "object") return envelope;
  const root = envelope as Record<string, unknown>;
  if ("data" in root) return root.data ?? null;
  return envelope;
}

function pickId(row: unknown): string {
  const rec = asRecord(row);
  if (!rec) return "";
  for (const key of ["id", "conversation_id", "uuid"]) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function extractConversationIds(payload: unknown): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const row of asArray(payload)) {
    const id = pickId(row);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

async function fetchConversationMessages(
  token: string,
  conversations: unknown,
): Promise<unknown> {
  const ids = extractConversationIds(conversations).slice(0, 5);
  if (!ids.length) return null;
  const settled = await Promise.allSettled(
    ids.map((id) =>
      prescribeRxPatientFetch(
        `/me/patient/conversations/${encodeURIComponent(id)}/messages`,
        { token, query: { per_page: 20 } },
      ),
    ),
  );
  const byId: Record<string, unknown> = {};
  ids.forEach((id, index) => {
    const result = settled[index];
    if (result?.status === "fulfilled") {
      byId[id] = unwrapPayload(result.value);
    }
  });
  return Object.keys(byId).length ? byId : null;
}

export async function fetchPatientSnapshot(
  token: string,
): Promise<PatientSnapshot> {
  const entries = Object.entries(PATIENT_SNAPSHOT_PATHS) as [
    PatientSnapshotKey,
    string,
  ][];
  const settled = await Promise.allSettled(
    entries.map(([, path]) => {
      if (path === "/me/patient/vitals/trends") {
        return prescribeRxPatientFetch(path, {
          token,
          query: { type: "all", range: "all" },
        });
      }
      return prescribeRxPatientFetch(path, { token });
    }),
  );
  const out = {} as Record<PatientSnapshotKey, unknown>;
  entries.forEach(([key], index) => {
    const result = settled[index];
    out[key] =
      result?.status === "fulfilled" ? unwrapPayload(result.value) : null;
  });
  const conversationMessages = await fetchConversationMessages(
    token,
    out.conversations,
  );
  return { ...out, conversationMessages };
}
