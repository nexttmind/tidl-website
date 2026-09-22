import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  const { id } = await params;
  try {
    const data = await prescribeRxFetch(
      `/telehealth/encounter-types/${encodeURIComponent(id)}/schema`,
    );
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
