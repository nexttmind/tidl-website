# TIDL website — source brief for resume bullets

Use this file as the only source when writing Mohammad Alachkar's resume bullets for this project. Do not invent metrics, user counts, revenue, or uptime. Do not assume a recruiter knows the clinical vendor or telehealth jargon. Name the company **TIDL**. Describe the vendor as "the external clinical system" unless the reader is an engineer who already knows the stack.

**Repo:** `C:\Users\User\OneDrive\Desktop\website-main\website-main`  
**App:** `web/` (Next.js, deployed with Vercel root directory `web`)  
**Canonical product docs:** `docs/specs/clinical-flow.md`, `docs/handoff-patient-portal.md`, `docs/decisions/`

---

## Instructions for the agent that writes the bullets

Write **three** bullets. A recruiter should understand each one without a glossary.

Rules:

- Lead with TIDL and the patient product, not with a library name.
- Use software-engineering words a recruiter already knows: website, API, server, login, cookie, payment, physician approval, video visit.
- Do not put vendor product names, protocol names, or crypto algorithm names in the bullet (PrescribeRx, Sanctum, AES-GCM, HMAC, Accept.js, iframe). Those details live here so the candidate can defend them in an interview.
- One bullet = one idea. Do not repeat "secure" or "robust."
- Say what was built and why it matters to a patient or to the business.
- Do not claim the marketing site and the clinical portal are live in production for the public unless the candidate confirms the domain cutover. The code and a full sandbox walkthrough exist. Production is an environment switch (base URL, token, sandbox flag).
- Do not claim a latency, conversion, or revenue number. None is measured in this repo.

Suggested shape:

1. What the product is and the path a patient walks.
2. Custom screens on TIDL's site, talking to the clinical system through an API, with credentials kept on the server.
3. The rule that matters: no payment until a physician approves, and a patient can only open their own video visit.

---

## What this project is

TIDL is a US telehealth brand. Patients shop a health goal on the website (weight loss, men's health, women's health, skin and hair, recovery, pain relief, and similar programs). They do not buy a named drug off a product page. A physician reviews their answers. Only after that review can they pay and receive a prescribed treatment.

This repository is the relaunch of that website and the patient portal. The portal lives on TIDL's own domain (`tidl.com` is the decided host), not on the clinical vendor's website. The clinical vendor keeps the medical record, the prescription, and the card vault. TIDL owns every screen the patient sees.

Two catalogs stay separate:

- **Public site:** goal-framed treatments, programs, and stacks. No molecule or drug names.
- **Logged-in portal, after review:** the approved plan, orders, prescriptions, and tracking.

---

## What a patient does (the workflow that exists in code)

```
Public page (treatment, program, or stack)
  -> Medical questionnaire (/care/intake)
  -> Create account or log in (/care/account)
  -> Wait for the physician (/care/waiting)
  -> Approved plan (/care/protocol) OR video visit first (/care/visit)
  -> Checkout (/care/checkout)
  -> Confirmation (/care/confirmation)
  -> Account home (/care/home): orders, prescriptions, tracking
```

Hard product rule, enforced on the server: while the case is pending, on hold, missing, or cancelled, the patient cannot reach payment. Hiding the button is not enough. The protocol, visit, and confirmation pages redirect them back.

Entry selection happens on the public page so the questionnaire matches that health goal. Payment happens after the physician approves, for the plan that was approved, not for a cart chosen before the review.

---

## What was built

### Public website

27 pages, including:

- Home, treatments (list + per-goal pages, including weight loss), programs, stacks, pain relief, categories, peptide guide, FAQs, careers.
- Legal: HIPAA authorization, notice of privacy practices, telehealth consent, electronic communications.

Marketing content is goal-framed. Live catalog prices can overlay the public product page from the clinical system. A help assistant ("Ask TIDL") answers from a written catalog, or from a model when that mode is configured. It does not write answers into the medical questionnaire unless the patient accepts a suggestion.

Email capture stores a lead in Postgres (Neon + Drizzle) and can send a welcome email (Resend). Phone and SMS consent can be added on that lead. Medical records and passwords are **not** stored in this database.

### Patient portal

Routes under `/care/*`, as in the workflow above.

- Questionnaire is multi-step and built from the clinical system's question schema for that visit type. The browser posts raw answers to TIDL. TIDL's server fetches the schema again, builds the official payload, and submits it. The patient does not send a hand-built medical chart.
- ID photos are compressed. The intake body limit was raised because uploads were hitting the platform's default cap. File fields are checked for type and size (6 MB encoded cap).
- After submit, account creation or login is bound to the chart that intake just created. Ownership is checked (patient lookup + encounter fetch) before a session is issued. A missing chart match fails closed.
- Waiting screen polls case status with backoff (6s, 12s, 24s, then 30s), pauses when the tab is hidden, and stops after 30 minutes with honest copy. It does not fake progress.
- Account home shows live encounters, orders, and prescriptions. Tracking uses the order id. Reorder starts a new questionnaire. It does not jump straight to payment.
- Video-visit API checks that the logged-in chart owns that encounter before returning the room.

### Connection to the clinical system

32 API routes under `/api/prescriberx/*` plus `POST /api/webhooks/prescriberx`. The browser never calls the clinical vendor directly.

Covered operations: health, catalog, encounter types, schema, products, intake submit, encounter status, scheduling slots, schedule, video room, patient profile, dashboard, encounters, orders, prescriptions, tracking, chart export download, checkout config, and protocol payment.

Auth routes: register, login, logout, refresh, session, forgot password.

Locked decisions (`docs/decisions/`):

| Decision | What it means in plain language |
|---|---|
| 0001 | TIDL builds its own screens. No embedded vendor widget. |
| 0003 | TIDL is the merchant of record. Card capture still depends on payment keys being set. |
| 0004 | The patient portal stays on TIDL's domain. |
| 0005 | Login tokens come from the clinical system. TIDL only seals them in a cookie. TIDL does not store passwords in its own database. |

### Login and secrets

- Organization API token: server only. Used for catalog, intake, and ownership checks.
- Patient token: also server only, inside an HttpOnly, SameSite=Lax cookie named `tidl_prx_session`, encrypted with AES-GCM from `TIDL_SESSION_SECRET` (minimum 32 characters). Works in Node route handlers and edge middleware.
- A Next.js proxy (`web/proxy.ts`) protects waiting, protocol, visit, confirmation, and home. There is no separate `middleware.ts` file. Do not add one.
- Unknown-email login is returned as a generic failure, not as "this email does not exist."
- Demo fixtures (`?demo=1`) work only when sandbox mode is on and the app is not in production. Production never shows fake checkout or a fake video visit.

### Payment

`POST /api/prescriberx/protocol/payment`, gated like the protocol page.

- If card-processor public keys are configured, the browser collects a payment nonce and the server vaults the card on the clinical system's merchant account, then charges the order tied to that encounter. A repeat charge detects an already-paid order.
- If those keys are absent, sandbox mode records an external payment on the encounter and does not charge a real card.
- Demo checkout never writes a payment.
- Payment posts are rate-limited (20/min per IP, with `Retry-After`).

### Webhooks

`POST /api/webhooks/prescriberx` rejects the call when the signing secret is missing (503) or the HMAC-SHA256 signature over the raw body is wrong (401). A repeated webhook id is acknowledged and not applied twice (24-hour memory). The stored projection is encounter id + status only.

The waiting screen and the payment gate do **not** trust that projection. They still read live status from the clinical system. The webhook receiver is built. Subscribing it in production needs a public HTTPS URL. The vendor rejects localhost callbacks.

### Abuse limits and environment safety

- Login and register: 10 requests/min/IP.
- Intake submit: 5/min/IP.
- Status polling: requires the sealed session, 20/min/IP backstop.
- Pointing a demo host at production mode returns 503 on health, register, and intake (`sandbox_host_mismatch`).
- Health checks never return the API token. In production they also omit the base URL and default encounter id.

### Tests and checks

`npm test` in `web/` runs Node tests for session refresh, the payment gate, account-home mapping, webhooks, environment guards, password-reset hints, sandbox demo, sandbox payment, rate limits, intake files, intake address, waiting poll, intake payload, scheduling, encounter enrichment, patient snapshot, and checkout mode selection.

Smoke scripts exist for auth, webhooks, environment guards, password UX, demo lock, rate limits, and waiting behavior (`npm run smoke:phase-*`). A handoff dated 2026-09-25 recorded unit tests 98/98 and those smokes passing against the sandbox. Re-run before quoting a count on a resume. Do not put "98 tests" on the resume unless that re-run is current.

---

## Stack (for the skills line, not for stuffing a bullet)

- Next.js 16, React 19, TypeScript, App Router.
- Server routes proxy the clinical HTTP API.
- Neon Postgres and Drizzle for marketing leads only.
- Resend for the welcome email.
- Vercel for the site. Clinical routes need env vars; the marketing site can deploy without them.

---

## What not to claim

- Do not say the candidate invented TIDL, led the company, or was the physician network.
- Do not quote revenue, patient volume, conversion, latency, or uptime. This repo does not measure them.
- Do not say passwords or medical records are stored in TIDL's database. They are not.
- Do not say webhooks are what the waiting screen trusts. Live status is.
- Do not say every checkout charges a real card. Real charge runs only when the card-processor keys are set. Otherwise it records a sandbox payment.
- Do not say production `tidl.com` cutover is finished unless the candidate confirms it. The decision and the code path exist. The README still treats the custom domain as a later step.
- Do not describe Ask TIDL as a clinical decision-maker. It is an assistant. It does not submit the questionnaire by itself.

---

## Facts ranked for a recruiter

Use these. Drop everything else if space is tight.

1. **Company and product.** A US telehealth brand. The candidate built the public website and the patient portal on the brand's own domain: shop a health goal, answer a medical questionnaire, create an account, wait for a physician, do a video visit when required, pay, then see orders and prescriptions.
2. **Ownership of the experience.** Screens are TIDL's. The clinical system is called through an API. Credentials never reach the browser. The login is an encrypted cookie.
3. **The rule that shows judgment.** Payment and the video room are blocked on the server until the case is approved, and a patient can open only their own visit.

Interview backup if they ask "how": schema-driven questionnaire, server rebuilds the payload, ownership check before session and before video room, HMAC-signed webhooks with replay skip, rate limits, sandbox versus production host guard. Do not lead the bullet with those words.
