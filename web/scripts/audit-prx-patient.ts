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
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = v;
  }
}

async function main() {
  loadEnvLocal();
  const base = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const h = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };
  const chart = "01a0c176-410a-7308-976d-4aca3c875e5a";
  const email = "ava-harness-1789952147040@example.com";

  const patient = await (
    await fetch(`${base}/patients/${chart}`, { headers: h })
  ).json();
  const lookup = await (
    await fetch(`${base}/patients/lookup?email=${encodeURIComponent(email)}`, {
      headers: h,
    })
  ).json();
  const encounter = await (
    await fetch(`${base}/encounters/01a0c176-4123-7134-a070-9daa65dfa325`, {
      headers: h,
    })
  ).json();

  const issue = await fetch(`${base}/patients/${chart}/issue-token`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ device_name: "audit-check" }),
  });
  const issueJson = (await issue.json()) as {
    data?: { token?: string };
  };
  let portalUser: { status?: number; email?: string; user_type?: number } = {};
  if (issueJson.data?.token) {
    const me = await fetch(`${base}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${issueJson.data.token}`,
      },
    });
    const meJson = (await me.json()) as {
      data?: { user?: { email?: string; user_type?: number } };
    };
    portalUser = {
      status: me.status,
      email: meJson.data?.user?.email,
      user_type: meJson.data?.user?.user_type,
    };
  }

  console.log(
    JSON.stringify(
      {
        patient: {
          id: (patient as { data?: { id?: string } }).data?.id,
          email: (patient as { data?: { email?: string } }).data?.email,
          patient_number: (patient as { data?: { patient_number?: string } })
            .data?.patient_number,
        },
        lookup_canonical: (
          lookup as { data?: { canonical_patient_chart_id?: string } }
        ).data?.canonical_patient_chart_id,
        encounter: {
          id: (encounter as { data?: { id?: string } }).data?.id,
          patient_chart_id: (
            encounter as { data?: { patient_chart_id?: string } }
          ).data?.patient_chart_id,
          status: (encounter as { data?: { status?: string } }).data?.status,
        },
        issue_token_status: issue.status,
        portal_user: portalUser,
      },
      null,
      2,
    ),
  );
}

main();
