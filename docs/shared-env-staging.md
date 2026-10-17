# Shared env + staging deploy (nexttmind team)

**Host:** `https://staging.tidlll.com`  
**PRX webhook URL:** `https://staging.tidlll.com/api/webhooks/prescriberx`  
**Repo env shape:** repo root [`.env.example`](../.env.example) → copy into `web/.env.local` (local) or Vercel/host env (staging).

---

## Team vault (required keys)

Store a single **TIDL Sandbox — staging + local dev** entry in the team password manager. Never commit values.

| Variable | Local | Staging | Notes |
|----------|-------|---------|--------|
| `PRESCRIBERX_API_BASE` | `https://demo.prescribe-rx.com/api/v1` | same | Demo playground only |
| `PRESCRIBERX_API_TOKEN` | Rotating `system_admin` or sales-org token | Durable sales-org token preferred | Refresh local via `build/tools/refresh-prescriberx-sandbox.sh` or demo [tokens doc](https://demo.prescribe-rx.com/api/docs/tokens) |
| `PRESCRIBERX_SANDBOX` | `true` | `true` | |
| `PRESCRIBERX_SALES_ORG_ID` | `019f3d35-afc4-72f8-b055-6c86c27ac1b3` | same | TIDL Sandbox org |
| `TIDL_SESSION_SECRET` | Unique per environment | **Different** from local | ≥ 32 chars; `openssl rand -base64 32` |
| `PRESCRIBERX_WEBHOOK_SECRET` | Any value for `npm run smoke:webhook` locally | **Must match** PRX subscription `signing_secret` for staging URL | PRX admin → Webhooks; local secret ≠ staging |
| `PRESCRIBERX_DEFAULT_ENCOUNTER_TYPE_ID` | Tenant default UUID | same | Optional if set in vault |
| `ASK_TIDL_MODE_DEFAULT` | `marketing` | `marketing` | Optional |

### Optional — real card checkout (Accept.js)

Only when PRX merchant exposes Authorize.net **API Login ID** + **Client Key** (sandbox):

| Variable | Staging |
|----------|---------|
| `PRESCRIBERX_AUTHORIZE_NET_API_LOGIN_ID` | From PRX Finance → merchant (not in repo) |
| `PRESCRIBERX_AUTHORIZE_NET_CLIENT_KEY` | Same |
| `PRESCRIBERX_COLLECTOR_PAYMENTS` | `true` |

Without these, `GET /api/prescriberx/checkout/config` reports `record_only_sandbox: true` — expected for record-only demos.

---

## Staging deploy checklist (Vercel or equivalent)

1. Merge latest `nexttmind/tidl-website` **main** (care API routes under `/api/prescriberx/*` must exist — older staging builds return **404** on auth/register smokes).
2. Set all **required** variables on the **staging** project (Production vs Preview: use Production for `staging.tidlll.com` if that is the prod target for that project).
3. Redeploy after env changes.
4. Verify:
   - `GET https://staging.tidlll.com/api/prescriberx/health` → `healthy: true`, `sandbox: true`, `/auth/me` ok.
   - Unsigned `POST https://staging.tidlll.com/api/webhooks/prescriberx` → **401** (secret configured, signature required).
5. Run `npm run signoff:staging` from `web/` (phase E passes on legacy `/health`; F/L/M/N need the new deploy).

6. With staging `PRESCRIBERX_WEBHOOK_SECRET` in your shell (from vault, not git):

   ```bash
   cd web
   set PRESCRIBERX_WEBHOOK_SECRET=<staging-secret>
   set SMOKE_BASE=https://staging.tidlll.com
   npm run smoke:webhook
   ```

7. Confirm PRX admin webhook subscription still points at staging URL and “last called” updates after a signed self-test.

---

## Local dev notes

- `web/.env.local` is gitignored; share via vault only.
- After token refresh, **restart** `npm run dev` so in-process env matches file (server routes also retry demo token refresh on 401, but smokes read `.env.local` directly).
- Local webhook secret (`tidl-local-webhook-self-test` or similar) is only for `npm run smoke:webhook` against localhost — do not reuse on staging.

---

## Marketing-only deploys

GitHub → Vercel for public marketing pages **does not** need PrescribeRx keys. Care routes return 503/missing-config without them — see `.env.example` header.
