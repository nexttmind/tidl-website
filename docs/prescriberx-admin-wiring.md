# PrescribeRx demo admin ↔ TIDL wiring matrix

**Audience:** engineers verifying nothing is missed between `demo.prescribe-rx.com` admin and the TIDL Next app (`web/`).  
**TIDL Sandbox org:** `ORG-7144184834`, UUID `019f3d35-afc4-72f8-b055-6c86c27ac1b3`.  
**Verified:** 2026-09-25 (platform admin session on demo).

This is not an exhaustive PRX product manual. It maps **each admin area that touches the headless TIDL journey** to what we call from `/api/prescriberx/*`, what patients see on `/care/*`, and what is intentionally out of scope.

---

## Correct admin URLs (common mistakes)

| Wrong guess | Works |
|---|---|
| `/admin/sales-organizations/{uuid}` | **404** — use `/admin/organization/{uuid}/edit` |
| Search only by `ENC-…` without org filter | Case may exist but not under **TIDL Sandbox** filter |
| Expecting `client_id` on TIDL intakes | Org has **0 clients**; use `sales_org_id` only |

**Deep links (helpers in `web/lib/prescriberx/sandbox-admin.ts`):**

- TIDL encounters list:  
  `https://demo.prescribe-rx.com/admin/encounter/encounters?sales_organization_id=019f3d35-afc4-72f8-b055-6c86c27ac1b3`
- Org settings (catalog, webhook toggle, merchant tab):  
  `https://demo.prescribe-rx.com/admin/organization/019f3d35-afc4-72f8-b055-6c86c27ac1b3/edit`
- Manage one encounter:  
  `https://demo.prescribe-rx.com/admin/encounter/{encounterUuid}`  
  (UUID from intake response or `GET /encounters/{id}` — not the `ENC-` display number alone)
- Create webhook subscription:  
  `https://demo.prescribe-rx.com/admin/system/webhooks/create`  
  (Subscriber type **Sales Organization** → **TIDL Sandbox**)

In local dev, `GET /api/prescriberx/health` includes `adminHints` with these URLs when `PRESCRIBERX_SALES_ORG_ID` is set.

---

## Encounter tenancy (why cases went “missing”)

Unified intake maps tenancy per [field-mapping guide](../reference/prescriberx/guides/extracted/field-mapping.txt):

- `sales_org_id` → `encounters.sales_organization_id`
- `client_id` → `encounter.client_id` (falls back to token tenant)

TIDL is a **sales-org integrator**. Sending a stale demo **`PRESCRIBERX_CLIENT_ID`** (Demo Clinic) while also setting **`PRESCRIBERX_SALES_ORG_ID`** could mis-assign rows so the TIDL org filter shows nothing.

**Fix (shipped):**

- Set `PRESCRIBERX_SALES_ORG_ID=019f3d35-afc4-72f8-b055-6c86c27ac1b3`
- **Do not** set `PRESCRIBERX_CLIENT_ID` for sandbox TIDL
- Restart dev after `.env.local` changes
- Intake sends `sales_org_id` only; prebuilt payloads strip `client_id` when sales org env is set

**Admin fallback:** Manage encounter → set **Sales Organization** to TIDL Sandbox → save.

---

## Admin menu → TIDL wiring

Legend: **Wired** = TIDL app calls PRX API for this journey. **Admin-only** = ops/demo on PRX UI, no TIDL UI. **Deferred** = not in scope for current portal. **Receiver** = TIDL endpoint exists; PRX subscription still needed.

### Core journey (must understand)

| Admin area | What it is on PRX | TIDL wiring | Patient / API surface |
|---|---|---|---|
| **Encounters → All Encounters** | List/filter/manage cases | **Wired** — created by `POST /telehealth/intake/unified` via `POST /api/prescriberx/intake` | `/care/intake` → `/care/waiting` polls `GET /api/prescriberx/encounters/[id]/status` → `/telehealth/encounters/{id}/status` |
| **Encounters → Manage → Status** | Manual transition (e.g. **Prescribed**) | **Admin-only** for sandbox demos; status read is **Wired** | Waiting/protocol gates use live status, not webhooks |
| **Encounters → All Encounter Types** | Type catalog per tenant | **Wired** — `GET /api/prescriberx/encounter-types`, schema, products | `entry-map.ts` + wizard schema |
| **Encounters → Intake / Step Builder**, **Question Bank** | Form definition | **Wired** indirectly — schema drives `/care/intake` | Same encounter-types + schema routes |
| **Encounters → Embed Configurations** | Public embed widgets | **Deferred** — headless path only | `/admin/embeds` token type not used |
| **Patients → All Patients** | Charts created by intake | **Wired** — patient block on unified intake; register uses `/patients/lookup` + `GET /encounters/{id}` | `/care/account`, ownership in `auth-ownership.ts` |
| **Products → All Products / Packages** | Catalog SKUs | **Wired** — `GET /api/prescriberx/catalog`, `products` | PDP overlay, intake product attach |
| **Orders → All Orders** | Fulfillment orders | **Partial** — created after payment path on PRX | Patient: `GET /api/prescriberx/patient/orders`, tracking proxy |
| **Finance → All Merchant Accts** | Authorize.net / etc. | **Partial** — `GET /api/prescriberx/merchant-accounts`; TIDL org has **no active merchant** | Checkout: record-only `reference_captured` / external transaction; live Accept.js when keys exist |
| **Finance → All Transactions** | Payment audit | **Wired** on protocol pay — `POST /transactions/external`, optional capture | `POST /api/prescriberx/protocol/payment` |
| **Webhooks → Create Subscription** | Outbound events | **Receiver** — `POST /api/webhooks/prescriberx` (HMAC); **no TIDL subscription yet** | Waiting still **polls**; webhooks optional enhancement |
| **Sales Organizations → TIDL Sandbox → Settings** | Webhook integration toggle | **Already enabled** (2026-09-25) — do not ask ops to “turn on” | Subscription + public URL is TIDL eng |
| **Prescriptions → All Prescriptions** | Rx records | **Wired** (read) — patient `prescriptions` proxy | `/care/home` data feeds |

### Encounters subtree (detail)

| Admin item | TIDL | Notes |
|---|---|---|
| New Encounter | Admin-only | TIDL creates via API intake only |
| Appointments / Calendar | **Wired** (visit-gated paths) | Patient books on `/care/visit` → `POST /encounters/{id}/schedule`; row appears in PRX Appointments + Calendar |
| Preclusion Restrictions | Admin-only | Clinical ops; not exposed on tidl.com |

**Manage encounter tabs (typical demo):** Status (Prescribed transition), patient/chart data from intake, orders linked after payment, metadata from intake `metadata` field. Banners like “missing vitals, health_questions” appear for thin/script intakes; admin can still apply **Prescribed** for sandbox.

### Auth & users

| Admin item | TIDL | Notes |
|---|---|---|
| Auth Management → Users | **Partial** | Patients created via intake + register; password bind often 422 — reset link flow |
| Roles / Permissions | N/A | Org token abilities from `/auth/me`; health exposes `issueToken` |

### Labs, subscriptions, telehealth, logistics

| Admin area | TIDL | Notes |
|---|---|---|
| Lab Management (orders, holds, panels) | **Deferred** | API exists; no `/care` labs UX |
| Subscriptions | **Deferred** | Webhook events listed in admin; no rebilling UI on TIDL |
| Telehealth Companies | **Deferred** | External telehealth path not used |
| Logistics / FC / Inventory | **Deferred** | Post-order ops on PRX; patient tracking proxy only |

### Platform / ops (not TIDL product)

Clients, Onboarding Links, Providers, Coupons, Commission, Billing Statements, Lead Management, Knowledge Base, Workflows, Chat Agents, SaaS Registrations, Clinical Settings, System Settings, Federation — **Admin-only / PRX platform**. No requirement to wire into tidl.com for current sandbox portal.

**API Documentation** in admin → links to `/api/docs` (same OpenAPI as `reference/prescriberx/`).

---

## TIDL `/api/prescriberx/*` route map (quick reference)

| Local route | PRX upstream | Admin correlate |
|---|---|---|
| `GET /health` | `/auth/me`, `/catalog`, `/telehealth/encounter-types` | Token + catalog health |
| `GET /me` | `/auth/me` | Auth Management / token provisioning |
| `GET /catalog` | `/catalog` | Products, org catalog tab |
| `GET /encounter-types` (+ schema) | telehealth types + schema | All Encounter Types, Step Builder |
| `GET /products` | `/telehealth/products` | Product picker on type |
| `POST /intake` | `/telehealth/intake/unified` | **Encounters list** (new row) |
| `GET /encounters/[id]/status` | `/telehealth/encounters/{id}/status` | Manage → Status |
| `POST /protocol/payment` | status, orders, `/transactions/external`, capture | Orders, Transactions |
| `GET /checkout/config`, `GET /merchant-accounts` | checkout + merchants | Finance → Merchant Accts |
| `POST /auth/*` | patient auth + issue-token | Patients / portal login |
| `GET /patient/snapshot` | every patient GET: chart, dashboard, encounters, orders, Rx, approvals, vitals, goals, trends, allergies, medications, conditions, payment methods, conversations + messages, communication preferences, `/me`, `/me/settings` | Account home |
| `GET /patient/*` | individual `/me/patient/*` proxies | Patient chart mirrors admin patient |
| `GET /encounters/[id]/status` | status + `GET /encounters/{id}` + video-room + hold requirements | Waiting / visit |
| `POST /api/webhooks/prescriberx` | (inbound) | Webhooks → Create Subscription |

Org-side reads for ownership: `GET /encounters/{id}`, `POST /patients/lookup` (see `auth-ownership.ts`).

---

## Webhooks (docs + admin + TIDL)

- **Guide:** `reference/prescriberx/guides/extracted/webhooks-guide.txt` — HMAC, no localhost URLs, secret shown once.
- **Admin:** Subscriber **Sales Organization** = TIDL Sandbox; URL = public `https://…/api/webhooks/prescriberx`.
- **TIDL:** Receiver fail-closed; projector in-memory only; **waiting poll remains source of truth**.
- **API alternative:** `POST /api/v1/webhooks` with sales-org token (when subscription is allowed from API).

Event types visible on create form include `encounter.status_changed`, `order.paid`, `fulfillment.shipped`, lab and subscription events — map to future portal enhancements, not current blocking path.

---

## Sandbox demo checklist

1. `PRESCRIBERX_SALES_ORG_ID` set; `PRESCRIBERX_CLIENT_ID` unset; restart dev.
2. Health green; optional `adminHints` in JSON.
3. Run intake on `/care/intake`; note **encounter UUID** from network tab or response.
4. Open filtered encounters list (link from health or above).
5. Manage → Status → **Prescribed** → Apply Transition.
6. Signed-in `/care/waiting` advances to protocol (poll, ~6–30s).
7. Checkout record-only or `?demo=1` per [sandbox-pm-demo.md](sandbox-pm-demo.md).

---

## Related docs

- [handoff-patient-portal.md](handoff-patient-portal.md) — phases, troubleshooting, Andrew vs TIDL tasks  
- [sandbox-wired.md](sandbox-wired.md) — env and route list  
- [sandbox-pm-demo.md](sandbox-pm-demo.md) — PM walkthrough  
- [open-questions.md](open-questions.md) — merchant, production IDs, BAA  
