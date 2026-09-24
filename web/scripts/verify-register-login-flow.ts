/**
 * End-to-end: intake → register → verify login works without forgot-password.
 * Usage: npx tsx scripts/verify-register-login-flow.ts
 */
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let v = t.slice(i + 1);
    if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = v;
  }
}

async function main() {
  loadEnvLocal();
  const base = (process.env.SMOKE_BASE || "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );
  const prxBase = process.env.PRESCRIBERX_API_BASE!.replace(/\/$/, "");
  const orgH = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PRESCRIBERX_API_TOKEN}`,
  };
  const encType =
    process.env.PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID ||
    "019ce396-46a1-73ab-87d6-c40310555401";
  const products = (await (
    await fetch(
      `${prxBase}/telehealth/products?encounter_type_id=${encodeURIComponent(encType)}`,
      { headers: orgH },
    )
  ).json()) as { data?: Array<{ product_id?: string }> };
  const productId = products.data?.[0]?.product_id;
  if (!productId) throw new Error("no product");

  const stamp = randomBytes(4).toString("hex");
  const email = `tidl-login-test-${stamp}@example.com`;
  const password = `TestPass-${stamp}!`;

  const intakeBody = {
    prebuilt: true,
    encounter_type_id: encType,
    is_sandbox: true,
    patient: {
      first_name: "Tidl",
      last_name: "LoginTest",
      email,
      date_of_birth: "1990-06-15",
      phone: "5551234567",
      gender: "male",
      address: {
        street: "123 Main St",
        city: "Miami",
        state: "FL",
        zip: "33101",
        country: "US",
      },
    },
    products: [{ product_id: productId, quantity: 1 }],
  };

  const intakeRes = await fetch(`${base}/api/prescriberx/intake`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(intakeBody),
  });
  const intakeJson = (await intakeRes.json()) as {
    data?: { encounter_id?: string; patient_chart_id?: string };
    message?: string;
  };
  if (!intakeRes.ok || !intakeJson.data?.encounter_id) {
    throw new Error(`intake failed: ${intakeJson.message ?? intakeRes.status}`);
  }

  const registerRes = await fetch(`${base}/api/prescriberx/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: password,
      encounter_id: intakeJson.data.encounter_id,
      patient_chart_id: intakeJson.data.patient_chart_id,
      intake_email: email,
    }),
  });
  const registerJson = (await registerRes.json()) as {
    success?: boolean;
    data?: {
      loginVerified?: boolean;
      needsPasswordSetup?: boolean;
      passwordResetEmailSent?: boolean;
      password?: { status?: string };
    };
    message?: string;
  };

  const loginRes = await fetch(`${base}/api/prescriberx/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginOk = loginRes.ok;

  console.log(
    JSON.stringify(
      {
        email,
        intake: intakeRes.status,
        register: {
          http: registerRes.status,
          loginVerified: registerJson.data?.loginVerified,
          needsPasswordSetup: registerJson.data?.needsPasswordSetup,
          passwordResetEmailSent: registerJson.data?.passwordResetEmailSent,
          passwordStatus: registerJson.data?.password?.status,
        },
        loginAfterRegister: { http: loginRes.status, ok: loginOk },
        passwordBugStillPresent:
          registerJson.success === true && loginOk === false,
      },
      null,
      2,
    ),
  );

  if (registerJson.success && !loginOk) {
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
