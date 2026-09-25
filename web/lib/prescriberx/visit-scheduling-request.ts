import { readSessionFromRequest, type PatientSessionPayload } from "@/lib/auth/session";
import {
  OwnershipError,
  assertChartOwnsEncounter,
} from "@/lib/prescriberx/auth-ownership";
import { GENERIC_UNAUTHENTICATED } from "@/lib/prescriberx/auth-errors";
import { prescribeRxFetch } from "@/lib/prescriberx/client";
import { resolveClinicalEntry } from "@/content/clinical/entry-map";
import {
  evaluateProtocolAccess,
  unwrapEncounterStatus,
} from "@/lib/prescriberx/encounter-status";

export class VisitSchedulingError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "VisitSchedulingError";
  }
}

export async function requireVisitSchedulingContext(
  request: Request,
  input: { encounterId: string; entrySlug: string },
): Promise<{
  session: PatientSessionPayload;
  entrySlug: string;
  encounterId: string;
  patientChartId: string;
  encounterTypeId: string;
}> {
  const session = await readSessionFromRequest(request);
  if (!session?.patientChartId?.trim()) {
    throw new VisitSchedulingError(
      GENERIC_UNAUTHENTICATED,
      "unauthenticated",
      401,
    );
  }

  const encounterId = input.encounterId.trim();
  const entry = resolveClinicalEntry(input.entrySlug);
  if (!entry.visitGateDefault) {
    throw new VisitSchedulingError(
      "This care path does not require a video visit.",
      "visit_not_required",
      422,
    );
  }

  try {
    await assertChartOwnsEncounter({
      patientChartId: session.patientChartId,
      encounterId,
      email: session.email ?? "",
    });
  } catch (err) {
    if (err instanceof OwnershipError) {
      throw new VisitSchedulingError("Not allowed for this encounter.", "forbidden", 403);
    }
    throw err;
  }

  const statusRaw = await prescribeRxFetch(
    `/telehealth/encounters/${encodeURIComponent(encounterId)}/status`,
  );
  const statusData = unwrapEncounterStatus(statusRaw);
  const access = evaluateProtocolAccess(statusData?.status, true);
  if (access === "wait") {
    throw new VisitSchedulingError(
      "Your case is not ready to schedule a visit yet.",
      "not_ready",
      422,
    );
  }
  if (access === "allow") {
    throw new VisitSchedulingError(
      "Your visit step is already complete. Continue to your protocol.",
      "visit_complete",
      422,
    );
  }

  return {
    session,
    entrySlug: entry.slug,
    encounterId,
    patientChartId: session.patientChartId.trim(),
    encounterTypeId: entry.encounterTypeId,
  };
}
