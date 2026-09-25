import {
  extractAbilitiesFromMe,
  orgTokenCanIssuePatientToken,
} from "@/lib/prescriberx/abilities";
import { prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  evaluatePrescribeRxEnvGuard,
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";
import { buildHealthConfigFlags } from "@/lib/prescriberx/health-config";
import { buildSandboxAdminHints } from "@/lib/prescriberx/sandbox-admin";

export const dynamic = "force-dynamic";

type Check = { path: string; status: number; ok: boolean };

/**
 * Direct PrescribeRx sandbox/production health.
 * Does not use the Netlify demo host. Flip production by changing
 * PRESCRIBERX_API_BASE + PRESCRIBERX_API_TOKEN (+ SANDBOX=false).
 */
export async function GET() {
  const env = getPrescribeRxEnv();
  if (!env) return missingPrescribeRxResponse();

  const guard = evaluatePrescribeRxEnvGuard(env);
  const configFlags = buildHealthConfigFlags(env);

  if (!guard.ok) {
    return Response.json(
      {
        success: false,
        data: {
          ...configFlags,
          healthy: false,
          issueToken: false,
          warnings: [],
          checks: {},
          code: guard.code,
          message: guard.message,
        },
      },
      { status: 503 },
    );
  }

  let issueToken = false;
  const paths = ["/auth/me", "/catalog", "/telehealth/encounter-types"] as const;
  const checks: Record<string, Check> = {};

  for (const path of paths) {
    try {
      const data = await prescribeRxFetch(path);
      checks[path] = { path, status: 200, ok: true };
      if (path === "/auth/me") {
        issueToken = orgTokenCanIssuePatientToken(extractAbilitiesFromMe(data));
      }
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status: number }).status)
          : 500;
      checks[path] = { path, status, ok: false };
    }
  }

  const upstreamHealthy = Object.values(checks).every((c) => c.ok);
  const healthy = upstreamHealthy && guard.warnings.length === 0;
  const adminHints = buildSandboxAdminHints(env);

  return Response.json(
    {
      success: true,
      data: {
        configured: true,
        ...configFlags,
        issueToken,
        checks,
        warnings: guard.warnings,
        healthy,
        ...(adminHints ? { adminHints } : {}),
      },
    },
    { status: upstreamHealthy ? 200 : 503 },
  );
}
