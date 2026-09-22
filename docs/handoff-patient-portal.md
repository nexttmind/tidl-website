# Handoff — patient portal + clinical care path (2026-09-22)

**Audience:** next eng team continuing from this workspace  
**Repo root:** `website-main/` (Next app in `web/`)  
**Status:** PrescribeRx sandbox wired; patient auth Phases **A–D complete**  
**Smoke:** catalog FAILS=0; Phase D patient-auth FAILS=0 (same day)

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
  → /care/confirmation            fixture navigate after pay UI
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
- Waiting poll every 6s; PDP live price overlay (`CategoryPdpLive`)
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
  names) in sessionStorage **and** localStorage —
  `web/lib/prescriberx/intake-flow.ts`
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
- Mapper: `web/lib/prescriberx/map-account-home.ts` → AccountHome chrome;
  empty / pending states; never invent molecule names; `?demo=1` = fixtures
- `CarePortalSession` logout chip on `CarePortalChrome`
- Reorder on AccountHome starts a **new intake**, not ungated protocol

### Phase D — Harden + smoke

- Register preflight: org `/auth/me` must have `patient:issue-token` or `*`
  else 503 `issue_token_unavailable`
- Smoke: `npx tsx scripts/smoke-phase-d.ts` → FAILS=0
- Checklist: [patient-auth-smoke.md](patient-auth-smoke.md)
- Specs updated: patient-auth, clinical-flow, sandbox-wired, open-questions,
  decision 0005

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
| Status / protocol access | `web/lib/prescriberx/encounter-status.ts`, `protocol-gate.ts` |
| Account home mapper | `web/lib/prescriberx/map-account-home.ts` |
| Intake handoff | `web/lib/prescriberx/intake-flow.ts` |
| Entry → encounter UUID | `web/content/clinical/entry-map.ts` |
| Session gate | `web/proxy.ts` |
| Account UI | `web/components/care/AccountWizard.tsx` |
| Waiting | `web/components/care/WaitingReview.tsx` |
| Protocol pay UI (fixture) | `web/components/care/ProtocolOrder.tsx` |
| Account home UI | `web/components/care/AccountHome.tsx` |
| Portal logout chip | `web/components/care/CarePortalSession.tsx` |

Auth + patient API routes under `web/app/api/prescriberx/`.

---

## 7. What is still demo / deferred

| Item | State |
|---|---|
| Protocol payment UI | Fixture card/tether; Complete purchase only navigates |
| MoR `reference_captured` into PRX | Not wired |
| Visit scheduling | Visit page is a stub continue |
| Webhook public URL + verify | Route shell exists; no live host |
| Password on first create | Fails; use forgot/reset |
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

---

## 9. Suggested next build order

1. **Ops:** durable token + password-bootstrap answer from Andrew  
2. **Payment:** TIDL MoR capture + `reference_captured` (or prepaid omit) on protocol  
3. **Visit:** scheduling APIs + gate matrix  
4. **Webhooks:** public URL, signature verify, drive waiting/protocol without poll-only  
5. **AccountHome:** richer live payloads (tracking, prescriptions) as PRX returns them  
6. **Cutover:** production `PRESCRIBERX_*`, `SANDBOX=false`, tidl.com DNS (0004)

---

## 10. Doc index for this workstream

| Doc | Role |
|---|---|
| **This file** | Handoff narrative |
| [specs/patient-auth.md](specs/patient-auth.md) | Cookie, routes, password bind, protocol gate |
| [patient-auth-smoke.md](patient-auth-smoke.md) | How to re-verify |
| [specs/clinical-flow.md](specs/clinical-flow.md) | Stage map + compliance |
| [sandbox-wired.md](sandbox-wired.md) | Sandbox catalog + intake wiring |
| [open-questions.md](open-questions.md) | Unresolved ops/Andrew items |
| [decisions/0004](decisions/0004-portal-on-tidl-com.md) / [0005](decisions/0005-patient-auth-on-tidl.md) | Locked product decisions |
| `reference/prescriberx/` | OpenAPI + extracted guides |

Do not invent PrescribeRx response shapes. Prefer live smoke and OpenAPI under
`reference/prescriberx/`. Never log tokens, passwords, or Authorization headers.
