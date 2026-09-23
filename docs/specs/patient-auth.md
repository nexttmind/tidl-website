# Patient auth (Phases A–F, J, H, L–N)

Status: implemented (foundation through production hardening; see handoff)
Depends on: decision 0004, decision 0005, `prescriberx-integration`

## Cookie contract

| Item | Value |
|---|---|
| Name | `tidl_prx_session` |
| Flags | `HttpOnly`; `SameSite=Lax`; `Secure` when `NODE_ENV=production`; `Path=/` |
| Payload (sealed) | `token`, `expiresAt`, optional `patientChartId`, `email`, `abilities` |
| Seal | AES-GCM (Web Crypto), key = SHA-256(`TIDL_SESSION_SECRET`) |
| Env | `TIDL_SESSION_SECRET` (min 32 chars) |

Malformed, tampered, or expired cookies → unauthenticated.

## TIDL proxy routes

| Client call | Upstream | Token |
|---|---|---|
| `POST /api/prescriberx/auth/register` | lookup + encounter + `POST /patients/{chart}/issue-token` + optional `PUT /me/password` | org then patient |
| `POST /api/prescriberx/auth/login` | `POST /auth/login` then `GET /auth/me` | none → patient |
| `POST /api/prescriberx/auth/logout` | `POST /auth/logout` | patient; cookie always cleared |
| `POST /api/prescriberx/auth/refresh` | `POST /auth/refresh` | patient |
| `GET /api/prescriberx/auth/session` | `GET /auth/me` (+ soft refresh) | patient |
| `POST /api/prescriberx/auth/forgot` | `POST /auth/password/forgot` | none |
| `GET /api/prescriberx/patient/dashboard` | `GET /me/patient/dashboard` | patient |
| `GET /api/prescriberx/patient/orders` | `GET /me/patient/orders` | patient |
| `GET /api/prescriberx/patient/orders/[order]/tracking` | `GET /me/patient/orders/{order}/tracking` | patient |
| `GET /api/prescriberx/patient/encounters` | `GET /me/patient/encounters` | patient |
| `GET /api/prescriberx/patient/prescriptions` | `GET /me/patient/prescriptions` | patient |

Auth JSON never includes the bearer token. Auth errors never include upstream bodies.
Patient `/me/patient/*` proxies never fall back to the organization token.

## Protocol / payment gate (Phase C)

`/care/protocol` and `/care/confirmation` call org `GET /telehealth/encounters/{id}/status` on the server. Allowed only when status is `prescribed`, `provider_signed`, `completed`, `order_placed`, or `order_paid` (and the entry is not visit-gated). Pending, On Hold, missing encounter, fetch failure, or cancelled → redirect to `/care/waiting`. Waiting no longer shows Continue to protocol unless `?demo=1`, `PRESCRIBERX_SANDBOX !== "false"`, and `NODE_ENV !== "production"` (see `isSandboxDemoQuery` in `web/lib/prescriberx/sandbox-demo.ts`). `/care/home` uses live patient data or an empty/pending state; demo fixtures only under that same sandbox demo flag.

Browser waiting polls `GET /api/prescriberx/encounters/{id}/status` with the session cookie. That route requires a valid sealed `tidl_prx_session` (local check via `readSessionFromRequest`; no `/auth/me` on each poll). Missing or expired session → **401**; waiting stops polling and redirects to `/care/account?mode=login` with `next` preserved. The route still live-fetches PrescribeRx org status; it does not read the webhook projector.

## Ownership (register)

1. `GET /patients/lookup?email=`
2. `GET /encounters/{id}` (bare). `include=patient` returns HTTP 500 on the sandbox and is not used.
3. Require lookup canonical chart id === submitted `patient_chart_id`
4. Require encounter `patient_chart_id` === submitted chart
5. If encounter includes email, require case-insensitive match
6. Fail closed → generic 403

Do not use telehealth status for ownership.

## Password bind

Checked live on the sandbox 2026-09-22. Reopen this note before changing password behavior.

`POST /patients/{id}/issue-token` provisions a passwordless ACTIVE user when the chart has no linked user. Register then calls `PUT /me/password`. That call is a password change, and PrescribeRx requires `current_password`.

Live results for a token from issue-token:

| Attempt | Result |
|---|---|
| `PUT /me/password` with `current_password: ""` | 422, "The current password field is required." |
| Omit `current_password` | 422, same message |
| `current_password: null` | 422, same message |
| `POST /me/password` | 405 |
| `password` on the issue-token body | 201, field ignored. Later `POST /auth/login` with that password is 401 |

Supported password paths in the OpenAPI we have: `POST /auth/login` (after a password exists) and `POST /auth/password/forgot` plus `POST /auth/password/reset`. There is no documented set-initial-password endpoint for passwordless users. Ask Andrew whether white-label register should use forgot/reset, or whether an undocumented set-password exists. Reset emails may still point at PrescribeRx, not tidl.com.

Register response:

```json
"password": { "status": "bound" | "failed" | "skipped", "reason"?: "..." }
```

Never claim `bound` unless upstream returned success. A failed bind still returns 201 and sets the session cookie. The account screen must say the password was not saved and must not block the waiting screen on a successful bind.

## Network proxy (session gate)

Protects: `/care/waiting`, `/care/protocol`, `/care/visit`, `/care/confirmation`, `/care/home`.
Allows: `/care/intake`, `/care/account`, marketing.
Gate: local unseal only in [`web/proxy.ts`](../../web/proxy.ts) (Next.js 16; do not add `middleware.ts`).

## Refresh

`ensureFreshPatientSession` refreshes when `expiresAt` is within 5 minutes.
Concurrent callers with the same bearer share one in-flight `/auth/refresh`.
Different bearers never share that flight. `POST /auth/refresh` uses the same path.

## Rate limits (Phase M)

Shared in-memory limiter: `web/lib/prescriberx/auth-rate-limit.ts`.

| Route | Limit | Notes |
|---|---|---|
| Auth routes (`/api/prescriberx/auth/*`) | 10 / min / IP | unchanged from Phase A |
| Intake `POST /api/prescriberx/intake` | 5 / min / IP | 429 + `Retry-After`; file slug/base64 + 6MB encoded cap validated server-side |
| Status `GET /api/prescriberx/encounters/[id]/status` | 20 / min / IP | requires sealed session cookie; still live-fetches PRX |

IP order: `x-real-ip` → `x-vercel-forwarded-for` → first `x-forwarded-for` →
`unknown`. PrescribeRx also enforces Auth 10/min upstream.

## Register preflight

`POST /auth/register` calls org `GET /auth/me` first. If the org token lacks
`patient:issue-token` (and is not `*`), register returns 503
`issue_token_unavailable` and does not call issue-token.

## Smoke

See [`docs/patient-auth-smoke.md`](../patient-auth-smoke.md).

| Script | Phase |
|---|---|
| `npx tsx scripts/smoke-phase-d.ts` | D — auth + protocol gate |
| `npm run smoke:phase-e` | E — env guards |
| `npm run smoke:phase-f` | F — login 404 → 401 |
| `npm run smoke:phase-l` | L — demo lock |
| `npm run smoke:phase-m` | M — rate limits + session-gated status |
| `npm run smoke:phase-n` | N — waiting poll + prod headers |

All from `web/` with dev server up unless noted in handoff.

## Handoff

Next team: [`docs/handoff-patient-portal.md`](../handoff-patient-portal.md)
(phases A–F, J, H, L–N, manual lessons, deferred work, Andrew blockers).
