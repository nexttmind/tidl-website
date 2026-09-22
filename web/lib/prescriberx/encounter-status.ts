/**
 * Encounter status helpers for waiting-screen polling.
 * Status tokens from PrescribeRx telehealth status docs / OpenAPI examples.
 */

export type EncounterStatusData = {
  id?: string;
  encounter_id?: string;
  encounter_number?: string;
  status?: string;
  status_label?: string;
  prescribed_at?: string | null;
  cancelled_at?: string | null;
  [key: string]: unknown;
};

export type WaitingBranch = "wait" | "protocol" | "visit" | "cancelled";

export type ProtocolAccess = "allow" | "visit" | "wait";

/** Payment / protocol is allowed only after physician acceptance. */
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
  if (
    s === "prescribed" ||
    s === "provider_signed" ||
    s === "completed" ||
    s === "order_placed" ||
    s === "order_paid"
  ) {
    return visitGateDefault ? "visit" : "protocol";
  }
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
