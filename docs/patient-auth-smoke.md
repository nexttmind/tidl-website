# Patient auth + portal smoke (Phases D–N)

Verified locally 2026-09-22 (Phase D) and 2026-09-23 (L/M/N). Full narrative:
[`docs/handoff-patient-portal.md`](handoff-patient-portal.md).

Run from `web/` with the Next dev server up:

```
npx tsx scripts/smoke-phase-d.ts
```

`SMOKE_BASE` defaults to `http://localhost:3000`. The script never prints tokens, passwords, or emails.

## Automated checks

- Org `/auth/me` includes `patient:issue-token` or `*`
- `GET /api/prescriberx/health` → `healthy: true`
- Unauthenticated `/care/waiting|protocol|visit|confirmation|home` → 307 `/care/account`
- Unauthenticated `/care/intake` and `/care/account` stay open
- Unauthenticated `/api/prescriberx/patient/*` → 401, no `token` in JSON
- Register on an existing chart+encounter sets `tidl_prx_session` (HttpOnly)
- Session probe authenticates and does not leak the bearer
- `/care/protocol?encounter=` while status is pending / On Hold → 307 `/care/waiting`
- `/care/home` with cookie → 200
- Logout returns `Set-Cookie` with `Max-Age=0`; `/care/home` without a cookie redirects to login

## Manual extras

- Waiting screen has no **Continue to protocol** unless `?demo=1` on sandbox
- `/care/home` without `?demo=1` does not invent past orders
- Log out chip on portal chrome clears the session

## Production hardening smokes (L/M/N)

Dev server must be up (`npm run dev`). Phase L requires dev — not production
`next start` (demo fixtures are correctly blocked in prod).

```bash
npm run smoke:phase-l   # ?demo=1 only in sandbox dev/test
npm run smoke:phase-m   # intake/status 429; status 401 without cookie
npm run smoke:phase-n   # waiting with session; prod headers on next start -p 3001
```

Unit tests cover helpers: `npm test` (includes `sandbox-demo`, `rate-limit`,
`intake-files`, `health-config`, `waiting-poll`, `intake-flow`).

## Known sandbox notes

- `PUT /me/password` after issue-token is 422 (no current password). Register still issues a session. Login needs the forgot/reset email path.
- Reset emails may still point at PrescribeRx, not tidl.com.
- Playground org tokens rotate ~12h. Refresh from `/api/docs/tokens` if health or issue-token fails.
