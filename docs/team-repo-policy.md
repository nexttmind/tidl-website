# Team repo policy — sandbox vs TIDL client

## Where sandbox lives

| Remote | Purpose |
|--------|---------|
| **origin** → `nexttmind/tidl-website` | **Team development:** PrescribeRx sandbox, `/care/*`, `/api/prescriberx/*`, `.env.local` pattern, smokes, runbooks |
| **ui** → `TIDL-Health/website` | **Fetch-only:** marketing/UI snapshots. `push` disabled. No sandbox handoff until contractual fulfillment |

## Rules

1. **Never push** PrescribeRx integration, patient portal APIs, or sandbox docs to `TIDL-Health/website`.
2. **Do push** team work to `nexttmind/tidl-website` so all developers share the same sandbox wiring.
3. UI updates from TIDL: import selective trees via `build/tools/import-ui-from-tidl-health.ps1` (keeps `web/lib/prescriberx`, `web/app/api/prescriberx`, etc.).
4. Secrets only in `web/.env.local` or host env (Vercel/staging); never in git.

## Onboarding

1. Clone `nexttmind/tidl-website`.
2. Copy `web/.env.local` from team vault (or `.env.example` + demo token).
3. Follow [`sandbox-backend-signoff.md`](sandbox-backend-signoff.md).
