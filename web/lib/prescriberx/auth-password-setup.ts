/**
 * Post-register password verification and reset-first fallback.
 * Org token is never used for login checks.
 */

export async function verifyPatientLogin(
  apiBase: string,
  email: string,
  password: string,
): Promise<boolean> {
  const base = apiBase.replace(/\/$/, "");
  if (!email.includes("@") || password.length < 8) return false;

  try {
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        device_name: "tidl-web-verify",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Best-effort forgot-password; returns true when upstream accepted the request. */
export async function triggerPasswordForgot(
  apiBase: string,
  email: string,
): Promise<boolean> {
  const base = apiBase.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/auth/password/forgot`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    return res.ok || (res.status >= 400 && res.status < 500);
  } catch {
    return false;
  }
}
