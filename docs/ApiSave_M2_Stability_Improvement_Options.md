# ApiSave — Stability Improvement Options (Photos 1 and 5)

**Prepared for:** Nordine
**Date:** 2026-08-19
**Companion to:** `ApiSave_M2_FieldTest_Diagnostic_Report.md`

This document is scoped narrowly: what would actually move Photos 1 and 5 (and, more importantly, the class of problem they represent) toward stable, correct results — and what each option costs. Photos 2/3/4/6 are addressed by the changes already made; they aren't repeated here.

---

## The two problems are different, and need different fixes

**Photo 1's problem is a Judge gap, and it's fixable, but it touches the ROUGE verdict.**
As documented in the diagnostic report, `ROUGE` fires whenever Q1=Q2=Q3=`OUI`, regardless of confidence level. A distant, low-resolution subject can get all three answered `OUI` at MEDIUM confidence and still trigger the same alert as a clear, close, HIGH-confidence read of a real Asian hornet. This is a real, closeable gap — not an inherent AI limitation.

**Photo 5's problem is closer to an inherent limitation.**
Gemini genuinely isn't perceiving the hair texture in that specific photo's lighting. No wording change can force a model to see something it isn't resolving from the pixels. The pathway itself is proven correct (Photo 6 uses it successfully); this is about this image's conditions, and by extension, other future images with similar lighting.

---

## Option A — Require HIGH confidence for ROUGE (Judge-logic change)

Change the ROUGE rule so it requires Q1=Q2=Q3=`OUI` **and** all three confidence ratings at HIGH, not just `OUI` at any confidence level. A MEDIUM or LOW-confidence all-`OUI` read would instead fall through to the existing `ORANGE_INSUFFISANCE` retake path — which is exactly your stated expectation for Photo 1.

- **Effort:** small, single-branch change, same category as today's fix.
- **Risk:** this is the app's single most safety-critical verdict. I re-checked today's regression data — the confirmed ROUGE cases in the M1/M2 sets (`ref_image_04`, `08`, `09`) all read HIGH confidence on every axis in today's live runs, so this change would not have flipped any of them. But that's 3 data points, not a guarantee across the full range of real photos you'll see in production — a genuinely clear, close-up Asian hornet photo that Gemini rates MEDIUM on one axis (e.g. slight motion blur) would now get a retake request instead of an immediate ROUGE alert on the first photo, which is a real behavior change worth your explicit sign-off before I make it, given what's at stake if it goes the wrong way for a real target.
- **My recommendation:** worth doing, but only with your explicit approval given it touches ROUGE, and with a dedicated regression pass afterward (all confirmed ROUGE cases across both reference sets, several repeats each) before it ships.

## Option B — In-app capture guidance for small/distant subjects (UX-level, no model change)

Have the app itself warn the user before submission when a photo is likely to be too zoomed-out — e.g. client-side heuristics on image resolution/crop, or simply stronger in-app copy ("get within arm's length, fill the frame with the insect") — so photos like Photo 1 are less likely to be submitted in the first place.

- **Effort:** small to medium, but it's a product/UX change, not a Judge or prompt change — different surface area from M2's remaining scope.
- **Benefit:** addresses the root cause (insufficient pixel detail) rather than compensating for it after the fact, and helps every case in this class, not just Photo 1.
- **Note:** doesn't fix a photo that's already been submitted; it's a prevention layer, not a correction to the analysis pipeline. Complements Option A rather than replacing it.

## Option C — Multi-frame consensus (retry-and-compare)

For borderline results, call Gemini 2–3 times on the same photo and require agreement before returning a decisive verdict (ROUGE or NON_CIBLE); disagreement falls back to `ORANGE_INSUFFISANCE`. This directly targets the exact instability documented in this report — Photos 1, 2, and 3 all showed different Gemini reads on repeated calls of the *same* image.

- **Effort:** medium — this is an orchestration change in `geminiApi.js`/the calling screen, not a Judge or prompt change, so it doesn't touch the rules you asked to keep minimal.
- **Cost:** doubles or triples Gemini API usage per user submission. Worth flagging explicitly given the quota conversation we just had — at scale this has real per-analysis cost and latency implications and would need to be weighed against your billing plan.
- **Benefit:** directly attacks the instability itself rather than any one symptom of it — would likely improve Photos 1, 2, and 3 simultaneously, and any other case with the same call-to-call variance we haven't seen yet.

## Option D — Structured output enforcement (`response_schema`)

This is M3 scope, already discussed and deferred — flagged here only for completeness, not proposed now. It would guarantee every response is schema-valid, but as covered in the M2 Round 4 assessment, it doesn't make the model choose to emit a tag it isn't otherwise inclined to write (this was the exact finding on the old photo #10 case) — so it would not, on its own, fix either Photo 1 or Photo 5.

## Not recommended: further prompt-wording iteration on Photo 5 alone

I could keep rewording the hairy-body instruction, but I don't think it's the right lever here — Photo 6 already proves the current wording works when the model can actually perceive the texture. More wording changes chasing one specific low-light photo risk exactly the kind of prompt-architecture churn you asked to avoid, for a marginal, photo-specific gain. Option C (consensus) or accepting this as a documented residual limitation are both better uses of effort than a fourth wording pass.

---

## My recommendation, in priority order

1. **Ship the two confirmed-stable fixes now** (Photos 4, 6, and the conditional-but-verified fix for 2/3) — this is real, evidenced progress and shouldn't wait on the harder cases.
2. **Get your sign-off on Option A** — it's small, targeted, and directly closes Photo 1's gap, but it changes the ROUGE gate so I want your explicit go-ahead before touching it, plus one more paid regression pass afterward.
3. **Treat Photo 5 as a documented residual limitation for now**, revisit if Option C (consensus) gets scoped, since that would help it too.
4. **Option B (capture guidance)** is worth a short separate conversation whenever you're ready — it's the only option here that's genuinely preventative rather than corrective.
