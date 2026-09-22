import {
  GENERIC_VALIDATION,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  clientIpFromRequest,
  consumeAuthRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

type ForgotBody = { email?: string };

/**
 * Proxy POST /auth/password/forgot (no bearer required upstream).
 * Always returns a generic success message to avoid email enumeration,
 * unless upstream is clearly rate-limiting or misconfigured.
 */
export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();

  const ip = clientIpFromRequest(request);
  if (!consumeAuthRateLimit(`forgot:${ip}`)) {
    return authJson(
      {
        success: false,
        message: "Too many attempts. Try again shortly.",
        code: "rate_limited",
      },
      429,
    );
  }

  let body: ForgotBody;
  try {
    body = (await request.json()) as ForgotBody;
  } catch {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "invalid_json" },
      400,
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return authJson(
      { success: false, message: GENERIC_VALIDATION, code: "validation" },
      422,
    );
  }

  try {
    const res = await fetch(`${env.baseUrl}/auth/password/forgot`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (res.status === 429) {
      return authJson(
        {
          success: false,
          message: "Too many attempts. Try again shortly.",
          code: "rate_limited",
        },
        429,
      );
    }

    if (res.status >= 500) {
      return authJson(
        {
          success: false,
          message: "Service temporarily unavailable. Try again.",
          code: "upstream_error",
        },
        502,
      );
    }

    // 2xx and non-revealing 4xx: do not say whether the email exists.
    return authJson(
      {
        success: true,
        message:
          "If an account exists for that email, password reset instructions were sent.",
      },
      200,
    );
  } catch (err) {
    return mapAuthError(err);
  }
}
