Hi Nordine,

Implemented exactly the two logic changes you specified, nothing else, and re-ran the same 10 unchanged images. Full report attached.

**6 of 10 matched, up from 3/10 in both prior rounds — and both fixes are confirmed working on real data, not just synthetic tests:**

- Photo #6 (the case that motivated the crabro override) now correctly routes to `ORANGE_PROBABLE_NON_CIBLE` — strong chromatic evidence correctly overriding a `Q3=NON` reading, exactly as specified.
- Photo #5 (the case that motivated the tiered wasp rule) now correctly resolves via the "1 core + 1 supporting tag" tier.
- Photo #8 counts as a match against its updated expected outcome, as agreed.
- **Zero VERT verdicts anywhere in this run** — every valid result landed on ROUGE, the non-target verdict, or a retake request. Nothing wasp/hornet-adjacent got waved through as "nothing suspicious."

Of the 4 remaining non-matches, I want to be precise about which are real findings versus which are just the model behaving differently between runs:

- **Photo #1**: same reading for the third round running (dark thorax, dark abdomen, all high confidence) — this looks like a stable, repeatable characteristic of this specific photo rather than random noise, which is useful to know. Left untouched, tracked as you asked.
- **Photo #3**: a new validation error, structurally the same family as the field-ambiguity issue from Round 1/2, but this time in a different field (`elements_visibles` instead of the one we already removed). I haven't touched it — flagging it for your direction the same way, rather than assuming the fix.
- **Photo #7 and #10**: both trace to the model giving different answers to the same photo across rounds (fewer tags written this time than in earlier rounds, even where the description text implies they should be there). Not a logic gap — both the existing and new thresholds behaved exactly as specified given the input they received.

Against the four bars you set for closing M2–M4: zero-VERT is met this round; the other three (10/10 valid outputs, #9 consistently ROUGE, #1 always valid) aren't yet met, and in every case the gap is exactly the kind of thing you already scoped to M3 (enum enforcement, safe fallback) and M4 (repeated-run stability). I've now recorded your four M3 acceptance criteria and designated photos #1 and #9 as permanent stability-test images directly in the implementation plan document, so none of this is just sitting in a report — it's written into the scope of the next phase.

One thing pending your call before I touch any more code: photo #3's new field-ambiguity finding. Everything else this round is either working as specified or already assigned to M3/M4.

Thank you.
