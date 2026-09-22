import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  try {
    const data = await prescribeRxFetch("/telehealth/encounter-types");
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
