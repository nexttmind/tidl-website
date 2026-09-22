# Product catalog: marketing vs post login sellables

Status: working draft for launch
Audience: Nav, ops, design, engineering
Source: Apex Peptide Price Sheet, PrescribeRx / LocumTele guidance,
Andrew calls, FDA compounding posture research (Aug 2026), TIDL compliance rules.

## Surface rules

Two catalogs. Do not collapse them.

| Surface | What you show | What you name |
|---|---|---|
| Landing, category, public PDP, pre login menu | Goal framed treatments, programs, stacks, pen / tablet imagery | Never molecule or drug names |
| Logged in portal after clinical review | Formulary cards, doses, vial / tablet variants | Named compounds and blends, if prescribed |

Conditional copy always carries "if prescribed". Practitioner framed.
No outcome claims without legal and medical review.
No compoundable molecule on any surface until PrescribeRx confirms status in writing.

GLP 1 is written with a space.

---

## Part A. Public marketing set (landing + PDPs)

These are the only product families merchandised on the open site.
Each maps to a treatment or program page and a clinical encounter entry.
Public PDPs sell the care protocol / stack story, not a named molecule.

### Health goals (treatment pages)

| Public label | Route | Public media | Clinical entry |
|---|---|---|---|
| Weight Loss | `/treatments/weight-loss` | Lifestyle + oral tablet thumb (sage oval) | GLP 1 screening |
| Sexual Health | `/treatments/sexual-health` | Lifestyle + oral tablet thumb (diamond) | Men's sexual health ED assessment |
| Men's Health | `/treatments/testosterone` | Lifestyle + oral tablet thumb (cream round) | Male TRT consult (video) |
| Women's Health | `/treatments/womens-balance` | Lifestyle only (no oral thumb yet) | Female HRT (video) |
| Skin and Hair | `/treatments/skin-and-hair` | Lifestyle + oral tablet thumb (hex shield) | Peptide assessment |
| Recovery and Performance | `/treatments/recovery-and-performance` | Lifestyle | Peptide assessment |

### Care protocols / archetypes (program and stack pages)

| Public label | Route |
|---|---|
| CEOs and Executives | `/programs/ceos-and-executives` |
| Creators and Builders | `/programs/creators-and-builders` |
| Parents | `/programs/parents` |
| Athletes | `/programs/athletes` |
| Jetlag Recovery | `/programs/travelers` |
| Healthspan | `/programs/healthspan` |
| Mind and Body Transformation | `/stacks/transformation` |

### Launch performer row (landing catalog cards)

Four cards only on the home catalog strip:

1. Weight Loss
2. Sexual Health
3. Men's Health
4. Skin and Hair

"Start with a health goal" keeps a lifestyle thumbnail.
Performer thumbs use TIDL branded oral tablet art (no molecule imprint).

### What public PDPs may include

- Goal framed headline and short body
- Protocol / stack name
- Price framing as care or membership where approved
- Pen imagery for testosterone and GLP 1 paths
- Oral tablet imagery for weight, sexual health, men's adjuncts, hair (goal framed)
- "If prescribed" and physician guided language
- CTA into clinical intake

### What public PDPs must not include

- Molecule or brand drug names (semaglutide, sildenafil, BPC-157, NAD+, and so on)
- "Generic", clinical equivalence to approved brands, or FDA approved compound claims
- Outcome guarantees
- Wolverine or other do not compound / gray list naming

---

## Part B. Post login formulary (after doctor review)

Named compounds surface only after account + clinical review in the patient portal.
Patient selects a class or protocol; provider sets dose. Fulfillment routes through
PrescribeRx pharmacy network.

Assumption for this draft: Apex sheet items that are not on the hard exclude list
are in scope if Andrew / pharmacy counsel confirms compounding for the TIDL tenant.
Pen format at launch: testosterone and GLP 1 only.

### Weight / metabolic

Prefer FDA approved product dispense where possible. Routine mass compounded copies of
semaglutide or tirzepatide are not a clean launch SKU after shortage end.

| Compound | Form | Notes |
|---|---|---|
| Semaglutide | Approved pen / oral (Rybelsus, oral Wegovy) first | Compounded only if patient specific need |
| Tirzepatide | Approved pen first | Compounded only if patient specific need |
| Liraglutide | Approved pen if network carries | |
| Orforglipron | Oral capsule if network carries | |
| Cagrilintide | Injectable vial | Confirm with pharmacy |
| AOD-9604 | Injectable vial | Apex |

### Men's health / TRT

Video consult. Controlled substance rules apply.

| Compound | Form | Notes |
|---|---|---|
| Testosterone cypionate | Oil vial | Pen candidate |
| Testosterone enanthate | Oil vial | Pen candidate |
| Testosterone cream / gel | Topical | |
| Enclomiphene | Oral tablet | Adjunct |
| Anastrozole | Oral tablet | Adjunct |
| hCG | Injectable vial | Adjunct if pharmacy carries |
| Gonadorelin | Injectable vial | Apex |

### Women's health / HRT

| Compound | Form | Notes |
|---|---|---|
| Network HRT formulary | Per pharmacy | Exact SKUs from Andrew; not yet named on public site |

### Sexual health

| Compound | Form | Notes |
|---|---|---|
| Sildenafil | Oral tablet | |
| Tadalafil | Oral tablet | |
| Vardenafil | Oral tablet | |
| Avanafil | Oral tablet | |
| PT-141 (bremelanotide) | Injectable / brand Vyleesi path | Prefer approved path where indicated |
| Oxytocin | Nasal or vial | Apex |

### Skin and hair

| Compound | Form | Notes |
|---|---|---|
| Minoxidil | Topical and / or oral | |
| Finasteride | Oral and / or topical | |
| Dutasteride | Oral and / or topical | |
| Spironolactone topical | Topical | If pharmacy carries |
| GHK-Cu | Topical / non injectable only | Injectable route is not cleared |

### Cellular / longevity

| Compound | Form | Notes |
|---|---|---|
| NAD+ | Injectable vial | Apex; Category 1 posture |
| Glutathione | Injectable vial | Confirm stock; not on Apex sheet |
| VIP | Injectable / nasal | If pharmacy stocks |

### Growth hormone / body composition peptides

Singles and Apex blends without BPC / TB500.

| Compound | Form |
|---|---|
| Sermorelin | Injectable vial |
| Tesamorelin | Injectable vial |
| Ipamorelin | Injectable vial |
| CJC-1295 (no DAC) | Injectable vial |
| Hexarelin | Injectable vial |
| MGF (non PEG) | Injectable vial |
| Tesamorelin / Ipamorelin blends | Injectable vial |
| CJC / Ipamorelin blends | Injectable vial |
| Tesamorelin / Ipamorelin / MGF blends | Injectable vial |

### Immune / recovery (no BPC / TB500)

| Compound | Form |
|---|---|
| Thymosin Alpha-1 | Injectable vial |
| Thymalin | Injectable vial |
| TA1 / Thymulin complex | Injectable vial |
| SS-31 | Injectable vial |
| Selank | Injectable vial / nasal |
| ARA-290 | Injectable vial |
| Curcumin vial | Injectable vial if pharmacy carries |

### Accessories

| Item | Form |
|---|---|
| Bacteriostatic water | Vial |
| Syringes | Device |

### Confirm with Andrew before locking (Apex adjacent, not hard blocked)

| Compound | Why held |
|---|---|
| IGF-1 LR3 | Confirm compounding path |
| Follistatin 344 | Confirm |
| FOXO4-DRI | Confirm |
| BDNF | Confirm |
| Cardiogen / Cartalax / PE-22-28 | Confirm |
| SLU-PP-332 / SR9009 / Tesofensine / 5-Amino-1MQ | Confirm |
| GHRP-2 | Trackers flag; counsel |
| WLB Slim / Trim / Renew vials | Obfuscated GLP style; do not market as copy |

---

## Part C. Explicitly not on TIDL at launch

Keep off public site and off TIDL portal until FDA final action and PrescribeRx writeup.

| Item | Reason |
|---|---|
| BPC-157 (any form) | Gray / not Category 1 authorized |
| TB-500 / Thymosin Beta-4 fragment | Same |
| Wolverine blend | Do not compound on TIDL; separate business path |
| GLOW / KLOW blends | Contain BPC / TB500 |
| MOTS-c | Gray PCAC track |
| KPV | Gray PCAC track |
| Epitalon | Gray PCAC track |
| Semax | Gray PCAC track |
| DSIP / Emideltide | Gray PCAC track |
| Melanotan II | Gray / Feb 2027 PCAC |
| Injectable GHK-Cu | Not Category 1 for injectable |
| LL-37 / PEG-MGF / Dihexa | Later PCAC track |
| MK-677 | Category 2 |
| Kisspeptin | Category 2 |
| Oral BPC / Brain Blend | Contains blocked agents |
| Routine mass compounded sema / tirze copies | Shortage exception ended |

---

## Part D. Journey map

```
Public marketing (goal / stack / lifestyle)
  → Clinical intake for that encounter type
  → Account create / log in
  → Provider review
  → Portal formulary: named compounds for that path
  → Checkout / Rx / pharmacy fulfillment
```

Async covers most peptide, GLP 1, and ED paths.
TRT and HRT require video.

---

## Part E. Open locks

1. PrescribeRx written SKU allowlist for the TIDL tenant (replaces Apex assumption).
2. Women's Health named HRT compounds for portal.
3. Confirm glutathione and VIP stock.
4. Confirm GHK-Cu topical only fulfillment.
5. Confirm pen fill pharmacies for testosterone and GLP 1.
6. Allison LegitScript guide before paid ads (site can launch without it).

Until item 1 lands, treat Part B as the working formulary wishlist and Part A as the only public merchandising set.
