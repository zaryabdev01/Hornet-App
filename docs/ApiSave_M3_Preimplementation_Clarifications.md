# ApiSave — M3 Pre-Implementation Clarifications

Response to your points before M3 starts. Structure follows your message: acceptance criteria, the photo #10 opinion, the revised M4 protocol, then the model-identifier architecture question.

No M3 work has begun and none will begin until you confirm the points below.

---

## 1. M3 Acceptance Criteria — Confirmed

All six are accepted as written and will be the definition of done for M3.

1. Exact enum values enforced through Gemini's native `responseSchema`. Confirmed.
2. Every analysis produces a usable verdict, with a safe fallback path if native validation fails. Confirmed.
3. Native-valid JSON rate and fallback activations reported as two separate metrics. Confirmed — a fallback counts as a usable result and explicitly does not count as a native-valid Gemini output. The M3 report will show both numbers side by side, never a blended "success rate".
4. The same 10 unchanged reference images rerun, raw model outputs included in the deliverable. Confirmed.
5. Photo #9 returns ROUGE, zero unjustified VERT verdicts. Confirmed.
6. Photos #1 and #10 become permanent tracked cases carried into every future validation round. Confirmed.

Item 3 is the only new one and it is the right requirement. Blending fallbacks into a single success figure would hide exactly the number M3 exists to measure.

---

## 2. Photo #10 — Which Mitigation Is Structurally Promising, and When to Try It

### The distinction still holds

`responseSchema` constrains which values are legal when the model writes a field. It has no mechanism to make the model decide to write an applicable optional tag. M3 is a precision fix. Photo #10 is a recall failure. M3 will not fix photo #10, and I am not going to imply otherwise.

### Option 1 — mandatory per-trait fields instead of an optional tag list

This is the structurally stronger of the two, and the argument is internal evidence, not general reasoning about language models.

Across all four rounds, the Q1/Q2/Q3 fields have produced zero recall-type failures. They are mandatory single-trait enums: the model must answer OUI/NON/NON_LISIBLE for each one, so there is no "decide whether to mention it" step to fail. Every recall-type miss observed in this system — photo #10 in all four rounds, plus the earlier-round misses that were later cleared by unrelated fixes — has come from `incompatibilites_cible`, the one place where the model chooses whether to add an item to an optional list.

That is the same model, same prompt, same images, two different field shapes, and a clean split in failure mode between them. Converting the wasp/Polistes traits into mandatory per-trait fields moves them from the shape that has failed into the shape that has not. Photo #10's own free-text description already names the relevant traits repeatedly; the failure is only in the optional write-down step, which a mandatory field removes.

Honest caveat: this is a strong structural argument, not a proven result. Four rounds on ten images is enough to see a pattern, not enough to call it a law. A mandatory field can still be answered NON incorrectly — that would be a wrong answer rather than a silent omission. A wrong answer is at least visible and measurable; a silent omission is not. Even if the experiment does not fix photo #10 outright, it converts an invisible failure mode into one we can count. That alone has value.

### Option 2 — prose/tag consistency check

Weaker, in both forms.

The prompt-level self-check ("verify your description matches your tags") asks the same model that already failed to write the tag to notice it failed to write the tag. It adds a second discretionary step on top of a discretionary step that is already the failure point. It is cheap to try, so it is worth including as a secondary variant in the same experiment, but I would not expect it to carry the fix.

The code-level keyword scan against `description_visible` is more deterministic but introduces a new fragility: it makes the Judge dependent on free-text phrasing in French prose that has no schema, no stability guarantee, and no enforcement. We would be trading a structured-input problem for a string-matching problem, and every model or prompt revision afterwards becomes a potential silent regression in that keyword layer. I do not recommend it as a primary mechanism. It could have a narrow role later as a reporting-only signal — flagging prose/field disagreement in test output without influencing the verdict — which gives us the diagnostic value without putting brittle text matching on the decision path.

### Recommended sequencing

My recommendation: a small, separately scoped experiment run after M3 and before the full M4 apparatus. Not bundled into M3, and not deferred until after M4.

Reasoning:

- **Not inside M3.** M3 is proxy, security, and schema enforcement. Mixing an unproven observation-schema redesign into that work makes M3's own results harder to attribute — if the native-valid rate moves, we would not know whether it was the schema enforcement or the field redesign.
- **Not after M4.** M4's purpose is to measure stability. If the current tag design is genuinely the wrong shape, M4 would be spending its larger effort measuring the run-to-run stability of a design we already suspect is flawed, and then we would redesign it and have to remeasure. That is paying for the expensive measurement twice.
- **Between the two.** Try the cheap fix first, on the existing 10 images, then let M4's strengthened protocol measure the design we actually intend to ship.

If the experiment fails, we have lost roughly two days and gained a documented negative result, and M4 proceeds on the current design with photo #10 as a known, tracked, accepted limitation.

### Rough effort — experiment only

Roughly 1.5 to 2.5 days. Rough estimate, order of magnitude, to be firmed up if you want to proceed — not a quote and not part of M3.

The range reflects real touchpoints rather than a guess: `src/core/schema.js` and `src/core/prompts.js` both carry the tag definitions, and `src/engine/judge.js` consumes them in more than one place — including `normalizeIncompat` and the tiered wasp/Polistes lock that distinguishes "core" from "supporting" tags. That tiered rule is the reason this is not a one-line change: every decision path that currently counts tags has to be re-expressed in terms of per-trait answers, with the same verdict behaviour preserved on the nine images that currently pass. The deliverable would be the modified schema, the reworked Judge paths, and a rerun of all 10 images with raw outputs, so the result is evidenced either way.

I would want your explicit agreement before any of this is started.

---

## 3. Revised M4 Testing Protocol — Proposal

You were right to refuse the 5-run measurement-only scope. Photo #1 is the argument against it: three rounds of an identical wrong answer looked like a systematic bias, and round 4 flipped it to correct with no code change on its path. A 3-to-5 run protocol would have concluded "stable systematic error" and been wrong. Any repeat count that photo #1 could have fooled is not a sufficient repeat count.

### Tiered repeats rather than a flat count

A single flat number is either too expensive everywhere or too weak where it matters. Proposed structure:

- **Initial screen:** 5 runs per image. Cheap pass to find where disagreement exists at all.
- **Escalation:** any image showing any disagreement in the screen goes to 15–20 runs. Disagreement is the trigger, because that is exactly where a small sample cannot separate variance from bias.
- **Critical baseline:** ROUGE-relevant images (Asian hornet, and photo #9) run at 10+ runs minimum even with zero disagreement in the screen. Safety-relevant categories should not get their confidence from a 5-run sample regardless of how clean that sample looks.

This concentrates call volume where the uncertainty and the stakes are, instead of spreading it flat.

### Consistency thresholds by severity

Proposed starting points, to be agreed before the runs so no threshold is negotiated after seeing results:

- **ROUGE-relevant categories:** 95% or better. A missed ROUGE is a safety-relevant miss and should be treated as the strictest bar in the system.
- **Non-target / orange categories** (European hornet, wasp/Polistes, ORANGE_PROBABLE_NON_CIBLE): 85% or better.
- **ORANGE_INSUFFISANCE:** no strict threshold. A verdict that drifts into ORANGE_INSUFFISANCE has failed safe — it asks the user for a retake. It is worth reporting as a quality figure but it should not be treated as a defect gate, because tightening it would push the system away from its safe direction.
- **Unjustified VERT:** zero tolerance, in every category. Not a percentage — a hard fail.

### Coverage

- Photos #1, #9 and #10 permanently included in every round.
- Minimum 3 images per critical category. One image standing in for a whole category is what produced the current situation, where photo #10 is simultaneously our only real wasp/Polistes signal and our only known failure. With three, a single image's variance cannot masquerade as a category-level conclusion.

### Larger reference set — joint dependency

This is a question back to you, not an assumption. A larger real-world set would materially improve what M4 can conclude, particularly for the wasp/Polistes and European hornet categories where we currently generalise from very few images. Whether that is possible depends entirely on whether you can supply additional field photographs, ideally with confirmed ground truth and realistic capture conditions rather than clean reference shots.

Please tell me roughly how many additional images are realistically available and on what timeline. The final M4 scope and price depend on that number, so I would rather size it with you than guess.

### When a category falls below threshold

Proposed policy, explicitly: a below-threshold category produces a written, evidenced finding — category, measured rate, agreed threshold, raw outputs — and becomes a new scoped, separately priced piece of follow-on work that you approve before anything is changed.

It does not become a silent unilateral fix inside M4. M4 measures; it does not quietly repair what it finds. That keeps the measurement honest, since a protocol that fixes as it goes cannot report cleanly on what it found.

### Preliminary effort — flagged as preliminary

The one-time harness build is unchanged from the original scope. What grows is call volume and analysis: more images, more repeats, more categories, roughly 3–5x the original run count.

Preliminary range: 7–9 days, approximately $1,750–$2,250 at the $250/day rate used elsewhere in this engagement. Original scope was 5 days.

This is a preliminary estimate, not a quote and not a request for approval. It cannot be firmed up until the exact image count and repeat counts are agreed, which in turn depends on the additional-images question above. And per your own instruction, the M4 decision waits until M3 results are in front of you. I am giving the number now only so the cost implication of a stronger protocol is visible before you are asked to decide anything.

---

## 4. Server-Side Configurable Model Identifier

Direct answers to your five questions.

### 4.1 Does it fit within M3's proxy scope?

Yes, naturally, and it does not need separate pricing.

Once the Gemini call moves behind a proxy, the model identifier is on the server side by construction — the proxy is the component making the API call, so the model string lives in the proxy's own configuration rather than in `src/services/geminiApi.js` in the mobile bundle. Making it read from proxy configuration instead of a hardcoded constant is the correct shape of that same change, not an addition to it. Hardcoding it into the proxy would actually be the odd choice.

The operational benefit you describe follows directly: an approved replacement model can be activated by a proxy redeploy, with no new mobile build and no store resubmission.

### 4.2 Effort if additional

Effectively absorbed into M3. The allowlist validation logic specifically is the only genuinely new code, and that is a small fraction of a day. No change to the M3 price.

### 4.3 Recommended mechanism

A proxy-side environment variable for the active identifier, plus a small hardcoded allowlist array inside the proxy of explicitly approved exact model strings.

I recommend against Firebase Remote Config here, and I want to be plain about why rather than list it as an option out of politeness. Remote Config solves the problem of changing configuration across a large fleet of clients without a deploy, typically triggered by non-engineers. ApiSave has one lightweight proxy service. Adopting it would add a third-party dependency, an additional account and credential to manage, another failure mode in the analysis path, and a second place where the truth about the active model lives — all to avoid a redeploy that takes minutes and that an engineer performs anyway.

Reconsider it if the architecture later grows to a point where non-engineers need to change configuration across multiple services. That is not the situation today.

### 4.4 Rollback and allowlist

Both yes.

Rollback is a proxy redeploy with the environment variable reverted to the previously approved value. The prior model string stays in the allowlist, so reverting requires no code change — only a configuration change back to a value that was already approved and already passed reference tests.

The allowlist is a validation check at proxy startup and at request time: if the configured identifier is not in the approved array, the proxy refuses to call it. Depending on your preference, that refusal either blocks startup outright, or falls back to the last known-good pinned model and logs loudly. My recommendation is refusing at startup — a misconfigured deploy should fail visibly rather than run on a silently different model.

Adding a new model to the allowlist requires a code change and a deploy, which means it cannot happen accidentally and always passes through review. That preserves the M1 pin discipline exactly: exact stable GA strings only, no `-latest` or preview aliases, no automatic switching, activation only after reference and regression tests pass.

### 4.5 Versioning the model together with prompt and schema

Yes, and this is the most important of the five questions. A server-configurable model identifier without this creates precisely the risk you identified: a model string changed in isolation, running against a prompt or schema it was never validated with.

Recommended mechanism: treat {model identifier, prompt version, schema version} as one atomic protocol bundle, and make the proxy activate a bundle rather than a bare model string. The allowlist then contains approved bundles, not approved model names, and there is no configuration path that lets a model be paired with a prompt or schema combination that was never tested together.

I would build this on the project's existing versioning convention rather than inventing a parallel one. `ENGINE.protocole` in `src/constants/branding.js` (currently `BEEALERT CORE V13.5+MES-1+V3.5+`) already loosely bundles the notion of protocol version. Extending that to be the authoritative bundle identifier — and having the proxy validate against it — keeps one version concept in the system instead of two that can drift apart. The exact extension format is worth agreeing explicitly before implementation, since it becomes the value that appears in analysis records and in every future test report.

---

## Next Step

Nothing on M3 starts until you confirm.

Specifically, I am waiting on:

1. Confirmation of the six acceptance criteria as restated in section 1.
2. Your decision on the photo #10 experiment — whether to scope it as a separate 1.5–2.5 day piece between M3 and M4, or to keep it out for now with photo #10 recorded as a known tracked limitation.
3. Agreement in principle on the revised M4 direction, with the final scope and price deferred until M3 results are in front of you, as you instructed.
4. Confirmation on the architecture question, including the atomic protocol bundle in 4.5, since that shapes the M3 proxy implementation directly.
5. An indication on additional reference images, which determines what M4 can realistically conclude.

Points 1 and 4 are the blocking ones for M3 itself. Points 2, 3 and 5 can be settled in parallel while M3 is underway, provided nothing in 4.5 changes.
