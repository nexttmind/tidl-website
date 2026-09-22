/**
 * Extended password bind probes (no secrets printed).
 */
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  for (const line of fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
  }
}

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const org = process.env.PRESCRIBERX_API_TOKEN!;
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${org}`,
    "Content-Type": "application/json",
  };

  const list = (await (await fetch(`${base}/patients?per_page=1`, { headers: h })).json()) as {
    data?: { data?: Array<{ id: string; email?: string }> } | Array<{ id: string; email?: string }>;
  };
  const inner = Array.isArray(list.data) ? list.data : list.data?.data;
  const patient = inner?.[0];
  if (!patient?.id) throw new Error("no patient");

  const pw = `ProbePass-${Date.now().toString(36).slice(-6)}9`;

  const issueWithPw = await fetch(`${base}/patients/${patient.id}/issue-token`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({
      device_name: "pw-probe-ext",
      password: pw,
      password_confirmation: pw,
    }),
  });
  const issueJson = (await issueWithPw.json()) as {
    data?: { token?: string };
    message?: string;
    errors?: unknown;
  };
  console.log(
    "issue-token+password body",
    issueWithPw.status,
    issueJson.message ?? "ok",
    "token",
    Boolean(issueJson.data?.token),
    "errors",
    JSON.stringify(issueJson.errors ?? null),
  );

  const issueRes = await fetch(`${base}/patients/${patient.id}/issue-token`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ device_name: "pw-probe-ext2" }),
  });
  const issue2 = (await issueRes.json()) as { data?: { token?: string } };
  const token = issue2.data?.token;
  if (!token) return;

  const ph = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const me = (await (await fetch(`${base}/auth/me`, { headers: ph })).json()) as {
    data?: Record<string, unknown>;
  };
  const d = me.data ?? {};
  const hints = Object.fromEntries(
    Object.entries(d).filter(([k]) =>
      /password|must|set|credential|auth/i.test(k),
    ),
  );
  console.log("auth/me password-related fields", JSON.stringify(hints));

  for (const [label, body] of [
    ["null current_password", { current_password: null, password: pw, password_confirmation: pw }],
    ["missing current_password key", { password: pw, password_confirmation: pw }],
  ] as const) {
    const r = await fetch(`${base}/me/password`, {
      method: "PUT",
      headers: ph,
      body: JSON.stringify(body),
    });
    const j = (await r.json()) as { errors?: unknown; message?: string };
    console.log(label, r.status, JSON.stringify(j.errors ?? j.message));
  }

  if (patient.email) {
    const loginAfterIssuePw = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email: patient.email,
        password: pw,
        device_name: "pw-probe-ext",
      }),
    });
    console.log("login after issue-token+password body", loginAfterIssuePw.status);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
