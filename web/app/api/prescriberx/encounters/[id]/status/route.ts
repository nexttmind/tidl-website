import { readSessionFromRequest } from "@/lib/auth/session";
import {
  clientIpFromRequest,
  consumeRateLimit,
} from "@/lib/prescriberx/auth-rate-limit";
import { GENERIC_UNAUTHENTICATED } from "@/lib/prescriberx/auth-errors";
import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Always live-fetch PrescribeRx. Do not read the webhook projector. */
export async function GET(request: Request, { params }: Params) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  const session = await readSessionFromRequest(request);
  if (!session) {
    return Response.json(
      {
        success: false,
        authenticated: false,
        message: GENERIC_UNAUTHENTICATED,
        code: "unauthenticated",
      },
      { status: 401 },
    );
  }

  const ip = clientIpFromRequest(request);
  const limit = consumeRateLimit(`status:${ip}`, 20, 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSec);

  const { id } = await params;
  try {
    const data = await prescribeRxFetch(
      `/telehealth/encounters/${encodeURIComponent(id)}/status`,
    );
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
