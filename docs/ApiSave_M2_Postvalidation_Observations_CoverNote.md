Hi Nordine,

Thank you for validating M2, and for the three observations — they're exactly the kind of
thing that's worth locking down now rather than rediscovering later. Attached is the full
write-up. Short version of each:

**1. The two false negatives (Asian hornet → probable non-target / crabro).**
Both images are now permanent regression cases. I ran each one 8 times live to see whether
this is a fixed error or variance — it's variance, but it lands on the wrong side about 7
times in 8. The whole outcome turns on one field: how Gemini reads the abdomen. When it
reads the abdomen ground as "dark" the verdict is correctly ROUGE; when it reads it as
"alternating yellow/black" it goes to crabro — and on these two genuine Asian hornets it
picks "alternating" ~87% of the time. Two secondary factors make it worse: the model reads
the normal orange-yellow Asian-hornet face as a "rufous head" crabro marker, and the Judge
has a rule where a single chromatic marker is enough to route to non-target if confidence is
high. The fix has three concrete, testable parts (prompt wording on the abdomen read, a
tighter definition of the "rufous head" marker, and two Judge guardrails). I'd want your
sign-off before changing any of it, and I'll validate against the existing confirmed-ROUGE
and confirmed-European-hornet cases before and after — not just these two images.

**2. 503 errors and latency.**
The 503s are Gemini's own — the model being temporarily overloaded on Google's side, not
our own code. Right now 503s are not retried at all, and the retries we do have are linear
with no jitter. The image is also sent at full camera resolution and re-uploaded on every
retry, and there's currently no timing instrumentation, so "each stage" can't be measured
yet. Proposed: add stage timing first (that's the measurement you asked for), then a proper
retry policy for 5xx with exponential backoff and jitter, then downscale the image before
sending. This is all transport-layer work — it doesn't touch detection logic — and can be
done as a self-contained pass.

**3. Distant structures.**
Confirmed: the green verdict is correct and stable (8/8). The model already notes "distant"
in its own description; there's just no structured field for it and no way to attach a
suggestion without changing the verdict. Proposed: a new "too distant to assess" flag in the
schema, and the Judge attaches your suggested wording to the green result without changing
it to orange.

I can put together effort and sequencing once you've had a look — the only one that needs a
decision from you before I can scope it firmly is point 1, since it's the only one that
changes detection behaviour.

Thanks,
Zaryab
