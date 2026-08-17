# ApiSave — M2 Validation Report, Round 3

**Prepared for:** Nordine
**Model:** `gemini-3.6-flash`
**Change tested:** the two client-specified logic changes — tiered wasp/Polistes rule, and the Q3=NON crabro override — plus photo #8's expected outcome updated to `ORANGE_PLAFOND` as agreed
**Date:** 2026-08-09

---

## Summary

**6 of 10 matched — up from 3/10 in both prior rounds, and both targeted fixes confirmed working on real data.**

- **Photo #6**, the case that motivated the new crabro override, now correctly resolves to `ORANGE_PROBABLE_NON_CIBLE` — strong chromatic evidence (4 crabro markers) correctly routed even with `Q3=NON`.
- **Photo #5**, the case that motivated the tiered wasp rule, now correctly resolves via the "1 core + 1 supporting" tier.
- **Photo #8** now counts as a match against its updated expected outcome (`ORANGE_PLAFOND`), as agreed.
- **Zero VERT verdicts anywhere in this run** — every insect-path result that produced a verdict landed on `ROUGE`, `ORANGE_PROBABLE_NON_CIBLE`, or `ORANGE_INSUFFISANCE`. On this round's data, no wasp/hornet-adjacent case was waved through as "nothing suspicious."

I implemented exactly the two logic changes you specified, nothing else. All 14 synthetic sanity-check cases pass, including new cases for both tiers of the wasp rule and both the fire/no-fire boundary of the crabro override. Full raw JSON for this round is in `test_images_2/report.json`.

---

## The 4 remaining non-matches — none are Judge bugs; here's the evidence for each

### Photo #1 — consistent, not random

This is the third round in a row this exact photo has been read the same way: `Q1=OUI`, `Q2=OUI`, `Q3=OUI`, all `HIGH` confidence, description consistently "thorax majoritairement noir," "abdomen à fond sombre avec segment terminal orange." Across all three rounds where it produced a verdict at all, it has never once been read as reddish/tawny. That's worth knowing on its own: this doesn't look like random noise on this particular photo — it looks like a stable, repeatable reading. The Judge is doing exactly the right thing with that input (three confirmed OUIs is the unambiguous ROUGE rule). No code change made or considered, per your instruction — kept exactly as-is for ongoing tracking.

### Photo #3 — a new instance of the same family of issue as Root Cause A, in a different field

New validation error this round: `Q3_morphologie.elements_visibles[0] valeur invalide: "silhouette_fine_allongee"`. This is structurally the same pattern as Root Cause A from Round 1/2 — a tag that belongs in `incompatibilites_cible` ended up in a different, narrower-enum field instead — but this time it's `elements_visibles` (the field meant only for the four positive Q3-OUI-supporting traits), not the field we already removed. I have **not** touched this. It's new evidence, not something I patched unilaterally, and I'd want your direction on it the same way we handled Root Cause A — likely the same category of fix (tighter prompt guidance on what belongs in `elements_visibles` vs `incompatibilites_cible`), but flagging rather than assuming.

### Photo #7 — model variance between rounds on the same photo

In Round 2, this photo's response had `Q3=OUI` and 3 crabro markers, correctly matching via the existing (unmodified) crabro branch. This round, the same photo came back with `Q3=NON` and only 2 crabro markers (`thorax_roux`, `abdomen_segmente_jaune_noir_alterne` — missing `tete_rousse_orangee`, which was present in Round 2's response). Both the existing branch and the new Q3=NON override correctly declined to fire on this input — 2 markers doesn't meet either threshold, exactly as specified. This is the model answering the same photo differently between rounds, not a logic gap.

### Photo #10 — same tag-under-emission pattern noted in Round 2

The description text explicitly says "silhouette fine" and "rayures jaunes," but only one supporting tag (`rayures_jaune_noir_vif`) was actually written to `incompatibilites_cible` — no core tag, so the tiered rule correctly does not engage (by design, per your spec: supporting tags alone shouldn't trigger it). This is the same "the model's prose says one thing, its tags say less" pattern from Round 2, now recurring on a different photo. Likely to improve with M3's structured-output enforcement, though I'd note schema enforcement controls the *shape* of what's written, not necessarily whether every applicable tag gets chosen — so this may not fully disappear even after M3.

---

## Against your four closing criteria for M2–M4

You set four bars for considering the engine validated across M2 through M4. Honest status against each, using this round's data:

| Criterion | Status this round |
|---|---|
| 10/10 technically valid outputs | 9/10 valid (1 validation error, photo #3) — this is exactly what M3's enum enforcement + safe fallback are scoped to close, now formally recorded in the plan as mandatory M3 acceptance criteria |
| Zero unjustified VERT verdicts | **Met this round** — zero VERT anywhere in the 9 valid outputs |
| Photo #9 returns ROUGE consistently | ROUGE in every round that produced a valid verdict (2 of 3 rounds; 1 round errored before producing any verdict) — not yet "consistent" in the strict sense you're asking for, which is precisely why it's now a named M3/M4 acceptance case |
| Photo #1 always produces a valid, safe verdict | 2 of 3 rounds produced a verdict (both ROUGE, both "safe" in the sense of erring toward caution); 1 round errored — same gap as above |

None of the shortfalls here are Judge logic problems — they're the exact class of issue you already scoped to M3 (enum constraint, valid-JSON guarantee, safe fallback) and M4 (repeated-run stability measurement). I've recorded your four M3 acceptance criteria and the permanent designation of photos #1 and #9 as stability-test images directly in the implementation plan document, so they're not just captured in this report.

---

## Full results this round

| # | Photo | Result | Expected | Match | Cause |
|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | ROUGE | ORANGE_PROBABLE_NON_CIBLE | ❌ | Stable hard case, tracked per your instruction |
| 2 | ref_image_02.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | |
| 3 | ref_image_03.jpg | validation error | ORANGE_PROBABLE_NON_CIBLE | ❌ | New field-ambiguity instance (elements_visibles) |
| 4 | ref_image_04.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | |
| 5 | ref_image_05.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | Tiered wasp rule — fixed |
| 6 | ref_image_06.jpg | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | Crabro Q3=NON override — fixed |
| 7 | ref_image_07.jpg | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | Model variance vs. Round 2 |
| 8 | ref_image_08.jpg | ORANGE_PLAFOND | ORANGE_PLAFOND | ✅ | Expected outcome updated as agreed |
| 9 | ref_image_09.jpg | ROUGE | ROUGE | ✅ | Control case, correct this round |
| 10 | ref_image_10.jpg | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | Tag under-emission, same family as Round 2 finding |

Full raw JSON for every image is in `test_images_2/report.json`.

---

## What I need from you

1. **Photo #3's new field-ambiguity finding** — same treatment as Root Cause A: your direction before I touch `elements_visibles`.
2. Everything else this round is either confirmed-working logic or model-variance already assigned to M3/M4 — no other decisions pending from my side.

I have not made any further code changes beyond the two you specified. Ready for M3 whenever you'd like to proceed, with its scope now including the four acceptance criteria above.
