import { readSessionFromRequest } from "@/lib/auth/session";
import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  clientIpFromRequest,
  consumeAuthRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { forceRefreshPatientSession } from "@/lib/prescriberx/patient-client";

export const dynamic = "force-dynamic";

/**
 * Force refresh of the patient token (also used internally near expiry).
 * Concurrent callers with the same bearer share one refresh in patient-client.
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
  if (!consumeAuthRateLimit(`refresh:${ip}`)) {
    return authJson(
      {
        success: false,
        message: "Too many attempts. Try again shortly.",
        code: "rate_limited",
      },
      429,
    );
  }

  const current = await readSessionFromRequest(request);
  if (!current) {
    return authJson(
      {
        success: false,
        message: GENERIC_UNAUTHENTICATED,
        code: "unauthenticated",
      },
      401,
    );
  }

  try {
    const fresh = await forceRefreshPatientSession(current);
    return authJson(
      {
        success: true,
        data: {
          authenticated: true,
          email: fresh.session.email ?? null,
          expiresAt: fresh.session.expiresAt,
        },
      },
      200,
      fresh.setCookie ? { "Set-Cookie": fresh.setCookie } : undefined,
    );
  } catch (err) {
    return mapAuthError(err);
  }
}
