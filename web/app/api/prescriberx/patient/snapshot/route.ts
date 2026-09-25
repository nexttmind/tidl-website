import { GENERIC_UNAUTHENTICATED, authJson, mapAuthError } from "@/lib/prescriberx/auth-errors";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { ensureFreshPatientSession } from "@/lib/prescriberx/patient-client";
import { fetchPatientSnapshot } from "@/lib/prescriberx/patient-snapshot";
import { stripSecrets } from "@/lib/prescriberx/patient-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

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

  try {
    const data = await fetchPatientSnapshot(fresh.session.token);
    const headers: HeadersInit = {};
    if (fresh.setCookie) headers["Set-Cookie"] = fresh.setCookie;
    return authJson({ success: true, data: stripSecrets(data) }, 200, headers);
  } catch (err) {
    return mapAuthError(err);
  }
}
