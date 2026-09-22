import {
  clearSessionCookieHeader,
  readSessionFromRequest,
} from "@/lib/auth/session";
import { authJson } from "@/lib/prescriberx/auth-errors";
import { PrescribeRxError } from "@/lib/prescriberx/client";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { prescribeRxPatientFetch } from "@/lib/prescriberx/patient-client";

export const dynamic = "force-dynamic";

/** Revoke patient token upstream when possible; always clear cookie. */
export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();

  const session = await readSessionFromRequest(request);
  const clear = clearSessionCookieHeader();

  if (!session) {
    return authJson(
      { success: true, data: { authenticated: false } },
      200,
      { "Set-Cookie": clear },
    );
  }

  try {
    await prescribeRxPatientFetch("/auth/logout", {
      method: "POST",
      token: session.token,
    });
  } catch (err) {
    // Upstream already 401 → still clear local session (not a failure for the client).
    if (!(err instanceof PrescribeRxError && err.status === 401)) {
      // Log without details; still clear cookie.
      console.error(
        `[prescriberx-auth] logout upstream status=${
          err instanceof PrescribeRxError ? err.status : "unknown"
        }`,
      );
    }
  }

  return authJson(
    { success: true, data: { authenticated: false } },
    200,
    { "Set-Cookie": clear },
  );
}
