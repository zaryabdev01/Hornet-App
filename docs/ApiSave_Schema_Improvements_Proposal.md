# ApiSave — Schema Enhancement Proposal (Future Phase)

**Prepared for:** Nordine
**Status:** Presented for your review only. **Not part of the current M1–M5 corrective/production plan** and not included in its pricing — this is a separate proposal to consider once that work is underway or complete.

Six potential schema additions were reviewed. Two are recommended as genuinely low-risk and directly aligned with priorities you've already stated. Two are technically real problems worth solving, but the specific mechanism originally proposed isn't recommended — an alternative is given instead. Two are deferred for lack of a current justification.

---

## Recommended

### 1. Per-feature evidence

**Current state:** each of Q1/Q2/Q3 already carries a `description_visible` free-text field.
**Proposed:**
```json
"Q2_abdomen": {
  "reponse": "OUI",
  "evidence": ["dark abdomen", "terminal orange band"]
}
```

**Why this is low-risk:** the Judge doesn't read `description_visible` today and wouldn't need to read `evidence` either — it's pure audit/debugging metadata, invisible to verdict logic.

**Value:** when a verdict looks surprising on a given photo, the specific visual cues behind each answer are visible immediately, without re-running anything. Also useful as documentation while building out the M4 reference image bank.

**One caveat:** this is more free text, and free text is the one channel the system prompt can't fully lock down with an enum. Recommend a lightweight scan of evidence strings for forbidden vocabulary (species names, verdict words) before they're stored or displayed — small effort, closes the one real gap this introduces.

### 2. Image quality breakdown (focus / lighting / occlusion)

**Current state:** a single `lisibilite: haute|moyenne|non_lisible` field covers whether a feature can be judged at all.
**Proposed:**
```json
"image_quality": {
  "focus": "GOOD|LOW",
  "lighting": "GOOD|LOW",
  "occlusion": "NONE|PARTIAL|FULL"
}
```

**Why this matters here specifically:** you've described guided retake as an intentional part of the ApiSave experience. This lets the retake message say "the lighting is the problem" versus "hold the phone steadier" versus "the abdomen is blocked," instead of one generic "unreadable" — more specific guidance within the exact feature you've asked us to preserve and extend.

**Honest scope note:** this is not entirely free of Judge-side changes. To be useful, the reason-code selection logic (`identifierCritereManquant()`) needs to read these new fields when choosing which retake code to return. It does not touch any RED/ORANGE/GREEN verdict threshold — only which retake message accompanies an already-decided "insufficient data" result. This is the same category of change as the two reason-code fixes already planned in M2, extended slightly further.

---

## Considered, not recommended as originally proposed

### 3. Continuous confidence scores (0.0–1.0) per feature

**What was proposed:** replacing `confidence: "HIGH"` with a float such as `confidence: 0.96`.

**Why it's not recommended:** a language model asked to output a precise probability produces a plausible-looking number, not a statistically calibrated one — there's no ground truth behind "0.96" the way there would be from a trained classifier. Adopting it risks the opposite of the intended effect: appearing more rigorous while actually being less trustworthy, on a system whose entire design premise is zero variability and nothing invented.

It also isn't free of Judge changes, despite first appearances: `judge.js` currently branches on the literal strings `LOW`/`MEDIUM`/`HIGH` in two places. Moving to floats means rewriting those comparisons and inventing new numeric cutoffs — a genuine Judge change, not a schema-only one.

**Recommended alternative, if finer granularity is wanted:** add one more categorical step — `LOW / MEDIUM / HIGH / VERY_HIGH` — rather than going continuous. Same practical benefit, keeps the strict enum-validation approach `schema.js` already relies on throughout, no invented thresholds.

### 4. Continuous visibility score (0.0–1.0), replacing the current readability field

Same false-precision issue as #3, with a larger Judge impact: today, unreadability is a hard boolean gate (`lisibilite === 'non_lisible'`). A float would force a brand-new, invented cutoff (0.3? 0.4?) into the Judge to decide what counts as unreadable — exactly the kind of unapproved decision-rule change you've asked to have flagged and justified separately.

**Recommended alternative:** extend the existing enum with one more tier — `haute | moyenne | faible | non_lisible` — giving the "slightly blurry vs. extremely blurry" distinction this proposal is really after, without a float or a new Judge threshold.

---

## Deferred — no current justification

### 5. Bounding box (insect location coordinates)

The stated rationale is that future versions could crop automatically — no current feature consumes this. Per your own standard that anything beyond identified need be justified separately before inclusion, this doesn't clear that bar yet. Worth revisiting if a specific future feature (auto-crop, zoom-to-subject, region highlighting) is actually planned, at which point it would have a concrete justification rather than a speculative one.

### 6. General "notes" catch-all field

This overlaps with the evidence field (#1) — the same observation could plausibly land in either field, and without a crisp rule distinguishing them, the model would likely be inconsistent about which one it uses from call to call. That inconsistency works against the determinism this system is built around. Recommend not adding this alongside evidence; if a catch-all is wanted later, it should replace evidence rather than sit next to it.

---

## Summary

| # | Item | Recommendation | Judge impact |
|---|---|---|---|
| 1 | Per-feature evidence | **Adopt** | None |
| 2 | Image quality breakdown | **Adopt** | Reason-code selection only — no verdict thresholds touched |
| 3 | Float confidence | Not recommended — use an extra enum tier instead | Would require Judge changes despite appearance |
| 4 | Float visibility score | Not recommended — use an extra enum tier instead | Would require a new, invented Judge threshold |
| 5 | Bounding box | Defer — no current consumer | None, but no justification yet either |
| 6 | Notes catch-all | Drop — redundant with #1 | None, but undermines determinism |

---

## Scope and timing

None of this is included in the current M1–M5 milestones or their pricing. If you'd like to proceed with items 1 and/or 2, the recommendation is to scope and price them as their own milestone once M1–M5 is underway or complete, rather than adding to the corrective work already agreed.
