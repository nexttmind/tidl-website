> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Content model

Consumer fixtures: goal framed, stack named. No molecule names (compliance).
Prices sourced from Apex Peptide Price Sheet blend rows in `assets/` (gitignored).
SKU ↔ clinical formula mapping stays with clinical ops / PrescribeRx, not on this surface.

| Slot id | Type | Sample | Notes |
| --- | --- | --- | --- |
| category.ticker | text | Free shipping on orders over $150 | |
| category.hero.title | text | Stacks | |
| category.hero.body | text | Physician guided… if prescribed | Conditional framing |
| category.subcats[] | list | Executives, Athletes, Transformation, Parents, Creatives, Legacy | Archetypes |
| category.products[] | list | name, meta, price | Stack names + "if prescribed" |
| category.*.title | text | Section titles | Goal framed, no outcome claims |
| category.assist.* | text | Consult CTA | |
| category.reading[] | list | Editorial | Flow pen / physician guided |
