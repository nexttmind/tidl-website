import type { PrescribeRxEnv } from "./env";
import { getSessionSecret, sandboxHostConsistent } from "./env";

export function buildHealthConfigFlags(env: PrescribeRxEnv) {
  const flags = {
    webhookSecretConfigured: Boolean(env.webhookSecret?.trim()),
    sessionSecretConfigured: Boolean(getSessionSecret()),
    sandboxHostConsistent: sandboxHostConsistent(env),
    sandbox: env.sandbox,
  };

  if (process.env.NODE_ENV === "production") {
    return flags;
  }

  return {
    ...flags,
    baseUrl: env.baseUrl,
    defaultEncounterTypeId: env.defaultEncounterTypeId,
  };
}
