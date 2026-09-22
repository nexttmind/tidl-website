> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Gap report — tidl — 2026-08-06

## Summary
- Variables missing in code export: space/radius ladders partially present in `globals.css`
- Components missing for category: mobile nav drawer, search molecule, filter sheet
- Components for PDP: all primary patterns exist in Figma; code stubs built this pass
- Variants/states missing: Select Open/Filled polish; gallery lightbox
- Patterns missing: dedicated How-it-works molecule (assembled Feature Row style)
- Blockers for in-scope pages: none under stub-and-list

## Variables
| Role needed | Suggested name | Type | Modes | Used on | Priority |
| --- | --- | --- | --- | --- | --- |
| Space ladder px export | space/* | number | light | all | P1 |
| Radius semantic export | radius/card, radius/control | number | light | cards, buttons | P1 |
| Promo callout surface | surface/promo | color | light | Promo Callout | P2 |
| Trust check fill | status/success | color | light | Trust Badge | mapped |

## Components
| Role | Suggested name | Variants | States | Props | Used on | Priority | Stub? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile nav drawer | Organism/Nav Drawer | open/closed | | | Category, PDP | P0 | yes |
| Search | Molecule/Search | | | | Nav | P1 | yes |
| Filter sheet | Organism/Filter Panel | | | facets | Category | P1 | yes |
| Select Open state | Atom/Select | Open, Filled | | | PDP plan | P1 | closest Default |
| Gallery lightbox | Molecule/Product Image Gallery | lightbox | | | PDP | P2 | thumb switch only |
| How it works steps | Molecule/Process Step | | | | PDP | P1 | assembled |
| Promo glyph | Atom/Icon | | | | Promo Callout | P2 | text mark |
| Care Dial pattern | Pattern/Care Dial | Desktop\|Mobile | area/provider selected | areas, providers, CTA | Home | P1 | yes |
| Care area list item | Molecule/Care Area Item | Default\|Selected | | icon, label | Care Dial | P1 | yes |
| Care Team list item | Molecule/Care Team Card (list) | Default\|Selected | | avatar, name | Care Dial | P1 | yes |
| Avatar | Atom/Avatar | sizes | | initials/src | Care Dial | P1 | yes |

## Patterns / sections
| Pattern | Composition notes | Page types | Priority |
| --- | --- | --- | --- |
| Category page assembly | Nav + Category Hero + strip + carousels + footer | Category | P0 |
| PDP page assembly | Nav + Product Detail + Benefits + BMI + Quality + FAQ + CTA + footer | PDP | P0 |

## Compromises accepted
| Decision | Risk | Revisit when |
| --- | --- | --- |
| Source molecule URL rebuilt as `/stacks/transformation` | Path parity lost | Accept; compliance |
| Figma PDP sample copy had molecule names; fixtures use stack language | Differs from Figma paint copy | Figma content pass |
| Testimonials omit weight outcomes | Less “dramatic” than source | Legal-cleared quotes |
| Plan select uses supply intervals, not mg titration | Less clinical specificity | Portal / Rx surfaces |
| BMI is client educational tool only | Not clinical decisioning | Keep disclaimer |
| Fonts: Source Serif 4 + Inter + Space Mono via Google | May differ from Canela/Sohne | Licensed fonts available |
| Omit LegitScript on site | Differs from source footer | Correct per compliance |

## Ready-for-Figma checklist
- [ ] Publish numeric space/radius variable tables
- [ ] Build mobile Nav Drawer component
- [ ] Build Search molecule
- [ ] Build Filter Panel organism
- [ ] Promote How-it-works steps to named molecule
- [ ] Replace molecule sample strings in Pattern/Product Detail Page with stack fixtures
- [ ] Add Select Open/Filled variants if not production-ready
