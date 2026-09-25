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
- Ask Andrew: create and assign an active merchant account to TIDL Sandbox (`ORG-7144184834`); admin shows none as of 2026-09-25. Also need Authorize.net sandbox API login + client key for collector checkout
- Webhook subscription for TIDL Sandbox: org **Webhook Integration** is **Enabled** (admin → TIDL Sandbox → Settings, verified 2026-09-25). **TIDL Sandbox** is selectable as Sales Organization subscriber on admin Create Webhook Subscription. Still missing: a **public HTTPS** callback URL (ngrok/preview/prod), create the subscription, copy PRX **signing secret** once into `PRESCRIBERX_WEBHOOK_SECRET` — eng/ops on TIDL side, not an Andrew toggle
- Public HTTPS host (ngrok or preview) for the sandbox webhook subscription; PRX shows the signing secret once, which replaces the local `PRESCRIBERX_WEBHOOK_SECRET`
