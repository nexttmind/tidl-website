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

/** Session seal secret for patient portal cookies (Phase A). */
export function getSessionSecret(): string | null {
  const secret = process.env.TIDL_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
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
    },
    { status: 503 },
  );
}
