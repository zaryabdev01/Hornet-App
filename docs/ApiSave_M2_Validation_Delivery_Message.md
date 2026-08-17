Hi Nordine,

I've run your M2 reference set through the live pipeline — full report attached. The short version: the Judge logic held up completely, and the misses trace back to one shared, fixable cause plus two smaller separate items — details below.

**First, the good news: the Judge made zero routing mistakes.** Every observation it received, it handled correctly — including the cases where the new wasp/Polistes rule is exactly what produced the right verdict. So the core decision logic built this milestone is sound.

Where it landed short of a clean sweep is upstream of the Judge, in how consistently Gemini fills in one specific JSON field for these insect categories. Digging into each case individually rather than just re-running:

1. **The main cause, affecting most of the misses:** the schema has a leftover field, `Q3_morphologie.incompatibilites_visibles`, that nothing in the Judge actually reads — but the prompt never explains what it's for. The model ends up inconsistently splitting wasp/Polistes tags between it and the field that actually matters, which sometimes trips a validation error and sometimes just hides the pattern from the rule. Good news: this looks like a single, well-understood fix. My recommendation is to remove the unused field entirely, which should resolve the majority of these at once — but I wanted your sign-off before touching anything prompt-related, given how carefully we've scoped that so far.

2. **One individual hard photo** (#1): Gemini read that particular European hornet's coloring as matching the dark-thorax/dark-abdomen pattern rather than the reddish one, and the Judge correctly returned ROUGE based on that reading — the logic did exactly what it should with the input it got. I deliberately left the ROUGE rule untouched rather than loosening it to accommodate this one case, since that would risk missing real Asian hornets elsewhere.

3. **One open design question, not a bug** (#8): a wasp nest with no individual insect visible can only go through the structure path, which has no way to identify species — so it correctly reports "probable nest" rather than "non-target species." Reaching the non-target verdict for a nest-only photo would mean inferring species from architecture alone, which runs against the "never invent" principle underpinning the whole system. Curious for your take on whether that's an acceptable limitation as-is, or worth scoping separately down the line.

The report has the full per-image breakdown and raw JSON behind each of these. Once you confirm the fix for item 1, I'd expect a re-run to land at 8–9 out of 10, with #8 remaining open either way as a design decision rather than something a code fix resolves.

Thank you.
