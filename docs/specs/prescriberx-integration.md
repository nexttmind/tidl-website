# PrescribeRx integration

Status: sandbox wired locally (2026-09-22). See `docs/sandbox-wired.md` for
phase notes, catalog gaps, and smoke checklist. Production cutover still
pending Andrew’s durable tenant token.
Sources: demo API docs (2026-08), reference/prescriberx Technical Documents,
api-example intake wizard. Locked decisions 0001 and 0003.

## Scope

Headless PrescribeRx REST API behind TIDL custom UI. No iframe embed
(decision 0001). PHI stays in PrescribeRx. Bearer tokens stay on the server.
Marketing pages ship without these credentials.

Out of scope for this path: External Telehealth (`/external-telehealth/*`),
which is for third party eRx routing fulfillment into PrescribeRx. Embed SDK
guides in reference/ are payment and prefill reference only.

## Environments

| Env | Base URL |
|---|---|
| Sandbox | `https://demo.prescribe-rx.com/api/v1` |
| Production | `https://prescribe-rx.com/api/v1` |

Build against sandbox first. Production flip is env only:
`PRESCRIBERX_API_BASE`, `PRESCRIBERX_API_TOKEN`, `PRESCRIBERX_SANDBOX=false`.
Do not proxy through the Netlify demo host (`tidldemo2.netlify.app`). TIDL talks
to PrescribeRx directly via `/api/prescriberx/*`.

Sandbox tokens auto rotate every twelve hours at
`GET https://demo.prescribe-rx.com/api/docs/tokens`. Refresh local env with
`bash build/tools/refresh-prescriberx-sandbox.sh`. Playground tokens are demo
only; Andrew issues a durable tenant token before production.

## Auth

Every `/api/v1/*` call needs:

```
Accept: application/json
Authorization: Bearer {token}
Content-Type: application/json   (JSON POST/PUT/PATCH)
```

Without `Accept: application/json`, auth failures historically returned HTML
302 to the login page instead of JSON 401. Always send it.

Token is a Sanctum bearer string including the `{id}|` prefix. Env name is
`PRESCRIBERX_API_TOKEN` (not an API key).

### Token type for TIDL

Use a Sales Organization or Client token. Both carry:

- `telehealth:read`, `telehealth:submit`
- `encounter:read`, `encounter:create`, `encounter:update`
- `patient:read`, `patient:create`, `patient:update`
- `product:read`, order abilities
- `webhook:read`, `webhook:create`, `webhook:update`, `webhook:delete`

API / System Admin / Super Admin tokens exist with full abilities. Prefer the
narrowest tenant scoped type Andrew provisions for TIDL.

Patient tokens are for the logged in patient portal surface, not server intake.

### Payment mode guard (decision 0003)

Sales org and client tokens cannot use `payment.mode=authorize` on unified
intake. PrescribeRx is not merchant of record on API driven flows. TIDL is MoR.

Use:

- `reference_captured` when TIDL has already charged via vaulted
  Authorize.net or NMI (record only into PrescribeRx)
- omit `payment` for prepaid / external billing default
- `patient_review` only if deferred portal pay is intentional

Embed form tokens support `authorize` because PrescribeRx is MoR on embed.
That path is closed for us.

## Primary flow

Patient journey is specified in `clinical-flow.md`. API spine is PrescribeRx
Top-5 Flow 1 and the reference `api-example` wizard: catalog / schema →
unified intake → status via poll or webhook.

```
Browser (TIDL UI under /care/*)
  → Next.js route handlers under /api/prescriberx/* (proxy; holds token)
    → GET  /telehealth/encounter-types
    → GET  /telehealth/encounter-types/{id}/schema
    → GET  /telehealth/products?encounter_type_id=…
    → POST /telehealth/intake/unified
    → GET  /telehealth/encounters/{id}/status   (or webhooks)
```

Design rule from the api-example: the browser collects raw `{ slug: value }`
pairs only. Schema re-fetch and payload mapping happen server side so the
client cannot dictate `maps_to` routing.

Ask Tidl is a separate proxy (`/api/ask-tidl`); see `ask-tidl.md`. It does not
replace intake submit.

### Key endpoints

| Method | Path | Role |
|---|---|---|
| GET | `/catalog` | Products + packages for the token tenant |
| GET | `/telehealth/encounter-types` | Encounter type list |
| GET | `/telehealth/encounter-types/{id}/schema` | Steps, fields, `field_type`, `maps_to` |
| GET | `/telehealth/products` | Products for an encounter type |
| POST | `/telehealth/intake/unified` | Create user/chart/encounter + answers |
| GET | `/telehealth/encounters/{id}/status` | Poll until prescribed / cancelled |
| GET | `/telehealth/allergies` `/medications` `/conditions` | Clinical typeahead |
| POST | `/telehealth/shipping-eligibility` | State gating helper |
| POST | `/telehealth/preclusions/evaluate` | Preclusion checks |

Full contract: `https://demo.prescribe-rx.com/api/docs` (OpenAPI at
`/api/docs/openapi.json`, about 151 paths).

### Schema driven UI

Schema `steps[]` mix patient and provider steps. Render only patient facing
`step_type` values:

| step_type | Meaning | Patient UI |
|---|---|---|
| 1 | Standard fields | yes |
| 2 | Health questions | yes |
| 3 | Product selection | yes |
| 4 | Consent | yes |
| 5 | Checkout / review | yes |
| 21 | Confirmation | success screen, not a form step |
| 22 | Identity verification | yes |
| 10–14 | Chart / assess / prescribe / SOAP / finalize | no |

`field_type` chooses the control. `maps_to` routes into `patient{}`,
`vitals{}`, `medical_history{}`, `identification{}`, or free form `answers{}`.
Unknown `maps_to` lands in `answers{}` by slug.

Consents are not fully defined by schema fields. Stamp `consents[]` with type,
version, text, `consented_at`, IP, user agent, source domain, and
`signature_method: "click"`. Consent type integers:

`1=HIPAA 2=TCPA 3=SMS 4=Email 5=Terms 6=Telehealth 7=Controlled 8=Privacy
9=BAA 10=Disclosure 99=Custom`

Files go in `documents[]` with typed categories (not inside `answers{}`).
API limits: 10 MB per file, 20 files. Prefer multipart upload into the proxy,
then assemble the API payload server side.

### Sandbox behaviour

Set `is_sandbox: true` (env `PRESCRIBERX_SANDBOX=true`) to skip provider
assignment, billing, and fulfillment. Names matching test patterns also flip
sandbox on the server. Production traffic must turn sandbox off.

## Webhooks

Subscribe via portal UI or `POST /api/v1/webhooks`. Response includes
`signing_secret` once. Store as `PRESCRIBERX_WEBHOOK_SECRET`.

Delivery headers:

- `X-PrescribeRx-Signature: sha256=<hex>` — HMAC-SHA256 of raw body bytes with
  the signing secret. Strip the `sha256=` prefix before compare. Use
  constant time compare.
- `X-Webhook-ID` — idempotency key; also present as `webhook_id` in the body

Body shape: `event`, `timestamp`, `webhook_id`, `subscription_id`, `data`.

Return 2xx within thirty seconds or PrescribeRx retries. Localhost and private
IP callback URLs are rejected; use a public URL (ngrok fine for early work).

Starter event set for launch lifecycle:

- `encounter.created`, `encounter.status_changed`, `encounter.assigned`,
  `encounter.prescribed`, `encounter.completed`, `encounter.cancelled`
- `order.placed`, `order.paid`, `order.status_changed`, `order.cancelled`
- `fulfillment.shipped`, `fulfillment.delivered`
- `subscription.*` when subscription billing ships
- `patient.created`

Thirty one public event slugs are live as of 2026-05-01. List via
`GET /webhooks/event-types`. Wildcards like `encounter.*` are accepted.

Receiver lives on the TIDL server, not in PrescribeRx:
`POST /api/webhooks/prescriberx`. Missing secret → 503; invalid HMAC → 401.
Waiting still polls live encounter status. Open item remains: public webhook
URL after first deploy (localhost callback URLs are rejected). Do not create
the subscription from application code.

## Env contract

See root `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `PRESCRIBERX_API_BASE` | Base URL with `/api/v1` |
| `PRESCRIBERX_API_TOKEN` | Server side bearer token |
| `PRESCRIBERX_WEBHOOK_SECRET` | HMAC signing secret from subscription create |
| `PRESCRIBERX_CLIENT_ID` | Optional tenant pin |
| `PRESCRIBERX_SALES_ORG_ID` | Optional tenant pin |
| `PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID` | Intake bootstrap default |
| `PRESCRIBERX_SANDBOX` | `true` / `false` for unified intake flag |

Vercel: set these only on environments that run clinical or webhook routes.
Preview and production for marketing only can omit them.

## Rate limits

| Scope | Limit |
|---|---|
| General | 60 / minute / user |
| Auth | 10 / minute / IP |
| Order creation | 30 / minute / user |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` on 429.

## Reference material in repo

| Path | Use |
|---|---|
| `reference/prescriberx/Technical Documents /api-example/` | Port target for Next.js proxy + IntakePayloadBuilder |
| `…/API Token Types & Abilities — PrescribeRx.pdf` | Token matrix |
| `…/Webhooks — PrescribeRx API.pdf` | Event + signature guide |
| `…/API Field Mapping — PrescribeRx.pdf` | Unified intake field destinations |
| `…/Top-5 Integration Flows — PrescribeRx API.pdf` | End to end recipes |
| `…/01–06 Embed SDK*.pdf` | Not our path; payment/prefill patterns only |
| Live docs | https://demo.prescribe-rx.com/api/docs |

## Open items

- Production Sales Org or Client token from PrescribeRx (Andrew)
- BAA
- Compoundable agent confirmation in writing
- TIDL encounter types and product catalog mapped to stacks (goal framed SKUs
  on the consumer surface; molecule names stay behind portal / Rx)
- Public webhook receiver URL after Vercel domain is live
- State availability gating wired to shipping eligibility / preclusions
- Legal consent copy versions stamped into `consents[]`
