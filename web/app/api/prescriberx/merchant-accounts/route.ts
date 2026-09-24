import { errorResponse } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import { listMerchantAccounts } from "@/lib/prescriberx/merchant-accounts";

export const dynamic = "force-dynamic";

/** Redacted merchant accounts for the token org (no gateway secrets). */
export async function GET() {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();
  try {
    const accounts = await listMerchantAccounts();
    return Response.json({
      success: true,
      data: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        gateway_provider: a.gateway_provider,
        environment: a.environment,
        is_default: a.is_default,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
