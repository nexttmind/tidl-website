/**
 * After register password bind fails, later login needs reset-first copy.
 * Session-only. Never auto-sends forgot (rate limits).
 */

export const PASSWORD_NEEDS_RESET_KEY = "tidl_password_needs_reset";

export type PasswordNeedsResetHint = {
  email: string;
};

export function serializePasswordNeedsReset(email: string): string {
  return JSON.stringify({
    email: email.trim().toLowerCase(),
  } satisfies PasswordNeedsResetHint);
}

export function parsePasswordNeedsReset(
  raw: string | null | undefined,
): PasswordNeedsResetHint | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: unknown };
    const email =
      typeof parsed.email === "string" ? parsed.email.trim().toLowerCase() : "";
    if (!email.includes("@")) return null;
    return { email };
  } catch {
    return null;
  }
}

export function persistPasswordNeedsReset(email: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      PASSWORD_NEEDS_RESET_KEY,
      serializePasswordNeedsReset(email),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function readPasswordNeedsReset(): PasswordNeedsResetHint | null {
  if (typeof window === "undefined") return null;
  try {
    return parsePasswordNeedsReset(
      sessionStorage.getItem(PASSWORD_NEEDS_RESET_KEY),
    );
  } catch {
    return null;
  }
}

export function clearPasswordNeedsReset(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PASSWORD_NEEDS_RESET_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}
