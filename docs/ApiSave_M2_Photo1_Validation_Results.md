# ApiSave — Photo 1 Fix: Full Validation Results

**Prepared for:** Nordine
**Date:** 2026-08-19
**Judge version:** `judge.js` V1.12 (implemented, not yet integrated into a build)
**Status: build still on hold, as instructed.** Read this before deciding whether to proceed — the repeated-sampling data changed the picture from what I told you in the proposal, and I want you to have the corrected number before this goes any further.

---

## What I implemented

Exactly what was proposed and approved: `ROUGE` now additionally requires `lisibilite = 'haute'` on all three criteria (Q1/Q2/Q3). If any one of them reads below that, the result falls through to the existing `ORANGE_INSUFFISANCE` / `RETAKE_SHARPER` retake path instead. Verified against 17 synthetic sanity-check cases (2 new ones added for this rule) — all pass, including a case that mirrors the real M1 `ref_image_09` scenario (confidence drops to MEDIUM but readability stays `haute` → ROUGE still fires correctly).

## Photo 1: the good news, confirmed properly this time

**6 out of 6 valid live calls today correctly produced `ORANGE_INSUFFISANCE`** (1 of 7 attempted calls hit a transient Gemini 503 "high demand" error, unrelated to the fix — excluded from the count). This is a real improvement, not a lucky sample — 6 independent calls is a meaningfully larger base than the 3 I had for the proposal.

## The confirmed-ROUGE regression cases: the number changed, and I want to be upfront about it

In the proposal, I checked each of the four confirmed-target reference cases **once** and found all four read `lisibilite: haute`. I said the expected impact on genuine targets would be minimal. That was based on a single sample per case, and I flagged at the time that Photo 1 itself needed more repeats to trust — I should have applied that same caution to these four cases before calling the impact "minimal." I re-ran all four, 7-8 times each, live. The corrected picture:

| Case | Valid samples | Matched (ROUGE fired correctly) | Rate |
|---|---|---|---|
| M1 `ref_image_04.jpg` | 6 | 4 | 67% |
| M1 `ref_image_08.jpg` | 8 | 8 | **100%** |
| M1 `ref_image_09.jpg` | 8 | 5 | 63% |
| M2 `ref_image_09.jpg` | 8 | 8 | **100%** |
| **Combined** | **30** | **25** | **83%** |

**Two of the four cases are completely stable (100%). The other two show a real, non-trivial rate — roughly 1 in 3 — of a genuine, correctly-identifiable target getting bumped to a retake request instead of an immediate ROUGE alert.** Every single miss on those two cases showed the exact same pattern: all three criteria dropped to `lisibilite: moyenne` together, not just one. That's a meaningful, repeatable cost against your stated goal of preserving a low-retake experience on confirmed targets — not the "minimal impact" I told you before I had the repeated samples.

**I checked one obvious mitigation** — requiring `haute` on only 2 of the 3 criteria instead of all 3 — but the data doesn't support it: in every miss, all three criteria degraded together (never a mixed pattern), so a majority-vote version of this rule would likely have made no difference on the cases I have data for. I'm not ruling it out with more samples, but I don't have evidence it would help.

## Full regression re-run (final check per the validation plan)

- **M1 structure/nest set: 10/10 matched**, including all three confirmed ROUGE cases in that set on this particular pass.
- **M2 insect set: 7/10 matched** (1 transient 503 excluded). The two genuine mismatches (`ref_image_01`, `ref_image_03`) are the same pre-existing Gemini-variance cases from the last report — re-confirmed as non-regressions: `before_fix` and `after_fix` produced identical output on both, meaning V1.12 never engaged on either case.
- **No new regressions anywhere else** in either set from this change.

---

## Where this leaves us

Photo 1 is meaningfully better. But this fix isn't the clean, near-zero-cost change the proposal suggested — it trades Photo 1's instability for a new, real retake cost on a subset of otherwise-clear confirmed-target photos, concentrated specifically where a photo's overall quality is borderline enough that Gemini's readability judgment itself wobbles between `haute` and `moyenne` call to call.

I don't think this is my call to make alone, given it directly trades against the low-retake objective you set. Options as I see them:

1. **Accept the trade-off as-is.** A confirmed target that gets a retake request isn't a wrong verdict — under your two-attempt flow, the user re-photographs and, per this data, is very likely to get a clean `haute` reading (and correct ROUGE) on the retry. This is a materially safer failure mode than a missed or misclassified target, even if it adds friction ~17-37% of the time on already-borderline photos.
2. **Revert this specific change and leave Photo 1 as a documented residual limitation**, same treatment as Photo 5, if the added retake rate on real targets isn't worth it to you.
3. **Ask me to look for a narrower version of the rule** — I don't have a specific promising lever to propose right now (the 2-of-3 idea didn't hold up against the data), but I can keep digging if you want to spend more time on it before deciding between 1 and 2.

I've held the build and made no further changes beyond what you approved. Photo 5 remains parked, and Photos 2/3/4/6 are untouched.
