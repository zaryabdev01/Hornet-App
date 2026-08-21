# ApiSave — M2 Field-Test Diagnostic Report

**Prepared for:** Nordine
**Source:** `ApiSave_M2_Android_Field_Test_Findings_EN.pdf` (18 August 2026), 6 photos in `test_images_3/`
**Model:** `gemini-3.6-flash`
**Date:** 2026-08-19
**Judge version:** `judge.js` V1.11 | **Prompt version:** `prompts.js` V2.5

This report follows your six-point request in order: reproduce, decision trace, failing layer, minimal correction, corrected build, regression protection.

---

## 1–3. Reproduction, decision trace, and failing-layer diagnosis

Each case below shows the raw Gemini fields that drove the Judge, the verdict on first reproduction (pre-fix), the diagnosis, and the correction applied.

### Photo 1 — Confirmed Asian hornets, distant group on jar

**First reproduction (pre-fix):** `ORANGE_INSUFFISANCE` — matched your expected output on this specific call.
**Raw trace (pre-fix):** Q1=NON (MEDIUM), Q2=NON (MEDIUM), Q3=NON (MEDIUM), `incompatibilites_cible=[thorax_roux, abdomen_jaune_dominant]`.

**Diagnosis: upstream, and unstable across repeated calls.** Re-running this exact photo 4 more times through the live pipeline today produced **three different verdict families**: `ORANGE_INSUFFISANCE`, `ORANGE_PROBABLE_NON_CIBLE`, and `ROUGE` (twice). In every ROUGE case, Gemini itself answered Q1=Q2=Q3=`OUI` with a clean velutina-consistent description ("abdomen majoritairement noir avec extrémité orange") — the Judge is doing exactly what it should with that input; the instability is entirely in what Gemini reports back for this specific low-resolution/distant subject.

**Correction applied:** added an explicit size/distance-based confidence ceiling to the prompt (`prompts.js` V2.5) — a subject occupying a small fraction of the frame can no longer be rated `HIGH` confidence regardless of how "clear" the visible detail looks. This reduces false-HIGH-confidence reads but does **not** fully resolve the instability — see the important caveat under "Failing layer" below.

**Failing layer, precisely:** the Judge's `ROUGE` rule (`Q1=Q2=Q3=OUI`) does not currently gate on confidence level at all — it fires on `OUI` regardless of whether confidence is HIGH, MEDIUM, or LOW. So even after the prompt fix lowered Gemini's self-reported confidence to MEDIUM on this photo, ROUGE still fired, because MEDIUM-confidence `OUI` and HIGH-confidence `OUI` are treated identically by the Judge today. **This is a real, currently-unaddressed gap in Judge logic** — see Section 4 for why I did not correct it today, and the improvement-options document for the two ways to close it.

**Status: not resolved.** Flagged honestly rather than claimed fixed.

---

### Photo 2 — European hornet under glass, Run A

**First reproduction (pre-fix):** `ORANGE_INSUFFISANCE` (60%) — reproduced your finding exactly.
**Raw trace:** Q1=OUI (HIGH), Q2=NON (HIGH), Q3=OUI (HIGH), `incompatibilites_cible=[abdomen_segmente_jaune_noir_alterne]`.

**Diagnosis: Judge logic.** The non-target route required `Q1_thorax === 'NON'` before it would even consider a crabro/non-target verdict. But Q1 asks whether the thorax reads as solid black — European hornets are also dark-thoraxed, so Gemini legitimately answers `OUI` here. That hard requirement was structurally blocking the correct route on genuine non-target specimens; Q2 (abdomen banding) is the trait that's actually diagnostic here, not Q1.

**Correction applied (`judge.js` V1.11):** removed the `Q1 === 'NON'` requirement from the three crabro-routing branches. Verified this cannot leak into a false `ROUGE`: `ROUGE` requires all three of Q1/Q2/Q3 = `OUI` and is checked earlier in `jugerMorphologie()`, before these branches are ever reached — so a case with Q2 = `NON` (required to enter these branches) can never have been a ROUGE candidate in the first place.

**Verified working:** re-run immediately after the fix → `ORANGE_PROBABLE_NON_CIBLE` (matches expected).

**Status: fix confirmed correct, but conditional on Gemini's own confidence report.** On a later re-run of the identical photo, Gemini itself reported MEDIUM (not HIGH) confidence with only 1 marker instead of 2 — under that input, the Judge correctly falls back to `ORANGE_INSUFFISANCE` by design (this conservative floor at MEDIUM confidence was your own Round 2 decision, to avoid false non-target calls on genuinely ambiguous photos). The Judge behaves correctly and consistently for what Gemini gives it; what varies is Gemini's own confidence self-rating for this particular "under glass with reflections" shot.

---

### Photo 3 — European hornet under glass, Run B (your control pass)

**First reproduction (pre-fix):** `ORANGE_INSUFFISANCE` — this did **not** reproduce your "control pass" result on the first call; it took a second call to land on `ORANGE_PROBABLE_NON_CIBLE`. This by itself is the clearest evidence of the instability described above: same physical specimen, same code, different Gemini reads.

**Raw trace (the run that reproduced your result):** Q1=OUI (HIGH), Q2=NON (HIGH), Q3=NON (HIGH), `incompatibilites_cible=[abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne]` (2 markers).

**Diagnosis: Judge logic** — same root cause as Photo 2, in the `Q3 = NON` branch this time. That branch had a "2 markers, high confidence" case that fell through to a retake request instead of the non-target route, because the branch only had the >=3-markers threshold and the Q1-gated 1-marker/high-confidence threshold — never a 2-markers/high-confidence one.

**Correction applied (`judge.js` V1.11):** added the missing high-confidence threshold to the `Q3 = NON` branch, matching the one that already existed for `Q3 = OUI`.

**Verified working:** re-run after the fix → `ORANGE_PROBABLE_NON_CIBLE`, matching your control result.

**Status: same caveat as Photo 2** — correct and stable whenever Gemini reports HIGH confidence with >=1 marker; falls back to insufficiency when Gemini itself reports MEDIUM.

---

### Photo 4 — Clear wasp-like non-target on red background

**First reproduction (pre-fix, using the *before*-M2 legacy Judge replica for comparison):** would have produced `VERT` under the pre-M2 logic. Under the current (pre-this-fix) M2 Judge: `ORANGE_PROBABLE_NON_CIBLE` — **this already matched your expected output on first reproduction**, both before and after today's changes.

**Raw trace:** Q1=OUI (HIGH), Q2=NON (HIGH), Q3=NON (HIGH), `incompatibilites_cible=[rayures_jaune_noir_vif, silhouette_fine_allongee]` → 1 "core" wasp tag + 1 "supporting" tag → the existing tiered wasp/Polistes rule fires correctly.

**Diagnosis:** no bug found. Your original field test likely caught a one-off bad Gemini read; every reproduction today (2 separate live calls) landed correctly.

**Status: confirmed stable, no code change needed or made for this case.**

---

### Photo 5 — Scoliid / mammoth wasp, dense hairy body (dish)

**First reproduction (pre-fix):** `ORANGE_INSUFFISANCE` (60%) — reproduced your finding exactly.
**Raw trace:** Q3=OUI, `elements_visibles=[thorax_massif, abdomen_epais_non_elance, proportions_compactes_robustes]` — described as "trapue et massive" (stocky/massive). The `morphologie_velue_compacte` tag, which is what routes to the existing hairy-body → `VERT` pathway, was never emitted.

**Diagnosis: upstream extraction, confirmed by comparison with Photo 6.** I viewed the source photo directly — dense hair is genuinely present, but under this image's dim, glossy lighting, Gemini is reading the specimen's bulk as "massive/robust" rather than "hairy." The existing prompt instruction fused "very hairy" and "massive" into a single trigger phrase, which let a bulky-but-glossy read satisfy the wrong branch.

**Correction applied (`prompts.js` V2.5):** decoupled hair *texture* from body *volume* in the "VERROU BOURDON/COLEOPTERE/MICRO" instruction — hair is now an explicit, independent trigger, with a direct instruction not to let a hairy body get classified as "massif" just because it's also bulky.

**Verified NOT working on this specific photo:** re-ran twice after the fix; both times still `ORANGE_INSUFFISANCE`, Gemini still not tagging hair. **Photo 6 (below), using the identical pathway, passes reliably** — this isolates the problem to this specific image's lighting/gloss rather than the rule itself.

**Status: not resolved.** The pathway is proven correct (Photo 6); this specific photo's conditions are outside what the current prompt wording can reliably overcome.

---

### Photo 6 — Scoliid / mammoth wasp on flower

**First reproduction (pre-fix):** `ORANGE_INSUFFISANCE` (60%) — reproduced your finding.
**Raw trace (pre-fix):** Q3=OUI, `elements_visibles=[thorax_massif, proportions_compactes_robustes]`, no hairy-body tag — same upstream gap as Photo 5.

**Correction applied:** same V2.5 prompt clarification as Photo 5.

**Verified working, twice:** re-run after the fix (personal key, then again with the paid key) → `VERT` both times, matching your expected output.

**Status: confirmed stable.**

---

## Summary table — all live runs today

| Photo | Expected | Pre-fix (reproduced) | Post-fix, run 1 | Post-fix, run 2 | Post-fix, run 3 (paid key) | Status |
|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE | ORANGE_INSUFFISANCE ✅ | ROUGE ❌ | ROUGE ❌ | ROUGE ❌ | **Not resolved** — upstream confidence instability |
| 2 | ORANGE_PROBABLE_NON_CIBLE | ORANGE_INSUFFISANCE ❌ | ORANGE_PROBABLE_NON_CIBLE ✅ | (quota error) | ORANGE_INSUFFISANCE ❌ | **Fix confirmed, conditional on Gemini's confidence report** |
| 3 | ORANGE_PROBABLE_NON_CIBLE (control) | ORANGE_INSUFFISANCE ❌ | ORANGE_PROBABLE_NON_CIBLE ✅ | (quota error) | ORANGE_INSUFFISANCE ❌ | **Fix confirmed, same caveat** |
| 4 | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE ✅ | ORANGE_PROBABLE_NON_CIBLE ✅ | (quota error) | ORANGE_PROBABLE_NON_CIBLE ✅ | **Stable** |
| 5 | VERT | ORANGE_INSUFFISANCE ❌ | ORANGE_INSUFFISANCE ❌ | (quota error) | ORANGE_INSUFFISANCE ❌ | **Not resolved** — upstream, photo-specific |
| 6 | VERT | ORANGE_INSUFFISANCE ❌ | VERT ✅ | (quota error) | VERT ✅ | **Stable** |

*(Run 2 mostly hit the free-tier daily quota mid-pass; only Photo 1's call went through before the limit hit, shown above.)*

---

## 4. Minimal corrections applied

Two changes, both scoped to existing M2 rules — no new tags, verdict routes, reason codes, or architecture:

1. **`judge.js` → V1.11.** Removed an unjustified `Q1_thorax === 'NON'` gate from the three crabro/non-target routing branches (Q1 is not actually diagnostic between the target and European hornet), and added a missing high-confidence threshold to the `Q3 = NON` branch to match the one already present for `Q3 = OUI`. Full reasoning and safety argument (why this cannot leak into a false ROUGE) is documented inline in the version-history comment block.
2. **`prompts.js` → V2.5.** Decoupled "hairy" from "massive/bulky" in the existing hairy-body exclusion rule, and added a size/distance-based ceiling on confidence ratings.

**What I deliberately did not change today:** the `ROUGE` rule's indifference to confidence level (the real reason Photo 1 still fails) is a change to your most safety-critical verdict path, and I didn't think it was mine to make unilaterally without your sign-off given its blast radius across the whole reference set — see the companion improvement-options document for the two ways to close it and their tradeoffs.

## 5. Corrected build

Not yet produced. Given the honest results above — 2 of 6 cases fully stable, 2 confirmed-but-conditional, 2 unresolved — I did not want to hand you a build advertised as closing the acceptance gate when it doesn't yet, for all six cases, on a single deterministic pass. I can produce it as soon as we've agreed how to handle Photos 1 and 5 (see improvement options), so the build and this diagnosis stay consistent with each other.

## 6. Regression protection

Both existing regression sets were re-run live today, after the fix:

- **M1 structure/nest set (`test_images/`, 10 cases): 10/10 matched.** No regression.
- **M2 insect set (`test_images_2/`, 10 cases): 8/10 matched.** The 2 misses (`ref_image_01`, `ref_image_03`) are **not regressions** — I confirmed this directly by comparing against the pre-M2 legacy Judge replica the test harness runs in parallel: both cases produced the *identical* output before and after today's fix (`before_fix === after_fix` in both cases). Today's fix never engaged on either case; both misses are Gemini call-to-call variance on borderline reference images, present before my changes and unaffected by them.
- All 15 synthetic sanity-check cases (`m2-sanity-check.cjs`) pass, including 2 new regression tests that lock in the old conservative threshold for MEDIUM-confidence cases, so the fix cannot be silently over-loosened later.

**No regression on the structure branch, or on the previously-validated M2 insect set.**
