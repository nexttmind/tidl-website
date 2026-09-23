/**
 * Phase L demo-lock smoke against a running dev server.
 *
 *   npm run dev
 *   npm run smoke:phase-l
 */
const smokeBase = (process.env.SMOKE_BASE || "http://localhost:3000").replace(
  /\/$/,
  "",
);

const ENCOUNTER = "01a0cd2f-3230-7227-9dba-5cf64cc5c28d";
const EMAIL = "tidl.phasej.home@example.com";

function extractCookie(setCookie: string | null): string {
  if (!setCookie) throw new Error("register did not set session cookie");
  const part = setCookie.split(";")[0]?.trim();
  if (!part) throw new Error("invalid Set-Cookie");
  return part;
}

async function fetchHtml(path: string, cookie: string) {
  const res = await fetch(`${smokeBase}${path}`, {
    headers: { Accept: "text/html", Cookie: cookie },
    redirect: "manual",
  });
  const text = await res.text();
  return { res, text };
}

async function main() {
  const reg = await fetch(`${smokeBase}/api/prescriberx/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: EMAIL,
      password: "SandboxPass123!",
      password_confirmation: "SandboxPass123!",
      encounter_id: ENCOUNTER,
    }),
  });
  if (reg.status !== 201 && reg.status !== 403) {
    throw new Error(`register unexpected status ${reg.status}`);
  }
  const cookie = extractCookie(reg.headers.get("set-cookie"));
  if (reg.status === 403) {
    throw new Error("register ownership failed; cannot smoke without session");
  }

  const demoHome = await fetchHtml(
    `/care/home?demo=1&entry=weight-loss`,
    cookie,
  );
  if (demoHome.res.status !== 200) {
    throw new Error(`demo home status ${demoHome.res.status}`);
  }
  if (!demoHome.text.includes("Convert to monthly")) {
    throw new Error("demo home missing fixture subscription controls");
  }

  const liveHome = await fetchHtml(`/care/home?entry=weight-loss`, cookie);
  if (liveHome.res.status !== 200) {
    throw new Error(`live home status ${liveHome.res.status}`);
  }
  if (liveHome.text.includes("Convert to monthly")) {
    throw new Error("live home must not show demo fixture controls");
  }

  const demoWaiting = await fetchHtml(
    `/care/waiting?demo=1&entry=weight-loss&encounter=${ENCOUNTER}`,
    cookie,
  );
  if (demoWaiting.res.status !== 200) {
    throw new Error(`demo waiting status ${demoWaiting.res.status}`);
  }
  if (!demoWaiting.text.includes("Continue to protocol")) {
    throw new Error("demo waiting missing Continue CTA");
  }

  const liveWaiting = await fetchHtml(
    `/care/waiting?entry=weight-loss&encounter=${ENCOUNTER}`,
    cookie,
  );
  if (liveWaiting.res.status !== 200) {
    throw new Error(`live waiting status ${liveWaiting.res.status}`);
  }
  if (liveWaiting.text.includes("Continue to protocol")) {
    throw new Error("live waiting must not show demo Continue");
  }

  const liveVisit = await fetchHtml(
    `/care/visit?entry=weight-loss&encounter=${ENCOUNTER}`,
    cookie,
  );
  if (liveVisit.res.status === 200) {
    if (liveVisit.text.includes("Continue to protocol")) {
      throw new Error("live visit must not show demo bypass");
    }
    if (!liveVisit.text.includes("not open on TIDL yet")) {
      throw new Error("live visit missing honest scheduling copy");
    }
  }

  const demoProtocol = await fetchHtml(
    `/care/protocol?demo=1&entry=executives&encounter=${ENCOUNTER}`,
    cookie,
  );
  if (demoProtocol.res.status === 200) {
    if (!demoProtocol.text.includes("4242 4242 4242 4242")) {
      throw new Error("demo protocol missing walkthrough payment");
    }
  }

  const liveProtocol = await fetchHtml(
    `/care/protocol?entry=executives&encounter=${ENCOUNTER}`,
    cookie,
  );
  if (liveProtocol.res.status === 200) {
    if (liveProtocol.text.includes("4242 4242 4242 4242")) {
      throw new Error("live protocol must not show fake payment fields");
    }
    if (!liveProtocol.text.includes("Payment is not connected")) {
      throw new Error("live protocol missing honest payment copy");
    }
  }

  console.log("smoke-phase-l OK", { base: smokeBase });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export {};
