Hi Nordine,

All three approved items are implemented and validated. Full report attached; short
version:

**Item 1 — the two false negatives.** The "Asian hornet → probable non-target /
crabro" outcome is gone: on the clear specimen (Case 2) it's now 0/8 wrong (4 runs
correct ROUGE, 4 runs a second-photo request), and on the blurry in-flight one
(Case 1) it's down from 8/8 wrong to 1/8. The confirmed Asian-hornet ROUGE cases
are completely unchanged — 26/26 across the run, so this is not just making
everything ROUGE. I validated before and after with repeated sampling against the
full set you asked for (the two new cases, the confirmed ROUGE cases, the confirmed
European-hornet cases, plus wasp/scoliid/mandarinia as guards). Raw per-run traces
are in the repo.

Two honest caveats:
- Case 1 and 4 of Case 2's runs land on "take a second photo" rather than ROUGE.
  That's an architectural limit, not a tuning gap: when the model reads the abdomen
  as non-conforming, the Judge is barred from ROUGE by design. Neither is ever
  mislabelled non-target now, which was the actual problem.
- The stricter crabro rule you approved (a single marker is no longer enough) sends
  a few borderline non-targets — including one real European hornet on half its
  runs — to a second-photo request instead of "probable non-target". Never ROUGE,
  always fail-safe. If you'd rather keep one strong marker sufficient there, it's a
  one-line change — let me know.

**Item 2 — 503s and latency.** 503 (and 500/502/504) are now retried with
exponential backoff and jitter — before, 503 wasn't retried at all. Per-stage
timing is now logged on every analysis (image prep, each Gemini call, retries,
validation, Judge) — that's the measurement you wanted. And the photo is downscaled
before it's sent, so a multi-MB image isn't uploaded, or re-uploaded on every
retry. This one needs a new build (it adds a native module), so it can't go out as
an over-the-air update.

**Item 3 — distant structure.** The green verdict is kept exactly as-is; a
suggestion line is added underneath — "Une structure éloignée a été détectée.
Rapprochez-vous ou zoomez pour une analyse plus précise." The verdict only ever
becomes orange if real suspicious structural markers are found, unchanged from
today.

Nothing is merged yet — Item 1 touches the prompt and Judge, so I'm holding it for
your review. On your go-ahead it merges and becomes the baseline M3 validates
against.

Thanks,
Zaryab
