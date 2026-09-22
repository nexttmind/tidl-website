> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Target components — TIDL Web DS

Canvas: `315:2479`. Inventory from top-level frames + roadmap (`316:3381`) + Component Library frame (`346:1459`). Descriptions exist on components for agent use.

Counts (roadmap): ~90 components · 16 atoms · ~50 molecules · ~20 patterns · 2 organisms · 2 media.

## Atoms (documented on canvas)

| Component | Node | Variants / states | Notes |
| --- | --- | --- | --- |
| Atom/Button | `316:3051` | Style: Primary, Secondary, Tertiary, Ghost × State: Default, Hover, Pressed, Focus, Disabled | Primary CTA. Title case labels. Ghost for dark/image only. |
| Atom/Link | `316:3060` | | |
| Atom/Chip | `316:3065` | | |
| Atom/Input | `316:3076` | | |
| Atom/Nav Link | `316:3083` | | |
| Atom/Select | `324:2814` | | |
| Atom/Pagination Dot | `330:845` | | |
| Atom/Selection Chip | `330:3522` | | |
| Atom/Radio Option | `330:3528` | | |
| Atom/File Upload Zone | `330:3535` | | |
| Atom/Progress Step | `330:3630` | | |
| (+ roadmap) Divider, Avatar, Check List Item, Value Point, TIDL Logo Lockup | | | See `02 · Component Library` |

## Molecules (selected; full list in Figma Component Library)

| Component | Node | States | Notes |
| --- | --- | --- | --- |
| Molecule/Notecard Executive…Legacy | `315:2590`–`315:2708` | Default, Expanded | Six archetype cards |
| Molecule/Category Section | `315:2776` | Category=Executive\|Athlete\|Transformation\|Parents\|Creative\|Legacy | |
| Molecule/FAQ Accordion Item | `324:2706` | | |
| Molecule/FAQ Nav Item | `324:2712` | | |
| Molecule/Benefit Row | `345:1451` | | |
| (+ roadmap) Section Header, Form Field, Footer Column, Breadcrumb, Testimonial Card, Product Card, Care Team Card, Editorial Notecard, Product Notecard, Order Summary, Clinical Summary, Progress Tracker, Trust Badge, … | | | |

## Organisms

| Component | Node | Variants |
| --- | --- | --- |
| Organism/Modal | `322:3006` | Size=Medium\|Large\|Mobile × Image=Yes\|No × Type=Standard\|Form |
| Modal Overlay | (with Modal) | Backdrop |

Also: `Modal Assembly Example` `324:323`

## Media

| Component | Node | States |
| --- | --- | --- |
| Media/Pen Video | `315:2733` | Paused, Playing |
| Media/Product Image TIDL Pen | `336:3667` | |
| brand/bg-dark-dynamic | `322:2929` | |

## Patterns (section / page shells)

| Pattern | Node |
| --- | --- |
| Pattern/Header | `322:2864` |
| Pattern/FAQ Page | `324:2718` |
| Pattern/Category Hero | `326:394` |
| Pattern/Product Carousel | `326:419` |
| Pattern/Complementary Products | `326:475` |
| Pattern/CTA Banner Wide | `326:526` |
| Pattern/Product Feature Two-Up | `326:534` |
| Pattern/Split Content Block | `326:560` |
| Pattern/Product Cards + Editorial | `326:565` |
| Pattern/Editorial CTA Strip | `326:607` |
| Pattern/Recommended Reading | `326:622` |
| Pattern/BMI Calculator Section | `327:3137` |
| Pattern/Quality Tested Section | `327:3195` |
| Pattern/Product Showcase Section | `327:3284` |
| Pattern/Product Carousel Hero | `328:3194` |
| Pattern/Clinically-Backed Section | `329:877` |
| Pattern/Account Creation Section | `330:1121` |
| Pattern/Assessment Modal | `330:3620` |
| Pattern/Account Portal | `330:4020` |
| Pattern/Video Hero Section | `341:1319` |
| Pattern/Benefits Section | `341:1352` |
| Pattern/Product Detail Page | `341:1427` |
| Pattern/CTA Band | `342:1379` |
| Pattern/Feature Row | `342:1386` |
| Pattern/Hero | `342:3748` |
| Pattern/Footer Global | `342:3772` |
| Pattern/Nav Global | `342:3790` |
| Pattern/Proof Strip | `342:3797` |
| Pattern/Content Prose | `342:3802` |
| Pattern/Ticker Bar | `342:3837` |

## Doc / system frames

| Frame | Node |
| --- | --- |
| 00 · System Roadmap | `316:3381` |
| 01 · Foundations | `316:2687` |
| 02 · Component Library | `346:1459` |
| 03 · Patterns · Responsive | `316:3172` |
| 04 · Category Section · Interaction Spec | `322:2678` |
| _example / Landing Page Assembly | `316:3310` |
| tidl.com landing page (legacy assembly) | `315:2481` |

## Gaps (from roadmap — treat as stub list)

- Mobile menu drawer
- Textarea, Switch
- Tooltip, Dropdown Menu, Toast
- Tab
- Spinner
- Icon wrapper + icon library
- Search bar
- Alert/Banner
- Pricing Card pattern
- Full social proof section assembly
- Intake flow screens (8 steps + exclusion + confirmation) not rebuilt in Figma
- Landing page not fully rebuilt from instances only
