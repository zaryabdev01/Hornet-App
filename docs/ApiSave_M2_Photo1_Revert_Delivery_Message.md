Hi Nordine,

Revert done, confirmed clean. `judge.js` is back to exactly V1.11's ROUGE behaviour — the version-history comment documents the V1.12 attempt and why it was reverted, so that reasoning stays on record even though the active code is unchanged from V1.11.

Final regression pass attached: M1 9/10, M2 6/10 (both sets had one transient Gemini "high demand" error each, unrelated to any code, excluded from the counts). Every genuine mismatch is a previously-documented, pre-existing case — I double-checked each one against the before/after comparison to confirm none of them trace back to the revert. Photos 2/3/4/6 are confirmed intact, and Photos 1/5 are behaving exactly as expected for documented residual limitations, not as new problems.

**M2 baseline for the build:** `judge.js` V1.11, `prompts.js` V2.5, `schema.js` unchanged since Round 4.

Moving on to the TestFlight build now — checking the Apple/EAS setup is in good shape before I kick it off, given the friction we hit last time on the Android side. Will confirm here once it's ready.

Thanks,
Zaryab
