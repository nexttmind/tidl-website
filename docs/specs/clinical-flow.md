# Clinical flow

Status: draft
Build window: product / treatment / program pages first, then this flow
(today–tomorrow). Depends on decisions 0001, 0002, 0003, 0004 and
`prescriberx-integration`, `intake-schema`, `ask-tidl`.

## Purpose

One patient journey from merchandising into clinician review and order
confirmation. Marketing stays goal framed. Named agents appear only after
account and clinical review (portal / Rx boundary).

## Entry surfaces

| Surface | Route pattern | CTA |
|---|---|---|
| Treatment (condition / goal) | `/treatments/[slug]` | Start care → clinical flow |
| Program (lifestyle archetype) | `/programs/[slug]` | Start care → clinical flow |
| Stack / product PDP | `/stacks/[slug]` | Get started → clinical flow |
| Open symptoms (no path preselected) | `/care/intake?entry=symptoms` | See what's right for you → universal encounter |

Hero, Programs, and Treatments headers carry a secondary
"See what's right for you" CTA beside Shop. That path uses PrescribeRx
`universal-encounter` so the clinician can recommend a care path from the
answers rather than a preselected protocol.

## Stage map

Account lands after intake answers are submitted. Payment for the prescribed
protocol is collected on the post-review protocol page (Account Portal IA),
not before intake. Cart / entry selection still happens on merchandising so
the correct encounter type can load for intake.

```
Merchandising (treatment | program | stack)
  → Clinical intake (schema from PrescribeRx for that encounter type)
       Ask Tidl available as assist (see ask-tidl spec)
  → POST answers → PrescribeRx unified intake
  → Account: log in or create
  → Waiting for physician review
  → Branch A: Care protocol (recommended agents, if prescribed) + place order / payment
  → Branch B: Video visit required (agent gated), then protocol + payment
  → Order confirmation
```

Note: Decision 0002 originally locked payment before intake because the cart
selects the question set. Entry selection still precedes intake. Charge capture
moved to the protocol page so patients pay for what the physician approved.
Amend 0002 when ops confirms merchant of record timing with PrescribeRx.

### Route shells (TIDL)

| Stage | Route | Notes |
|---|---|---|
| Intake | `/care/intake` | Multi step; schema driven |
| Account | `/care/account` | Log in or create |
| Waiting | `/care/waiting` | "Waiting for the physician to review your information." |
| Protocol | `/care/protocol` | Post review protocol + place order / payment |
| Visit | `/care/visit` | Video conference with physician |
| Confirmation | `/care/confirmation` | Order confirmation |

Query or session carries `encounter_id` / `encounter_number` after submit.
Do not put PHI in the URL.

## Stage detail

### 1. Entry selection (pre intake)

Cart / merchandising entry selects which encounter type and product set the
intake schema covers. Payment is not collected here. Patients see goal framed
stack language only.

### 2. Clinical intake

Server loads:

- `GET /api/prescriberx/encounter-types/[id]/schema`
- `GET /api/prescriberx/products?encounter_type_id=`

UI renders patient `step_type` values only (see intake-schema). Values stay as
raw `{ slug: value }` in the client. On submit, the browser posts to
`POST /api/prescriberx/intake`; the proxy re-fetches schema, builds the unified
payload, and calls PrescribeRx. Token never reaches the browser.

Ask Tidl sits beside or inside intake as educational assist. It does not write
answers into the encounter unless the patient explicitly accepts a suggested
value into a field.

### 3. Account

After successful unified intake response (`encounter_id`, `encounter_number`):

- Existing patient: log in (PrescribeRx patient auth / portal token path)
- New patient: create account bound to the chart created by unified intake
  (email match)

Portal lives on tidl.com (decision 0004). This screen is the handoff from
anonymous intake session into authenticated portal session.

### 4. Waiting for physician review

Single purpose screen. Copy direction:

"Waiting for the physician to review your information."

No fake progress, no simulated typing, no invented ETA. Optional: show
elapsed wait only if the system has a real timestamp.

**Polling (Phase N, shipped):** browser polls
`GET /api/prescriberx/encounters/[id]/status` with the session cookie.
Backoff 6s → 12s → 24s → 30s cap; pauses when the tab is hidden; stops after
30 minutes with honest refresh copy; no overlapping in-flight polls. Missing
session → 401, stop poll, redirect to login with `next` preserved. The route
live-fetches PrescribeRx org status — it does not read the webhook projector.

Webhooks (`encounter.assigned`, `encounter.status_changed`, `encounter.prescribed`,
`encounter.cancelled`) are received at `POST /api/webhooks/prescriberx` but
**waiting still polls PRX**; projector is not source of truth (Phase H).

### 5. Branch after review

Ops / clinical rules decide the branch from encounter outcome and the agents
under consideration (not from marketing copy).

**Branch A — Care protocol + order**

Shown when the physician has prescribed and no live visit is required.
Authenticated only. `/care/protocol` and `/care/confirmation` fail closed
when encounter status is pending, On Hold, missing, or cancelled — hiding the
button is not enough; a typed URL must redirect to waiting. Demo continue is
sandbox-only (`?demo=1` and `PRESCRIBERX_SANDBOX`). May name specific agents
here because this is portal / post review. Frame as the clinician's protocol,
not a catalog upsell.

IA (from Pattern/Account Portal): stack / goal, approved agents, care team,
clinical summary, place order / payment. Visual treatment is PDP-like: hero
imagery, agent plates, sticky order card. CTA captures payment (TIDL MoR) and
continues to confirmation.

Payment mode into PrescribeRx: `reference_captured` (or omit payment block for
external prepaid). Never `authorize` on sales org / client tokens.

**Branch B — Video visit**

Shown when the selected or candidate agent requires a synchronous physician
visit before prescribing or dispensing. Scheduling uses PrescribeRx scheduling
endpoints once wired. After visit completion, patient returns to protocol or
waiting as status dictates.

Visit requirement matrix (agent → visit required yes/no) lives with clinical
ops / PrescribeRx configuration, not hardcoded in marketing fixtures.

### 6. Order confirmation

Post payment capture + prescription + (when applicable) visit. Show order
identity, shipping expectation, and support path. Molecule detail only if the
user is authenticated and a prescription exists. Webhook
`order.placed` / `fulfillment.shipped` keeps status fresh.

## Compliance on these screens

- Pre account merchandising and intake chrome: goal framed, stack named.
  No molecule names.
- Waiting screen: no outcome claims, no implied approval.
- Protocol and confirmation after login: named agents allowed when present on
  the prescription / protocol payload.
- Always practitioner framed. Conditional language where needed
  ("if prescribed").
- No PHI in client analytics, repo fixtures, or URL query strings.

## TIDL proxy endpoints used by this flow

| Client call | Proxies to |
|---|---|
| `GET /api/prescriberx/encounter-types` | `GET /telehealth/encounter-types` |
| `GET /api/prescriberx/encounter-types/[id]/schema` | `GET /telehealth/encounter-types/{id}/schema` |
| `GET /api/prescriberx/products` | `GET /telehealth/products` |
| `POST /api/prescriberx/intake` | `POST /telehealth/intake/unified` |
| `GET /api/prescriberx/encounters/[id]/status` | status + encounter detail + video-room + messages + labs + hold requirements |
| `GET /api/prescriberx/patient/snapshot` | every patient-token GET (`/me/patient/*`, conversations, prefs, trends, `/me`) |
| `GET /api/prescriberx/patient/dashboard` | `GET /me/patient/dashboard` (patient token) |
| `GET /api/prescriberx/patient/orders` | `GET /me/patient/orders` |
| `GET /api/prescriberx/patient/orders/[order]/tracking` | `GET /me/patient/orders/{order}/tracking` |
| `GET /api/prescriberx/patient/encounters` | `GET /me/patient/encounters` |
| `GET /api/prescriberx/patient/prescriptions` | `GET /me/patient/prescriptions` |
| `POST /api/webhooks/prescriberx` | Inbound PrescribeRx webhooks |
| `POST /api/ask-tidl` | Clinical / marketing LLM (Thia) |

Auth and portal: `/api/prescriberx/auth/*` (decision 0005). `/care/home` maps
patient dashboard/orders or an honest empty/pending state. Visit scheduling
and MoR `reference_captured` remain later passes.

## Content map (ops owned)

Server module: `web/content/clinical/entry-map.ts`.

| Entry slug | Kind | Sandbox encounter slug | Visit gate default |
|---|---|---|---|
| symptoms | general | universal-encounter | no |
| weight-loss, transformation | treatment / stack | glp-1-screening | no |
| testosterone | treatment | quick-video-visit (sandbox; TRT id at cutover) | yes |
| womens-balance | treatment | quick-video-visit (sandbox; HRT id at cutover) | yes |
| sexual-health | treatment | mens-sexual-health-ed-assessment | no |
| recovery-performance, skin-hair, athletes | treatment / program | peptide-assessment | no |
| executives, healthspan, parents, creators, travelers | program | universal-encounter | no |

Replace UUIDs with TIDL tenant IDs at cutover. Prefer this module over
inlining IDs in page components.

## Open items

Shipped (see `docs/handoff-patient-portal.md`):

- **2026-09-22:** AccountWizard auth bind, live `/care/home`, protocol/confirmation
  fail-closed until prescribed, Phase D smoke + `patient:issue-token` preflight.
- **2026-09-22 – 2026-09-23:** Phases J, H, E, F (home polish, webhooks,
  env guards, password UX) and L, M, N (demo lock, abuse limits, waiting
  backoff + prod headers).

Still open:

- ~~Visit scheduling UX + PrescribeRx scheduling bind~~ — `/care/visit` books via `POST /encounters/{id}/schedule` (2026-09-25); protocol unlocks after post-visit statuses on visit-gated entries
- Formal amend of decision 0002 (pay at protocol vs pay before intake)
- Exact waiting copy legal review
- Agent → video visit matrix from clinical ops
- Live payment provider bind on `/care/protocol` (UI gated on physician accept; capture still fixture)
- Password bind for passwordless users: session may still be issued when `PUT /me/password` fails. Never claim the password was saved. Detail in `docs/specs/patient-auth.md` (sandbox 2026-09-22). Ask Andrew before changing that path.
