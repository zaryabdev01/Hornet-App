Hi Nordine,

Thank you for the approval. Attached is the effort, sequencing and M3 position for the three
items.

Short version:

**Item 1 — false-negative correction (3–5 days).** The five approved changes to the prompt,
Judge and schema, then before-and-after repeated-sampling regression against the full set:
the two new cases, the confirmed-ROUGE Asian-hornet cases, the confirmed European-hornet
cases and the wider M2 reference set. The range is 3–5 rather than a single number because
prompt tuning is volatile — M2 took four rounds — and the baseline run on day one will show
where it lands. No new regressions is the acceptance bar.

**Item 2 — 503 / latency (2–3 days).** Stage-timing instrumentation first (that's the
per-stage measurement you asked for), then a proper retry policy for 5xx with exponential
backoff and jitter, then downscaling the image before it's sent.

**Item 3 — distant-structure suggestion (1.5–2.5 days).** New "too distant to assess" flag,
Judge attaches your wording to the green result without changing it, UI shows it.

**On M3:** my recommendation is that all three are billed **separately from M3, and done
before it**. Item 1 changes the prompt and schema, and M3's whole point is to measure the
native-valid JSON rate — if the prompt changes mid-M3 that number can't be attributed. So
Item 1 lands first, M3 then validates against the corrected baseline and its version bundle
just references the new prompt/schema versions. Items 2 and 3 are independent of M3
entirely. If you'd rather approve and invoice the three as one block instead of separately,
that's fine — the work and the totals don't change.

Combined for the three: 6.5–10.5 days (about $1,625–$2,625 at the $250/day rate).

I'll start Item 1 as soon as you confirm the range and sequence. No rush on the hosting
platform — that only gates M3.

Thanks,
Zaryab
