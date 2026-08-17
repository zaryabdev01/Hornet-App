# ApiSave — Technical Audit Report

**Prepared for:** Nordine
**Scope:** Sanitized source code review, compared against the canonical Vision prompt (PDF §1.3 — `VISION_SYSTEM_PROMPT_APISAVE`, `VISION_USER_PROMPT`, JSON format) and the Judge rules described in the PDF, per your clarification of 2026-07-29.
**Method:** Read-only review. No source files were modified in the course of this audit.
**Note on scope:** as instructed, only §1.3 was treated as the exact reference to diff against. The remaining PDF sections were used strictly as functional/business-rule context (verdict logic, offline behavior, GPS workflow, UI, safety copy) — none of that code was treated as authoritative or considered for reuse.

---

## Summary

The application's core architecture already implements the separation you require: Gemini is confined to producing neutral, schema-validated observations, and a fully deterministic Judge is the only component that computes the final verdict. That split is real in the code, not just aspirational.

Comparing the live implementation against §1.3 and the Judge rules you described surfaces **11 concrete differences**. Two are functionally important enough to prioritize before anything else:

1. **A Judge logic bug that can suppress a correct nest detection** (Finding 1, below) — this is a genuine false-negative risk and, in my view, the most urgent item in this report regardless of the rest of the prompt-fidelity work.
2. **A structural reorganization of the prompt's step-by-step pipeline** (Finding 3) — this is the most likely explanation for the consistency regression you described when the prompt was adapted for API integration.

Everything else is lower-impact: a mislabeled tag, some prompt additions that need your sign-off, and a few robustness/security recommendations for the Gemini integration.

---

## Part 1 — Vision Prompt vs. §1.3

### What already matches exactly

- The absolute prohibitions (no species names, no verdict vocabulary, single-individual rule) are preserved almost word for word.
- The wasp/Polistes exclusion lock — silhouette, leg coloring, stripe pattern, and the "triple anti-artifact rule" for stripes — is preserved verbatim.
- The core OUI conditions for Q1 (thorax) and Q2 (abdomen), including the abdomen anti-artifact rule (curvature + repetition + uniformity), are preserved verbatim.
- The overall JSON response shape matches field for field.
- The rule that cardboard texture and layering are "never sufficient alone" to confirm a nest is preserved verbatim.

### Differences found

**Finding 3 — Pipeline structure was flattened (High impact)**
§1.3 organizes the entire analysis as five explicit, sequential, gated steps (`ETAPE 1` through `ETAPE 5`, under a section literally called "PIPELINE ANALYSE DETERMINISTE"). The live prompt keeps the same underlying content but reorganizes it into loosely named rule blocks, plus a separate, different 7-step "analysis guide" placed elsewhere in the file. The content wasn't lost, but the explicit staged-gate framing was.

This matters because instruction ordering and grouping measurably affects how an LLM weighs and follows a prompt — it's the most plausible technical explanation for what you described as reduced consistency after the prompt was adapted for the API. **Recommendation: restore the explicit ETAPE 1–5 structure verbatim, and merge the current secondary guide back into it rather than keeping two separate sequencing schemes.**

**Finding 2 — Beetle exclusion tags the wrong label**
§1.3 specifies that a hard carapace / visible elytra should be tagged `INSECT BEETLE FEATURES VISIBLE`. The live prompt tags the same case as `morphologie_filiforme` — which means "thread-thin/slender," the opposite of a hard-shelled beetle body. This looks like a copy/paste slip introduced during the reorganization. It doesn't change the immediate outcome (the criterion still resolves to NON), but it feeds a semantically wrong tag into the Judge's incompatibility counting.

**Finding 4 — A stop instruction was dropped**
§1.3's wasp/Polistes lock ends with an explicit instruction to stop further evaluation of that individual. The live prompt still forces the two dependent answers to NON, but no longer includes the explicit stop directive — free-text description fields aren't covered by that forcing, so this is worth restoring for consistency.

**Finding 5 — Several additions exist beyond the canonical wording**
None of these are necessarily wrong, but per your rule that V14's wording must not be modified without approval, I'm listing them rather than assuming any are pre-approved:
- A new "insect analysis takes priority over structure" rule, not present in §1.3.
- An expanded list of things to ignore during analysis (shadows, warm/cool lighting, other insects nearby, commercial trap containers) — §1.3's equivalent list is shorter.
- An explicit list of Q2/Q3 "NON" triggers that §1.3 doesn't spell out the same way.
- A block of fixed fallback values used to keep the JSON complete when only the insect or only the structure branch applies (this one plausibly exists for technical reasons — to guarantee the response always passes schema validation — but is still an addition to the canonical text).

**Finding 6 — Two reason codes described in your materials are never actually produced**
The dedicated codes for "hairy body incompatible" and "beetle features visible" exist in the codebase's constants but no code path currently returns them — those specific cases fall back to a generic insufficient-criteria message instead of a precise one. Not a safety issue, but a fidelity gap against the described behavior.

**Finding 7 — A minor JSON enum difference**
§1.3 uses a single combined value for one field (`mixte_jaune_noir_alterne`); the live implementation splits it into two separate values. This currently has zero effect on verdicts since the Judge doesn't read that field at all — but it's a deviation from the pinned JSON shape worth reconciling.

---

## Part 2 — Gemini API Configuration

Since §1.3 is what you paste manually into Gemini's interface rather than an API configuration, this section checks whether the live integration reproduces equivalent conditions.

- **Temperature is set to 0** — consistent with the zero-variability intent stated in your own reference materials.
- **The system prompt is sent through Gemini's dedicated system-instruction channel**, separate from the user turn — the correct way to reproduce a system/user split programmatically.
- **The Gemini call does not use a structured-output schema.** It only requests JSON via MIME type and relies on the prompt wording plus after-the-fact validation to catch malformed responses. A previous integration (now unused, built against OpenAI) *did* enforce a strict schema server-side. Recommendation: add Gemini's native response-schema enforcement to reduce reliance on the model simply "remembering" to format correctly.
- **The Gemini API key currently ships inside the mobile app itself**, which means it's technically extractable from the built binary. The previous OpenAI integration routed calls through a server-side proxy instead, which doesn't expose the key client-side. Worth deciding whether that pattern should be reinstated for the Gemini call.
- **One question I can't resolve without your input:** which exact Gemini model and settings do you use when manually pasting the prompt for reference testing? The app currently calls `gemini-2.5-flash`. If your reference results were produced on a different model or version, that alone could account for some of the consistency differences you've observed, independent of anything in the prompt text.

---

## Part 3 — Judge Rules vs. Your Described Logic

### What already matches exactly

- The confidence values attached to each verdict (92 / 72 / 65 / 55 / 85) are identical.
- The confidence-calibration adjustments (how the displayed percentage shifts based on how certain each individual observation was) are identical.
- The rule that a low-confidence "NON" is treated as unreadable rather than a real "no" is identical.
- The headline rule — all three criteria answered OUI on the same individual triggers the highest-severity verdict — is identical.
- The nest-structure scoring formula (how markers, texture, layering, shape, and quality combine into a score) is identical, including the threshold for a nest-probable verdict.
- Both "absolute" morphological shortcuts (an insect too small to be a hornet; two or more clear morphological mismatches at high confidence) resolve to the same safe verdict in both versions.

### Finding 1 — A Judge rule can suppress a correct nest detection (Critical)

Your description specifies that the "this looks artificial, not biological" override should only fire when **more than one** artificial-looking cue is present **and** no strong nest markers were also detected. In the live code, that override fires on **a single** artificial cue, unconditionally — before the nest-evidence score is even calculated, and regardless of how much strong nest evidence is also present.

This matters in practice because real hornet nests are very often built on or against artificial structures — gutters, eaves, sheds, utility poles. If Gemini flags even one artificial-looking element in a photo that also shows strong, genuine nest markers, the current logic discards all of that nest evidence and reports nothing suspicious. That's a false-negative risk in precisely the situation this app is meant to catch, and I'd recommend treating this as the first fix, independent of the prompt-fidelity work above.

### Other observations (not necessarily defects — flagging for your decision)

- The current code gives more specific retake guidance than your description calls for — e.g. it tells the user exactly which body part to re-photograph, rather than a single generic "too blurry" message. This looks like a genuine improvement, but since you've asked that Judge behavior not change without approval, I'm flagging it rather than assuming it's pre-approved.
- The way recommended actions are represented was redesigned: your materials describe short action tags (e.g. "contact a professional," "report," "retake") mapped to distinct UI buttons; the live app instead shows one descriptive sentence per verdict. This is a product/UX-level difference, not a logic bug, but it changes the on-screen experience from what's described in your reference materials.

---

## Part 4 — Other Notes

- The now-unused OpenAI-based vision integration in the codebase is dead code (not referenced anywhere active), but it uses a more security-conscious pattern than the current live Gemini path — a server-side proxy and a strict schema. It may be useful as a template when hardening the Gemini integration, or it can simply be removed.
- Regarding the Apple Developer identifiers found earlier in `eas.json` — understood that these are not credentials and will continue to be treated as confidential, as agreed.

---

## Findings at a Glance

| # | Area | Impact | Summary |
|---|------|--------|---------|
| 1 | Judge — structure | **Critical** | A single artificial-looking cue can override genuine, strong nest evidence |
| 2 | Prompt | High | Beetle exclusion tags the wrong (semantically inverted) label |
| 3 | Prompt | High | Five-step gated pipeline was flattened/reorganized — likely cause of reported inconsistency |
| 4 | Prompt | Medium | Explicit "stop evaluation" instruction dropped from the wasp/Polistes lock |
| 5 | Prompt | Medium | Several additions beyond the canonical wording — need your decision, item by item |
| 6 | Judge | Medium | Two described reason codes are never actually produced by the current logic |
| — | Gemini config | Medium | No structured-output schema enforced on the Gemini call |
| — | Gemini config | High | API key ships inside the mobile app rather than behind a server-side proxy |
| 7 | Schema | Low | One JSON field's enum values are split differently than the canonical version (no current effect on verdicts) |
| — | Judge | Informational | Retake guidance is more specific than described — likely an improvement, needs sign-off |
| — | Product/UX | Informational | Recommended-action presentation was redesigned from tagged buttons to sentences |

---

## Questions for You

1. Which exact Gemini model and settings do you use for manual reference testing, so the API integration can be verified against the same baseline?
2. For each item in Finding 5 — keep as is, revert to the canonical wording, or refine?
3. For the more specific retake guidance noted under Part 3 — keep the improvement, or match the original generic message?
4. For the recommended-action presentation (buttons vs. sentences) — is the current design intentional, or should the original button-based layout be restored?

---

## Proposed Next-Phase Plan

Pending your answers above, here's how I'd sequence the corrective work as separate milestones:

| Milestone | Scope | Estimate |
|---|---|---|
| **M1 — Prompt fidelity restoration** | Restore the explicit five-step pipeline structure; fix the beetle-label bug; resolve each Finding 5 item per your decision; reconcile the JSON enum difference | 2–3 days |
| **M2 — Judge correctness fixes** | Fix Finding 1 first (critical); resolve the unreachable reason codes; resolve the retake-guidance question per your decision | 2–3 days |
| **M3 — Gemini API hardening** | Add structured-output schema enforcement; evaluate moving the API key behind a server-side proxy; retire or repurpose the unused OpenAI integration | 2–4 days |
| **M4 — Regression test suite** | Build a labeled set of reference images with known-correct outcomes, and an automated harness to verify future changes don't silently shift verdicts | 3–5 days (depends on how many reference images you can provide) |
| **M5 — Production readiness** | Secrets hygiene, build configuration review, iOS/Android build & submit dry run, store metadata | 3–6 days |

I'm happy to start with M1/M2 as soon as you confirm the open questions above — those two cover both the critical bug and the most likely source of the consistency issue you originally raised.

---

*This report was prepared as a read-only deliverable. No source files were modified during this review.*
