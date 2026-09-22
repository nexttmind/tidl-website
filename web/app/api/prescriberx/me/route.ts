import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

/** Proxy GET /auth/me. Token stays on the server. */
export async function GET() {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  try {
    const data = await prescribeRxFetch("/auth/me");
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
