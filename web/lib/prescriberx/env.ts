/** Server-only PrescribeRx env. Never import from client components. */

export type PrescribeRxEnv = {
  baseUrl: string;
  token: string;
  sandbox: boolean;
  clientId: string | null;
  salesOrgId: string | null;
  defaultEncounterTypeId: string | null;
  webhookSecret: string | null;
};

export const DEMO_PRESCRIBERX_HOST = "demo.prescribe-rx.com";
export const PRODUCTION_PRESCRIBERX_HOST = "prescribe-rx.com";

/** Session seal secret for patient portal cookies (Phase A). */
export function getSessionSecret(): string | null {
  const secret = process.env.TIDL_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function hostnameFromPrescribeRxBase(baseUrl: string): string | null {
  try {
    return new URL(baseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isDemoPrescribeRxBase(baseUrl: string): boolean {
  const host = hostnameFromPrescribeRxBase(baseUrl);
  if (host) return host === DEMO_PRESCRIBERX_HOST;
  return baseUrl.toLowerCase().includes(DEMO_PRESCRIBERX_HOST);
}

export function isProductionPrescribeRxBase(baseUrl: string): boolean {
  const host = hostnameFromPrescribeRxBase(baseUrl);
  if (host) {
    return (
      host === PRODUCTION_PRESCRIBERX_HOST ||
      (host.endsWith(".prescribe-rx.com") &&
        !host.startsWith("demo.") &&
        host !== DEMO_PRESCRIBERX_HOST)
    );
  }
  const lower = baseUrl.toLowerCase();
  return (
    lower.includes(PRODUCTION_PRESCRIBERX_HOST) &&
    !lower.includes(DEMO_PRESCRIBERX_HOST)
  );
}

export type PrescribeRxEnvGuard =
  | { ok: true; warnings: string[] }
  | { ok: false; code: "sandbox_host_mismatch"; message: string };

/** Demo host + SANDBOX=false is a hard misconfiguration. */
export function evaluatePrescribeRxEnvGuard(env: PrescribeRxEnv): PrescribeRxEnvGuard {
  if (isDemoPrescribeRxBase(env.baseUrl) && !env.sandbox) {
    return {
      ok: false,
      code: "sandbox_host_mismatch",
      message:
        "PRESCRIBERX_SANDBOX=false cannot be used with demo.prescribe-rx.com. Use production base URL or set PRESCRIBERX_SANDBOX=true.",
    };
  }

  const warnings: string[] = [];
  if (isProductionPrescribeRxBase(env.baseUrl) && env.sandbox) {
    warnings.push(
      "PRESCRIBERX_SANDBOX=true against production host; set false before live patient traffic.",
    );
  }
  return { ok: true, warnings };
}

export function sandboxHostConsistent(env: PrescribeRxEnv): boolean {
  return evaluatePrescribeRxEnvGuard(env).ok;
}

export function getPrescribeRxEnv(): PrescribeRxEnv | null {
  const baseUrl = process.env.PRESCRIBERX_API_BASE?.replace(/\/$/, "");
  const token = process.env.PRESCRIBERX_API_TOKEN;
  if (!baseUrl || !token) return null;

  return {
    baseUrl,
    token,
    sandbox: (process.env.PRESCRIBERX_SANDBOX ?? "true").toLowerCase() !== "false",
    clientId: process.env.PRESCRIBERX_CLIENT_ID || null,
    salesOrgId: process.env.PRESCRIBERX_SALES_ORG_ID || null,
    defaultEncounterTypeId:
      process.env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID || null,
    webhookSecret: process.env.PRESCRIBERX_WEBHOOK_SECRET || null,
  };
}

export function missingPrescribeRxResponse() {
  return Response.json(
    {
      success: false,
      message:
        "PrescribeRx is not configured. Set PRESCRIBERX_API_BASE and PRESCRIBERX_API_TOKEN.",
      code: "prescriberx_not_configured",
    },
    { status: 503 },
  );
}

export function misconfiguredPrescribeRxResponse(
  code: string,
  message: string,
) {
  return Response.json(
    { success: false, message, code },
    { status: 503 },
  );
}

/** Block clinical writes when demo host is paired with SANDBOX=false. */
export function guardPrescribeRxEnv(env: PrescribeRxEnv): Response | null {
  const guard = evaluatePrescribeRxEnvGuard(env);
  if (!guard.ok) {
    return misconfiguredPrescribeRxResponse(guard.code, guard.message);
  }
  return null;
}
