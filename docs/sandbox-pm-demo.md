# Sandbox walkthrough for the product manager

**Audience:** product manager and anyone demoing local TIDL against PrescribeRx sandbox.  
**Site:** `http://localhost:3000`  
**PrescribeRx:** `https://demo.prescribe-rx.com`  
**Org:** TIDL Sandbox · `ORG-7144184834` · `019f3d35-afc4-72f8-b055-6c86c27ac1b3`

This is a testing script. It does not charge a real card, and it does not replace production payment, visit scheduling, or a public webhook.

---

## Before you start

1. From `web/`, run `npm run dev`.
2. Open `http://localhost:3000/api/prescriberx/health`. You want `healthy: true` and `sandbox: true`.
3. If health is red, the org token expired (about every 12 hours). Refresh `system_admin` from `https://demo.prescribe-rx.com/api/docs/tokens` into `web/.env.local` as `PRESCRIBERX_API_TOKEN`, or run `bash build/tools/refresh-prescriberx-sandbox.sh`. Restart `npm run dev` after any `.env.local` change, including the sales-org id. Do not commit `.env.local`.
4. `PRESCRIBERX_SALES_ORG_ID` in `.env.local` should be `019f3d35-afc4-72f8-b055-6c86c27ac1b3`.
5. Log into PrescribeRx admin in another tab (Demo Admin is enough to browse encounters).

Optional checks (dev server up, from `web/`):

```bash
npm run smoke:phase-d
npm run smoke:phase-l
```

Phase D proves login and that protocol stays closed while the encounter is still pending. Phase L proves `?demo=1` only works in this sandbox.

---

## What the two paths are for

| Path | What the PM sees | When to use it |
|---|---|---|
| A. Weight Loss, live | Real intake, account, waiting, then protocol after admin moves the encounter | The honest patient story |
| B. Peak Performance checkout | Protocol and checkout screens, then a sandbox payment that does not charge a card | Showing the buy step |

Weight Loss and Peak Performance both go to **protocol** after a physician-like status (not the visit screen). Visit-gated entries (Energy & Strength, Balance & Beauty) are not this script.

Statuses that unlock protocol and live checkout: `prescribed`, `provider_signed`, `completed`, `order_placed`, `order_paid`.

`?demo=1` is a designer shortcut. It opens protocol and checkout while the encounter is still pending. On checkout it shows a **fixture** card (4242 / USDT) and jumps to confirmation **without** writing a payment to PrescribeRx. The line “Sandbox payment — no real charge” appears on checkout **without** `demo=1`, after the encounter is prescribed-like. That form records a reference in PrescribeRx. It still does not charge a card, because TIDL Sandbox has no active merchant account.

Waiting does not get push updates. TIDL has no webhook subscription in PrescribeRx admin. The waiting page polls. `npm run smoke:webhook` only proves the local receiver.

---

## Path A — Weight Loss (live)

1. Open `http://localhost:3000/treatments/weight-loss`.
2. Start care and land on `/care/intake?entry=weight-loss` (GLP-1 screening).
3. Fill intake with a fresh email you can remember, for example `pm-demo-<today>@example.com`, and submit.
4. Create the account on `/care/account` with that same email. If the password is not saved, use **Email me a reset link**, set a password from the email, then log in. The session can still continue to waiting if you are already signed in.
5. You should land on `/care/waiting?entry=weight-loss&encounter=<uuid>`. Leave this tab open. The page should stay on review. There is no Continue button unless the URL also has `demo=1`.
6. In PrescribeRx admin, open [TIDL Sandbox encounters](https://demo.prescribe-rx.com/admin/encounter/encounters?sales_organization_id=019f3d35-afc4-72f8-b055-6c86c27ac1b3) or search by `ENC-…`. If the case is missing from that filter, confirm `PRESCRIBERX_SALES_ORG_ID` is set, `PRESCRIBERX_CLIENT_ID` is unset, and dev was restarted — see [`prescriberx-admin-wiring.md`](prescriberx-admin-wiring.md).
7. Open **Manage**.
   - If it says no sales organization is assigned, choose **TIDL Sandbox** and **Save Details**. Restarting the dev server after `PRESCRIBERX_SALES_ORG_ID` is set avoids this on new intakes.
   - If a banner says the intake is missing **vitals** or **health questions**, the case was created without the full site form. For the PM demo, use `/care/intake` and answer those steps. You can still set status for a thin test case; the banner is a data warning, not a lock.
8. Open the **Status** tab. Choose **Prescribed**. Click **Apply Transition**. The header badge should read **Prescribed**. This is the care case, not a shop-order “approved” toggle.
9. Return to the waiting tab. Within about half a minute it should leave review and open `/care/protocol?entry=weight-loss&encounter=<uuid>`.

If **Apply Transition** does not stick, stop Path A there and say so. Use Path B with `?demo=1` to show protocol and checkout. Do not add a fake status bypass in the app.

---

## Path B — Peak Performance checkout

Use the encounter id from Path A when you have one. Any encounter id in the URL is enough for the `demo=1` screens.

### While the encounter is still pending (UI only)

Sign in on TIDL first. Unauthenticated `/care/protocol` and `/care/checkout` redirect to login.

- Protocol: `http://localhost:3000/care/protocol?demo=1&entry=executives&encounter=<uuid>`
- Checkout: `http://localhost:3000/care/checkout?demo=1&entry=executives&encounter=<uuid>`

Submit checkout. You should reach `/care/confirmation` with `demo=1`. No card is charged, and PrescribeRx does not get a payment record from this shortcut.

### After Path A is prescribed (real gate + sandbox record)

Drop `demo=1`:

- `http://localhost:3000/care/protocol?entry=executives&encounter=<uuid>`
- `http://localhost:3000/care/checkout?entry=executives&encounter=<uuid>`

You should see **Sandbox payment — no real charge on your card.** Submit **Complete purchase**. Confirmation should open without `demo=1`. The card number field is read-only on purpose.

Same checkout **without** a prescribed-like status and **without** `demo=1` must bounce back to waiting. That is the gate the PM should see once, so the shortcut and the live rule stay distinct.

---

## What this demo does not include

- A live card charge or TIDL as merchant of record. Admin → TIDL Sandbox → Merchant Accounts currently says there is no active merchant.
- A PrescribeRx webhook pointed at this laptop. Waiting keeps polling.
- A durable sales-org token. The playground token still rotates.
- Production host cutover or replacing sandbox encounter type ids in `web/content/clinical/entry-map.ts`.

Those stay with ops after this test.

---

## Dry run (2026-09-25)

Walked on local `npm run dev` against demo PrescribeRx. Health was green after a token refresh. `npm run smoke:phase-d` and `npm run smoke:phase-l` passed.

- Fresh GLP-1 intake `ENC-5674296131` showed up in admin **On Hold**, with no sales org and a note that vitals and health questions were missing (the one-shot API payload, not the full intake form).
- Demo Admin → **Status** → **Prescribed** → **Apply Transition** stuck. PrescribeRx status API returned `prescribed`.
- Signed-in waiting for that encounter moved on its own to `/care/protocol` (no `demo=1`). Account create kept the session even though the password was not saved on PrescribeRx.
- Peak Performance checkout with `?demo=1` used the fixture card and landed on confirmation with `demo=1`.
- The same checkout without `demo=1` showed **Sandbox payment — no real charge** and landed on confirmation with no `demo` flag.
