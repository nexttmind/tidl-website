import {
  getWebhookSecret,
  handlePrescribeRxWebhook,
} from "@/lib/prescriberx/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Inbound PrescribeRx webhooks.
 * Fail closed: missing secret → 503, invalid HMAC → 401.
 * Waiting and protocol gate still use live PRX status, not this projector.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const result = handlePrescribeRxWebhook({
    rawBody,
    signatureHeader: request.headers.get("x-prescriberx-signature"),
    webhookIdHeader: request.headers.get("x-webhook-id"),
    secret: getWebhookSecret(),
  });
  return Response.json(result.body, { status: result.status });
}
