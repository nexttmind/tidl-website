import {
  buildSessionCookieHeader,
  sealSession,
  type PatientSessionPayload,
} from "@/lib/auth/session";
import {
  extractAbilitiesFromMe,
  orgTokenCanIssuePatientToken,
} from "@/lib/prescriberx/abilities";
import {
  GENERIC_OWNERSHIP_FAILURE,
  GENERIC_UPSTREAM,
  GENERIC_VALIDATION,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  OwnershipError,
  resolveRegisterOwnership,
} from "@/lib/prescriberx/auth-ownership";
import {
  clientIpFromRequest,
  consumeAuthRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  guardPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import {
  triggerPasswordForgot,
  verifyPatientLogin,
} from "@/lib/prescriberx/auth-password-setup";
import { normalizeIntakeEmail } from "@/lib/prescriberx/intake-flow";
import { bindPatientPassword } from "@/lib/prescriberx/password-bind";
import { extractAuthToken } from "@/lib/prescriberx/token-parse";

export const dynamic = "force-dynamic";

type RegisterBody = {
  email?: string;
  password?: string;
  password_confirmation?: string;
  patient_chart_id?: string;
  encounter_id?: string;
  /** From intake handoff — must match email when present. */
  intake_email?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Post-intake create/bind:
 * ownership (org) → issue-token (org) → optional password bind (patient) → seal cookie.
 */
export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();
  const envBlocked = guardPrescribeRxEnv(env);
  if (envBlocked) return envBlocked;
  if (!process.env.TIDL_SESSION_SECRET || process.env.TIDL_SESSION_SECRET.length < 32) {
    return authJson(
      {
        success: false,
        message: "Session is not configured.",
        code: "session_not_configured",
      },
      503,
    );
  }

  const ip = clientIpFromRequest(request);
  if (!consumeAuthRateLimit(`register:${ip}`)) {
    return authJson(
      {
        success: false,
        message: "Too many attempts. Try again shortly.",
        code: "rate_limited",
      },
      429,
    );
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_json" },
      400,
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const confirm = String(body.password_confirmation ?? body.password ?? "");
  const patientChartId = String(body.patient_chart_id ?? "").trim();
  const encounterId = String(body.encounter_id ?? "").trim();

  if (!isEmail(email) || password.length < 8 || password !== confirm) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "validation" },
      422,
    );
  }
  if (!encounterId) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "validation" },
      422,
    );
  }

  const intakeEmail = normalizeIntakeEmail(body.intake_email);
  if (intakeEmail && intakeEmail !== email) {
    return authJson(
      {
        success: false,
        message:
          "Email must match the address used on intake. Use the same email or complete intake again.",
        code: "email_mismatch",
      },
      422,
    );
  }

  try {
    const me = await prescribeRxFetch("/auth/me");
    const abilities = extractAbilitiesFromMe(me);
    if (!orgTokenCanIssuePatientToken(abilities)) {
      console.error("[prescriberx-auth] org token missing patient:issue-token");
      return authJson(
        {
          success: false,
          message: GENERIC_UPSTREAM,
          code: "issue_token_unavailable",
        },
        503,
      );
    }
  } catch (err) {
    return mapAuthError(err);
  }

  let resolvedChartId = patientChartId;
  try {
    const owned = await resolveRegisterOwnership({
      email,
      patientChartId: patientChartId || undefined,
      encounterId,
    });
    resolvedChartId = owned.patientChartId;
  } catch (err) {
    if (err instanceof OwnershipError) {
      return authJson(
        {
          success: false,
          message: GENERIC_OWNERSHIP_FAILURE,
          code: "ownership_failed",
        },
        403,
      );
    }
    return mapAuthError(err);
  }

  let issueEnvelope: unknown;
  try {
    issueEnvelope = await prescribeRxFetch(
      `/patients/${encodeURIComponent(resolvedChartId)}/issue-token`,
      {
        method: "POST",
        body: { device_name: "tidl-web" },
      },
    );
  } catch (err) {
    return mapAuthError(err);
  }

  let parsed;
  try {
    parsed = extractAuthToken(issueEnvelope);
  } catch (err) {
    return mapAuthError(err);
  }

  const passwordBind = await bindPatientPassword({
    patientToken: parsed.token,
    password,
  });

  const loginVerified = await verifyPatientLogin(env.baseUrl, email, password);
  let needsPasswordSetup = !loginVerified;
  let passwordResetEmailSent = false;
  if (needsPasswordSetup) {
    passwordResetEmailSent = await triggerPasswordForgot(env.baseUrl, email);
  }

  const effectivePasswordStatus =
    loginVerified && passwordBind.status !== "skipped"
      ? "bound"
      : passwordBind.status === "bound" && !loginVerified
        ? "failed"
        : passwordBind.status;

  const session: PatientSessionPayload = {
    token: parsed.token,
    expiresAt: parsed.expiresAt,
    abilities: parsed.abilities,
    email,
    patientChartId: resolvedChartId,
  };

  const sealed = await sealSession(session);
  if (!sealed) {
    return authJson(
      {
        success: false,
        message: "Session is not configured.",
        code: "session_not_configured",
      },
      503,
    );
  }

  return authJson(
    {
      success: true,
      data: {
        authenticated: true,
        email,
        expiresAt: session.expiresAt,
        patientChartId: resolvedChartId,
        loginVerified,
        needsPasswordSetup,
        passwordResetEmailSent,
        password: {
          status: effectivePasswordStatus,
          ...(passwordBind.status === "failed"
            ? { reason: passwordBind.reason }
            : {}),
          ...(passwordBind.status === "skipped"
            ? { reason: passwordBind.reason }
            : {}),
        },
      },
    },
    201,
    { "Set-Cookie": buildSessionCookieHeader(sealed, session.expiresAt) },
  );
}
