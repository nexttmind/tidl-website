import {
  buildSessionCookieHeader,
  sealSession,
  type PatientSessionPayload,
} from "@/lib/auth/session";
import {
  GENERIC_VALIDATION,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  clientIpFromRequest,
  consumeAuthRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { PrescribeRxError } from "@/lib/prescriberx/client";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { prescribeRxPatientFetch } from "@/lib/prescriberx/patient-client";
import { extractAuthToken } from "@/lib/prescriberx/token-parse";

export const dynamic = "force-dynamic";

type LoginBody = {
  email?: string;
  password?: string;
};

/**
 * Returning patient login via PrescribeRx POST /auth/login.
 * Uses an empty org path: login is unauthenticated upstream, then we seal the patient token.
 */
export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();
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
  if (!consumeAuthRateLimit(`login:${ip}`)) {
    return authJson(
      {
        success: false,
        message: "Too many attempts. Try again shortly.",
        code: "rate_limited",
      },
      429,
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_json" },
      400,
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email.includes("@") || password.length < 1) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "validation" },
      422,
    );
  }

  // Login must NOT use the org bearer. Call PrescribeRx directly.
  let envelope: unknown;
  try {
    const url = `${env.baseUrl}/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        device_name: "tidl-web",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }
    if (!res.ok) {
      throw new PrescribeRxError("Login failed", res.status, parsed);
    }
    envelope = parsed;
  } catch (err) {
    return mapAuthError(err);
  }

  let parsed;
  try {
    parsed = extractAuthToken(envelope);
  } catch (err) {
    return mapAuthError(err);
  }

  // Confirm /auth/me with the patient token (never org).
  try {
    await prescribeRxPatientFetch("/auth/me", { token: parsed.token });
  } catch (err) {
    return mapAuthError(err);
  }

  const session: PatientSessionPayload = {
    token: parsed.token,
    expiresAt: parsed.expiresAt,
    abilities: parsed.abilities,
    email: parsed.userEmail ?? email,
    patientChartId: parsed.patientChartId,
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
        email: session.email,
        expiresAt: session.expiresAt,
        patientChartId: session.patientChartId ?? null,
      },
    },
    200,
    { "Set-Cookie": buildSessionCookieHeader(sealed, session.expiresAt) },
  );
}
