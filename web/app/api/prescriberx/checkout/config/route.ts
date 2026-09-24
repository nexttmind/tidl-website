import { authJson } from "@/lib/prescriberx/auth-errors";
import {
  getPrescribeRxEnv,
  guardPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import {
  getPrxAcceptJsConfig,
  isPrxCollectorPaymentsEnabled,
} from "@/lib/prescriberx/prx-collector-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();
  const guard = guardPrescribeRxEnv(env);
  if (guard) return guard;

  const collector = isPrxCollectorPaymentsEnabled();
  const accept = getPrxAcceptJsConfig();

  return authJson({
    success: true,
    data: {
      sandbox: env.sandbox,
      collector_enabled: collector && !!accept,
      record_only_sandbox: env.sandbox && !collector,
      accept_js: accept
        ? {
            api_login_id: accept.apiLoginId,
            client_key: accept.clientKey,
            script_url: accept.acceptJsUrl,
            gateway_provider: accept.gatewayProvider,
          }
        : null,
    },
  });
}
