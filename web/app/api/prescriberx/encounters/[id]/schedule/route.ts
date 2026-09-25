import { readSessionFromRequest } from "@/lib/auth/session";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/prescriberx/auth-rate-limit";
import { GENERIC_UNAUTHENTICATED } from "@/lib/prescriberx/auth-errors";
import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "@/lib/prescriberx/env";
import { unwrapEncounterStatus } from "@/lib/prescriberx/encounter-status";
import { rateLimitedResponse } from "@/lib/prescriberx/rate-limit-response";
import {
  fetchEncounterVideoRoom,
  parseVideoRoom,
  scheduleEncounterVisit,
} from "@/lib/prescriberx/scheduling";
import {
  VisitSchedulingError,
  requireVisitSchedulingContext,
} from "@/lib/prescriberx/visit-scheduling-request";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

type Body = {
  entry?: string;
  scheduled_start?: string;
  provider_profile_id?: string;
  patient_timezone?: string;
};

export async function POST(request: Request, { params }: Params) {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  const session = await readSessionFromRequest(request);
  if (!session) {
    return Response.json(
      { success: false, message: GENERIC_UNAUTHENTICATED, code: "unauthenticated" },
      { status: 401 },
    );
  }

  const ip = clientIpFromRequest(request);
  const limit = consumeRateLimit(`sched-book:${ip}`, 10, 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfterSec);

  const { id: encounterId } = await params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body" },
      { status: 422 },
    );
  }

  const scheduledStart = body.scheduled_start?.trim();
  if (!scheduledStart) {
    return Response.json(
      { success: false, message: "scheduled_start is required" },
      { status: 422 },
    );
  }

  const entrySlug = body.entry?.trim() ?? "testosterone";

  try {
    await requireVisitSchedulingContext(request, { encounterId, entrySlug });

    const statusRaw = await prescribeRxFetch(
      `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
    );
    const statusData = unwrapEncounterStatus(statusRaw);
    if ((statusData?.status ?? "").toLowerCase() === "scheduled") {
      return Response.json(
        {
          success: false,
          code: "already_scheduled",
          message: "This visit is already scheduled.",
        },
        { status: 422 },
      );
    }

    const booked = await scheduleEncounterVisit({
      encounterId,
      scheduledStart,
      providerProfileId: body.provider_profile_id?.trim() || null,
      patientTimezone: body.patient_timezone?.trim() || null,
      reason: "Patient booked via TIDL care portal",
    });

    const roomFromBook = parseVideoRoom(booked);
    const room =
      roomFromBook?.join_url
        ? roomFromBook
        : await fetchEncounterVideoRoom(encounterId);

    return Response.json({
      success: true,
      data: {
        scheduled_start: scheduledStart,
        video_room: room,
        encounter: booked,
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
