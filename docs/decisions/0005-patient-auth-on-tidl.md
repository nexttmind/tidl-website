# 0005 Patient auth on tidl.com (PrescribeRx patient tokens)

Status: locked
Date: 2026-09-22
Owner: TIDL eng; playground token confirmed `patient:issue-token` 2026-09-22; ask Andrew for a durable sales-org token

## Decision

Patient portal authentication uses PrescribeRx patient-scoped Sanctum tokens.
TIDL seals the bearer in an httpOnly cookie (`tidl_prx_session`) with
AES-GCM (`TIDL_SESSION_SECRET`). Organization API tokens remain server-only
for intake, catalog, ownership checks, and `POST /patients/{id}/issue-token`.

## Rationale

Decision 0004 places the portal on tidl.com. OpenAPI documents
`POST /patients/{id}/issue-token` for white-label portals and
`POST /auth/login` for returning patients. PHI and password hashes stay in
PrescribeRx. TIDL does not store credentials in Neon.

## Consequences

- Browser never receives the raw patient bearer.
- Create/bind after intake requires ownership verification
  (`GET /patients/lookup` + `GET /encounters/{id}`) before issue-token.
- Password bind via `PUT /me/password` fails for passwordless users on the
  sandbox (422, current password required). See `docs/specs/patient-auth.md`
  (checked 2026-09-22). Session may still be issued. Never claim the password
  was saved unless status is `bound`.
- Middleware gates `/care/waiting|protocol|visit|confirmation|home` by local
  cookie unseal only (no PrescribeRx call per navigation). Implemented in
  `web/proxy.ts` (Next.js 16 proxy; not `middleware.ts`).

Implementation closeout (Phases A–D, smoke, lessons):
`docs/handoff-patient-portal.md`.
