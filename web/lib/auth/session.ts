/**
 * Sealed patient portal session (AES-GCM via Web Crypto).
 * Works in Node route handlers and Edge middleware.
 * Raw PrescribeRx bearer never goes to browser JS — only inside httpOnly cookie.
 */

export const SESSION_COOKIE_NAME = "tidl_prx_session";

export type PatientSessionPayload = {
  token: string;
  expiresAt: string;
  patientChartId?: string;
  email?: string;
  abilities?: string[];
};

const IV_BYTES = 12;
const VERSION = "v1";

function getSessionSecret(): string | null {
  const secret = process.env.TIDL_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const padded = b64 + pad;
  if (typeof atob === "function") {
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

function isSessionPayload(value: unknown): value is PatientSessionPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.token !== "string" || v.token.length < 8) return false;
  if (typeof v.expiresAt !== "string" || !v.expiresAt) return false;
  if (v.patientChartId !== undefined && typeof v.patientChartId !== "string") {
    return false;
  }
  if (v.email !== undefined && typeof v.email !== "string") return false;
  if (v.abilities !== undefined) {
    if (!Array.isArray(v.abilities)) return false;
    if (!v.abilities.every((a) => typeof a === "string")) return false;
  }
  return true;
}

/** Encrypt + integrity-protect session JSON. Returns null if secret missing. */
export async function sealSession(
  payload: PatientSessionPayload,
): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  if (!isSessionPayload(payload)) return null;

  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  const cipher = new Uint8Array(cipherBuf);
  return `${VERSION}.${bytesToBase64Url(iv)}.${bytesToBase64Url(cipher)}`;
}

/** Decrypt session. Invalid/tampered/malformed → null (treat as unauthenticated). */
export async function unsealSession(
  sealed: string | undefined | null,
): Promise<PatientSessionPayload | null> {
  if (!sealed || typeof sealed !== "string") return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = sealed.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;
  const [, ivB64, cipherB64] = parts;
  if (!ivB64 || !cipherB64) return null;

  try {
    const key = await deriveKey(secret);
    const ivRaw = base64UrlToBytes(ivB64);
    const cipherRaw = base64UrlToBytes(cipherB64);
    const iv = new Uint8Array(ivRaw);
    const cipher = new Uint8Array(cipherRaw);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher,
    );
    const json = JSON.parse(new TextDecoder().decode(plainBuf)) as unknown;
    if (!isSessionPayload(json)) return null;
    return json;
  } catch {
    return null;
  }
}

export function isSessionExpired(
  payload: PatientSessionPayload,
  nowMs = Date.now(),
): boolean {
  const expires = Date.parse(payload.expiresAt);
  if (Number.isNaN(expires)) return true;
  return expires <= nowMs;
}

/** True when token should be refreshed (within 5 minutes of expiry). */
export function sessionNeedsRefresh(
  payload: PatientSessionPayload,
  nowMs = Date.now(),
  skewMs = 5 * 60 * 1000,
): boolean {
  const expires = Date.parse(payload.expiresAt);
  if (Number.isNaN(expires)) return true;
  return expires - nowMs <= skewMs;
}

export function buildSessionCookieHeader(
  sealed: string,
  expiresAt: string,
): string {
  const maxAgeSec = Math.max(
    60,
    Math.floor((Date.parse(expiresAt) - Date.now()) / 1000) || 30 * 60,
  );
  const parts = [
    `${SESSION_COOKIE_NAME}=${sealed}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function clearSessionCookieHeader(): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/** Read cookie value from a Cookie header string. */
export function readCookieValue(
  cookieHeader: string | null | undefined,
  name: string = SESSION_COOKIE_NAME,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

export async function readSessionFromRequest(
  request: Request,
): Promise<PatientSessionPayload | null> {
  const raw = readCookieValue(request.headers.get("cookie"));
  const payload = await unsealSession(raw);
  if (!payload) return null;
  if (isSessionExpired(payload)) return null;
  return payload;
}

/** Export for tests — validates payload shape without crypto. */
export function assertValidSessionPayload(
  value: unknown,
): value is PatientSessionPayload {
  return isSessionPayload(value);
}
