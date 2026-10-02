import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "@/lib/prescriberx/auth-errors";
import {
  clientIpFromRequest,
  consumeRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { PrescribeRxError, errorResponse } from "@/lib/prescriberx/client";
import { fetchEnrichedEncounterStatus } from "@/lib/prescriberx/encounter-enrich";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import { ensureFreshPatientSession } from "@/lib/prescriberx/patient-client";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Always live-fetch PrescribeRx. Do not read the webhook projector. */
export async function GET(request: Request, { params }: Params) {
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

  const ip = clientIpFromRequest(request);
  const limit = consumeRateLimit(`status:${ip}`, 20, 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSec);

  const { id } = await params;
  try {
    const data = await fetchEnrichedEncounterStatus(id, fresh.session.token);
    const headers: HeadersInit = {};
    if (fresh.setCookie) headers["Set-Cookie"] = fresh.setCookie;
    return Response.json({ success: true, data }, { status: 200, headers });
  } catch (err) {
    if (err instanceof PrescribeRxError && err.status === 401) {
      return authJson(
        {
          success: false,
          message: "Encounter status temporarily unavailable.",
          code: "upstream_unauthorized",
        },
        502,
      );
    }
    return errorResponse(err);
  }
}
