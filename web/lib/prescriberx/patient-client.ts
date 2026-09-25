/**
 * PrescribeRx fetch using the *patient* bearer from the sealed session.
 * Never falls back to the organization token.
 */

import {
  buildSessionCookieHeader,
  clearSessionCookieHeader,
  isSessionExpired,
  readSessionFromRequest,
  sealSession,
  sessionNeedsRefresh,
  type PatientSessionPayload,
} from "../auth/session";
import { getPrescribeRxEnv } from "./env";
import { PrescribeRxError } from "./client";
import { extractAuthToken } from "./token-parse";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  form?: FormData;
  headers?: Record<string, string>;
  /** Explicit patient token (e.g. right after issue-token, before cookie set). */
  token?: string;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
) {
  const url = new URL(`${baseUrl}/${path.replace(/^\//, "")}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function patientFetchRaw<T>(
  token: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const env = getPrescribeRxEnv();
  if (!env) {
    throw new PrescribeRxError("PrescribeRx env not configured", 503, null);
  }
  if (!token) {
    throw new PrescribeRxError("Patient token required", 401, null);
  }

  const method = options.method ?? "GET";
  const url = buildUrl(env.baseUrl, path, options.query);
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  let body: string | FormData | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const timeoutMs = 20_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    throw new PrescribeRxError(
      `PrescribeRx ${method} ${path} network failure`,
      502,
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text.slice(0, 200) };
    }
  }

  if (!res.ok) {
    throw new PrescribeRxError(
      `PrescribeRx ${method} ${path} failed`,
      res.status,
      parsed,
    );
  }

  return parsed as T;
}

/** Direct patient-token call (no org fallback). */
export async function prescribeRxPatientFetch<T = unknown>(
  path: string,
  options: RequestOptions & { token: string },
): Promise<T> {
  return patientFetchRaw<T>(options.token, path, options);
}

export type FreshSessionResult = {
  session: PatientSessionPayload;
  /** Set-Cookie value when a refresh issued a new sealed session */
  setCookie?: string;
};

/**
 * Single-flight refresh keyed by the current bearer.
 * Same token shares one /auth/refresh. Different patients never share a flight.
 */
const refreshInFlight = new Map<string, Promise<FreshSessionResult>>();

async function refreshPatientSession(
  current: PatientSessionPayload,
): Promise<FreshSessionResult> {
  const envelope = await patientFetchRaw<unknown>(current.token, "/auth/refresh", {
    method: "POST",
    body: { device_name: "tidl-web" },
  });
  const parsed = extractAuthToken(envelope);
  const next: PatientSessionPayload = {
    token: parsed.token,
    expiresAt: parsed.expiresAt,
    abilities: parsed.abilities.length
      ? parsed.abilities
      : current.abilities,
    email: parsed.userEmail ?? current.email,
    patientChartId: parsed.patientChartId ?? current.patientChartId,
  };
  const sealed = await sealSession(next);
  if (!sealed) {
    throw new PrescribeRxError("Session secret not configured", 503, null);
  }
  return {
    session: next,
    setCookie: buildSessionCookieHeader(sealed, next.expiresAt),
  };
}

/**
 * Force one refresh for this bearer. Concurrent callers with the same token
 * await the same promise and receive the same new session.
 */
export function forceRefreshPatientSession(
  current: PatientSessionPayload,
): Promise<FreshSessionResult> {
  const key = current.token;
  const existing = refreshInFlight.get(key);
  if (existing) return existing;

  const flight = refreshPatientSession(current).finally(() => {
    if (refreshInFlight.get(key) === flight) {
      refreshInFlight.delete(key);
    }
  });
  refreshInFlight.set(key, flight);
  return flight;
}

/**
 * Load session from cookie; refresh once if near expiry.
 * Does not call PrescribeRx when the token is still outside the refresh window.
 */
export async function ensureFreshPatientSession(
  request: Request,
): Promise<FreshSessionResult | null> {
  const current = await readSessionFromRequest(request);
  if (!current) return null;
  if (isSessionExpired(current)) return null;

  if (!sessionNeedsRefresh(current)) {
    return { session: current };
  }

  try {
    return await forceRefreshPatientSession(current);
  } catch (err) {
    // 401 means this bearer is no longer valid. Do not keep it as authenticated.
    if (err instanceof PrescribeRxError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

export function patientLogoutCookieHeader(): string {
  return clearSessionCookieHeader();
}

/** Test-only: clear in-flight refresh mutex. */
export function resetPatientRefreshMutexForTests() {
  refreshInFlight.clear();
}
