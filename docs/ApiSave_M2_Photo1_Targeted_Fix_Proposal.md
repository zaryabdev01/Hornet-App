# ApiSave — Photo 1: Targeted Fix Proposal (readability-gated ROUGE)

**Prepared for:** Nordine
**Date:** 2026-08-19
**Status:** Proposal only — no code has been changed. Waiting for your review before touching `judge.js` or producing a build, per your instruction.

You were right to reject Option A. I went and got the evidence rather than just agreeing in the abstract — it's below, and it changes the design.

---

## Direct answers to your four questions

### 1. Can a targeted approach be implemented within M2, using existing fields and architecture?

**Yes.** This is a single-branch change inside `jugerMorphologie()` in `judge.js` — the same category of change as the fixes already validated for Photos 2/3/5/6. No new architecture, no proxy, no schema change required.

### 2. Do the existing per-criterion readability fields support it, or would a schema change be required?

**The existing fields support it, with one honest caveat.**

Every observation already carries two *separate* fields per criterion (Q1/Q2/Q3), and I'd been under-using the distinction between them:

- `confidence` (HIGH/MEDIUM/LOW) — the model's self-rated certainty in its own interpretation
- `lisibilite` (haute/moyenne/non_lisible) — a more literal readability judgment: was this specific criterion clearly visible at all

Today's Judge already uses `lisibilite` for one thing (forcing a criterion to `NON_LISIBLE` when it's fully unreadable) but never uses it to gate ROUGE specifically. That's the unused lever your question pointed me at.

**Caveat:** `lisibilite` doesn't distinguish *why* something reads as degraded — too small/distant, too blurry, bad angle, and poor lighting all collapse into the same `moyenne` value today. For this specific fix (block ROUGE when the image is genuinely insufficient, regardless of which specific reason), that's fine — any of those causes deserves the same conservative response. If you later want the retake message itself to say something specific like "move closer" instead of a generic "retake," distinguishing "too small" from "too blurry" as separate causes would need a new field. Not needed for this fix.

### 3. What impact would this have on the ORANGE_INSUFFISANCE rate?

**I checked this against real data rather than estimate it.** Today's regression sets (re-run live, after the earlier fixes) contain four confirmed, correctly-classified ROUGE cases — three in the structure set, one in the M2 insect set. I pulled the raw `lisibilite` value for all four:

| Case | Confidence (Q1/Q2/Q3) | Lisibilite (Q1/Q2/Q3) |
|---|---|---|
| M1 `ref_image_04.jpg` | HIGH/HIGH/HIGH | haute/haute/haute |
| M1 `ref_image_08.jpg` | HIGH/HIGH/HIGH | haute/haute/haute |
| M1 `ref_image_09.jpg` | **MEDIUM/MEDIUM/MEDIUM** | **haute/haute/haute** |
| M2 `ref_image_09.jpg` | HIGH/HIGH/HIGH | haute/haute/haute |

**This is the concrete case against Option A, and the case for this one.** `ref_image_09` (M1) is a real, correctly-identified target — but its *confidence* dropped to MEDIUM on all three criteria on this call, while its *readability* stayed accurately `haute` throughout. Option A (requiring HIGH confidence) would have wrongly downgraded this genuine target to a retake request. A readability-gated rule would not — it correctly reads this photo as clear and lets ROUGE stand.

**Expected impact: minimal**, specifically because all four confirmed-target cases read `haute` readability on every criterion, even when confidence itself wobbled. This gate is narrower and more targeted than Option A by design.

### 4. How would I validate this fixes Photo 1 without downgrading confirmed targets?

I checked this against real data too, and I want to give you the honest number rather than round it up.

I have three documented ROUGE misfires on Photo 1 from today's testing with full raw JSON:

| Run | Confidence (Q1/Q2/Q3) | Lisibilite (Q1/Q2/Q3) | Would the new gate have blocked ROUGE? |
|---|---|---|---|
| Run 1 | HIGH/HIGH/HIGH | **haute/haute/haute** | **No** |
| Run 2 | MEDIUM/MEDIUM/MEDIUM | moyenne/moyenne/moyenne | Yes |
| Run 3 | MEDIUM/MEDIUM/MEDIUM | moyenne/moyenne/moyenne | Yes |

**2 of 3 documented misfires would be caught by this fix. 1 of 3 would not** — because on that one call, Gemini rated the image as fully readable (`haute`) despite it genuinely being a distant, small-subject photo. That's a distinct, harder problem: Gemini's readability self-rating, like its confidence self-rating, isn't perfectly reliable either — just more reliable, based on this data, and specifically more reliable in the direction that matters (it didn't fail on any of the four genuine targets).

I'm giving you this straight rather than claiming the fix "solves" Photo 1: it should meaningfully reduce the instability, on today's small sample by roughly two-thirds, but not guarantee it to zero. If you want it fully closed, that likely means pairing this with something else later (capture-quality guidance in the app itself, or the consensus-retry option) — not something to decide now, just flagging it so the number I give you after implementing isn't a surprise.

**Validation plan, once you approve:**
1. Implement the single-branch change in `judge.js`.
2. Re-run Photo 1 six to eight times (more repeats than today, given the documented variance) and report the exact pass rate with full decision traces — not a single lucky run presented as proof.
3. Re-run all four confirmed-ROUGE cases above, several times each, to confirm none of them ever gets falsely downgraded once real variance is sampled properly, not just the one call each I have today.
4. Re-run the full M1 + M2 regression sets once more for final no-regression confirmation.
5. Deliver the same style of before/after report as today's diagnostic, so every number is traceable to raw evidence.

---

## The proposed rule, in plain terms

Today, ROUGE fires whenever Q1=Q2=Q3=`OUI`, with no readability check at all. The proposed change: also require that none of the three criteria's `lisibilite` reads below `haute`. If Q1=Q2=Q3=`OUI` but any one of them is only `moyenne` (or worse), the result falls through to the existing `ORANGE_INSUFFISANCE` retake path instead of firing ROUGE — using the existing retake mechanism, not a new one.

I have not touched `judge.js`. Waiting on your go-ahead before I implement, and will hold the build as instructed. Photo 5 stays a documented residual limitation per your last message, and the fixes already validated for Photos 2/3/4/6 are untouched and ready.
