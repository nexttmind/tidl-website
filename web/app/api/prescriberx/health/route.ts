import { prescribeRxFetch } from "@/lib/prescriberx/client";
import {
  getPrescribeRxEnv,
  missingPrescribeRxResponse,
} from "@/lib/prescriberx/env";

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

  const paths = ["/auth/me", "/catalog", "/telehealth/encounter-types"] as const;
  const checks: Record<string, Check> = {};

  for (const path of paths) {
    try {
      await prescribeRxFetch(path);
      checks[path] = { path, status: 200, ok: true };
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status: number }).status)
          : 500;
      checks[path] = { path, status, ok: false };
    }
  }

  const healthy = Object.values(checks).every((c) => c.ok);
  return Response.json(
    {
      success: true,
      data: {
        configured: true,
        baseUrl: env.baseUrl,
        sandbox: env.sandbox,
        defaultEncounterTypeId: env.defaultEncounterTypeId,
        checks,
        healthy,
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
