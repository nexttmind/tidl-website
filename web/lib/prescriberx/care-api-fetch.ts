/**
 * Browser fetch helpers for /care/* pages.
 * Only treat PrescribeRx proxy 401 with code unauthenticated as "logged out".
 */

export type CareApiResult = {
  unauthorized?: boolean;
  ok: boolean;
  data: unknown;
};

function isUnauthenticated(
  status: number,
  json: Record<string, unknown> | null,
): boolean {
  if (status !== 401) return false;
  if (json?.code === "unauthenticated") return true;
  if (json?.authenticated === false) return true;
  return false;
}

export async function fetchCareApi(path: string): Promise<CareApiResult> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  let json: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await res.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      json = parsed as Record<string, unknown>;
    }
  } catch {
    json = null;
  }
  if (isUnauthenticated(res.status, json)) {
    return { unauthorized: true, ok: false, data: null };
  }
  if (!res.ok) return { ok: false, data: null };
  return { ok: true, data: json?.data ?? null };
}

export async function careApiUnauthorized(res: Response): Promise<boolean> {
  if (res.status !== 401) return false;
  try {
    const parsed: unknown = await res.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return false;
    }
    return isUnauthenticated(401, parsed as Record<string, unknown>);
  } catch {
    return false;
  }
}
