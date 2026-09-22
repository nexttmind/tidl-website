# Intake schema

Status: draft
Companion to `prescriberx-integration` and `clinical-flow`.

## Scope

How TIDL turns a PrescribeRx encounter type schema into the `/care/intake`
UI, and how answers map back into `POST /telehealth/intake/unified`.

## Source of truth

`GET /telehealth/encounter-types/{id}/schema` via
`GET /api/prescriberx/encounter-types/[id]/schema`.

Per encounter type the schema returns `steps[]` with `step_name`, `step_type`,
`display_order`, `is_required`, and `fields[]`. Each field carries `slug`,
`label`, `field_type`, `is_required`, help/placeholder, `validation`,
`options`, `min`/`max`, `depends_on`, and `maps_to`.

Encounter type is chosen from the entry surface (treatment / program / stack)
through the ops content map in `clinical-flow`. Payment before intake
(decision 0002) locks the cart so the correct schema is known.

## Patient steps only

| step_type | Meaning | Render |
|---|---|---|
| 1 | Standard fields | Field list |
| 2 | Health questions | Field list |
| 3 | Product selection | Product cards from `/telehealth/products` |
| 4 | Consent | Consent checkboxes (copy from TIDL config) |
| 5 | Checkout / review | Review summary (payment already collected) |
| 21 | Confirmation | Post submit success handoff → `/care/account` |
| 22 | Identity verification | Uploads / ID fields |
| 10–14 | Provider back office | Hidden |

## Client contract

Browser state is raw only:

```ts
{
  encounter_type_id: string
  values: Record<string, unknown>  // keyed by field slug
  products: { product_id: string, quantity: number }[]
  consents: string[]               // keys accepted in UI
  files: Record<string, File>      // keyed by upload field slug
}
```

No client side `maps_to` logic. Submit posts that bundle to
`POST /api/prescriberx/intake`. Proxy re-fetches schema and builds the API
payload (port of `IntakePayloadBuilder` from the PrescribeRx api-example).

## maps_to routing (server)

| maps_to | Payload |
|---|---|
| name / email / phone / dob / demographics | `patient.*` |
| `addresses.primary` or address field type | `patient.address` |
| height / weight / HR / BP | `vitals.*` |
| allergies / medications / conditions | `medical_history.*` |
| drivers license fields | `identification.*` |
| unset / unknown | `answers[slug]` |

File fields → `documents[]` with typed categories. Consents → `consents[]`
with type, version, text, timestamp, IP, UA, source domain,
`signature_method: "click"`.

## Conditional fields

Honour `depends_on` (`equals`, `not_equals`, `in`, `contains`). Hidden fields
are not validated and not submitted.

## Sandbox

`PRESCRIBERX_SANDBOX=true` sets `is_sandbox` on unified intake until production
cutover.

## Open items

- Port remaining field types (signature pad canvas, scored assessments)
- TIDL consent copy versions per legal pages
- Replace sandbox encounter UUIDs with TIDL tenant IDs from Andrew
- Payment step before intake (decision 0002) once checkout is live
- Refine review step to use human labels instead of raw slugs
