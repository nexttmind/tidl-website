# Sandbox backend sign-off (nexttmind team)

**Repo:** [nexttmind/tidl-website](https://github.com/nexttmind/tidl-website)  
**Not for TIDL-Health:** PrescribeRx sandbox wiring, `.env.local`, and care API routes stay on this fork only until product handoff.

---

## Prerequisites

1. Copy env shape from repo root `.env.example` into `web/.env.local` (never commit).
2. Valid demo org token in `PRESCRIBERX_API_TOKEN` (refresh from demo docs when expired).
3. `TIDL_SESSION_SECRET` ≥ 32 characters.
4. `PRESCRIBERX_SALES_ORG_ID` = TIDL Sandbox org (`019f3d35-afc4-72f8-b055-6c86c27ac1b3`).
5. From `web/`: `npm install`, then `npm run dev` on port 3000 for browser/smoke routes.

---

## Static checks (no server)

From `web/`:

```bash
npm run typecheck
npm run test
```

---

## API checks (dev server required)

With `npm run dev` running in another terminal, from `web/`:

```bash
npm run smoke:phase-e
npm run smoke:phase-f
npm run smoke:phase-l
npm run smoke:phase-m
npm run smoke:phase-n
npm run smoke:phase-d
```

Webhook self-test (set `PRESCRIBERX_WEBHOOK_SECRET` in `.env.local` first):

```bash
npm run smoke:webhook
```

One-shot live scripts (create ephemeral patients; need valid token):

```bash
npx tsx scripts/verify-sandbox-intake-once.ts
npx tsx scripts/verify-patient-reads-once.ts
npx tsx scripts/verify-visit-booking-once.ts
npm run audit:care-home-symptoms
```

Manual: `GET http://localhost:3000/api/prescriberx/health` → `healthy: true`, `sandbox: true`.

---

## Intake completeness (admin banners)

PrescribeRx unified intake uses the **`answers`** object (field slugs from schema).  
Thin **prebuilt** script intakes may show admin “missing health_questions/vitals” banners; **demo the full `/care/intake` wizard** so `answers` + `vitals` are populated.

---

## Staging (team deploy)

When wiring **staging.tidlll.com** (or another HTTPS host):

| Variable | Notes |
|----------|--------|
| Same `PRESCRIBERX_*` + `TIDL_SESSION_SECRET` as local | Per-environment secrets |
| `PRESCRIBERX_WEBHOOK_SECRET` | Must match PrescribeRx subscription signing secret for that URL |
| Public URL | `https://<host>/api/webhooks/prescriberx` |

Waiting/protocol still poll live PRX; webhooks are additive.

---

## Optional: real card checkout

Add to host env when Accept.js sandbox keys are available:

- `PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID`
- `PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY`
- `PRESCRIBERX_COLLECTOR_PAYMENTS=true`

Without these, protocol payment stays **record-only** (expected for sandbox).

---

## UI sync from TIDL-Health (marketing only)

Import UI from `TIDL-Health/website` with `build/tools/import-ui-from-tidl-health.ps1`.  
**Do not** push sandbox PrescribeRx code to the TIDL-Health remote (`ui` remote is fetch-only).

Pinned UI fetch commit: see `build/tools/fetch-tidl-health-web.ps1` parameter default.

---

## Sign-off checklist

- [ ] `typecheck` + `test` pass
- [ ] Phase E/F/L/M/N/D smokes pass with dev server
- [ ] `verify-sandbox-intake-once` OK
- [ ] `audit:care-home-symptoms` backend actions OK (HTML section checks may fail on SSR; ignore if API rows pass)
- [ ] Staging env + webhook secret documented in team password store
- [ ] No secrets committed; `.env.local` gitignored
