import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import {
  ensureFreshPatientSession,
  prescribeRxPatientFetch,
} from "@/lib/prescriberx/patient-client";

export const dynamic = "force-dynamic";

type MeUser = {
  email?: string;
  patient_chart_id?: string;
};

/**
 * Non-PHI session probe for the browser.
 * Returns authenticated + email + expiresAt only (never the bearer).
 */
export async function GET(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();

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

  let email = fresh.session.email ?? null;
  let patientChartId = fresh.session.patientChartId ?? null;

  try {
    const me = await prescribeRxPatientFetch<{
      data?: MeUser;
      email?: string;
    }>("/auth/me", { token: fresh.session.token });
    const user =
      me && typeof me === "object" && me.data && typeof me.data === "object"
        ? me.data
        : (me as MeUser);
    if (user && typeof user.email === "string") email = user.email;
    if (user && typeof user.patient_chart_id === "string") {
      patientChartId = user.patient_chart_id;
    }
  } catch (err) {
    return mapAuthError(err);
  }

  const headers: HeadersInit = {};
  if (fresh.setCookie) {
    headers["Set-Cookie"] = fresh.setCookie;
  }

  return authJson(
    {
      success: true,
      authenticated: true,
      email,
      expiresAt: fresh.session.expiresAt,
      patientChartId,
    },
    200,
    headers,
  );
}
