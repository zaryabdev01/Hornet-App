Hi Nordine,

Proposal attached, answering your four questions directly — no code changed yet, exactly as you asked.

Short version: you were right to reject Option A, and I went and got the evidence rather than just agreeing in the abstract. The schema already carries a second field per criterion I'd been under-using — `lisibilite` (readability), separate from `confidence` (self-rated certainty). I checked all four confirmed-genuine ROUGE cases across today's regression sets, and every one of them reads fully readable (`haute`) on all three criteria — including one where `confidence` itself had dropped to MEDIUM on that call. That's the actual proof: confidence is the volatile signal your instinct flagged, readability is the stable one. A gate built on readability instead of confidence would not have touched any of those four genuine targets.

For Photo 1 itself: I have three documented misfires with full raw data. Two of three would be caught by a readability gate. One would not — Gemini rated that specific call fully readable despite the subject genuinely being too small/distant, so readability self-rating isn't perfectly reliable either, just meaningfully more reliable than confidence, and reliable in the direction that matters most (zero failures on real targets). I'm giving you that as roughly two-thirds improvement on today's sample, not a claimed complete fix — I'd rather you have the honest number now than a surprise later.

The proposed change itself is small: ROUGE would additionally require none of the three criteria read below full readability; anything less falls through to the existing retake flow instead of firing ROUGE. Same mechanism you already have, just a narrower gate than Option A.

If you're good with this direction, I'll implement it, run it against Photo 1 six to eight times (not just once) plus repeated passes on all four confirmed-ROUGE cases, and send you the same style of before/after evidence as the last report before it goes anywhere near a build.

Photo 5 stays parked as agreed, and the fixes already validated for Photos 2/3/4/6 haven't been touched.

Thanks,
Zaryab
