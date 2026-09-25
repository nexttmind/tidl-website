import { readSessionFromRequest } from "@/lib/auth/session";
import {
  OwnershipError,
  assertChartOwnsEncounter,
} from "@/lib/prescriberx/auth-ownership";
import { GENERIC_UNAUTHENTICATED } from "@/lib/prescriberx/auth-errors";
import { errorResponse } from "@/lib/prescriberx/client";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { fetchEncounterVideoRoom } from "@/lib/prescriberx/scheduling";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  const session = await readSessionFromRequest(request);
  if (!session?.patientChartId) {
    return Response.json(
      { success: false, message: GENERIC_UNAUTHENTICATED, code: "unauthenticated" },
      { status: 401 },
    );
  }

  const { id: encounterId } = await params;
  try {
    await assertChartOwnsEncounter({
      patientChartId: session.patientChartId,
      encounterId,
      email: session.email ?? "",
    });
  } catch (err) {
    if (err instanceof OwnershipError) {
      return Response.json(
        { success: false, message: "Not allowed for this encounter.", code: "forbidden" },
        { status: 403 },
      );
    }
    return errorResponse(err);
  }

  try {
    const room = await fetchEncounterVideoRoom(encounterId);
    if (!room?.join_url) {
      return Response.json(
        {
          success: false,
          code: "no_room",
          message: "No video room for this encounter yet.",
        },
        { status: 404 },
      );
    }
    return Response.json({ success: true, data: room });
  } catch (err) {
    return errorResponse(err);
  }
}
