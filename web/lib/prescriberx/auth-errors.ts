/**
 * Controlled auth API errors — never leak upstream bodies, tokens, or PHI.
 */

import { PrescribeRxError } from "./client";
import { TokenParseError } from "./token-parse";

export const GENERIC_AUTH_FAILURE =
  "Unable to complete authentication. Check your details and try again.";
export const GENERIC_OWNERSHIP_FAILURE =
  "Unable to complete authentication. Check your details and try again.";
export const GENERIC_VALIDATION = "Invalid request.";
export const GENERIC_UNAUTHENTICATED = "Not authenticated.";
export const GENERIC_UPSTREAM = "Service temporarily unavailable. Try again.";

export function authJson(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit,
): Response {
  return Response.json(body, { status, headers });
}

export function mapAuthError(err: unknown): Response {
  if (err instanceof TokenParseError) {
    console.error("[prescriberx-auth] malformed upstream token envelope");
    return authJson(
      { success: false, message: GENERIC_UPSTREAM, code: "malformed_upstream" },
      502,
    );
  }

  if (err instanceof PrescribeRxError) {
    if (err.status === 401) {
      return authJson(
        { success: false, message: GENERIC_AUTH_FAILURE, code: "unauthorized" },
        401,
      );
    }
    if (err.status === 403) {
      return authJson(
        { success: false, message: GENERIC_AUTH_FAILURE, code: "forbidden" },
        403,
      );
    }
    if (err.status === 422) {
      return authJson(
        { success: false, message: GENERIC_VALIDATION, code: "validation" },
        422,
      );
    }
    if (err.status === 429) {
      return authJson(
        {
          success: false,
          message: "Too many attempts. Try again shortly.",
          code: "rate_limited",
        },
        429,
      );
    }
    console.error(
      `[prescriberx-auth] upstream status=${err.status} (body omitted)`,
    );
    return authJson(
      { success: false, message: GENERIC_UPSTREAM, code: "upstream_error" },
      err.status >= 500 ? 502 : err.status,
    );
  }

  void err;
  console.error("[prescriberx-auth] unexpected error (details omitted)");
  return authJson(
    { success: false, message: GENERIC_UPSTREAM, code: "unexpected" },
    500,
  );
}
