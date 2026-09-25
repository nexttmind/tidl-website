/**
 * Whitelist of patient write actions TIDL forwards to PrescribeRx.
 * Paths are built only from validated ids. No org-token fallback.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PatientActionCall = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  form?: FormData;
  headers?: Record<string, string>;
};

export class PatientActionError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function rec(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PatientActionError(422, "Invalid request.");
  }
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!UUID.test(raw)) {
    throw new PatientActionError(422, `Invalid ${label}.`);
  }
  return raw;
}

function text(value: unknown, max: number): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw.length > max) {
    throw new PatientActionError(422, "Invalid request.");
  }
  return raw;
}

function optionalText(value: unknown, max: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, max);
}

function bool(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new PatientActionError(422, "Invalid request.");
  }
  return value;
}

function num(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new PatientActionError(422, "Invalid request.");
  }
  return n;
}

const PROVIDE_FIELDS = [
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "phone",
  "email",
  "address_street1",
  "address_street2",
  "address_city",
  "address_state",
  "address_zip",
  "weight",
  "height_feet",
  "height_inches",
  "drivers_license_number",
  "drivers_license_state",
] as const;

const SEVERITY = new Set(["mild", "moderate", "severe", "life_threatening"]);
const CONDITION_STATUS = new Set(["active", "resolved", "in_remission"]);

export function planPatientAction(input: unknown): PatientActionCall {
  const body = rec(input);
  const action = typeof body.action === "string" ? body.action : "";

  switch (action) {
    case "send_message": {
      const content = text(body.content, 5000);
      const conversationId =
        typeof body.conversation_id === "string" && body.conversation_id.trim()
          ? uuid(body.conversation_id, "conversation")
          : "";
      if (!conversationId) {
        throw new PatientActionError(422, "Open a conversation first.");
      }
      return {
        method: "POST",
        path: `/me/patient/conversations/${conversationId}/messages`,
        body: { content },
      };
    }
    case "open_conversation": {
      const encounterId = uuid(body.encounter_id, "encounter");
      return {
        method: "POST",
        path: `/me/patient/encounters/${encounterId}/conversation`,
      };
    }
    case "accept_approval": {
      const id = uuid(body.approval_id, "approval");
      const total = num(body.acknowledged_total, 0, 100_000);
      const key = text(body.idempotency_key, 80);
      return {
        method: "POST",
        path: `/me/patient/approvals/${id}/accept`,
        body: { acknowledged_total: total },
        headers: { "Idempotency-Key": key },
      };
    }
    case "decline_approval": {
      const id = uuid(body.approval_id, "approval");
      return {
        method: "POST",
        path: `/me/patient/approvals/${id}/decline`,
      };
    }
    case "provide_information": {
      const encounterId = uuid(body.encounter_id, "encounter");
      const fields = rec(body.fields);
      const form = new FormData();
      let count = 0;
      for (const key of PROVIDE_FIELDS) {
        const value = optionalText(fields[key], 255);
        if (!value) continue;
        form.append(key, value);
        count += 1;
      }
      if (!count) throw new PatientActionError(422, "Nothing to send.");
      return {
        method: "POST",
        path: `/me/patient/encounters/${encounterId}/provide-information`,
        form,
      };
    }
    case "add_allergy": {
      const allergen = text(body.allergen ?? body.allergy_name, 255);
      const severity = optionalText(body.severity, 32);
      if (severity && !SEVERITY.has(severity)) {
        throw new PatientActionError(422, "Invalid request.");
      }
      return {
        method: "POST",
        path: "/me/patient/allergies",
        body: {
          allergy_name: allergen,
          reaction: optionalText(body.reaction, 500),
          severity,
          notes: optionalText(body.notes, 1000),
        },
      };
    }
    case "remove_allergy":
      return {
        method: "DELETE",
        path: `/me/patient/allergies/${uuid(body.id, "allergy")}`,
      };
    case "add_medication":
      return {
        method: "POST",
        path: "/me/patient/medications",
        body: {
          medication_name: text(body.name ?? body.medication_name, 255),
          dose: optionalText(body.dose, 100),
          frequency: optionalText(body.frequency, 100),
          notes: optionalText(body.notes, 1000),
        },
      };
    case "remove_medication":
      return {
        method: "DELETE",
        path: `/me/patient/medications/${uuid(body.id, "medication")}`,
      };
    case "add_condition": {
      const status = optionalText(body.status, 32);
      if (status && !CONDITION_STATUS.has(status)) {
        throw new PatientActionError(422, "Invalid request.");
      }
      return {
        method: "POST",
        path: "/me/patient/conditions",
        body: {
          condition_name: text(body.condition ?? body.condition_name, 255),
          status,
          notes: optionalText(body.notes, 1000),
        },
      };
    }
    case "remove_condition":
      return {
        method: "DELETE",
        path: `/me/patient/conditions/${uuid(body.id, "condition")}`,
      };
    case "record_weight":
      return {
        method: "POST",
        path: "/me/patient/vitals/weight",
        body: {
          weight_lbs: num(body.weight_lbs, 50, 800),
          value: String(num(body.weight_lbs, 50, 800)),
        },
      };
    case "record_blood_pressure":
      return {
        method: "POST",
        path: "/me/patient/vitals/blood-pressure",
        body: {
          systolic: num(body.systolic, 60, 250),
          diastolic: num(body.diastolic, 40, 150),
          ...(body.heart_rate === undefined || body.heart_rate === ""
            ? {}
            : { heart_rate: num(body.heart_rate, 40, 200) }),
        },
      };
    case "record_glucose":
      return {
        method: "POST",
        path: "/me/patient/vitals/glucose",
        body: {
          glucose_mgdl: num(body.glucose_mgdl, 20, 800),
          fasting: body.fasting === true,
        },
      };
    case "update_preferences": {
      const channels = rec(body.channels);
      return {
        method: "PUT",
        path: "/me/patient/communication-preferences",
        body: {
          global_enabled: bool(body.global_enabled),
          channels: {
            email: bool(channels.email),
            sms: bool(channels.sms),
            in_app: bool(channels.in_app),
          },
        },
      };
    }
    case "update_goals":
      return {
        method: "PUT",
        path: "/me/patient/vitals/goals",
        body: {
          ...(body.target_weight_lbs === undefined || body.target_weight_lbs === ""
            ? {}
            : { target_weight_lbs: num(body.target_weight_lbs, 50, 800) }),
        },
      };
    case "request_export":
      return { method: "POST", path: "/me/patient/export" };
    case "export_status":
      return {
        method: "GET",
        path: `/me/patient/export/${uuid(body.export_id, "export")}`,
      };
    case "validate_coupon":
      return {
        method: "POST",
        path: "/me/patient/coupons/validate",
        body: {
          code: text(body.code, 50),
          ...(body.subtotal === undefined || body.subtotal === ""
            ? {}
            : { subtotal: num(body.subtotal, 0, 100_000) }),
        },
      };
    default:
      throw new PatientActionError(422, "Invalid request.");
  }
}

const COUPON_KEYS = [
  "valid",
  "code",
  "discount_amount",
  "discount",
  "amount",
  "message",
  "description",
] as const;

export function sanitizeCouponResult(envelope: unknown): Record<string, unknown> {
  const root =
    envelope && typeof envelope === "object"
      ? (envelope as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const out: Record<string, unknown> = {};
  for (const key of COUPON_KEYS) {
    const value = data[key];
    if (typeof value === "string" && value.length <= 240) out[key] = value;
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

export function sanitizeExportResult(envelope: unknown): Record<string, unknown> {
  const root =
    envelope && typeof envelope === "object"
      ? (envelope as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const id = data.id ?? data.export_id ?? data.export;
  const status = data.status;
  return {
    id: typeof id === "string" ? id : undefined,
    status: typeof status === "string" ? status : undefined,
    ready: data.ready === true,
  };
}
