# ApiSave — M2 Validation Report, Round 2

**Prepared for:** Nordine
**Model:** `gemini-3.6-flash`
**Change tested:** removal of `Q3_morphologie.incompatibilites_visibles` (Root Cause A from Round 1)
**Date:** 2026-08-09

---

## Summary

**Good news first: Root Cause A is confirmed fixed.** Photos #2 and #7, which failed Round 1 with a hard validation crash caused by the ambiguous field, now pass cleanly. That confirms the diagnosis was correct and the fix worked exactly as intended.

**The overall count is still 3/10** — but not for the same reasons as Round 1, and reading it as "no progress" would be misleading. Removing the ambiguous field cleared out one failure mode entirely and, in doing so, gave a clean look at the reference set for the first time — which surfaced two further reliability patterns that were previously obscured by Root Cause A, plus confirmed something important: **some of this variance is coming from the vision model itself giving different answers to the same photo on different calls**, not from anything in the code.

I have not made further code changes this round. Both new patterns involve a real trade-off and deserve your decision before I touch anything.

---

## Confirmed: Root Cause A is resolved

| Photo | Round 1 | Round 2 |
|---|---|---|
| #2 | Validation error | ✅ `ORANGE_PROBABLE_NON_CIBLE` |
| #7 | Validation error | ✅ `ORANGE_PROBABLE_NON_CIBLE` |

No trace of the old error pattern anywhere in this run. That specific bug is closed.

---

## New pattern 1 — the model doesn't always tag the full wasp/Polistes signature

My Non-Target Hymenoptera rule looks for a **specific pair** of tags together (`silhouette_fine_allongee` + `proportions_greles_non_robustes`), per your spec, matching exactly what the wasp/Polistes lock is supposed to add. In this run:

- **Photo #5**: previously matched correctly. This time, Gemini's description still reads as a clear wasp ("silhouette élancée avec proportions grêles et pattes claires") but it only tagged `proportions_greles_non_robustes` — not `silhouette_fine_allongee`. My rule requires both, so it missed, and the case fell through to a generic incompatibility count that resolved to VERT instead.
- **Photo #3 and #10**: similar — the description text is consistent with a wasp, but the specific tag pair isn't fully present, and in #10 even the thorax reading (Q1) came back differently than in Round 1's run of the same image.

This is not the field-confusion bug from Round 1 — that's fully gone. This is the model being inconsistent about which subset of the four specified tags it actually writes down, even when its own description text is clearly describing a wasp.

**Decision needed:** my rule currently requires the exact pair. I could loosen it to fire on *any one* of the four wasp/Polistes-specific tags, which would catch more of these cases — but it also lowers the bar for what counts as "clearly a wasp," which trades detection reliability for a small increase in false-positive risk on borderline cases. I'd like your view on where that line should sit before changing it.

## New pattern 2 — European hornet routing can't fire when morphology reads "NON"

**Photo #6** is the clearest example: Gemini reported very strong European-hornet coloring (4 separate crabro-associated tags — about as unambiguous chromatically as this gets) with `Q1=NON` and `Q2=NON` exactly as expected. But it also marked `Q3_morphologie = NON` (its morphology reading), and the routing to `ORANGE_PROBABLE_NON_CIBLE` requires `Q3` to be `OUI` or unreadable — never `NON` — before it will even consider the chromatic evidence. With `Q3=NON`, the case instead falls through to a generic "several incompatibilities, therefore not the target species" result, which lands on VERT.

**This isn't something introduced this milestone** — that `Q3` condition existed in the original code, before any of our changes; the tightened threshold from earlier in M2 only changed how many chromatic markers are needed, not this condition. It simply hasn't been visible until now because this is the first time we've tested it against real European hornet photos where the model's morphology reading disagrees with its color reading.

**Decision needed:** should overwhelming chromatic evidence (e.g. 3+ crabro-associated markers) be enough to route to the non-target verdict even when `Q3=NON`? The tension is the same shape as photo #1 from Round 1: loosening this helps European hornets get classified correctly, but the same kind of loosening, applied carelessly, is exactly what could let a real Asian hornet slip through if its morphology were ever misread. I don't want to make this call unilaterally — it's a real detection-logic trade-off, not a bug fix.

## New pattern 3 — confirmed model non-determinism, unrelated to any of our changes

**Photo #9** — the Asian-hornet control case that matched cleanly in every prior run — failed this time on a schema validation error: the model wrote `proportions_robustes` instead of the valid `proportions_compactes_robustes`. **Photo #1** did the same with a different near-miss value. Neither of these fields were touched by this round's change. This is the model giving a slightly different (and in these two cases, invalid) answer to the exact same photo it answered correctly before.

I'd treat this as expected variance rather than something to chase — and it's a direct, concrete illustration of exactly why you asked for repeated-run stability testing on critical categories as part of M4. This is that need showing up in real data.

---

## Photo #1, tracked as requested

Per your instruction, #1 stayed in the set unchanged. This run it hit a different (new) validation error than Round 1's mismatch — another data point for the pattern above, not a new separate issue. No action taken on it, as agreed.

## Photo #8, as agreed

Still `ORANGE_PLAFOND`, as expected and accepted.

---

## Full results this round

| # | Photo | Result | Expected | Match | Cause |
|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | validation error (`proportions_robuste_compacte`) | ORANGE_PROBABLE_NON_CIBLE | ❌ | Model variance (tracked, no action per your request) |
| 2 | ref_image_02.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | Root Cause A — now fixed |
| 3 | ref_image_03.jpg | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | New pattern 1 — partial tagging |
| 4 | ref_image_04.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | — |
| 5 | ref_image_05.jpg | VERT | ORANGE_PROBABLE_NON_CIBLE | ❌ | New pattern 1 — partial tagging |
| 6 | ref_image_06.jpg | VERT | ORANGE_PROBABLE_NON_CIBLE | ❌ | New pattern 2 — Q3=NON lockout |
| 7 | ref_image_07.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | Root Cause A — now fixed |
| 8 | ref_image_08.jpg | ORANGE_PLAFOND | ORANGE_PROBABLE_NON_CIBLE | ❌ | Accepted per your decision |
| 9 | ref_image_09.jpg | validation error (`proportions_robustes`) | ROUGE | ❌ | Model variance (control case) |
| 10 | ref_image_10.jpg | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | New pattern 1 — partial tagging |

Full raw JSON for every image is in `test_images_2/report.json`.

---

## What I need from you

1. **New pattern 1**: loosen the wasp/Polistes rule to fire on any one of the four specified tags instead of requiring the exact pair — yes or no, and if partially, which combination you'd want.
2. **New pattern 2**: should strong chromatic evidence (3+ crabro markers) be able to route to the non-target verdict even when `Q3=NON`, or should `Q3=NON` remain a hard stop regardless of chromatic signal?
3. No action needed on pattern 3 (model variance) — noting it as expected and relevant to M4.

I've deliberately not touched either of the two new patterns yet, given both are real detection-logic trade-offs rather than clear-cut bugs.
