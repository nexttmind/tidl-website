> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Flow map — tidl (v1)

Merchandising → clinical intake → account → physician review →
protocol (order / payment) or visit → confirmation. See
`docs/specs/clinical-flow.md`.

## Merchandising

| Trigger | From | Destination | Pattern |
| --- | --- | --- | --- |
| Shop / stack card | `/stacks` | `/stacks/[slug]` | Route |
| Treatment card | Home / Ask Tidl | `/treatments/[slug]` | Route |
| Program card | Home / Ask Tidl | `/programs/[slug]` | Route |
| Get started (PDP) | Stack / treatment / program | `/care/intake` | Route |
| FAQ expand | PDP | Same page accordion | FAQ Accordion |
| Plan select | PDP | Local select state | Select |
| BMI Calculate | PDP | Client result bands | BMI Calculator |
| Ask Tidl open | Chrome / AssistBand | Ask Tidl modal → `POST /api/ask-tidl` | Modal |
| Account (nav) | All | `/care/account` or portal | Route |

## Clinical flow

| Trigger | From | Destination | Pattern |
| --- | --- | --- | --- |
| Start care | Merchandising | `/care/intake?entry=…` | Route |
| Intake step next | `/care/intake` | Same route, step state | Assessment steps |
| Intake submit | `/care/intake` | `POST /api/prescriberx/intake` → `/care/account` | API + Route |
| Account done | `/care/account` | `/care/waiting` | Route |
| Status prescribed, no visit | `/care/waiting` | `/care/protocol` | Poll / webhook |
| Status visit required | `/care/waiting` | `/care/visit` | Poll / webhook |
| Visit complete | `/care/visit` | `/care/protocol` or `/care/waiting` | Route |
| Place order / pay | `/care/protocol` | `/care/confirmation` | Payment stub → Route |

Payment lives on the protocol page (Account Portal IA), after physician
approval. Do not invent a second checkout inside intake. Provider back office
steps stay out of the patient UI.
