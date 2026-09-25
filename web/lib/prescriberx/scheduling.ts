/** PrescribeRx scheduling helpers (availability + encounter schedule + video room). */

import { prescribeRxFetch } from "./client";

export type AvailableSlot = {
  start: string;
  end?: string;
  display_time?: string;
  display_start?: string;
  provider_profile_id?: string;
  timezone?: string;
};

export type SlotsByDay = {
  date: string;
  display?: string;
  slots: AvailableSlot[];
};

export type VideoRoomInfo = {
  join_url?: string | null;
  scheduled_at?: string | null;
  display_scheduled_at?: string | null;
  can_join_now?: boolean;
  opens_at?: string | null;
  status?: string | null;
};

function unwrapData(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return root;
}

export function flattenSlotDays(payload: unknown): AvailableSlot[] {
  const data = unwrapData(payload);
  if (!data) return [];
  const days = data.slots;
  if (!Array.isArray(days)) return [];
  const out: AvailableSlot[] = [];
  for (const day of days) {
    if (!day || typeof day !== "object") continue;
    const row = day as Record<string, unknown>;
    const slots = row.slots;
    if (!Array.isArray(slots)) continue;
    for (const slot of slots) {
      if (!slot || typeof slot !== "object") continue;
      const s = slot as Record<string, unknown>;
      const start = s.start;
      if (typeof start !== "string" || !start.trim()) continue;
      out.push({
        start: start.trim(),
        end: typeof s.end === "string" ? s.end : undefined,
        display_time:
          typeof s.display_time === "string" ? s.display_time : undefined,
        display_start:
          typeof s.display_start === "string" ? s.display_start : undefined,
        provider_profile_id:
          typeof s.provider_profile_id === "string"
            ? s.provider_profile_id
            : undefined,
        timezone: typeof s.timezone === "string" ? s.timezone : undefined,
      });
    }
  }
  return out;
}

export async function fetchAvailableSlots(input: {
  encounterTypeId: string;
  patientChartId: string;
  timezone?: string;
  fastest?: boolean;
}): Promise<{ slots: AvailableSlot[]; raw: unknown }> {
  const raw = await prescribeRxFetch("/scheduling/availability/slots", {
    query: {
      encounter_type_id: input.encounterTypeId,
      patient_chart_id: input.patientChartId,
      timezone: input.timezone ?? "America/New_York",
      ...(input.fastest ? { fastest: true } : {}),
    },
  });
  return { slots: flattenSlotDays(raw), raw };
}

export async function scheduleEncounterVisit(input: {
  encounterId: string;
  scheduledStart: string;
  providerProfileId?: string | null;
  patientTimezone?: string | null;
  reason?: string | null;
}): Promise<unknown> {
  const body: Record<string, unknown> = {
    scheduled_start: input.scheduledStart,
  };
  if (input.providerProfileId) {
    body.provider_profile_id = input.providerProfileId;
  }
  if (input.patientTimezone) {
    body.patient_timezone = input.patientTimezone;
  }
  if (input.reason) body.reason = input.reason;

  return prescribeRxFetch(
    `/encounters/${encodeURIComponent(input.encounterId)}/schedule`,
    { method: "POST", body },
  );
}

export function parseVideoRoom(payload: unknown): VideoRoomInfo | null {
  const data = unwrapData(payload);
  if (!data) return null;
  const room =
    data.video_room && typeof data.video_room === "object"
      ? (data.video_room as Record<string, unknown>)
      : data;
  if (!room || typeof room !== "object") return null;
  const r = room as Record<string, unknown>;
  return {
    join_url: typeof r.join_url === "string" ? r.join_url : null,
    scheduled_at:
      typeof r.scheduled_at === "string"
        ? r.scheduled_at
        : typeof data.scheduled_at === "string"
          ? data.scheduled_at
          : null,
    display_scheduled_at:
      typeof r.display_scheduled_at === "string"
        ? r.display_scheduled_at
        : null,
    can_join_now: r.can_join_now === true,
    opens_at: typeof r.opens_at === "string" ? r.opens_at : null,
    status: typeof r.status === "string" ? r.status : null,
  };
}

export async function fetchEncounterVideoRoom(
  encounterId: string,
): Promise<VideoRoomInfo | null> {
  try {
    const raw = await prescribeRxFetch(
      `/encounters/${encodeURIComponent(encounterId)}/video-room`,
    );
    return parseVideoRoom(raw);
  } catch {
    return null;
  }
}
