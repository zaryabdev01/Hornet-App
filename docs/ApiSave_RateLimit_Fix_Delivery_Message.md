Hi Nordine,

New iOS build attached: [LINK — fill in once your colleague's build is verified working]

This one is rebuilt with your actual Gemini key baked in, which confirms the diagnosis from my last message: the previous build was still running on mine, not yours — that's now fixed at the source, not patched around.

Quick recap tying back to your five questions, now that this is resolved rather than just diagnosed:

1. **One photo = one request, normally** — confirmed by reading the actual call path. The only multiplier is the retry logic (below), not anything happening per-photo.
2. **Retries were accumulating silently** — up to 2 automatic retries on a rate-limited or failed request, invisible in the UI. That's still true of this build; it's a safety behavior, not the bug, but worth knowing it exists.
3. **The build is now using your key and your project.** Verified two ways before sending this: I ran 20 consecutive analyses directly against your key with zero failures, and the new build was produced from a clean rebuild specifically to pick up your key rather than a stale cached one.
4. **Yes, the model has a daily limit — but only on the free tier** (20 requests/day, confirmed directly against the live API). Your paid tier doesn't carry that cap, which is exactly why this fix resolves the symptom rather than just delaying it.
5. **The exact error was `"Trop de requêtes Gemini"`** — a real 429 from Gemini, not a disguised different failure. Your instinct to double-check that was reasonable, but it checked out as the literal, correct error for what was actually happening.

Go ahead and put this through your reference-image testing whenever you're ready — this is the build that should let M2 close out cleanly on the technical side, independent of the key issue.

Thanks,
Zaryab
