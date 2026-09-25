# Handoff — patient portal + clinical care path (2026-09-22, updated 2026-09-25)

**Audience:** next eng team continuing from this workspace  
**Repo root:** `website-main/` (Next app in `web/`)  
**Status:** PrescribeRx sandbox wired; portal Phases **A–F, J, H, L–N** complete; `/care/checkout` with sandbox record-only payment; full sandbox walkthrough verified 2026-09-25  
**Smoke:** catalog FAILS=0; Phase D FAILS=0 (2026-09-22, re-run 2026-09-25); L/M/N smokes pass (2026-09-23; L re-run 2026-09-25); unit tests 98/98

Start here. Specs and decisions below are canonical; this file is the
narrative of what shipped, what broke in manual test, and what to build next.

---

## 1. Product intent (locked)

| Decision | Meaning |
|---|---|
| [0001](decisions/0001-headless-api-no-iframe.md) | Headless PrescribeRx API; no iframe |
| [0003](decisions/0003-merchant-of-record.md) | TIDL MoR for payment (capture still deferred) |
| [0004](decisions/0004-portal-on-tidl-com.md) | Patient portal lives on **tidl.com**, not prescribe-rx.com |
| [0005](decisions/0005-patient-auth-on-tidl.md) | Auth = PrescribeRx patient Sanctum tokens; TIDL seals them in `tidl_prx_session` |

PrescribeRx’s hosted patient portal (e.g. `demo.prescribe-rx.com/login`) is
real today for sandbox emails. The **TIDL** portal is `/care/*` on this site.
Do not hand patients off to PrescribeRx mid-journey in production.

Payment timing: collect on **post-review protocol** page (clinical-flow), not
before intake. Amend decision 0002 when ops confirms.

---

## 2. Patient journey (implemented)

```
Merchandising (/treatments|programs|stacks)
  → /care/intake?entry=…          schema from PRX; submit unified intake
  → /care/account                 create (register) or log in
  → /care/waiting                 poll encounter status
  → /care/protocol                ONLY if prescribed-like status
       or /care/visit             if entry visitGateDefault
  → /care/checkout                sandbox: record-only payment into PRX
                                  (PRX Accept.js collector if Authorize.net keys set)
  → /care/confirmation
  → /care/home                    live AccountHome (or empty/pending)
```

**Hard rule (Phase C):** while status is pending / On Hold / missing /
cancelled, the patient must **not** reach payment. Hiding the button is not
enough — `/care/protocol` and `/care/confirmation` fail closed on the server.

---

## 3. What we shipped (by phase)

### Sandbox wiring (pre-auth)

Documented in [sandbox-wired.md](sandbox-wired.md):

- Org token → `/api/prescriberx/*` (health, catalog, encounter-types, schema,
  products, intake, encounter status)
- Entry map: `web/content/clinical/entry-map.ts` (sandbox UUIDs)
- Waiting poll with backoff (6s → 30s cap); PDP live price overlay (`CategoryPdpLive`)
- Intake: silent product attach; address/shipping normalization; ID photo
  compression; `experimental.proxyClientMaxBodySize: "50mb"` in
  `web/next.config.ts` (intake was hitting Next’s 10MB limit)

### Phase A — Auth foundation

- Cookie `tidl_prx_session` (HttpOnly, SameSite=Lax, AES-GCM via
  `TIDL_SESSION_SECRET`) — `web/lib/auth/session.ts`
- Patient client (never org fallback) — `web/lib/prescriberx/patient-client.ts`
- Ownership — `web/lib/prescriberx/auth-ownership.ts`
  (`/patients/lookup` + bare `GET /encounters/{id}`; do **not** use
  `include=patient` — sandbox 500)
- Routes: `web/app/api/prescriberx/auth/{register,login,logout,refresh,session,forgot}/`
- Session gate: `web/proxy.ts` (Next 16 — **do not add `middleware.ts`**)
  protects waiting / protocol / visit / confirmation / home

### Phase B — Account UI

- Intake handoff stores `patientChartId`, `encounterNumber`, `userId` (+ email
  names) in **sessionStorage only** — `web/lib/prescriberx/intake-flow.ts`
  (Phase N removes legacy `localStorage` key on read)
- `AccountWizard` calls register / login / forgot; honest
  `password.status`; clears passwords after success but keeps encounter
  handoff for recovery
- Register can resolve chart from encounter alone if handoff chart is missing
- Header Sign up (`/care/account?mode=create`) has **no** encounter — create
  is blocked until intake (or URL with `encounter=`)

### Phase C — Live portal + payment gate

- Waiting: **no** default Continue to protocol; auto-advance only on
  prescribed / visit; optional `?demo=1` + `PRESCRIBERX_SANDBOX` for designers
- Server gate: `web/lib/prescriberx/protocol-gate.ts` on protocol, confirmation,
  visit pages
- Patient proxies: `web/app/api/prescriberx/patient/{dashboard,orders,encounters,prescriptions}/`
  and `orders/[order]/tracking`
- Patient snapshot: `GET /api/prescriberx/patient/snapshot` pulls every
  patient-token GET (`/me/patient/*`, conversations + messages, prefs, trends,
  `/me`, `/me/settings`). Writes (chat send, export request, provide-information,
  chart edits) stay off tidl.com until a dedicated screen exists.
- Mapper: `web/lib/prescriberx/map-account-home.ts` → AccountHome chrome;
  empty / pending states; never invent molecule names; `?demo=1` = fixtures
- Signed-in header: email + Log out in the SiteHeader auth slot (no second overlay chip)
- Reorder on AccountHome starts a **new intake**, not ungated protocol

### Phase D — Harden + smoke

- Register preflight: org `/auth/me` must have `patient:issue-token` or `*`
  else 503 `issue_token_unavailable`
- Smoke: `npx tsx scripts/smoke-phase-d.ts` → FAILS=0
- Checklist: [patient-auth-smoke.md](patient-auth-smoke.md)
- Specs updated: patient-auth, clinical-flow, sandbox-wired, open-questions,
  decision 0005

### Phase J — Account home (live, honest)

- Mapper treats patient `encounters` / `orders` / `prescriptions` as a bare
  array or a wrapped object. Live On Hold encounters show waiting CTA.
- Prescriptions are their own list; attach to an order only when `order_id`
  is that order’s UUID. Tracking fetch uses order UUID only.
- Hide Convert / Skip / Pause unless `?demo=1`. No invented pharmacy, survey,
  care-team names, or carrier copy.

### Phase H — Webhook receiver (poll stays source of truth)

- `POST /api/webhooks/prescriberx` is fail-closed: missing
  `PRESCRIBERX_WEBHOOK_SECRET` → 503; bad HMAC → 401.
- Verify `X-PrescribeRx-Signature` as HMAC-SHA256 of the **raw** body.
  Idempotency: same `webhook_id` / `X-Webhook-ID` → 200, skip re-project.
- Projector stores encounter id + status slug only. **Waiting and protocol
  gate still poll live PRX.** Do not cache pending as source of truth.
- Local proof: `PRESCRIBERX_WEBHOOK_SECRET=dev-secret npm run smoke:webhook`
  (dev server up). PrescribeRx rejects localhost callback URLs — subscribe
  only after a public URL exists. Do **not** `POST /api/v1/webhooks` from
  the app.

How to subscribe later (portal or API, public HTTPS only):

```bash
# After a public URL exists (ngrok or deployed host). Copy signing_secret once.
curl -X POST "https://demo.prescribe-rx.com/api/v1/webhooks" \
  -H "Authorization: Bearer $PRESCRIBERX_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "url": "https://YOUR_PUBLIC_HOST/api/webhooks/prescriberx",
    "events": ["encounter.*"],
    "is_active": true
  }'
```

Store `signing_secret` as `PRESCRIBERX_WEBHOOK_SECRET`. Starter events:
`encounter.created`, `encounter.status_changed`, `encounter.prescribed`,
`encounter.completed`, `encounter.cancelled`. Wildcards like `encounter.*`
are accepted.

### Phase E — Env guards (no UUID swap)

- Demo host + `PRESCRIBERX_SANDBOX=false` → **503** on health, register, intake
  (`sandbox_host_mismatch`). Production host + sandbox still true → health
  **200** with `warnings` and `healthy: false` (dry-run allowed).
- Health adds `webhookSecretConfigured`, `sessionSecretConfigured`,
  `issueToken`, `sandboxHostConsistent`. Never returns the bearer token.
- `build/tools/refresh-prescriberx-sandbox.sh` merges token/base/sandbox only;
  refuses when `SANDBOX=false`; preserves `TIDL_SESSION_SECRET` and webhook secret.
- Cutover checklist lives in root `.env.example`. Entry-map UUIDs unchanged.

Smoke: `npm run smoke:phase-e` (dev server up).

### Phase F — Password UX (honest path)

- Login upstream **404** (unknown email) maps to TIDL **401** + generic auth
  copy. `mapAuthError` still forwards 404 on other routes (orders/tracking).
- Register `password.status === "failed"` still **201** with a session.
  Keep **Continue to physician review**. Persist `tidl_password_needs_reset`
  + email in sessionStorage. Show reset as the way later login works.
  Do **not** auto-send forgot.
- Login failure with that flag: reset-first copy; email stays filled.
  Forgot success keeps email and stays on login.
- Never label password `bound` unless the bind API said so.
  No invented set-password API.

Smoke: `npm run smoke:phase-f` (dev server up). Unknown-email login → 401.

### Phase L — Demo lock

- `?demo=1` is honored only when `PRESCRIBERX_SANDBOX !== "false"` **and**
  `NODE_ENV !== "production"`. Helper: `web/lib/prescriberx/sandbox-demo.ts`.
- Live `/care/home`, `/care/protocol`, and `/care/visit` never show fixture
  subscription controls, fake 4242/USDT checkout, or demo visit bypass.
- Protocol/visit/confirmation gates still fail closed; demo skips gates only in
  sandbox dev/test.

Smoke: `npm run smoke:phase-l` (dev server up, session via register).

### Phase M — Shared abuse limits

- One in-memory limiter (`web/lib/prescriberx/auth-rate-limit.ts`), per Node
  process. Auth stays 10/min/IP unchanged.
- Intake `POST`: 5/min/IP with `429` + `Retry-After`. Server validates file
  slug/base64 and 6MB encoded cap (`web/lib/prescriberx/intake-files.ts`).
- Status `GET`: requires sealed `tidl_prx_session` (`readSessionFromRequest`,
  no refresh on poll); 20/min/IP backstop; still live-fetches PRX (never webhook
  projector).
- Health omits `baseUrl` and `defaultEncounterTypeId` when `NODE_ENV=production`.

Smoke: `npm run smoke:phase-m`.

### Phase N — Waiting backoff + headers

- Waiting poll backoff 6s → 12s → 24s → 30s cap; pauses when tab hidden;
  30-minute wall-clock stop with honest refresh copy; no overlapping polls; 401
  stops poll and redirects to login with `next` preserved.
- Intake handoff writes sessionStorage only; legacy `localStorage` key removed on
  read.
- Production responses add security headers via `web/next.config.ts` (no CSP).

Smoke: `npm run smoke:phase-n` (dev); production headers on `next start -p 3001`.

### Checkout merge + build health (2026-09-24 – 2026-09-25)

Teammate commit `5669b5e` ("Add care checkout with PrescribeRx sandbox record
and collector payment flow") added:

- `/care/checkout` (`web/app/care/checkout/page.tsx`,
  `web/components/care/ProtocolCheckout.tsx`), gated like protocol.
- `POST /api/prescriberx/protocol/payment`: sandbox mode records an external
  transaction on the encounter (`record-external-payment.ts`); collector mode
  vaults Accept.js opaque data and charges through PRX
  (`collect-prx-protocol-payment.ts`, `vault-prx-payment-method.ts`).
- `GET /api/prescriberx/checkout/config` for Accept.js keys.
- Register password verify + auto forgot-password; intake address normalization.

Mode selection (`web/lib/prescriberx/prx-collector-config.ts`): collector only
when `PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID` and `…_CLIENT_KEY` are set;
otherwise sandbox record-only. `?demo=1` checkout is still fixture-only and
never writes to PRX.

Follow-up fixes after the merge:

- `authJson(…, 200)` on checkout config and payment success (typecheck).
- Payment route rate limit was a no-op: it tested `!consumeRateLimit(...)` but
  that returns `{ allowed, retryAfterSec }`. Now
  `web/lib/prescriberx/protocol-payment-rate-limit.ts` (`protocol-pay:{ip}`,
  20/min, `429` + `Retry-After`) with a unit test.
- `sandbox-payment.test.ts` moved from vitest to `node:test`;
  `scan-sandbox-payment.ts` report typing.

Verified: `npm test` 98/98, typecheck, build.

### PrescribeRx admin audit (2026-09-25)

Full admin menu ↔ TIDL API matrix: [`prescriberx-admin-wiring.md`](prescriberx-admin-wiring.md).

Logged in as platform admin on `demo.prescribe-rx.com`:

| Area | Finding |
|---|---|
| Org | **TIDL Sandbox**, `ORG-7144184834`, id `019f3d35-afc4-72f8-b055-6c86c27ac1b3`, Sales Group, Active, owner `tidl@prescribe-rx.com` |
| Catalog / types | 131 products priced on the org; GLP-1 Screening11, Peptide Assessment, Universal Encounter, etc. enabled |
| Encounters | ~499 on the org, mostly On Hold / Pending (test intakes) |
| Clients / orders | 0 / 0 (API intakes land as encounters) |
| Merchant accounts | **None active** for the org; global merchant search for TIDL empty |
| Webhooks | **No subscription** for TIDL yet (other sandboxes have one). Org **Webhook Integration** setting is **Enabled**; admin Create Subscription lists **TIDL Sandbox** under Sales Organization |

Admin can move a case: encounter → **Manage** → **Status** tab → choose
**Prescribed** → **Apply Transition**. PRX status API then returns
`prescribed` and TIDL waiting advances by polling. No webhook required.

New intakes can arrive with **no sales org** assigned in admin. Setting
`PRESCRIBERX_SALES_ORG_ID` (sent as `sales_org_id` on intake), **clearing**
`PRESCRIBERX_CLIENT_ID`, and restarting dev should attach them; otherwise pick
TIDL Sandbox on Manage and save. Stale demo `client_id` on intake was a common
cause of “missing” encounters under the org filter (fixed in intake builder).

### Product-manager walkthrough (2026-09-25)

Runbook: [`sandbox-pm-demo.md`](sandbox-pm-demo.md). Dry run on local dev:
fresh GLP-1 intake `ENC-5674296131` → admin Prescribed → waiting moved to
protocol without `demo=1` → executives checkout `demo=1` (fixture) and live
sandbox record → confirmation. Account create still reports the password not
saved on PRX; session continues.

---

## 4. Manual test lessons (do not re-learn)

| Symptom | Cause | Fix / guidance |
|---|---|---|
| Intake 400 body too large | ID photos as huge base64 | Compression in IntakeWizard; 50mb proxy body |
| Intake 422 encounter type unavailable | e.g. testosterone not in token’s available types | Prefer weight-loss / sexual / peptide / universal |
| Intake 422 missing patient info | Shipping address incomplete | `normalizeIntakeAddress` + state → 2-letter |
| Create account “Finish intake…” | Opened header Sign up without encounter | Use post-intake URL or redo intake |
| Login 401 after create | Password never saved (`PUT /me/password` 422) | **Email me a reset link**, then login |
| Protocol / $349 while On Hold | Old demo Continue button | Removed; server redirects to waiting |
| Mobile “real portal” vs TIDL | PrescribeRx hosted portal vs `/care/home` | Expected until white-label emails point at tidl.com |
| Dev health slow / 127.0.0.1 timeout | Windows host binding | Prefer `http://localhost:3000` for smoke |
| Health 503, `/me` 401 | Playground token expired (~12h) | Refresh `system_admin` from `/api/docs/tokens`, restart dev |
| New encounter missing from TIDL Sandbox filter | No sales org on the encounter | Set `PRESCRIBERX_SALES_ORG_ID` + restart, or assign on Manage |
| Admin banner "missing vitals, health_questions" | Thin API intake (scripts), not the full form | Use `/care/intake` for demos; status can still be set |
| Waiting stuck even after admin change | Status not prescribed-like, or no TIDL session | Use Status → Prescribed; log in first |

**Verified patient (manual):** intake weight-loss succeeded; patient visible in
PrescribeRx admin; account created; waiting showed On Hold; after Phase C,
protocol blocked; login via reset password worked; `/care/home` accessible.

---

## 5. How to run locally

```bash
cd web
# .env.local from ../.env.example — need at least:
#   PRESCRIBERX_API_BASE=https://demo.prescribe-rx.com/api/v1
#   PRESCRIBERX_API_TOKEN=…   # refresh ~12h from /api/docs/tokens
#   PRESCRIBERX_SANDBOX=true
#   TIDL_SESSION_SECRET=…     # min 32 chars
npm install
npm run dev
```

Checks:

```bash
# Health
curl.exe -s http://localhost:3000/api/prescriberx/health

# Unit tests
npm test

# Phase D smoke (dev server must be up)
npx tsx scripts/smoke-phase-d.ts

# Production hardening (dev server must be up unless noted)
npm run smoke:phase-l   # demo lock — requires dev (NODE_ENV !== production)
npm run smoke:phase-m   # intake/status rate limits + session-gated status
npm run smoke:phase-n   # waiting poll + prod headers on next start -p 3001

# Unit tests (includes L/M/N)
npm test
npm run typecheck
npm run build
```

Token refresh: `https://demo.prescribe-rx.com/api/docs/tokens` (prefer
`system_admin` for playground encounter-types) or
`bash build/tools/refresh-prescriberx-sandbox.sh`.

---

## 6. Key files (map)

| Area | Path |
|---|---|
| Session seal | `web/lib/auth/session.ts` |
| Org fetch | `web/lib/prescriberx/client.ts` |
| Patient fetch | `web/lib/prescriberx/patient-client.ts` |
| Ownership / register resolve | `web/lib/prescriberx/auth-ownership.ts` |
| Password bind | `web/lib/prescriberx/password-bind.ts` |
| Password reset hint | `web/lib/prescriberx/password-reset-hint.ts` |
| Demo lock (`?demo=1`) | `web/lib/prescriberx/sandbox-demo.ts` |
| Rate limits | `web/lib/prescriberx/auth-rate-limit.ts`, `rate-limit-response.ts` |
| Intake file validation | `web/lib/prescriberx/intake-files.ts` |
| Health config (prod omits secrets) | `web/lib/prescriberx/health-config.ts` |
| Waiting poll backoff | `web/lib/prescriberx/waiting-poll.ts` |
| Status / protocol access | `web/lib/prescriberx/encounter-status.ts`, `protocol-gate.ts` |
| Account home mapper | `web/lib/prescriberx/map-account-home.ts` |
| Intake handoff | `web/lib/prescriberx/intake-flow.ts` |
| Production security headers | `web/next.config.ts` |
| Entry → encounter UUID | `web/content/clinical/entry-map.ts` |
| Session gate | `web/proxy.ts` |
| Account UI | `web/components/care/AccountWizard.tsx` |
| Waiting | `web/components/care/WaitingReview.tsx` |
| Protocol pay UI (fixture) | `web/components/care/ProtocolOrder.tsx` |
| Checkout (sandbox record / collector) | `web/components/care/ProtocolCheckout.tsx`, `web/app/api/prescriberx/protocol/payment/route.ts` |
| Payment mode + rate limit | `web/lib/prescriberx/prx-collector-config.ts`, `protocol-payment-rate-limit.ts` |
| Account home UI | `web/components/care/AccountHome.tsx` |
| Portal logout | `SiteHeader` auth slot (signed-in replaces Log In / Sign Up) |

Auth + patient API routes under `web/app/api/prescriberx/`.

---

## 7. What is still demo / deferred

| Item | State |
|---|---|
| Checkout payment | Sandbox: records a reference on the PRX encounter, no card charged. `?demo=1`: fixture only, nothing written |
| Live card charge (PRX collector) | Code present; blocked — no active merchant on TIDL Sandbox, no Authorize.net keys in env |
| MoR `reference_captured` into PRX | Not wired |
| Visit scheduling | Visit page is a stub continue |
| Webhook receiver | Fail-closed HMAC on `POST /api/webhooks/prescriberx`; in-memory id+status only. Waiting still polls PRX. No subscription in PRX admin yet; needs a public HTTPS URL and the PRX-issued signing secret. |
| Rate limits | In-memory per Node process (Phase M). Not Redis/Upstash — multi-instance deploy needs shared store later. |
| Intake handoff | sessionStorage only (Phase N). Legacy localStorage key removed on read. |
| Password on first create | Bind still fails in sandbox; session stays valid; reset-first UX + `tidl_password_needs_reset` |
| Reset email host | May still be PrescribeRx domain |
| AccountHome care team / agents | Mapped only when PRX returns them; no invented molecules |
| Neon | Leads only — **not** auth/PHI |

---

## 8. Ask Andrew / ops before changing behavior

From [open-questions.md](open-questions.md):

1. First password for passwordless issue-token users (forgot/reset vs set-password API)
2. White-label reset URL → tidl.com `/care/account`
3. Durable sales-org token with `patient:issue-token` (playground rotates ~12h)
4. Replace sandbox encounter UUIDs with TIDL tenant IDs
5. Agent → video visit matrix
6. Live payment + refund UX if screening fails after charge
7. Webhook receiver URL on live TIDL host
8. Create and assign an active merchant account to TIDL Sandbox (and Authorize.net sandbox API login + client key) so collector checkout can be tested
9. ~~Enable Webhook Integration~~ — **already enabled** on TIDL Sandbox (2026-09-25). **Do not ask Andrew for this.** Create the subscription once TIDL has a public HTTPS webhook URL; copy the PRX signing secret once

---

## 9. Suggested next build order

**Done (eng-only, no Andrew blockers):** Phases J, H, E, F, L, M, N; checkout merge fixes; sandbox PM walkthrough.

**Where we stand (2026-09-25):** the full patient path runs end to end on
sandbox. Remaining work is ops and product decisions, not portal build:

| Waiting on | Owner | Unblocks |
|---|---|---|
| Active merchant on TIDL Sandbox + Authorize.net sandbox keys | PrescribeRx ops | Real card entry via PRX collector |
| Durable sales-org token | PrescribeRx | No 12h token refresh |
| Public HTTPS URL + webhook subscription + PRX signing secret | Us | Push events (emails, order/shipping updates) |
| Visit scheduling decision + APIs | Product + PrescribeRx | Visit-gated entries past `/care/visit` |
| Tenant encounter UUIDs, production env, DNS | PrescribeRx + us | Go-live (Phase K) |
| First-password answer for issue-token users | PrescribeRx | Clean account create without reset email |

**Next — blocked on ops / product lead:**

1. **Ops:** durable token + password-bootstrap answer from Andrew  
2. **Payment (Phase G):** TIDL MoR capture + `reference_captured` (or prepaid omit) on protocol  
3. **Visit (Phase I):** scheduling APIs + gate matrix  
4. **Webhooks:** public HTTPS URL pointed at this receiver (localhost rejected)  
5. **Cutover (Phase K):** production `PRESCRIBERX_*`, `SANDBOX=false`, tidl.com DNS (0004)

Parallel tracks (not portal launch blockers): Ask TIDL backend, product catalog
merchandising, marketing restyle — see specs under `docs/specs/`.

---

## 10. Doc index for this workstream

| Doc | Role |
|---|---|
| **This file** | Handoff narrative |
| [specs/patient-auth.md](specs/patient-auth.md) | Cookie, routes, password bind, protocol gate |
| [patient-auth-smoke.md](patient-auth-smoke.md) | How to re-verify |
| [specs/clinical-flow.md](specs/clinical-flow.md) | Stage map + compliance |
| [sandbox-wired.md](sandbox-wired.md) | Sandbox catalog + intake wiring |
| [sandbox-pm-demo.md](sandbox-pm-demo.md) | Product-manager walkthrough + admin status steps |
| [open-questions.md](open-questions.md) | Unresolved ops/Andrew items |
| [decisions/0004](decisions/0004-portal-on-tidl-com.md) / [0005](decisions/0005-patient-auth-on-tidl.md) | Locked product decisions |
| `reference/prescriberx/` | OpenAPI + extracted guides |

Do not invent PrescribeRx response shapes. Prefer live smoke and OpenAPI under
`reference/prescriberx/`. Never log tokens, passwords, or Authorization headers.
