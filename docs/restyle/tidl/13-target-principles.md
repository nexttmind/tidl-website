# Target principles — live site

## Where to read

- Tokens: `web/app/globals.css`, mirrored in `10-target-tokens.md`
- This folder otherwise is a 2024 archive. Do not implement visual language from it.

## Token binding

- Screens and components bind semantic roles from `:root`.
- Do not invent a parallel token layer or a second type stack.

## Type

- Display and UI are Inter. Overline and mono are Space Mono.
- Do not load Source Serif 4, Questrial, Canela, or Sohne on the consumer site.
- Display size uses `--font-display-scale` `1.4`.
- Button labels: title case. Nav labels: uppercase. Buttons are pills.

## Surfaces

- Page wash is cool bone `#f4f6f0` with the radial stack in `globals.css`. That is the light identity, not `#F5F2ED` cream.
- `--color-paper` is for raised surfaces, not the html wash.
- Primary action is steel `#405774`. Gold is an accent.
- Dark footer and dark heroes are inverse roles, not a dark theme.

## What is not the consumer system

- `/brand/peptide` is deleted. Marks and plates stay as merchandising assets, not a style-guide route.
- Marketing email is a night lockup for Klaviyo. It is not a public style guide. `/emails/*.html` is deleted.
- Theme field hex on a hero is that hero's atmosphere, not a second global palette to extract.

## Layout

- Sticky / global chrome with scrolling body.
- `.layout-frame` 1728. Do not add a second page max.
- Desktop is the unscoped default and is locked. New width queries use only `--bp-tablet` `721px` and `--bp-desktop` `1025px`. See `.cursor/rules/16-responsive.mdc`.

## Compliance

- No molecule or drug names on consumer-facing surfaces; goal framed, stack named.
- No celebrity or partner names in deliverables.
- No outcome claims without review; conditional language carries "if prescribed".
- Practitioner framed. Write "GLP 1" with a space.
- No PHI in this repo.
