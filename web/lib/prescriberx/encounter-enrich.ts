/**
 * Merge every encounter-scoped PrescribeRx read we can take onto one status object.
 * Waiting / visit / gates already poll status — extra fields ride along.
 */

import { prescribeRxFetch } from "./client";
import { unwrapEncounterStatus, type EncounterStatusData } from "./encounter-status";
import { prescribeRxPatientFetch } from "./patient-client";
import { fetchEncounterVideoRoom, parseVideoRoom } from "./scheduling";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapData(envelope: unknown): Record<string, unknown> | null {
  const root = asRecord(envelope);
  if (!root) return null;
  const data = asRecord(root.data);
  return data ?? root;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pickString(
  rec: Record<string, unknown> | null,
  keys: readonly string[],
): string | undefined {
  if (!rec) return undefined;
  for (const key of keys) {
    const hit = asString(rec[key]);
    if (hit) return hit;
  }
  return undefined;
}

export function mergeEncounterReads(
  statusRaw: unknown,
  detailRaw: unknown,
): EncounterStatusData {
  const status = unwrapEncounterStatus(statusRaw) ?? {};
  const detail = unwrapData(detailRaw) ?? {};
  const roomFromDetail = parseVideoRoom(detail.video_room ?? detail);
  return {
    ...detail,
    ...status,
    id:
      asString(status.id) ??
      asString(detail.id) ??
      asString(status.encounter_id),
    encounter_id: asString(status.encounter_id) ?? asString(detail.id),
    encounter_number:
      asString(status.encounter_number) ??
      pickString(detail, ["encounter_number"]),
    status: asString(status.status) ?? pickString(detail, ["status"]),
    status_label:
      asString(status.status_label) ?? pickString(detail, ["status_label"]),
    scheduled_at:
      asString(status.scheduled_at) ??
      pickString(detail, ["scheduled_at", "scheduled_for"]) ??
      null,
    video_room: status.video_room ?? roomFromDetail ?? undefined,
  };
}

export async function fetchEnrichedEncounterStatus(
  encounterId: string,
  patientToken?: string | null,
): Promise<EncounterStatusData> {
  const enc = encodeURIComponent(encounterId);
  const [statusSettled, detailSettled, messagesSettled, labsSettled, labReqSettled] =
    await Promise.allSettled([
      prescribeRxFetch(`/telehealth/encounters/${enc}/status`),
      prescribeRxFetch(`/encounters/${enc}`),
      prescribeRxFetch(`/encounters/${enc}/messages`),
      prescribeRxFetch(`/encounters/${enc}/labs`),
      prescribeRxFetch(`/encounters/${enc}/lab-requirements`),
    ]);

  const statusRaw =
    statusSettled.status === "fulfilled" ? statusSettled.value : null;
  const detailRaw =
    detailSettled.status === "fulfilled" ? detailSettled.value : null;

  if (!statusRaw && !detailRaw) {
    if (statusSettled.status === "rejected") throw statusSettled.reason;
    throw detailSettled.status === "rejected"
      ? detailSettled.reason
      : new Error("encounter status unavailable");
  }

  const merged = mergeEncounterReads(statusRaw, detailRaw);
  const token = (merged.status ?? "").toLowerCase();

  if (messagesSettled.status === "fulfilled") {
    merged.messages = unwrapData(messagesSettled.value) ?? messagesSettled.value;
  }
  if (labsSettled.status === "fulfilled") {
    merged.labs = unwrapData(labsSettled.value) ?? labsSettled.value;
  }
  if (labReqSettled.status === "fulfilled") {
    merged.lab_requirements =
      unwrapData(labReqSettled.value) ?? labReqSettled.value;
  }

  if (token === "scheduled" && !parseVideoRoom(merged.video_room)) {
    const room = await fetchEncounterVideoRoom(encounterId);
    if (room) merged.video_room = room;
  }

  if (patientToken) {
    try {
      const reqs = await prescribeRxPatientFetch(
        `/me/patient/encounters/${enc}/requirements`,
        { token: patientToken },
      );
      const data = unwrapData(reqs);
      if (data) merged.hold_requirements = data;
    } catch {
      // Not held, or patient token cannot read requirements.
    }
  }

  return merged;
}
