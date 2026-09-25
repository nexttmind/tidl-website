import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import { PrescribeRxError } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import {
  ensureFreshPatientSession,
  prescribeRxPatientFetch,
} from "@/lib/prescriberx/patient-client";
import { stripSecrets } from "@/lib/prescriberx/patient-proxy";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  const { id } = await params;
  if (!UUID.test(id)) {
    return authJson({ success: false, message: "Invalid request." }, 422);
  }

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
    const envelope = await prescribeRxPatientFetch(
      `/me/patient/export/${encodeURIComponent(id)}/download`,
      { token: fresh.session.token },
    );
    const headers = new Headers({
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tidl-records-${id}.json"`,
    });
    if (fresh.setCookie) headers.set("Set-Cookie", fresh.setCookie);
    return new Response(JSON.stringify(stripSecrets(envelope)), {
      status: 200,
      headers,
    });
  } catch (err) {
    if (err instanceof PrescribeRxError && err.status === 404) {
      return authJson(
        { success: false, message: "That export is not ready yet." },
        404,
      );
    }
    return mapAuthError(err);
  }
}
