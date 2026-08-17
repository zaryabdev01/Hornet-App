# ApiSave — Engineering Assessment: M2 Closure & Realistic M3/M4 Outlook

**Prepared for:** Nordine
**Basis:** 4 rounds of real API testing on the M2 reference set (40 individual live calls total), plus the M1 reference set
**Date:** 2026-08-09
**Purpose:** a direct, candid answer to your questions before you approve M3 — not a sales pitch for the next milestone.

You asked for my honest professional judgment, not reassurance, and said plainly you're not looking for a guarantee. I'm going to answer in that spirit: where I have genuine confidence, I'll say so and explain why; where I don't, I'll say that too, and tell you what I do and don't have evidence for.

---

## 1. Where things actually stand

Score across the four M2 rounds on the same 10-image set: **3/10 → 3/10 → 6/10 → 9/10.** The trend is real and each jump traces to a specific, understood fix (Root Cause A, the tiered wasp rule, the crabro override, the field-separation clarification) — this isn't noise trending upward, it's genuine bugs and ambiguities being closed one at a time, each confirmed on real data before moving to the next.

But two individual photos in this round's data change how I'd characterize what's left:

- **Photo #1**, which I described in Round 3 as "a stable, repeatable" wrong answer after three identical misses, flipped to correct in Round 4 with no code change on the path that handles it. I was wrong to lean toward "stable" off three samples — it was actually variable, just with a run of bad luck. I'm telling you this plainly because it's directly relevant to your question about repeated-run testing: **three or even five repeats is not always enough to tell a systematic bias apart from variance with a long streak.**
- **Photo #10**, by contrast, has now failed identically in **all four** rounds — the only image in the set with a 0-for-4 record. Its description text has repeatedly implied the same wasp-like traits, but the model has never once written down the specific tag combination needed. That is a materially different, more concerning pattern than #1 turned out to be.

I'm leading with this because it reframes your question. The evidence doesn't point to one hard photo and otherwise-solid ground. It points to at least one genuine, reproducible reliability gap (#10) sitting alongside ordinary model variance (#1, #7, and others across rounds) — and those two things need different answers.

---

## 2. Your four questions, answered directly

### "Can M3+M4 realistically achieve 10/10 technically valid outputs?"

**Yes — I have real confidence in this one.** Every schema failure we've seen (Round 2's `proportions_robustes`, Round 3's `elements_visibles` misplacement) has been the model writing a value outside the allowed set. Native structured-output enforcement (`responseSchema`) doesn't ask the model to *try* to stay within the schema and then check afterward, the way today's pipeline works — it constrains what the model is *able* to generate at the decoding level. This is exactly the failure mode that mechanism exists to eliminate. Combined with the safe fallback you've asked for as a backstop, I'd expect this to be at or very close to 10/10 in practice.

### "Can M3+M4 realistically achieve 10/10 expected verdicts on this reference set?"

**No, and I don't think I'd be giving you an honest answer if I said yes.** Photo #10 is my evidence: it is not a formatting problem. The model has, four independent times, chosen not to write a tag that its own description text implies applies. Structured-output enforcement controls *which values are legal if the model writes a tag* — it has no mechanism to compel the model to write every tag that's arguably applicable. That's a recall problem, not a precision problem, and M3 as scoped only addresses precision. I don't have a concrete, proven fix for this to offer you today. I can speculate about further prompt-level countermeasures (for instance, an instruction requiring consistency between the free-text justification and the selected tags), but that would be unproven, untested work, not something I can respons­ibly fold into M3's current scope or promise will work.

### "Can M3+M4 realistically achieve stable reproduction across repeated runs?"

This depends entirely on what "stable" means, and I want to be precise about that rather than give a one-word answer:

- If you mean **"M4 will produce trustworthy, reliable data about how consistent each category actually is"** — yes, I'm confident in that. That's exactly what a 5-run harness measuring a consistency rate is built to do.
- If you mean **"the underlying model's answers will themselves become consistent"** — that's not something M4 can deliver by itself. M4 as scoped is a measurement tool, not an intervention. It will tell us, with real numbers, which categories are reliable and which aren't (photo #10-style patterns will show up clearly as a sub-100% consistency rate). It will not, on its own, make an unreliable category more reliable.

### "Will M3+M4 achieve sufficient reliability on new, real-world images?"

I can't respons­ibly answer this with a number, and I don't think you'd want me to invent one. Ten hand-picked images, however carefully chosen, is not a statistically meaningful sample of real-world field photos — different lighting, angles, phone cameras, insect poses, and regional coloring variation are all things this set doesn't exercise. If you want a real, evidence-backed answer to this question specifically, it would mean deliberately expanding the reference set well beyond 10 images — that's a genuine option worth considering, not something I'd assume you want without asking. Separately, I'd point back to the app's own disclaimer text ("indicative analysis, professional confirmation recommended") — that framing isn't just legal cover, it's the technically honest posture for a phone-photo species classification tool. Even trained entomologists sometimes disagree on *Vespa crabro* vs. *velutina* from a single photo in poor lighting. I don't think 100% reliability is a realistic engineering target for this problem, regardless of how much further work goes into it — and I'd rather tell you that now than imply otherwise.

---

## 3. The "shape vs. selection" distinction, concretely

You quoted my own line back to me, which is fair — I want to make sure it's not just a phrase but something I can show you with evidence. Structured-output enforcement is a well-established technique specifically for constraining *output format*: it guarantees every enum value the model writes is one of the allowed values, and that the JSON always has the required shape. It has no mechanism — none that I'm aware of in Gemini's current API, and none that exists in this class of technique generally — for guaranteeing the model *chooses* to populate every field that's arguably applicable based on what it can see. Photo #10 is a clean illustration: the model's own prose keeps describing wasp-like traits, but the corresponding tag doesn't always get written. Schema enforcement would not change that behavior, because the tag it *does* write is always valid — the gap isn't an invalid value, it's a missing one.

---

## 4. Will M4 fix instability, or only measure it?

**As currently scoped, M4 tests and documents. It does not include a mandate to fix whatever it finds.** I want to be direct about this rather than let it stay ambiguous: if M4's repeated-run testing confirms a pattern like photo #10 (which I'd expect it to, given four rounds of consistent evidence already), that finding would need to become a new, separately scoped and priced piece of work — designed around what the actual data shows, not guessed at in advance. That's the same discipline we've used for everything else in this engagement: I'm not going to fold speculative corrective work into M4's existing price, and I don't think you'd want me to.

---

## 5. M3 vs. M4 acceptance criteria — one clear list

**M3 (already recorded in the implementation plan):**
- Gemini constrained to exact enum values via `responseSchema`.
- Every analysis produces valid JSON and a usable verdict.
- A safe fallback verdict exists if validation still somehow fails.
- Photo #9 (Asian-hornet control) returns `ROUGE` on the M3 acceptance run.

**M4 (already recorded in the implementation plan):**
- Reference bank and automated full-pipeline harness, covering all six categories from the original scope.
- Field-based comparison (exact match on decision-relevant fields; free-text logged, not scored).
- 5x repeated runs on the critical categories (Asian hornet, European hornet), consistency rate reported.
- **Explicitly a measurement deliverable, not a corrective one.**

## 6. Proposed course of action if M4's stability numbers come back bad

I'd propose we agree on acceptable consistency thresholds *before* M4 runs, not after — and that the threshold should depend on verdict severity, not be a single flat number:

- **ROUGE-relevant consistency** needs to be very high — this is the safety-critical case, and I'd want to see something close to full consistency before calling it acceptable.
- **ORANGE_PROBABLE_NON_CIBLE / ORANGE_INSUFFISANCE consistency** can reasonably tolerate more variance, since an inconsistent read in that range degrades to "ask for a second photo" rather than a wrong high-stakes verdict — the system already has a built-in self-correction path for this tier.

If M4's data shows a pattern below whatever threshold we agree on, I'd bring you the specific finding, a proposed fix, and a price for a follow-on milestone at that point — the same way Root Cause A, the tiered wasp rule, and the crabro override each went through you before implementation, not folded in silently.

---

## 7. What I genuinely expect — concrete numbers, not a guarantee

You asked directly what stable result I actually expect, so here it is:

- **On this specific 10-image set, once M3 lands:** I'd expect somewhere around 8–9 out of 10 correct on any given run. Photo #10's pattern is the most likely recurring gap; occasional one-off misses from ordinary variance (what #1, #7 showed across rounds) should become rarer once the safe fallback prevents them from surfacing as validation errors, but I wouldn't call the number a floor — it's an honest estimate from a trend, not an extrapolation I'd stake much confidence in beyond "meaningfully better than today, not perfect."
- **On repeated-run consistency for the two control-style categories** (confirmed Asian hornet, confirmed European hornet): based on what we've seen when the underlying tags were present at all, I'd expect high consistency — my rough expectation is somewhere in the 80–95%+ range — but this is exactly what M4 exists to actually measure, not something I'd ask you to take on faith.
- **On new, real-world images beyond this set:** I don't have a number to give you honestly, and I'd be inventing one if I did. That requires either a larger validation set or production monitoring data (which the app's existing feedback mechanism and community map are already positioned to eventually provide).

**Limitations I expect to remain even after M3 and M4, stated plainly:**
1. Tag-recall gaps like photo #10 may persist without dedicated, separately-scoped follow-on prompt work informed by real M4 data — I don't have a proven fix for this today.
2. Individual hard photos (specific lighting, angle, or coloring conditions) will likely always exist to some degree. That's a property of single-photo visual classification, not a bug to eventually be found and squashed.
3. Confidence about reliability on real-world images beyond this 10-image set stays genuinely unquantified until the reference set grows or production data accumulates.

---

## 8. On your M2/M3 allocation question

Yes, I agree with your allocation: the `elements_visibles` clarification was a prompt-wording ambiguity discovered during M2 validation, the same category as Root Cause A — it belongs in M2 and is now done and confirmed (Round 4, attached separately). Native enum *enforcement* is a different mechanism entirely (API-level constrained decoding vs. prompt wording), and correctly stays in M3.

---

I'd rather hand you this than a cleaner-sounding summary. Happy to talk through any of it, or adjust M3/M4's scope based on where you land after reading this.
