/**
 * Encounter status helpers for waiting-screen polling.
 * Status tokens from PrescribeRx telehealth status docs / OpenAPI examples.
 */

export type EncounterHoldRequirements = {
  missing?: string[];
  items?: Array<{ slug?: string; label?: string; satisfied?: boolean }>;
  info_request_message?: string;
  completeness_pct?: number;
};

export type EncounterStatusData = {
  id?: string;
  encounter_id?: string;
  encounter_number?: string;
  status?: string;
  status_label?: string;
  scheduled_at?: string | null;
  prescribed_at?: string | null;
  cancelled_at?: string | null;
  hold_requirements?: EncounterHoldRequirements;
  video_room?: { join_url?: string | null; scheduled_at?: string | null };
  messages?: unknown;
  labs?: unknown;
  lab_requirements?: unknown;
  [key: string]: unknown;
};

export type WaitingBranch = "wait" | "protocol" | "visit" | "cancelled";

export type ProtocolAccess = "allow" | "visit" | "wait";

/** Visit-gated paths: protocol/checkout only after the live visit step. */
const VISIT_GATE_POST_VISIT_PROTOCOL = new Set([
  "provider_signed",
  "completed",
  "order_placed",
  "order_paid",
]);

const VISIT_GATE_PRE_VISIT = new Set([
  "prescribed",
  "unassigned",
  "awaiting_scheduling",
  "pending_provider_review",
]);

const ASYNC_PROTOCOL_STATUSES = new Set([
  "prescribed",
  "provider_signed",
  "completed",
  "order_placed",
  "order_paid",
]);

/** Payment / protocol is allowed only after physician acceptance (and visit when required). */
export function evaluateProtocolAccess(
  status: string | null | undefined,
  visitGateDefault: boolean,
): ProtocolAccess {
  const branch = classifyWaitingBranch(status, visitGateDefault);
  if (branch === "protocol") return "allow";
  if (branch === "visit") return "visit";
  return "wait";
}

/** Collapse PRX status into waiting-screen branch. */
export function classifyWaitingBranch(
  status: string | null | undefined,
  visitGateDefault: boolean,
): WaitingBranch {
  const s = (status ?? "").toLowerCase();
  if (s === "cancelled" || s === "canceled") return "cancelled";

  if (visitGateDefault) {
    if (s === "scheduled") return "visit";
    if (VISIT_GATE_POST_VISIT_PROTOCOL.has(s)) return "protocol";
    if (VISIT_GATE_PRE_VISIT.has(s)) return "visit";
    return "wait";
  }

  if (ASYNC_PROTOCOL_STATUSES.has(s)) return "protocol";
  return "wait";
}

export function encounterStatusLabel(data: EncounterStatusData | null): string | null {
  if (!data) return null;
  if (data.status_label) return data.status_label;
  const raw = data.status;
  if (!raw) return null;
  return raw
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Pull status payload from proxy envelope or bare object. */
export function unwrapEncounterStatus(json: unknown): EncounterStatusData | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object") return data as EncounterStatusData;
  if ("status" in root) return root as EncounterStatusData;
  return null;
}
