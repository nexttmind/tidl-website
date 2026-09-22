REST API for the PrescribeRx telehealth and pharmacy platform.

## Required Headers

Every request to `/api/v1/*` MUST include these headers:

```
Accept: application/json
Authorization: Bearer {token}       (all endpoints except /auth/login and /auth/password/forgot)
Content-Type: application/json      (POST/PUT/PATCH requests with a JSON body)
```

**The `Accept: application/json` header is mandatory.** Without it, authentication
failures historically returned a 302 redirect to the web login page instead of a
JSON 401 body — masking the real error from integrators. The server now injects
this header via middleware on every `/api/*` request as a safety net, but clients
SHOULD still send it explicitly for portability and to match the documented contract.

If you ever receive an HTML response or a 302 redirect, check that (1) your HTTP
client is actually sending the `Accept: application/json` header, and (2) the full
token string from `POST /auth/login` is in the `Authorization` header (including
the `{id}|` prefix Sanctum emits).

## Authentication

All authenticated endpoints require a Bearer token obtained via `POST /auth/login`.

```
Authorization: Bearer {token}
```

Tokens are scoped with abilities based on user type. The ability list
below mirrors `App\Enums\Api\TokenAbility::forUserType()` exactly — that
method is the authoritative source. Wildcards are NOT issued (e.g.,
`encounter:*`); each ability is granted explicitly.

| User Type           | Value | Abilities |
|---------------------|-------|-----------|
| Provider            | 0     | encounter:read, encounter:create, encounter:update, prescription:read, prescription:create, prescription:sign, patient:read, patient:update, provider:read, provider:update, product:read |
| Patient             | 1     | patient:read, patient:update, patient:vitals, order:read, telehealth:read, telehealth:submit, encounter:read, prescription:read, product:read |
| Sales Organization  | 2     | sales-org:read, sales-org:update, client:read, client:create, order:read, order:create, order:update, product:read, patient:read, patient:create, patient:update, prescription:read, telehealth:read, telehealth:submit, encounter:read, encounter:create, encounter:update, webhook:read, webhook:create, webhook:update, webhook:delete |
| API                 | 3     | `*` (all abilities) |
| System Admin        | 4     | `*` (all abilities) |
| Client              | 6     | client:read, client:update, order:create, order:read, order:update, prescription:read, patient:read, patient:create, patient:update, product:read, telehealth:read, telehealth:submit, encounter:read, encounter:create, encounter:update, webhook:read, webhook:create, webhook:update, webhook:delete |
| Super Admin         | 8     | `*` (all abilities) |
| Client Provider     | 9     | client:read, client:update, order:create, order:read, order:update, prescription:read, prescription:create, prescription:sign, encounter:create, encounter:read, encounter:update, patient:read, patient:create, patient:update, product:read, provider:read, provider:update, telehealth:read, telehealth:submit, webhook:read, webhook:create, webhook:update, webhook:delete |
| Client Administrator| 10    | Identical ability list to Client (tenant-scoped at policy layer) |

Ambassador (5), Affiliate (7), and Telehealth Admin (11) currently
receive no API abilities — `forUserType()` returns `[]` for them.

**Token type guard on payment.mode=authorize:** sales-org / client tokens
cannot use `payment.mode=authorize` on the unified intake endpoint —
PRX is not the merchant of record for API-driven flows. Use
`reference_captured` (record-only) or `patient_review` (deferred portal
pay) instead. Embed-form tokens (browser-served) DO support `authorize`
because PRX is the merchant on the embed flow.

## Response Format

All responses follow a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-04-03T12:00:00+00:00"
  }
}
```

Paginated responses include `meta.pagination`:

```json
{
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 25,
      "total": 112,
      "from": 1,
      "to": 25
    }
  }
}
```

## Rate Limiting

| Scope | Limit |
|-------|-------|
| General | 60 requests/minute per user |
| Auth endpoints | 10 requests/minute per IP |
| Order creation | 30 requests/minute per user |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` (on 429).

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Business rule error |
| 401 | Unauthenticated |
| 402 | Payment failed |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation error |
| 429 | Rate limited |
| 500 | Server error |
