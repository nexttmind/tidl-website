/**
 * Probe PrescribeRx first-time password bind variants (no secrets printed).
 */
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
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

  const issueRes = await fetch(`${base}/patients/${patient.id}/issue-token`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ device_name: "pw-probe" }),
  });
  const issueJson = (await issueRes.json()) as { data?: { token?: string } };
  const token = issueJson.data?.token;
  console.log("issue-token", issueRes.status, "token", Boolean(token));
  if (!token) return;

  const pw = `ProbePass-${Date.now().toString(36).slice(-6)}9`;
  const ph = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const variants: { label: string; body: Record<string, unknown> }[] = [
    { label: "empty current_password", body: { current_password: "", password: pw, password_confirmation: pw } },
    { label: "omit current_password", body: { password: pw, password_confirmation: pw } },
    { label: "POST instead of PUT", body: { current_password: "", password: pw, password_confirmation: pw } },
  ];

  for (const v of variants.slice(0, 2)) {
    const r = await fetch(`${base}/me/password`, {
      method: "PUT",
      headers: ph,
      body: JSON.stringify(v.body),
    });
    const text = await r.text();
    let j: Record<string, unknown> | null = null;
    try {
      j = JSON.parse(text) as Record<string, unknown>;
    } catch {
      j = { raw: text.slice(0, 300) };
    }
    const errors = j.errors ?? (j.data as Record<string, unknown> | undefined)?.errors ?? j.message;
    console.log(v.label, "status", r.status, "errors", JSON.stringify(errors));
  }

  const postR = await fetch(`${base}/me/password`, {
    method: "POST",
    headers: ph,
    body: JSON.stringify({ password: pw, password_confirmation: pw }),
  });
  console.log("POST /me/password", postR.status);

  if (patient.email) {
    const login = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: patient.email, password: pw, device_name: "pw-probe" }),
    });
    console.log("login with chosen pw", login.status);
  }

  // Org-side: can sales org set user password?
  const userPaths = [
    `/users`,
    `/patients/${patient.id}`,
  ];
  for (const p of userPaths) {
    const opt = await fetch(`${base}${p}`, { method: "OPTIONS", headers: h });
    console.log("OPTIONS", p, opt.status);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
