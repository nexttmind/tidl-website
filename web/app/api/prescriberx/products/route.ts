import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  const { searchParams } = new URL(request.url);
  const encounterTypeId = searchParams.get("encounter_type_id");
  try {
    const data = await prescribeRxFetch("/telehealth/products", {
      query: { encounter_type_id: encounterTypeId },
    });
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
