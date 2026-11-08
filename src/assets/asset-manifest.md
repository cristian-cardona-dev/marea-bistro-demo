# Asset manifest — Marea V2 images

Purpose: compact reference for the integration agent. Lists every selected asset, its intended sections, source/license, format/aspect, and whether a credits.json entry should be added.

Generation status: COMPLETE. The four dish PNGs were user-provided and staged by the orchestrator into `src/assets/images/dishes/`. Existing licensed photos were parent-staged into `hero/`, `story/`, `gallery/`, `atmosphere/`. Shell copy/download was blocked in this session; no new downloads performed.

---

## dishes/ (user-provided AI-generated photographs — horizontal, native aspect kept)

| Filename | Subject | Sections | Source / creator / license | Format / aspect | Credit entry |
|---|---|---|---|---|---|
| `paella-de-marisco.png` | Paella de marisco — paellera with prawns, mussels, clams, calamari, lemon | menu dish card | AI-generated; user-provided; no third-party photographer/source/license | PNG / horizontal (landscape, native aspect kept) | No — illustrative, fictional Marea |
| `lubina-a-la-brasa.png` | Lubina a la brasa — whole grilled sea bass, lemon, grilled vegetables | menu dish card | AI-generated; user-provided; no third-party photographer/source/license | PNG / horizontal (landscape, native aspect kept) | No — illustrative, fictional Marea |
| `ensalada-de-pulpo.png` | Ensalada de pulpo — grilled octopus, potatoes, pimentón, parsley | menu dish card | AI-generated; user-provided; no third-party photographer/source/license | PNG / horizontal (landscape, native aspect kept) | No — illustrative, fictional Marea |
| `crema-catalana.png` | Crema catalana — caramelized crust in earthenware ramekin | menu dish card | AI-generated; user-provided; no third-party photographer/source/license | PNG / horizontal (landscape, native aspect kept) | No — illustrative, fictional Marea |

Prompts used: see `src/assets/images/dishes/asset-prompts.md`. Dimensions: keep native generated resolution; do not resize/crop to portrait. Astro `astro:assets` (Sharp-backed) handles build-time responsive optimization.

Editorial grade confirmed on all four: warm ivory + deep teal + restrained terracotta, natural light, no brand logos/text, labeled illustrative (Marea is fictional).

---

## hero/ (parent-staged; credit record already in integration target credits.json)

| Filename | Subject | Sections | Source / creator / license | Format / aspect | Credit entry |
|---|---|---|---|---|---|
| `mediterranean-sea-view.jpg` | Tranquil Mediterranean sea view, clear skies | hero sea/coast interlude | Pexels — Vincent Rivaud — Pexels License (record in integration target `public/images/credits.json`) | JPEG / portrait | Already in target credits — do not duplicate |

Pointer only: existing target record `pexels:32727471`, page `https://www.pexels.com/photo/tranquil-mediterranean-sea-view-with-clear-blue-skies-32727471/`.

---

## story/ (parent-staged; credit record already in integration target credits.json)

| Filename | Subject | Sections | Source / creator / license | Format / aspect | Credit entry |
|---|---|---|---|---|---|
| `table-ceramics-linen.jpg` | White crockery on table top, ceramics + linen | culinary story interlude | Pexels — cottonbro studio — Pexels License (record in integration target `public/images/credits.json`) | JPEG / portrait | Already in target credits — do not duplicate |

Pointer only: existing target record `pexels:6739706`, page `https://www.pexels.com/photo/white-crockery-on-table-top-6739706/`.

---

## gallery/ (light asymmetric collage; parent-staged)

| Filename | Subject | Sections | Source / creator / license | Format / aspect | Credit entry |
|---|---|---|---|---|---|
| `marea-octopus-elegant.jpg` | Sharp grilled octopus on elegant plate | gallery collage | Pexels — Deane Bayas — Pexels License (record in integration target `public/images/credits.json`) | JPEG / portrait | Already in target credits — do not duplicate |
| `mediterranean-market-stall.jpg` | Vibrant Italian market stall, fresh produce | gallery / story interlude | Pexels — Paula Conde Sanchez — Pexels License (record in integration target `public/images/credits.json`) | JPEG / portrait | Already in target credits — do not duplicate |

Pointers only: existing target records `pexels:39452706` and `pexels:39139756`.

Already in clean baseline `public/images/` (CC BY-SA via Wikimedia Commons, already in baseline credits.json): `gallery-market.jpg` (Diego Delso, CC BY-SA 4.0), `albufera-gaianes.jpg` (Joanbanjo, CC BY-SA 3.0), `gallery-coast.jpg`, `gallery-octopus.jpg`, `gallery-tiles.jpg` (local, source to verify).

---

## atmosphere/ (parent-staged; credit record already in integration target credits.json)

| Filename | Subject | Sections | Source / creator / license | Format / aspect | Credit entry |
|---|---|---|---|---|---|
| `fresh-ingredients-slate.jpg` | Fresh Mediterranean ingredients on slate | atmosphere / menu detail | Pexels — Gundula Vogel — Pexels License (record in integration target `public/images/credits.json`) | JPEG / landscape | Already in target credits — do not duplicate |

Pointer only: existing target record `pexels:32356156`, page `https://www.pexels.com/photo/fresh-mediterranean-ingredients-on-slate-32356156/`.

---

## Notes / decisions

- Four dish PNGs are user-provided AI-generated images; added as four records in `credits-additions.json` with source type "AI-generated; user-provided; no third-party photographer/source/license" and `creditRequired: false`. No generator version or photographer credit invented.
- Pexels photo credits are NOT duplicated in `credits-additions.json`; they already exist in the integration target's `credits.json`. Manifest keeps source-page/license pointers only.
- No components, `site.ts`, global CSS, or motion touched. No build/tests/lint/install. No additional downloads.
