# Brief — tidl

> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

- Source: Live URL(s) provided per turn (structure capture). Figma page also holds example assemblies and patterns.
- Target Figma: https://www.figma.com/design/jVfEjwKeDW2jUAW2lD64gK/TIDL.com?node-id=315-2479
  - fileKey: `jVfEjwKeDW2jUAW2lD64gK`
  - page: `Z · TIDL Website for Cursor` (`315:2479`)
  - Related file (Daybreak Fields brand): `KcKa8zfPY1IArc8QP9d1rW` (not the rebuild target unless needed for primitives)
- Output app/path: Greenfield Next app at `web/`
- Scope pages: Only URLs you send. Do not expand to full IA without ask.
  - In scope: Product category — https://www.aesop.com/hand-and-body.html → `/stacks`
  - In scope: Product detail — https://www.goodlifemeds.com/products/tirzepatide → `/stacks/transformation`
  - In scope (section): Staging home Care Dial — https://tidldemo2.netlify.app/ `#journey` → `/` `LandingCare`
- Content policy: keep source structure; rewrite consumer copy to TIDL voice and compliance (goal framed, stack named; no molecule names; no outcome claims; GLP 1 with space; conditional if prescribed)
- Media mode: placeholders
- Themes: Light only (DS constraint). Footer and some sections are always dark/inverse surfaces, not a dark mode.
- Interaction depth: Page rebuilds first (hover/focus). FAQ expand, gallery thumbs, BMI calculate wired as light prototype. Forms, modals, multi-step: inventory now, wire in prototype phase. See Flow policy below.
- Gap policy: stub-and-list
- Round-trip Figma: later (separate thread / code-to-figma-audit)
- Artifact root: `docs/restyle/tidl/`

## Flow policy (recommended)

Do not invent a global IA map before pages exist. Sequence:

1. Per URL: capture structure (sections, CTAs, overlays spotted on that page).
2. Log every modal / drawer / multi-step as a pattern role in `07-interaction-notes.md`, mapped to DS organisms already on the canvas (`Organism/Modal`, `Pattern/Assessment Modal`, FAQ accordion, etc.).
3. After two or more pages exist in code: write `09-flow-map.md` (trigger → destination: route vs modal vs same-page expand). That is the prototype wiring brief.
4. Motion and prototype stringing stay later phases, as planned.

Default overlay grammar from the DS:

| Need | Use |
| --- | --- |
| Confirm / info / form overlay | `Organism/Modal` — Size Medium\|Large\|Mobile × Image Yes\|No × Type Standard\|Form |
| Multi-step assessment / intake in overlay | `Pattern/Assessment Modal` (progress steps + form atoms) |
| FAQ expand | `Molecule/FAQ Accordion Item` |
| Category expand / notecard | `Molecule/Notecard *` Default\|Expanded |
| Full account experience | `Pattern/Account Portal` (route, not modal) |

Known DS gaps that affect flows (from Figma roadmap): mobile nav drawer, Textarea, Switch, Tooltip, Dropdown, Toast, Tab, Spinner, Search, Alert/Banner. Stub if a source URL needs them.

## Status

Folder is closed as a visual source. Keep for IA and flow history only.

- [x] Phase 0 intake
- [x] Phase 2 DS ingest (v0 artifacts)
- [x] Phase 1 source URL capture (Hand & Body + Good Life PDP)
- [x] Phase 3 semantic map + gap report
- [x] Phase 4–6 scaffold + category rebuild + browser check
- [x] Phase 4–6 PDP rebuild (`/stacks/transformation`) + browser check
- [x] Phase 1+5 Care Dial (`#journey` → `LandingCare`) interactive rebuild
- [ ] Motion / prototype wiring (later)
- [ ] code-to-figma-audit (separate thread)
