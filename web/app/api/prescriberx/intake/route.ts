import { buildUnifiedIntakePayload } from "@/lib/prescriberx/build-intake-payload";
import { errorResponse, prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import type {
  EncounterSchemaData,
  UploadedDoc,
} from "@/lib/prescriberx/schema-types";

export const dynamic = "force-dynamic";

type RawBody = {
  encounter_type_id?: string;
  encounter_type_slug?: string;
  values?: Record<string, unknown>;
  products?: string[] | { product_id: string; quantity?: number }[];
  consents?: string[];
  files?: UploadedDoc[];
  /** If true, body is already a unified payload (passthrough). */
  prebuilt?: boolean;
};

/**
 * Accepts the browser's raw intake bundle, re-fetches schema, builds unified
 * payload, and POSTs to PrescribeRx. Token never reaches the browser.
 */
export async function POST(request: Request) {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();

  let body: RawBody & Record<string, unknown>;
  try {
    body = (await request.json()) as RawBody & Record<string, unknown>;
  } catch {
    return Response.json(
      {
        success: false,
        message:
          "The intake request was too large to read. Use a smaller ID photo, then submit again.",
      },
      { status: 400 },
    );
  }

  // Passthrough for already-shaped payloads (advanced callers).
  if (body.prebuilt) {
    const { prebuilt: _p, ...payload } = body;
    if (env.sandbox) payload.is_sandbox = true;
    try {
      const data = await prescribeRxFetch("/telehealth/intake/unified", {
        method: "POST",
        body: payload,
      });
      return Response.json(data);
    } catch (err) {
      return errorResponse(err);
    }
  }

  const encounterTypeId =
    (body.encounter_type_id as string | undefined) ||
    env.defaultEncounterTypeId;

  if (!encounterTypeId && !body.encounter_type_slug) {
    return Response.json(
      {
        success: false,
        message: "encounter_type_id or encounter_type_slug is required",
      },
      { status: 422 },
    );
  }

  try {
    const schemaRes = await prescribeRxFetch<{ data: EncounterSchemaData }>(
      `/telehealth/encounter-types/${encodeURIComponent(String(encounterTypeId))}/schema`,
    );
    const schema = schemaRes.data ?? (schemaRes as unknown as EncounterSchemaData);

    const productIds = (body.products ?? []).map((p) =>
      typeof p === "string" ? p : p.product_id,
    );

    const payload = buildUnifiedIntakePayload({
      schema,
      values: body.values ?? {},
      files: body.files ?? [],
      productIds,
      acceptedConsentKeys: body.consents ?? [],
      isSandbox: env.sandbox,
      clientId: env.clientId,
      salesOrgId: env.salesOrgId,
      meta: {
        ip_address:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          undefined,
        user_agent: request.headers.get("user-agent") || undefined,
        source_domain: request.headers.get("host") || undefined,
      },
    });

    const data = await prescribeRxFetch("/telehealth/intake/unified", {
      method: "POST",
      body: payload,
    });
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
