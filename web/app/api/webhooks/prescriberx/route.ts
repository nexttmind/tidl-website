import { verifyPrescribeRxSignature } from "@/lib/prescriberx/webhooks";
import { getPrescribeRxEnv } from "@/lib/prescriberx/env";

export const dynamic = "force-dynamic";

/**
 * Inbound PrescribeRx webhooks.
 * Verifies X-PrescribeRx-Signature when PRESCRIBERX_WEBHOOK_SECRET is set.
 * Acknowledge fast; fan out to status projectors in a later pass.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const env = getPrescribeRxEnv();

  if (env?.webhookSecret) {
    const signature = request.headers.get("x-prescriberx-signature");
    if (!verifyPrescribeRxSignature(rawBody, signature)) {
      return Response.json(
        { success: false, message: "Invalid signature" },
        { status: 401 },
      );
    }
  }

  let event: { event?: string; webhook_id?: string } = {};
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Idempotency key: event.webhook_id / X-Webhook-ID. Persist later.
  console.info("[prescriberx webhook]", {
    event: event.event,
    webhook_id:
      event.webhook_id || request.headers.get("x-webhook-id") || null,
  });

  return Response.json({ success: true, received: true });
}
