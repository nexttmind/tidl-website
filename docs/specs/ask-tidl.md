# Ask Tidl

Status: draft
Surface name: Ask Tidl (AskTidl.ai). Clinical LLM orchestration: Thia
(Elliot, Derek). Fixture UI already mounts from site chrome.

## Purpose

Educational assist that helps the patient choose a treatment or program and
understand intake / provider review. Never writes a prescription. Never
replaces the physician.

Two modes share one client entry (`POST /api/ask-tidl`) and diverge by
context and model policy.

| Mode | Where | May see | Must not |
|---|---|---|---|
| Marketing | Global Ask Tidl modal on public pages | Catalog, FAQs, how care works | PHI, molecule names, outcome claims, inventing Rx |
| Clinical | Beside `/care/intake` | Encounter type label, step labels, non PHI field help, allowed catalog links | Autofill PHI into PrescribeRx without explicit patient action; molecule names on pre login chrome; clinical decisions |

## Product rules

- Goal framed language on every pre login answer.
- Practitioner framed: licensed provider reviews intake and decides what, if
  anything, is prescribed.
- No outcome guarantees. Prefer process language ("review", "if prescribed").
- Molecule and compound names stay out of marketing mode. Clinical mode may
  discuss agents only when the session is authenticated and the prompt policy
  allows portal grade vocabulary.
- Ask Tidl suggestions never POST to PrescribeRx by themselves. The patient
  must confirm a value into an intake field; then the normal intake submit
  path owns persistence.

## Current implementation

`web/components/ai/AskTidlModal.tsx` + `web/content/fixtures/ask-tidl.ts`.
Client side keyword router. Swap target is `POST /api/ask-tidl`.

## Endpoint

`POST /api/ask-tidl`

Request:

```json
{
  "query": "string",
  "mode": "marketing" | "clinical",
  "context": {
    "path": "/care/intake",
    "encounter_type_id": "uuid | null",
    "step_slug": "string | null",
    "entry_slug": "transformation | weight-loss | …",
    "entry_kind": "stack | treatment | program | null"
  }
}
```

Response:

```json
{
  "paragraphs": ["…"],
  "treatments": [{ "id", "label", "href", "blurb" }],
  "programs": [{ "id", "label", "href", "blurb" }],
  "disclaimer": "Educational guidance only. …",
  "source": "fixture" | "llm"
}
```

Server behaviour:

1. If `ASK_TIDL_LLM_URL` (or Thia credentials) is unset, answer with the
   fixture router so UI work is unblocked.
2. If set, forward to the clinical LLM with a system prompt that encodes the
   product rules above, plus mode specific constraints.
3. Strip or rewrite any molecule names in marketing mode before return.
4. Never log raw clinical answers that contain PHI into third party analytics.

## Env

| Variable | Purpose |
|---|---|
| `ASK_TIDL_LLM_URL` | Thia / clinical LLM HTTP endpoint |
| `ASK_TIDL_LLM_KEY` | Bearer or gateway key for that endpoint |
| `ASK_TIDL_MODEL` | Optional model id |
| `ASK_TIDL_MODE_DEFAULT` | `marketing` unless overridden |

Keys stay server side. The browser only calls `/api/ask-tidl`.

## Clinical intake assist

On `/care/intake`, Ask Tidl may:

- Explain why a step exists ("providers need height and weight for dosing
  decisions if prescribed")
- Point at the matching treatment or program page
- Clarify telehealth consent language at a plain language level

Ask Tidl must not:

- Tell the patient they qualify or will be prescribed
- Recommend a specific agent as if already prescribed
- Bypass required fields or consents

## Handoff to Thia

Thia owns model hosting, retrieval over approved clinical / catalog content,
and safety filters. TIDL owns the UI, mode switch, PrescribeRx proxy boundary,
and compliance copy. Contract for the LLM HTTP API is finalized with Elliot /
Derek; until then the fixture path remains the default.

## Open items

- Thia endpoint contract and auth
- Retrieval corpus (approved FAQs, stack blurbs, consent summaries)
- Molecule filter implementation for marketing mode
- Whether clinical mode is gated on account session or allowed during
  anonymous intake with reduced vocabulary
