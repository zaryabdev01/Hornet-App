Hi Nordine,

The field removal is in and I've re-run the full set, including #1 as you asked. Full report attached — quick summary below.

**Root Cause A is confirmed fixed.** Photos #2 and #7, which failed last time with a hard validation error, now pass cleanly with no trace of that issue. The fix worked exactly as diagnosed.

The overall count is still 3/10, but I want to be clear that's not "no progress" — removing that field cleared one failure mode entirely and, in doing so, gave a clean look at the reference set for the first time. That surfaced two further patterns that were previously hidden behind Root Cause A, plus confirmed something worth knowing on its own: some of the variance is coming from the model itself answering the same photo differently across calls, not from anything in the code. Photo #9 — your Asian-hornet control case, which had matched cleanly twice before — failed this run purely on the model writing a slightly invalid value it hadn't written before. Nothing in this round touched that field. That's a direct, real-world illustration of exactly why you asked for repeated-run stability testing as part of M4.

The two new patterns both need your call rather than a unilateral fix from me:

1. **Partial tagging**: my wasp/Polistes rule requires a specific pair of tags together. In several cases the model's description clearly reads as a wasp, but it only wrote one of the two required tags, so the rule didn't fire. I could loosen it to accept any one of the four wasp-specific tags instead of requiring the pair — that would catch more of these, at the cost of a slightly lower bar for what counts as "clearly non-target."

2. **A pre-existing condition, now visible for the first time**: European-hornet routing requires the morphology reading (`Q3`) to not be a flat "no" before it will even look at the color evidence — this predates M2, we just never had real European-hornet photos to test it against before. Photo #6 shows a case with very strong, unambiguous European-hornet coloring where the model's own morphology reading came back "no" anyway, locking it out of the correct route. Loosening this to let strong color evidence override a "no" morphology reading is the same kind of trade-off as photo #1 from Round 1 — it would help here, but carelessly applied, that's the same class of loosening that could risk letting a real Asian hornet through if its morphology were ever misread. I don't want to decide that alone.

I haven't touched either of these — both are real detection-logic trade-offs, not bugs with an obvious right answer. Let me know your call on each and I'll implement and re-run.

Thank you.
