import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  clientIpFromRequest,
  consumeRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { PrescribeRxError } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import {
  PatientActionError,
  planPatientAction,
  sanitizeCouponResult,
  sanitizeExportResult,
} from "@/lib/prescriberx/patient-action-plan";
import { ensureFreshPatientSession, prescribeRxPatientFetch } from "@/lib/prescriberx/patient-client";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";

export const dynamic = "force-dynamic";

function conversationIdOf(envelope: unknown): string | undefined {
  const root =
    envelope && typeof envelope === "object"
      ? (envelope as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const nested =
    data.conversation && typeof data.conversation === "object"
      ? (data.conversation as Record<string, unknown>)
      : null;
  for (const source of [data, nested]) {
    if (!source) continue;
    for (const key of ["id", "conversation_id"]) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return undefined;
}

function safeValidationMessage(body: unknown): string | null {
  const root =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const message = root?.message;
  if (
    typeof message === "string" &&
    message.length > 0 &&
    message.length <= 180 &&
    !/token|bearer|password|secret/i.test(message)
  ) {
    return message;
  }
  return null;
}

function actionError(err: unknown): Response {
  if (err instanceof PrescribeRxError) {
    if (err.status === 422) {
      return authJson(
        {
          success: false,
          message: safeValidationMessage(err.body) ?? "Invalid request.",
          code: "validation",
        },
        422,
      );
    }
    if (err.status === 402) {
      return authJson(
        {
          success: false,
          message: "No card on file, or the card was declined. The item is still waiting.",
          code: "payment_required",
        },
        402,
      );
    }
    if (err.status >= 500) {
      return authJson(
        {
          success: false,
          message:
            safeValidationMessage(err.body) ??
            "Service temporarily unavailable. Try again.",
          code: "upstream_error",
        },
        502,
      );
    }
    if (err.status === 409) {
      return authJson(
        {
          success: false,
          message: "That item changed or was already reviewed. Refresh and try again.",
          code: "conflict",
        },
        409,
      );
    }
  }
  return mapAuthError(err);
}

export async function POST(request: Request) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  const limit = consumeRateLimit(
    `patient-action:${clientIpFromRequest(request)}`,
    20,
    60_000,
  );
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSec);

  let fresh;
  try {
    fresh = await ensureFreshPatientSession(request);
  } catch (err) {
    return mapAuthError(err);
  }
  if (!fresh) {
    return authJson(
      {
        success: false,
        authenticated: false,
        message: GENERIC_UNAUTHENTICATED,
        code: "unauthenticated",
      },
      401,
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return authJson({ success: false, message: "Invalid request." }, 422);
  }

  let plan;
  try {
    plan = planPatientAction(input);
  } catch (err) {
    if (err instanceof PatientActionError) {
      return authJson({ success: false, message: err.message }, err.status);
    }
    return authJson({ success: false, message: "Invalid request." }, 422);
  }

  if (plan.body && typeof plan.body === "object" && !Array.isArray(plan.body)) {
    const payload = plan.body as Record<string, unknown>;
    const lookup: Record<string, { field: string; idKey: string }> = {
      "/me/patient/allergies": {
        field: "allergy_name",
        idKey: "terminology_allergy_id",
      },
      "/me/patient/medications": {
        field: "medication_name",
        idKey: "terminology_medication_id",
      },
      "/me/patient/conditions": {
        field: "condition_name",
        idKey: "terminology_condition_id",
      },
    };
    const spec = lookup[plan.path];
    const term = spec ? payload[spec.field] : undefined;
    if (spec && typeof term === "string") {
      const searchPath =
        plan.path === "/me/patient/allergies"
          ? "/terminology/allergies/search"
          : plan.path === "/me/patient/medications"
            ? "/terminology/medications/search"
            : "/terminology/conditions/search";
      try {
        const found = await prescribeRxPatientFetch(searchPath, {
          token: fresh.session.token,
          query: { q: term, limit: 1 },
        });
        const data =
          found && typeof found === "object"
            ? (found as { data?: Array<{ id?: string }> }).data
            : undefined;
        const id = data?.[0]?.id;
        if (id) payload[spec.idKey] = id;
      } catch {
        // Free-text name still goes through.
      }
    }
  }

  try {
    const envelope = await prescribeRxPatientFetch(plan.path, {
      token: fresh.session.token,
      method: plan.method,
      body: plan.body,
      form: plan.form,
      headers: plan.headers,
    });
    const action =
      input && typeof input === "object"
        ? String((input as { action?: string }).action ?? "")
        : "";
    const data =
      action === "validate_coupon"
        ? sanitizeCouponResult(envelope)
        : action === "request_export" || action === "export_status"
          ? sanitizeExportResult(envelope)
          : action === "open_conversation"
            ? { id: conversationIdOf(envelope) }
            : { ok: true };
    const headers: HeadersInit = {};
    if (fresh.setCookie) headers["Set-Cookie"] = fresh.setCookie;
    const status = action === "request_export" ? 202 : 200;
    return authJson({ success: true, data }, status, headers);
  } catch (err) {
    return actionError(err);
  }
}
