/**
 * Parse PrescribeRx auth / issue-token envelopes.
 * Login/Refresh OpenAPI document `data.token`.
 * issue-token documents only SuccessEnvelope — same `data.token` shape is
 * assumed and verified in smoke; unknown shapes throw a controlled error.
 */

export class TokenParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenParseError";
  }
}

export type ParsedAuthToken = {
  token: string;
  expiresAt: string;
  abilities: string[];
  userEmail?: string;
  patientChartId?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickTokenString(data: Record<string, unknown>): string | null {
  const direct = data.token;
  if (typeof direct === "string" && direct.length > 0) return direct;

  // Documented variants we will accept only if smoke proves them; keep narrow.
  const plain = data.plain_text_token;
  if (typeof plain === "string" && plain.length > 0) return plain;

  const access = data.access_token;
  if (typeof access === "string" && access.length > 0) return access;

  return null;
}

function pickExpiresAt(data: Record<string, unknown>): string {
  if (typeof data.expires_at === "string" && data.expires_at) {
    return data.expires_at;
  }
  // issue-token is documented as ~30 min; if expiry omitted, set conservative TTL
  return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}

function pickAbilities(data: Record<string, unknown>): string[] {
  if (!Array.isArray(data.abilities)) return [];
  return data.abilities.filter((a): a is string => typeof a === "string");
}

/**
 * Extract bearer + metadata from Login / Refresh / issue-token style envelopes.
 * Throws TokenParseError if token string is missing (do not invent).
 */
export function extractAuthToken(envelope: unknown): ParsedAuthToken {
  const root = asRecord(envelope);
  if (!root) {
    throw new TokenParseError("Auth response was not an object");
  }

  const data = asRecord(root.data) ?? root;
  const token = pickTokenString(data);
  if (!token) {
    throw new TokenParseError(
      "Auth response missing data.token (unexpected PrescribeRx envelope)",
    );
  }

  const user = asRecord(data.user);
  const email =
    user && typeof user.email === "string" ? user.email : undefined;
  const patientChartId =
    user && typeof user.patient_chart_id === "string"
      ? user.patient_chart_id
      : typeof data.patient_chart_id === "string"
        ? data.patient_chart_id
        : undefined;

  return {
    token,
    expiresAt: pickExpiresAt(data),
    abilities: pickAbilities(data),
    userEmail: email,
    patientChartId,
  };
}
