import { clientIpFromRequest, consumeRateLimit } from "@/lib/prescriberx/auth-rate-limit";
import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { unwrapEncounterStatus } from "@/lib/prescriberx/encounter-status";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";
import { fetchAvailableSlots } from "@/lib/prescriberx/scheduling";
import {
  VisitSchedulingError,
  requireVisitSchedulingContext,
} from "@/lib/prescriberx/visit-scheduling-request";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  const ip = clientIpFromRequest(request);
  const limit = consumeRateLimit(`sched-slots:${ip}`, 30, 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSec);

  const url = new URL(request.url);
  const encounterId = url.searchParams.get("encounter_id")?.trim() ?? "";
  const entrySlug = url.searchParams.get("entry")?.trim() ?? "testosterone";
  const timezone =
    url.searchParams.get("timezone")?.trim() || "America/New_York";

  if (!encounterId) {
    return Response.json(
      { success: false, message: "encounter_id is required" },
      { status: 422 },
    );
  }

  try {
    const ctx = await requireVisitSchedulingContext(request, {
      encounterId,
      entrySlug,
    });

    const statusRaw = await prescribeRxFetch(
      `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
    );
    const statusData = unwrapEncounterStatus(statusRaw);
    const alreadyScheduled =
      (statusData?.status ?? "").toLowerCase() === "scheduled";

    if (alreadyScheduled) {
      return Response.json({
        success: true,
        data: {
          already_scheduled: true,
          slots: [],
          status: statusData?.status ?? null,
          scheduled_at:
            typeof statusData?.scheduled_at === "string"
              ? statusData.scheduled_at
              : null,
        },
      });
    }

    const { slots } = await fetchAvailableSlots({
      encounterTypeId: ctx.encounterTypeId,
      patientChartId: ctx.patientChartId,
      timezone,
      fastest: false,
    });

    return Response.json({
      success: true,
      data: {
        already_scheduled: false,
        slots,
        timezone,
        encounter_type_id: ctx.encounterTypeId,
      },
    });
  } catch (err) {
    if (err instanceof VisitSchedulingError) {
      return Response.json(
        { success: false, code: err.code, message: err.message },
        { status: err.status },
      );
    }
    return errorResponse(err);
  }
}
