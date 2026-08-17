# ApiSave — M2 Validation Report, Round 4

**Prepared for:** Nordine
**Model:** `gemini-3.6-flash`
**Change tested:** `Q3_morphologie.elements_visibles` field-separation clarification (prompt only — no schema, Judge, or expected-outcome changes)
**Date:** 2026-08-09

---

## Summary

**9 of 10 matched — up from 6/10 in Round 3.**

- **Photo #3**, the case that motivated this round's fix, now resolves cleanly: `silhouette_fine_allongee` correctly landed in `incompatibilites_cible`, and `elements_visibles` came back empty as instructed. No validation error. First real-data confirmation the clarification works.
- **Photos #2, #6, #7** — all now correct via the crabro override, each with 3 distinct chromatic markers this round.
- **Photo #1 — flipped to correct after being wrong three rounds straight.** This is the more important finding than the score. See below.
- **Photo #10 remains the sole miss — 0 for 4 across every round so far.**

Full raw JSON for this round is in `test_images_2/report.json`. I have made no further code changes beyond the single field-separation clarification you approved.

---

## Photo #1: revising my Round 3 read of this case

In Round 3, I described photo #1 as "a stable, repeatable characteristic of this specific photo" based on three consecutive identical (wrong) readings. This round, with no code change affecting this photo's logic path since Round 3, it returned the correct reading: `Q1=NON`, `Q2=NON` (reddish/orange, not dark), three crabro markers, correctly routed to `ORANGE_PROBABLE_NON_CIBLE`.

I was wrong to lean toward "stable" off three data points, and I want to say that plainly rather than quietly move past it. What this actually shows is that three samples isn't enough to distinguish "the model is systematically biased on this photo" from "the model is variable on this photo and happened to land the same way three times." That distinction matters directly for your question about repeated-run testing — it's part of why I'd recommend M4's stability runs use more than 3–5 repeats for any case being used to draw a real conclusion, not fewer.

## Photo #10: now the standout case

Across all four rounds, this photo has never once produced the tag combination needed to reach the correct verdict — it's the only image in the set with a 0-for-4 record. Every round, the model tags at most one supporting marker (`rayures_jaune_noir_vif`) and never a core morphological tag, even though its own description text has repeatedly mentioned fine/striped characteristics. This is a more concerning, more persistent pattern than photo #1 turned out to be, and it's the central piece of evidence in the assessment document also attached to this message.

---

## Full results this round

| # | Photo | Result | Expected | Match |
|---|---|---|---|---|
| 1 | ref_image_01.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ (flipped from 3 consecutive misses) |
| 2 | ref_image_02.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 3 | ref_image_03.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ (field-separation fix confirmed) |
| 4 | ref_image_04.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 5 | ref_image_05.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 6 | ref_image_06.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 7 | ref_image_07.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 8 | ref_image_08.jpg | ORANGE_PLAFOND | ORANGE_PLAFOND | ✅ |
| 9 | ref_image_09.jpg | ROUGE | ROUGE | ✅ |
| 10 | ref_image_10.jpg | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ |

**Score trend across all four rounds: 3/10 → 3/10 → 6/10 → 9/10.**

---

See the accompanying engineering assessment document for what this data does and doesn't tell us about M3/M4's realistic outcomes, and direct answers to your specific questions.
