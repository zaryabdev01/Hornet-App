Hi Nordine,

Thank you for the approval. Attached is the scope, price and sequencing for the three items.

**Fixed price for all three: $300**, split by item:

- **Item 1 — false-negative correction: $150.** The five approved changes to the prompt,
  Judge and schema, then before-and-after repeated-sampling regression against the full set:
  the two new cases, the confirmed-ROUGE Asian-hornet cases, the confirmed European-hornet
  cases and the wider M2 reference set. Largest of the three — it carries the full
  regression obligation and will likely need a few tuning rounds. No new regressions is the
  acceptance bar.

- **Item 2 — 503 / latency: $90.** Stage-timing instrumentation first (that's the per-stage
  measurement you asked for), then a proper retry policy for 5xx with exponential backoff
  and jitter, then downscaling the image before it's sent.

- **Item 3 — distant-structure suggestion: $60.** New "too distant to assess" flag, Judge
  attaches your wording to the green result without changing it, UI shows it.

**On M3:** my recommendation is that all three are done **before M3 and billed separately
from it**. Item 1 changes the prompt and schema, and M3's whole point is to measure the
native-valid JSON rate — if the prompt changes mid-M3 that number can't be attributed. So
Item 1 lands first, M3 then validates against the corrected baseline and its version bundle
just references the new prompt/schema versions. Items 2 and 3 are independent of M3
entirely. If you'd rather approve and pay the three as one $300 block instead of
separately, that's fine — the work is unchanged.

Sequence: Item 1, then Item 2, then Item 3. I'll start Item 1 as soon as you confirm the
price and split. No rush on the hosting platform — that only gates M3.

Please also create the M3 , from the provided document. 

Thanks,
Zaryab
