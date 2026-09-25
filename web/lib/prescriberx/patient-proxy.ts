/**
 * Shared patient-token GET proxy. Never uses the org token.
 * Errors never include upstream bodies. Tokens never leave the server.
 */

import {
  GENERIC_UNAUTHENTICATED,
  authJson,
  mapAuthError,
} from "./auth-errors";
import { getPrescribeRxEnv, missingPrescribeRxResponse } from "./env";
import {
  ensureFreshPatientSession,
  prescribeRxPatientFetch,
} from "./patient-client";

const SECRET_KEY = /token|password|authorization|secret|bearer|card_number|last_four|cvv/i;

export function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, next] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY.test(key)) continue;
    out[key] = stripSecrets(next);
  }
  return out;
}

function unwrapPayload(envelope: unknown): unknown {
  if (!envelope || typeof envelope !== "object") return envelope;
  const root = envelope as Record<string, unknown>;
  if ("data" in root) return root.data ?? null;
  return envelope;
}

export async function patientGetProxy(
  request: Request,
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
): Promise<Response> {
  if (!getPrescribeRxEnv()) return missingPrescribeRxResponse();

  let fresh;
  try {
    fresh = await ensureFreshPatientSession(request);
  } catch (err) {
    return mapAuthError(err);
  }

  if (!fresh) {
    return authJson(
      {
        success: false,
        authenticated: false,
        message: GENERIC_UNAUTHENTICATED,
        code: "unauthenticated",
      },
      401,
    );
  }

  try {
    const envelope = await prescribeRxPatientFetch(path, {
      token: fresh.session.token,
      query,
    });
    const headers: HeadersInit = {};
    if (fresh.setCookie) headers["Set-Cookie"] = fresh.setCookie;
    return authJson(
      {
        success: true,
        data: stripSecrets(unwrapPayload(envelope)),
      },
      200,
      headers,
    );
  } catch (err) {
    return mapAuthError(err);
  }
}
