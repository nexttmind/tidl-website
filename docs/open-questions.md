# Open questions

One line per item. Move to docs/decisions/ when locked.

Patient portal Phases A–F, J, H, L–N are shipped (production hardening
complete). Full handoff:
[`docs/handoff-patient-portal.md`](handoff-patient-portal.md).

- Compoundable agent confirmation from PrescribeRx, in writing
- Pharmacy cost basis
- Pen fill capability
- Subscription billing compliance
- LegitScript written timeline from Joseph and Allison
- BAA with PrescribeRx
- State availability gating
- Twilio 10DLC SMS registration
- DNS cutover runbook
- Webhook receiver URL on the live TIDL host (signature verify per prescriberx-integration spec)
- Legal and compliance pages: terms, privacy, HIPAA, telehealth informed consent
- Replace sandbox encounter UUIDs in entry-map.ts with TIDL tenant IDs from Andrew
- Agent → video visit required matrix from clinical ops
- Patient auth for `/care/account` — **locked in decision 0005**; Phases A–F, J, H, L–N shipped (cookie, AccountWizard, live home, protocol gate, demo lock, rate limits, waiting backoff, smokes)
- Ask Andrew: for a passwordless user from issue-token, should white-label register use forgot/reset for the first password, or is there an undocumented set-password? See patient-auth spec (sandbox 2026-09-22: `PUT /me/password` is 422 without `current_password`)
- White-label password-reset URL on tidl.com (PrescribeRx forgot-password emails may still point at PRX)
- Durable TIDL sales-org token with `patient:issue-token` (playground token confirmed on 2026-09-22 smoke; rotates ~12h)
- Thia Ask Tidl LLM HTTP contract and credentials
- Refund UX when clinical screening fails after payment
- MoR live capture on `/care/protocol` (`reference_captured` / prepaid) — UI gated; charge not wired
- Visit scheduling APIs after physician accept when `visitGateDefault`
- Live checkout keys: TIDL Sandbox has **active** Authorize.net **Sandbox** merchant **Atlas Protocol Sales Org SB Acct Default** (sales admin verified 2026-10-13). Still need Accept.js API login + client key in TIDL env for collector checkout (not stored in repo)
- Webhook: **Active** subscription to `https://staging.tidlll.com/api/webhooks/prescriberx` (2 events, last called ~4 days ago, 2026-10-13). Staging env + vault checklist: [`shared-env-staging.md`](shared-env-staging.md). Unsigned POST returns **401** (receiver live). Signed `npm run smoke:webhook` needs vault secret matching PRX
- `web/.env.local` **PRESCRIBERX_API_TOKEN** was **401 Unauthenticated** on 2026-10-13 — refresh via `https://demo.prescribe-rx.com/api/docs/tokens` (`system_admin` for eng smokes) or TIDL Sandbox → Settings → Manage Token (org token, ~30-day expiry shown Nov 05, 2026)
- Intake → provider queue: PRX admin may flag thin **script/prebuilt** intakes missing vitals/`answers`. Unified intake OpenAPI uses **`answers`** (wizard slugs), not a separate `health_questions` key — demo via `/care/intake` UI for complete payloads
- Catalog counts: sales **Products & Pricing** shows **135** org SKUs; API `GET /catalog` returns **87** products + **12** packages (system_admin, 2026-10-13). Treat 87 as headless sellables overlay; 135 is full org pricing matrix. Sales **Packages** UI lists **0** org-created packages (platform packages still in API)
