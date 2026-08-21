# ApiSave — V1.12 Revert: Final Confirmation

**Prepared for:** Nordine
**Date:** 2026-08-19
**M2 baseline as of this revert: `judge.js` V1.11, `prompts.js` V2.5, `schema.js` unchanged.**

---

## Revert confirmed

`judge.js`'s ROUGE rule is back to exactly its V1.11 form — `Q1=Q2=Q3=OUI` fires ROUGE directly, no readability gate. The version-history comment block in the file documents the V1.12 attempt, the evidence that led to reverting it, and the decision, so the reasoning stays auditable even though the code itself is unchanged from V1.11. All 16 synthetic sanity-check cases pass, including a new regression test that locks in this restored behaviour so it can't silently drift back.

## Final no-regression check (live, after the revert)

- **M1 structure/nest set: 9/10 matched** (1 case hit a transient Gemini 503 "high demand" error — a server-side availability blip, unrelated to any code — excluded from the count; otherwise clean).
- **M2 insect set: 6/10 matched** (1 more transient 503 excluded). The 3 genuine mismatches are all pre-existing, already-documented Gemini-variance cases, not regressions:
  - `ref_image_01`, `ref_image_03` — the same two cases flagged as non-regressions in the earlier diagnostic report (`before_fix === after_fix` on both).
  - `ref_image_10` — this is the historically unstable case from the M2 Round 4 report (the old "0-for-4" case). I checked it the same way: `before_fix === after_fix`, both ROUGE, both driven entirely by Gemini reading a fully clean, high-confidence velutina-consistent profile on this call — nothing to do with today's revert.
- **Photos 2/3/4/6 (the validated fixes): confirmed unchanged and intact.** Photo 4 and Photo 6 matched again on this pass. Photo 2 and Photo 3 behaved exactly as already documented — correct when Gemini reports high confidence, a retake request when it doesn't (Photo 3 hit a transient 503 on this specific pass, so no new data point there, but nothing about its logic path changed).
- **Photos 1 and 5: behaving exactly as expected for documented residual limitations** — Photo 1 read ROUGE this pass (consistent with the reverted V1.11 behaviour you approved keeping), Photo 5 read `ORANGE_INSUFFISANCE` (consistent with the known hairy-body extraction gap). Both are working as intended given the "leave as documented limitation" decision — not new problems.

## M2 baseline, confirmed

| File | Version |
|---|---|
| `src/engine/judge.js` | **V1.11** (M2 baseline) |
| `src/core/prompts.js` | **V2.5** (hairy-body/confidence-ceiling clarifications from the field-test diagnostic) |
| `src/core/schema.js` | Unchanged since Round 4 |

This is the version that should ship in the TestFlight build.

---

Proceeding to prepare the build now — will confirm here once it's ready and verified.
