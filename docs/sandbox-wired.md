# PrescribeRx sandbox — wired locally (website-main)

**Status:** sandbox wired for local care + curated PDP overlays  
**Verified:** 2026-09-23 (catalog FAILS=0; Phase D FAILS=0; L/M/N smokes pass); full PM walkthrough 2026-09-25  
**Cross-check:** tidl-main saw the same catalog (162 products / 11 packages)

This note records what we built across the sandbox wiring phases, what the
API actually contains, and what is still a sandbox/tenant gap (not a site bug).

---

## Quick start

1. Env lives in `web/.env.local` (gitignored). Keys: `PRESCRIBERX_API_BASE`,
   `PRESCRIBERX_API_TOKEN`, `PRESCRIBERX_SANDBOX=true`, optional
   `PRESCRIBERX_CLIENT_ID`, `PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID`,
   `PRESCRIBERX_SALES_ORG_ID` (TIDL Sandbox `019f3d35-afc4-72f8-b055-6c86c27ac1b3`).
2. Product-manager script (Weight Loss live path + Peak Performance checkout):
   [`docs/sandbox-pm-demo.md`](sandbox-pm-demo.md).
3. Tokens rotate ~every 12h. Refresh from
   `https://demo.prescribe-rx.com/api/docs/tokens` (prefer `system_admin` for
   playground encounter-types) or run `bash build/tools/refresh-prescriberx-sandbox.sh`.
4. From `web/`: `npm run dev` → open `http://localhost:3000`.
5. Smoke: `GET /api/prescriberx/health` should return `healthy: true`.

---

## What each phase did

### Phase 1 — Auth and entry map

- Confirmed `web/.env.local` talks to `https://demo.prescribe-rx.com/api/v1`.
- Health green for `/auth/me`, `/catalog`, `/telehealth/encounter-types`.
- Every `entry-map` encounter UUID returns schema 200 (including
  `male-trt-consult` and `female-hrt`, which may be missing from the type
  **list** but still work by UUID).

### Phase 2 — Extra proxies (no UI)

- `GET /api/prescriberx/catalog` → PRX `/catalog`
- `GET /api/prescriberx/me` → PRX `/auth/me`

### Phase 3 — Silent products on intake

- Schema-driven `IntakeWizard` already existed; submit used `products: []`.
- Added `product-map` + `browse-api`: resolve a product ID from the encounter
  product list (or catalog fallback) **without** showing a product picker
  (`step_type` 3 stays skipped in `field-types`).

### Phase 4 — Waiting screen

- Same WaitingReview chrome; polls
  `GET /api/prescriberx/encounters/[id]/status` every 6s.
- Auto-advances to protocol/visit on prescribed-like statuses.
- Demo continue is off unless `?demo=1` on sandbox. Protocol stays closed while pending.

### Phase 5 — PDP catalog overlay

- `CategoryPdpLive` on treatments / programs / weight-loss / transformation.
- Curated `ThemeId` → catalog keywords.
- When a product is found, apply sandbox **price**, retail/compare, stock
  (available/unavailable), **short_description** → tagline, and plan option
  price lines. **Photos stay brand fixtures** (sandbox `image_url` not used).
  Goal-framed H1 titles stay (no molecule name as the main title).
  Long `description` is empty in this sandbox for all SKUs.
- No match → fixture content unchanged (e.g. pain relief).
- Member/prescription *structure* remains; dollar amounts come from sandbox.

### Phase 6 — This doc + smoke

- Smoke checklist below passed with FAILS=0 on 2026-09-22.

### Phases J–N — Portal polish + production hardening (2026-09-22 – 2026-09-23)

See [`docs/handoff-patient-portal.md`](handoff-patient-portal.md) for full narrative.

| Phase | Summary |
|---|---|
| **J** | Live `/care/home` maps PRX honestly; no invented molecules; prescriptions/tracking by UUID |
| **H** | Fail-closed webhook receiver; waiting still polls live PRX (projector is not source of truth) |
| **E** | Demo/prod host guards; health flags; merge-safe sandbox token refresh |
| **F** | Reset-first password UX after failed bind; login 404 → 401 |
| **L** | `?demo=1` locked to sandbox dev/test; live pages hide fixture controls and fake checkout |
| **M** | Shared in-memory rate limits on intake (5/min/IP) and status (20/min/IP); session-gated status GET; intake file validation |
| **N** | Waiting poll backoff 6→12→24→30s; tab visibility pause; 30min timeout; sessionStorage-only handoff; prod security headers |

---

## Routes in play

| Local route | PrescribeRx |
|---|---|
| `GET /api/prescriberx/health` | `/auth/me`, `/catalog`, `/telehealth/encounter-types` |
| `GET /api/prescriberx/me` | `/auth/me` |
| `GET /api/prescriberx/catalog` | `/catalog` |
| `GET /api/prescriberx/encounter-types` | `/telehealth/encounter-types` |
| `GET /api/prescriberx/encounter-types/[id]/schema` | `.../schema` |
| `GET /api/prescriberx/products?encounter_type_id=` | `/telehealth/products` |
| `POST /api/prescriberx/intake` | `/telehealth/intake/unified` |
| `GET /api/prescriberx/encounters/[id]/status` | status + encounter detail + video-room + messages + labs + hold requirements |
| `GET /api/prescriberx/patient/snapshot` | every patient-token GET (`/me/patient/*`, conversations, prefs, trends, `/me`) |
| `GET /api/prescriberx/patient/*` | individual `/me/patient/*` proxies (patient token) |
| `POST /api/webhooks/prescriberx` | inbound (HMAC; public URL later) |

Key libs: `web/lib/prescriberx/*`  
Admin ↔ API matrix: [`prescriberx-admin-wiring.md`](prescriberx-admin-wiring.md)
Entry map: `web/content/clinical/entry-map.ts`  
PDP live wrapper: `web/components/pdp/CategoryPdpLive.tsx`

---

## Catalog findings (confirmed with tidl-main)

Same playground catalog from both folders:

| Area | Finding |
|---|---|
| Totals | **162** products, **11** packages |
| Weight / GLP | Strong — many tirzepatide / semaglutide / retatrutide SKUs |
| Men’s TRT | Strong — testosterone vials (+ TRT packages) |
| Peptides | Strong — BPC-157, TB-500, NAD+, etc. |
| Sexual / classic ED | **No** sildenafil/tadalafil. Catalog has **PT-141** + **oxytocin** |
| Women’s HRT | **No** estradiol/progesterone. Only weak match: **DHEA cream** |
| Pain topicals | **None** (lidocaine/diclofenac/etc.) |

### Encounter linked product counts

| Encounter | In type list? | Linked products |
|---|---|---|
| `glp-1-screening` | yes | 8 |
| `peptide-assessment` | yes | 2 |
| `male-trt-consult` | **no** (UUID still works) | 1 |
| `mens-sexual-health-ed-assessment` | yes | **0** |
| `female-hrt` | **no** (UUID still works) | **0** |
| `universal-encounter` | yes | **0** |

**Site behavior for gaps:** when the encounter list is empty, intake may fall
back to a catalog SKU (sexual → PT-141 pen; women’s → DHEA cream; some
programs → NAD/BPC keywords). If catalog also has nothing useful (pain
relief, open symptoms), the page stays fixture-looking and intake submits
without a product. **No consumer “missing product” banner.**

**PDP note (Balance & Beauty):** shoppers still see “Balance & Beauty”; the
~$1 buy-box price is sandbox DHEA, not real HRT. Do not demo this as “women’s
HRT is live.”

---

## Smoke checklist (local)

Run with `web` dev server up:

- [x] `GET /api/prescriberx/health` → `healthy: true`, `sandbox: true`
- [x] `GET /api/prescriberx/me` → 200
- [x] `GET /api/prescriberx/catalog` → ~162 products
- [x] `GET /api/prescriberx/encounter-types` → 200
- [x] Schema for GLP-1, female-hrt, sexual ED → 200
- [x] GLP-1 products → 8
- [x] Pages `/treatments/weight-loss`, `/sexual-health`, `/womens-balance` → 200

Manual care path (optional): merch → `/care/intake` → submit → account →
waiting (poll). Protocol/payment stays closed until status is prescribed.
Sandbox designers may use `?demo=1` only.

Patient auth closeout: `npx tsx scripts/smoke-phase-d.ts` (see
`docs/patient-auth-smoke.md`). Phase D verified 2026-09-22.

Webhook HMAC self-test (dev server up; set the same secret in `.env.local`):

```bash
PRESCRIBERX_WEBHOOK_SECRET=dev-secret npm run smoke:webhook
```

Unsigned POST must be 401 (or 503 if the secret is unset). Signed POST 200;
replay of the same `webhook_id` reports `duplicate`. Do not register a
localhost URL with PrescribeRx.

Phase E env smoke (dev server up):

```bash
npm run smoke:phase-e
```

Expect `sandboxHostConsistent`, `sessionSecretConfigured`,
`webhookSecretConfigured`, and `issueToken` all true on a correctly wired
sandbox `.env.local`. Token refresh:

```bash
bash build/tools/refresh-prescriberx-sandbox.sh
```

Refuses when `PRESCRIBERX_SANDBOX=false`; preserves session/webhook secrets.

Phase F login smoke (dev server up):

```bash
npm run smoke:phase-f
```

Unknown-email `POST /api/prescriberx/auth/login` must return **401**, never 404.

Phase L demo lock (dev server up):

```bash
npm run smoke:phase-l
```

`?demo=1` works only in sandbox dev/test. Production ignores it.

Phase M abuse limits (dev server up):

```bash
npm run smoke:phase-m
```

Status route requires session cookie. Intake/status return `429` + `Retry-After`
when burst.

Phase N waiting + headers:

```bash
npm run smoke:phase-n
```

Production build: `npm run build && npx next start -p 3001` then
`SMOKE_BASE=http://localhost:3001 npm run smoke:phase-n` for security headers.

---

## Still out of scope / ask Andrew

- Durable TIDL sales-org token (not rotating playground `system_admin`)
- Link PT-141 / real ED SKUs to `mens-sexual-health-ed-assessment`
- Add estradiol/progesterone (and link to `female-hrt`)
- Link products to `universal-encounter` if open intake should attach SKUs
- Pain topicals only if sold through PrescribeRx
- Patient portal Phases A–F, J, H, L–N wired (see handoff). MoR payment
  (`reference_captured`), visit scheduling, tenant UUID cutover, public webhook URL.
- Active merchant account on TIDL Sandbox (admin shows none, 2026-09-25) +
  Authorize.net sandbox keys; until then checkout stays sandbox record-only.
- Webhook subscription for TIDL Sandbox (none in admin yet). Not needed for
  status: admin Status → Prescribed is picked up by waiting's poll.

---

## Related docs

- `docs/sandbox-pm-demo.md` — product-manager walkthrough (Weight Loss + checkout)
- `docs/handoff-patient-portal.md` — **start here for next team** (A–F, J, H, L–N + lessons)
- `docs/specs/prescriberx-integration.md`
- `docs/specs/clinical-flow.md`
- `docs/specs/intake-schema.md`
- `docs/specs/patient-auth.md`
- `docs/patient-auth-smoke.md`
- tidl-main: `the-last-sandbox-details.md`, `prescribe-rx-sandbox-tokens.md`
