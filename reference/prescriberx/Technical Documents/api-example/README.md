# PrescribeRx Intake Wizard — Reference Implementation

A self-contained, **framework-free** form wizard that renders a multi-step
telehealth intake from a PrescribeRx **encounter type schema** and submits it to
the **unified intake** endpoint. It is built to be copied, rebranded, and
extended by any group that needs to collect intake on their own site — a
WordPress page, a static marketing site, a custom portal, anything that can run
PHP.

It defaults to the **GLP-1 Screening** encounter type but the type is
switchable at runtime, so the same code builds the form for *any* encounter type
your tenant exposes — without you writing field-specific markup.

---

## 1. What this is (and what it isn't)

**It is** a working, end-to-end example: a browser collects values, a thin PHP
proxy holds your API token and forwards a correctly-shaped payload to the API.
Drop in a token, open the page, submit a real (sandbox) encounter.

**It is not** a polished, on-brand patient experience. The styling is a neutral
Bootstrap 5 baseline on purpose — it's a skeleton you theme. The clinical-search
fields (allergies/medications/conditions) are plain free-text chip inputs by
default; wiring them to the live lookup endpoints is a documented extension, not
something baked in.

### Design principle

The browser is **presentation only**. It never decides how data maps into the
API contract — it just collects raw `{ slug: value }` pairs and posts them. All
contract logic lives server-side in one reusable class. This mirrors a clean
component → action → service split: the JS is the "component," `api.php` is the
thin controller, and `IntakePayloadBuilder` is the reusable action/service with
all the business logic. You could call that same builder from a queued job, a
CLI importer, or a server-rendered form and get an identical payload. No logic
is duplicated between transport mechanisms.

---

## 2. File layout

```
prescribe-rx-intake-wizard/
├── index.html                  # The page. Bootstrap 5 + the wizard mount point.
├── config.php                  # THE ONE FILE YOU EDIT. Token, endpoints, consents, limits.
├── api.php                     # AJAX proxy / thin controller. Browser talks only to this.
├── lib/
│   ├── FieldType.php           # field_type integer constants + classification helpers.
│   ├── PrescribeRxClient.php   # cURL gateway: auth, GET/POST, error normalization, caching.
│   └── IntakePayloadBuilder.php# Schema-driven transformer: raw values -> API payload.
├── assets/
│   ├── wizard.css              # Neutral, rebrandable styles (CSS variables up top).
│   └── wizard.js               # The rendering engine: RENDERERS + STEP_RENDERERS registries.
└── README.md                   # This file.
```

---

## 3. Quick start

1. **Get a token.** You need a bearer token whose user type carries the
   `telehealth:submit`, `telehealth:read`, and `encounter:create` abilities.
   Sales Organization, Client, and API user types all qualify (see the Token
   Types matrix in the API docs). For trying it out, the demo docs publish
   auto-rotating **sandbox** tokens at
   `https://demo.prescribe-rx.com/api/docs/tokens`.

2. **Configure.** Open `config.php` and set the token. Prefer an environment
   variable over hard-coding:

   ```bash
   export PRESCRIBE_RX_TOKEN="your-token-here"
   export PRESCRIBE_RX_BASE_URL="https://demo.prescribe-rx.com/api/v1"   # optional; this is the default
   ```

   Or edit the `api_token` line directly. **Never commit a production token.**

3. **Serve it.** Any PHP 8.1+ server works. For a local spin-up:

   ```bash
   cd prescribe-rx-intake-wizard
   php -S 127.0.0.1:8000
   ```

   Open `http://127.0.0.1:8000/`. The wizard loads the encounter-type list,
   fetches the GLP-1 schema, and renders the steps.

4. **Submit.** Fill it in and submit. With `sandbox_mode => true` (the default)
   the encounter is flagged sandbox, so no provider assignment, billing, or
   fulfillment is triggered. You'll get back an encounter number and a
   completeness score on the success screen.

> **Requirements:** PHP 8.1+ with the cURL and JSON extensions (both standard).
> No Composer, no build step, no Node.

---

## 4. How it works, end to end

```
┌──────────────┐   GET ?action=bootstrap      ┌──────────┐   GET …/schema      ┌─────────┐
│  index.html  │ ───────────────────────────► │  api.php │ ──────────────────► │   API   │
│  + wizard.js │                              │ (proxy)  │   GET …/products    │         │
│ (browser)    │ ◄─────────────────────────── │          │ ◄────────────────── │         │
└──────────────┘   { schema, products, … }    └──────────┘                     └─────────┘
       │
       │  user fills steps; JS holds raw { slug: value }, File objects, products, consents
       ▼
┌──────────────┐   POST { action:submit, … }  ┌──────────┐                     ┌─────────┐
│  wizard.js   │ ───────────────────────────► │  api.php │  re-fetch schema    │   API   │
│              │                              │          │  IntakePayloadBuilder│        │
│              │ ◄─────────────────────────── │          │  POST …/intake/unified─────►   │
└──────────────┘   { encounter_number, … }    └──────────┘ ◄────────────────── └─────────┘
```

1. **Bootstrap.** On load (and whenever the type switcher changes), the browser
   calls `api.php?action=bootstrap&encounter_type_id=…`. The proxy fetches the
   encounter type's **schema**, its **products**, and assembles the **consent**
   metadata and **upload limits** from `config.php`, returning everything in one
   response.

2. **Render.** `wizard.js` filters the schema's steps down to the patient-facing
   ones (see §6), then renders each step. For each field it looks up a renderer
   by `field_type` and produces the matching control.

3. **Collect.** As the user types/selects, values are stored flat in
   `state.values` keyed by slug. Selected files are held as `File` objects in
   `state.files` and uploaded as multipart binary parts (no client-side base64). Selected products and accepted consent keys are tracked
   separately.

4. **Submit.** The browser POSTs the raw bundle to `api.php?action=submit`. The
   proxy **re-fetches the authoritative schema** (so the client can never
   dictate mapping), hands everything to `IntakePayloadBuilder`, and forwards
   the built payload to `POST /telehealth/intake/unified`.

5. **Respond.** Success → the wizard shows the encounter number, status, and
   completeness score. Validation errors (422) → the proxy relays the API's
   `errors{}` map and the wizard highlights the offending fields.

---

## 5. The schema drives everything

The schema endpoint (`GET /telehealth/encounter-types/{id}/schema`) returns,
per encounter type:

- `steps[]` — each with `step_name`, `step_type` (int), `display_order`,
  `is_required`, and `fields[]`.
- each field carries `slug`, `label`, `field_type` (int), `is_required`,
  `help_text`, `placeholder`, `validation`, `options[]`, `min`/`max`,
  `depends_on`, and crucially **`maps_to`**.

Two field properties do all the routing work:

- **`field_type`** decides the *shape* of the value and which control renders it
  (text vs. select vs. file vs. address …).
- **`maps_to`** decides *where the value lands* in the API payload — a
  structured block (`patient{}`, `vitals{}`, `medical_history{}`,
  `identification{}`) or the free-form `answers{}` map.

`IntakePayloadBuilder` never hard-codes a slug like `patient_first_name`. It
reads `maps_to=first_name` and routes accordingly. **Add a field to the
encounter type in the PrescribeRx admin and it flows through end to end with
zero code changes** — the renderer picks it up by type, the builder routes it by
`maps_to`. That's the no-code extensibility goal: new fields are an admin
operation, not a deploy.

### maps_to routing table

`IntakePayloadBuilder::MAPS_TO_ROUTES` is the authoritative list. Current
entries:

| `maps_to`                          | Lands in payload at              |
|------------------------------------|----------------------------------|
| `first_name`, `last_name`          | `patient.first_name` / `.last_name` |
| `email`                            | `patient.email`                  |
| `mobile_phone`, `phone`            | `patient.phone`                  |
| `date_of_birth`                    | `patient.date_of_birth`          |
| `gender`, `race`, `ethnicity`, `preferred_language` | `patient.*`     |
| `addresses.primary`                | `patient.address` (object)       |
| `height_inches`                    | `vitals.height_inches` (total inches) |
| `weight_lbs`                       | `vitals.weight_lbs`              |
| `heart_rate_bpm`                   | `vitals.heart_rate_bpm`          |
| `allergies` / `medications` / `conditions` | `medical_history.*`      |
| `drivers_license_number`           | `identification.id_number` (+ sets `id_type`) |
| `drivers_license_state_of_issue`   | `identification.id_state`        |

Anything with no `maps_to` (or an unrecognized one) lands in `answers{}` keyed
by its slug — that's where the Health Questions step ends up, exactly as the API
expects. Two field types route to fixed locations regardless of `maps_to`:
`ADDRESS` → `patient.address`, `BLOOD_PRESSURE` → `vitals.blood_pressure_*`.

If your tenant uses a `maps_to` value not in the table above, add one line to
`MAPS_TO_ROUTES`. That's the only change needed.

---

## 6. Step-type filtering (why some steps don't show)

An encounter type's schema includes **provider/back-office** steps mixed in with
the patient-facing ones. The GLP-1 type, for example, has 14 steps — but Chart
Review, Provider Assessment, Prescribing, SOAP, and Finalize are not things a
patient fills out. The wizard renders only the step types listed in
`config.php → patient_step_types`:

| step_type | Meaning              | Shown? | Rendered as           |
|-----------|----------------------|--------|-----------------------|
| 1         | Standard fields      | yes    | generic field list    |
| 2         | Health questions     | yes    | generic field list    |
| 3         | Product selection    | yes    | product cards         |
| 4         | Consent              | yes    | consent checkboxes    |
| 5         | Checkout             | yes    | review summary        |
| 22        | Identity verification| yes    | generic (file uploads)|
| 21        | Confirmation         | yes\*  | success screen        |
| 10–14     | Provider/back-office | **no** | excluded              |

\* step_type 21 isn't a navigable form step — it's pulled aside and used as the
post-submit success screen.

To include or exclude a step type, edit the `patient_step_types` array. No code
change.

---

## 7. The renderer registries — the main extension point

`wizard.js` has two registries, both plain objects you extend by adding a key.
No other code changes when you add one — this is deliberate, so there's a single
place to look and nothing to duplicate.

### `RENDERERS` — keyed by `field_type`

Each entry is `function(field) -> Element`. Every field type in the API enum is
covered:

- **Text-like** (text, email, phone, password, url, date, time, datetime,
  calendar) share one `textLike(inputType)` factory.
- **Numeric** (number, weight, heart rate, temperature, blood glucose) and
  **currency** with an addon.
- **Single-choice** (select, radio group, radio buttons) and **yes/no**,
  **toggle switch**.
- **Multi-choice** (checkbox group, toggle group, multiselect).
- **Clinical search** (allergy/medication/condition) as **free-text chip
  inputs** by default — see the extension note below.
- **Composite**: height (ft/in → total inches), blood pressure (sys/dia), BMI
  (computed, read-only), address (street/city/state/zip/country).
- **File upload** (stores the `File` in `state.files`; uploaded as a multipart
  part on submit). Signature pad is
  currently aliased to file upload (a stub — see below).
- **Display-only**: section header, divider, hidden.

To support a new or custom field type, add one function:

```js
RENDERERS[FT.MY_NEW_TYPE] = function (field) {
  var node = document.createElement('input');
  node.className = 'form-control';
  node.value = getVal(field.slug) || '';
  node.addEventListener('input', function () { setVal(field.slug, node.value); });
  return makeField(field, node);   // wraps it with label, help text, required marker
};
```

`makeField(field, node)` handles the label, help text, required asterisk, and
error slot for you. `setVal`/`getVal` keep `state.values` in sync and re-run
conditional visibility.

### `STEP_RENDERERS` — keyed by `step_type`

For steps that aren't just "a list of fields." Add a key to take over a whole
step:

```js
STEP_RENDERERS[ST.PRODUCT]  = function (step, container) { … product cards … };
STEP_RENDERERS[ST.CONSENT]  = function (step, container) { … consent checkboxes … };
STEP_RENDERERS[ST.CHECKOUT] = function (step, container) { … review summary … };
```

Standard, Health, and Identity steps all fall through to the `'default'`
renderer (the generic field list). Override any of them the same way.

---

## 8. Conditional fields (dependencies)

Fields with a `depends_on` clause show/hide based on another field's value. The
engine (`refreshVisibility` / `evalDependency`) supports `equals`, `not_equals`,
`in`, and `contains` operators. Example from the GLP-1 schema:
`glp1_alcohol_frequency` appears only when `glp1_alcohol_consumption` equals
`"Yes"`. Hidden fields are skipped during validation and excluded from the
submitted answers, so a hidden required field never blocks submission.

---

## 9. Files → documents

File-upload fields are **not** sent in `answers{}`. They go in `documents[]` with
a typed category. `config.php → document_type_map` maps each file field's slug to
an API document type (`id_front → government_id_front`,
`body_photo → body_picture`, etc.); unmapped slugs fall back to
`document_type_default`.

**Transport: files upload as real `multipart/form-data` parts, not base64 in
JSON.** On submit, the browser sends one JSON `payload` part (the raw values,
products, consents) plus each file as a binary part named `files[slug]`. This
matters: base64-inlining a file inside the JSON body inflates it ~33% and pushes
large submissions past server body limits (`post_max_size`,
`client_max_body_size`), which silently drops uploads. Multipart streams the
bytes through PHP's normal upload path instead.

Server-side, `api.php → collectUploads()` reads `$_FILES`, validates the **real**
uploaded bytes (size from the upload, MIME sniffed with `finfo` — which matches
the API's own server-side sniff and avoids 422s from a spoofed type), then
base64-encodes each file so `IntakePayloadBuilder` can assemble the `documents[]`
entries unchanged. (Programmatic callers can still POST `application/json` with
files inlined as `{ slug: { filename, mime_type, base64 } }`; that legacy path is
validated by `validateUploads()`.)

Keep `max_file_bytes` / `max_files` at or below the API limits (10 MB/file, 20
files), and make sure the server's `upload_max_filesize`, `post_max_size`, and web
server body limit (e.g. nginx `client_max_body_size`) are at least as large as
`max_file_bytes × max_files`. If a request exceeds `post_max_size`, the proxy
detects the dropped body and returns a clear 413 instead of failing silently.

---

## 10. Consents

The schema's Consent step carries no fields, so consent text lives in
`config.php → consents`. Each entry has a `type` (the API's consent_type
integer), `version`, `required` flag, `label`, and `text`. Each one renders as a
checkbox; each accepted checkbox becomes a `consents[]` record stamped with
`consented_at`, `ip_address`, `user_agent`, `source_domain`, and
`signature_method: "click"` — the capture context the platform records for
audit. consent_type integers:

```
1=HIPAA  2=TCPA  3=SMS  4=Email  5=Terms  6=Telehealth
7=Controlled  8=Privacy  9=BAA  10=Disclosure  99=Custom
```

Add, remove, or reword consents entirely in config — no code change.

---

## 11. Products

The product step renders cards from `GET /telehealth/products?encounter_type_id=…`.
**Products are tenant- and encounter-type-dependent and may come back empty** (on
the demo tenant, GLP-1 returns no filtered products). The wizard handles an empty
list gracefully — it shows a note and lets the patient proceed, since many
encounter types don't gate intake on product selection. Selected product IDs are
sent as `products[]` of `{ product_id, quantity }`.

---

## 12. Payment

This example sends **no `payment` block**, and that's intentional: with no
payment block the API defaults to **prepaid / external billing**, so the basic
example submits cleanly without a payment gateway. That keeps the reference
implementation gateway-agnostic.

The unified intake endpoint supports a `payment{}` block with multiple modes for
when you're ready to collect payment. To add it:

1. Collect whatever your chosen mode needs in a step (e.g. a card token from your
   gateway's client-side SDK — **never** raw PAN through your server).
2. Pass it through `api.php → submit` into the `$extra` array, or extend
   `IntakePayloadBuilder::build()` to assemble a `payment` block.
3. Forward it as `payload['payment']`.

The supported modes (per the OpenAPI spec) cover prepaid/external (the default
when omitted), charging a stored method, deferred/invoice, and gateway-token
flows. Pick the one matching your billing model and shape the block accordingly.
Because the builder is the single source of payload logic, you add payment in one
place and every caller (UI, job, importer) gets it.

---

## 13. Switching encounter types

The header has a `<select>` that lists every encounter type from
`GET /telehealth/encounter-types`. Changing it re-bootstraps the whole wizard for
the new type — new schema, new steps, new fields, new products. The initial type
is `config.php → default_encounter_type_id` (GLP-1 on the demo). Other groups can
point the default at their own encounter type, or just use the switcher.

If you want to **lock** the form to a single type (e.g. embedding a GLP-1-only
form on a specific landing page), hide the switcher in `index.html` and set the
default — the rest works unchanged.

---

## 14. Going to production

1. **Real token.** Set `PRESCRIBE_RX_TOKEN` to a production token whose user type
   has the required abilities. Keep it in the environment / a secrets manager,
   not in source control.
2. **Base URL.** Point `PRESCRIBE_RX_BASE_URL` at your production API base
   (including the `/api/v1` suffix).
3. **Turn off sandbox.** Set `sandbox_mode => false` so encounters enter the real
   provider/billing/fulfillment workflow.
4. **Tenant routing.** If your token doesn't imply the tenant, set `client_id`
   and/or `sales_org_id` in config.
5. **CORS.** The proxy assumes same-origin. If you host the form on a different
   origin than `api.php`, set an explicit `Access-Control-Allow-Origin` allow-list
   in `api.php` — never reflect arbitrary origins.
6. **HTTPS.** Serve over TLS; the client verifies the API's certificate (TLS
   verification is on in `PrescribeRxClient`).

---

## 15. Security notes

- **The token never reaches the browser.** It lives in `config.php` / env and is
  read only by `api.php`. The browser only ever talks to your proxy.
- **The client can't dictate mapping.** `api.php` re-fetches the authoritative
  schema at submit time; the browser's role is limited to supplying raw values.
- **Uploads are validated server-side** (count, size, MIME) regardless of what
  the client claims.
- **Errors are relayed, not swallowed.** API 422s come back with the `errors{}`
  map so the wizard can highlight fields, but server/auth details aren't leaked
  beyond what's needed.

---

## 16. Known stubs & suggested extensions

These are intentional simplifications in the baseline. Each is a clean hook
point, not a rewrite:

- **Clinical search fields** (allergy/medication/condition) are free-text chip
  inputs. For a real patient experience, wire `chipInput` to the platform's
  lookup endpoints (e.g. medication/allergy/condition search) for typeahead with
  coded results, then store the codes instead of free text. The builder already
  routes these to `medical_history.*` — only the input control changes.
- **Signature pad** is aliased to file upload. Swap in a canvas-based signature
  widget that produces an image (or a structured signature payload) and register
  it as `RENDERERS[FT.SIGNATURE_PAD]`. The consent records already carry
  `signature_method`.
- **Styling** is a neutral baseline. The CSS variables at the top of
  `wizard.css` (`:root`) are the rebranding surface — set your colors, fonts, and
  spacing there before touching individual rules.
- **Validation** is the API's source of truth plus light client checks. If you
  want richer inline validation, read each field's `validation` block from the
  schema and enforce it in `validateStep`.

---

## 17. Field-type reference

`lib/FieldType.php` and the `FT` object in `wizard.js` mirror the API's
`field_type` enum. The full set:

```
1 Text          2 Email         3 Number        4 Phone        5 Date
6 Textarea      7 Password      8 URL           10 Select      11 MultiSelect
12 RadioGroup   13 RadioButtons 14 CheckboxGroup 15 ToggleSwitch 16 Yes/No
17 ToggleGroup  20 Typeahead    21 FileUpload   22 SignaturePad 23 Calendar
24 Time         25 DateTime     27 Range        28 Currency    30 AllergySearch
31 MedicationSearch 32 ConditionSearch 40 Height 41 Weight     42 BMI
43 BloodPressure 44 Address     45 FullName     46 HeartRate   47 Temperature
48 BloodGlucose  49 ScoredAssessment 50 TreatmentIndication 51 ConsentCheckbox
52 ProductSelection 53 DoseSelection 60 SectionHeader 61 Divider 80 Hidden
```

Keeping these two lists in sync (PHP + JS) is the one place a field type lives in
two files; both are simple constant maps, so adding a type is two one-line edits.
