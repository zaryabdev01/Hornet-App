# ApiSave — Read-Only Technical Audit Report

**Scope:** Sanitized source code (`ApiSave_Source_Sanitized_Audit.zip`) vs. the canonical reference defined by the client as PDF Section 1.3 (`VISION_SYSTEM_PROMPT_APISAVE`, `VISION_USER_PROMPT`, JSON format, pages 2–5), with the remaining PDF sections (notably §1.4, the Judge) treated as **descriptive business-rules background**, not authoritative code, per client clarification.
**Constraint honored throughout:** read-only. No source files were modified to produce this report.

---

## 1. Executive Summary

The application's core architecture is sound and already implements the separation the client requires: Gemini is confined to producing neutral, schema-validated observations ([src/core/prompts.js](../src/core/prompts.js), [src/core/schema.js](../src/core/schema.js)); the deterministic Judge ([src/engine/judge.js](../src/engine/judge.js)) is the sole component computing the RED/ORANGE/GREEN verdict. That separation is real and correctly enforced in code, not just in comments.

However, comparing the live prompt and Judge against the canonical reference (§1.3) and the described business rules (§1.4) surfaces **11 concrete divergences**, three of which are functionally significant:

| # | Finding | Severity |
|---|---|---|
| D1 | `indices_artificiels` override in the structure Judge ignores strong nest evidence on a single artificial-looking cue | **CRITICAL** |
| D2 | Beetle/hard-carapace lock tags the wrong incompatibility type (semantically inverted) | **HIGH** |
| D3 | The prompt's explicit fail-fast `ETAPE 1–5` pipeline was flattened/reordered into named rule blocks + a separate guide | **HIGH** |
| D4–D11 | See §4 and §6 | LOW–MEDIUM |

The rest of this document walks through the evidence for each.

---

## 2. Vision Prompt — Section-by-Section Comparison

### 2.1 What matches exactly (confirmed fidelity — no action needed)

- The `<INTERDICTIONS ABSOLUES>` block (no species names, no verdict vocabulary, single-individual rule) is preserved near-verbatim.
- The `VERROU GUEPE/POLISTE/HYMENOPTERE STRICT` trigger conditions (silhouette, leg color, stripe patterns, anti-artifact triple rule) are preserved verbatim.
- Q1_THORAX and Q2_ABDOMEN's core OUI conditions, and the "REGLE ANTI-ARTEFACT TRIPLE" (courbure + répétition + homogénéité), are preserved verbatim.
- The overall JSON shape (`etape_1_declencheur`, `etape_2_individu`, `Q1_thorax`, `Q2_abdomen`, `Q3_morphologie`, `incompatibilites_cible`, `structure`) matches field-for-field.
- `structure.texture_papier_carton` + `strates_repetitives` "never sufficient alone" rule is preserved verbatim.

### 2.2 Divergences

**D3 — [HIGH] The five-step fail-fast pipeline structure was flattened.**
Canonical §1.3 organizes the entire analysis as five explicit, sequentially-gated steps under `<PIPELINE ANALYSE DETERMINISTE>`:
> `ETAPE 1: VERROUX STRUCTURES ET PIEGES (MODE FAIL-FAST)` → `ETAPE 2: GESTION DES PERTURBATEURS` → `ETAPE 3: VERROUX D'EXCLUSION INSECTE` → `ETAPE 4: EVALUATION CIBLE` → `ETAPE 5: EVALUATION STRUCTURE`

The live prompt ([prompts.js](../src/core/prompts.js)) drops this explicit staged-gate framing. The equivalent content (object/trap detection, VERROU rules, Q1–Q3, structure evaluation) still exists, but is reorganized into flat named blocks ("VERROU GUEPE/POLISTE...", "VERROU ANTI-PIEGES VEGETAUX", etc.) plus a separate, shorter "GUIDE D'ANALYSE SEQUENTIEL" (7 steps) near the end of the file — a second, different sequencing scheme layered on top.

**Why this matters:** instruction order and grouping measurably affects how an LLM weighs and follows a prompt. This is the most likely candidate for what the client's original brief described as "reorganized to facilitate API integration," and the most plausible root cause of the consistency regression the client reported. **Recommendation: restore the explicit ETAPE 1–5 gated structure verbatim, and fold the current "GUIDE D'ANALYSE SEQUENTIEL" back into it rather than keeping it as a separate parallel scheme.**

**D2 — [HIGH] Beetle/carapace lock assigns a semantically wrong incompatibility tag.**
- §1.3: *"Carapace dure/elytres visibles → Q3 = 'NON' + 'INSECT BEETLE FEATURES VISIBLE'"*
- [prompts.js:53](../src/core/prompts.js): *"Carapace dure/elytres visibles → Q3_morphologie.reponse = 'NON' + incompatibilites_cible += `'morphologie_filiforme'`"*

`morphologie_filiforme` means *thread-thin/slender* — the opposite of a hard-shelled, armored beetle body. This reads as a copy/paste error introduced during the prompt's reorganization. It doesn't change the Q3=NON outcome for that specific case, but it pollutes `incompatibilites_cible` with an inaccurate tag, which the Judge's `MORPHO_TYPES` counting logic (`nbMorpho`) then treats at face value.
**Recommendation:** fix the tag. Also see D6 — the codes the canonical text actually specifies here (`INSECT BEETLE FEATURES VISIBLE`, `INSECT HAIRY BODY INCOMPATIBLE`) don't exist at all in the current `incompatibilites_cible` vocabulary.

**D4 — [MEDIUM] `STOP_EVALUATION_CIBLE` instruction dropped from the wasp/Polistes lock.**
§1.3 ends that lock with an explicit `-> STOP_EVALUATION_CIBLE`. The live prompt forces Q2/Q3 to NON but never includes the explicit stop instruction. Functionally the forced values likely dominate, but the free-text fields (`description_visible`, `justification`) aren't constrained by enums — dropping the explicit stop could let the model keep reasoning past the lock in ways that leak into those free-text fields inconsistently.

**D5 — [MEDIUM] Additions beyond the canonical wording, not present in §1.3 at all:**
- `PRIORITE ABSOLUE A L'INSECTE` block (insect analysis overrides structure analysis) — new guidance, not in canon.
- `REGLE ANTI-PERTURBATION`'s ignore-list is expanded (adds shadows, hot/cold lighting, other insects nearby, commercial trap containers) beyond §1.3's shorter ETAPE 2 list.
- Explicit Q2 "NON" trigger list and revised Q3 "NON" wording (adds "compacte-velue", drops explicitly named "jonction etroite, silhouette tres fine" as direct Q3 triggers).
- `SEPARATION DES MODES` block (fixed fallback values for whichever branch — insect vs. structure — wasn't taken).

None of these are obviously *wrong* — several look like reasonable engineering additions (e.g. `SEPARATION DES MODES` plausibly exists to guarantee the JSON is always schema-complete, which matters for `schema.js` validation). But the client's own stated rule is that V14's wording must not be rewritten *or added to* without explicit approval. **Recommendation: present this list to the client as a keep/revert decision per item, rather than assuming any of them are pre-approved.**

**D6 — [MEDIUM] Reason codes exist in `constants/verdicts.js` but are never reachable.**
`INSECT_HAIRY_BODY_INCOMPATIBLE` and `INSECT_BEETLE_FEATURES_VISIBLE` are defined in [verdicts.js](../src/constants/verdicts.js) (mirroring §1.3/§1.4's dedicated reason codes for those two locks) but no code path in [judge.js](../src/engine/judge.js) ever returns them — those cases fall through into the generic `nbMorpho` incompatibility count instead. Net effect: a user photographing an obvious bumblebee or beetle gets a generic "insufficient criteria" message instead of a specific, correct explanation. This is a fidelity gap versus the described Judge behavior, not a safety issue.

**D7 — [LOW] JSON enum split: `fond_dominant`.**
§1.3: single combined value `mixte_jaune_noir_alterne`. Live schema/prompt ([schema.js](../src/core/schema.js), [prompts.js](../src/core/prompts.js)): split into two separate values, `mixte` and `jaune_noir_alterne`. Currently has no behavioral impact — `judge.js` doesn't consume `fond_dominant` in any branching logic — but it is a structural deviation from the pinned JSON shape and should be reconciled for strict fidelity.

---

## 3. Gemini API Configuration Review

Since §1.3 describes what the client pastes manually into Gemini's interface, not an API config, this section checks whether the live integration ([geminiApi.js](../src/services/geminiApi.js)) preserves equivalent conditions.

- ✅ `temperature: 0` — matches the "zero variability" production intent stated in the client's own file headers.
- ✅ System prompt sent via the dedicated `system_instruction` API field, separate from the user turn — the technically correct way to reproduce a system/user split.
- ⚠️ **[MEDIUM]** `response_mime_type: 'application/json'` is set, but **no `response_schema`** is passed in `generationConfig`. Gemini supports enforcing a strict output schema natively; the now-unused OpenAI path ([visionApi.js](../src/services/visionApi.js)) *did* use one (`response_format: json_schema, strict: true`). Right now, JSON conformance depends entirely on prompt wording plus post-hoc validation/regex-repair ([jsonParser.js](../src/utils/jsonParser.js)) — weaker than the removed implementation. **Recommendation: add a `responseSchema` mirroring `core/schema.js`.**
- ⚠️ **[HIGH — carried over from earlier findings]** `GEMINI_API_KEY` ships inside the client app bundle via `expo-constants`/EAS secrets, extractable from the built binary. The abandoned OpenAI path routed through a server-side proxy (`PROXY_URL`/`PROXY_SECRET`), which doesn't expose the key client-side.
- ❓ **Open question for the client:** which exact Gemini model and generation settings does he use when manually pasting the prompt into the Gemini interface for reference testing? The app currently calls `gemini-2.5-flash`. If the reference behavior was produced on a different model/version, some of the "less consistent" verdicts he's observed could stem from a model mismatch, independent of any prompt wording issue.

---

## 4. Judge Logic — Rules Described in §1.4 vs. `judge.js`

### 4.1 Confirmed fidelity (no action needed)

- `CONFIANCE` thresholds are byte-for-byte identical: ROUGE 92, ORANGE_PLAFOND 72, ORANGE_PROBABLE_NON_CIBLE 65, ORANGE_INSUFFISANCE 55, VERT 85.
- `calibrateConfiance()` — identical adjustment rules and caps.
- `effectiveReponse()` (LOW-confidence "NON" downgraded to unreadable) — identical.
- The ROUGE rule (all of Q1/Q2/Q3 = OUI) — identical.
- The structure score formula (weights for `forts`, `faibles`, texture/strates combinations, shape, suspension, quality) — identical, including the `score >= 3` threshold for ORANGE_PLAFOND.
- The two "absolute morphological shortcut" rules (tiny-insect and ≥2 morphological incompatibilities at HIGH confidence → VERT) — identical.

### 4.2 Divergences

**D1 — [CRITICAL] `indices_artificiels` override ignores strong nest evidence.**
- §1.4 describes: `artificialOnly = indices_artificiels.length > 1 && !hasStrongNestMarkers` — i.e., it takes **more than one** artificial-looking cue, **and** requires the *absence* of strong nest markers, before overriding to "non-biological."
- Live [judge.js](../src/engine/judge.js):
  ```js
  if (s.indices_artificiels.length >= 1) {
    return formatVerdict('VERT', 'Indice(s) artificiel(s) visible(s) — structure non biologique.',
      'OBJECT_NON_BIOLOGICAL_STRUCTURE', analyseId, timestamp);
  }
  ```
  This fires on a **single** artificial cue, **unconditionally**, before the structure score or `hasStrongNestMarkers` is even computed.

**Why this is the most important finding in this audit:** real Asian hornet nests are frequently built directly on or against artificial structures — gutters, eaves, utility poles, sheds, fences. If Gemini flags even one artificial-looking element (very plausible for a nest photographed against a man-made backdrop) alongside genuinely strong nest markers (multiple strong markers, confirmed cardboard texture, confirmed layering, `structure_strength: STRONG`), the current Judge discards all of that evidence and returns a flat "nothing suspicious" (VERT). This is a false-negative risk in exactly the scenario this app exists to catch. **Recommend prioritizing this as the first fix, independent of the rest of the prompt-fidelity work**, and restoring the `> 1 && !hasStrongNestMarkers` guard.

### 4.3 Other observations (informational, not necessarily defects)

- **D8 — [LOW/INFO]** `identifierCritereManquant()` gives specific, per-criterion retake guidance (`RETAKE_THORAX` / `RETAKE_ABDOMEN` / `RETAKE_MORPHOLOGY` / `RETAKE_DORSAL_VIEW`) where §1.4 used one generic `INSECT_TOO_BLURRY` code for the same case. This reads as a genuine UX improvement, but per the client's own rule (no unapproved Judge changes), it should be explicitly confirmed rather than assumed acceptable.
- **D9 — [INFO]** The `ACTIONS` data model was redesigned: §1.4/PDF §3.1 describes short action keywords (`CONTACT PRO`, `SIGNAL`, `RETAKE`, `NO_ACTION`) mapped to UI buttons with icons via a UI lookup table. The live implementation ([verdicts.js](../src/constants/verdicts.js)) instead stores one descriptive sentence per verdict. This is a product/UX-level divergence from the described design, not a logic bug — flagging for the client's awareness since it changes the on-screen action affordances from the originally described button-based UX.

---

## 5. Non-Prompt, Non-Judge Findings (carried over)

- `eas.json` contains real Apple Developer identifiers (Apple ID email, ASC App ID, Team ID) in the sanitized package. **Client confirmed unintentional inclusion, not credentials — continued confidentiality requested, no further action needed from our side.**
- The legacy OpenAI vision path ([visionApi.js](../src/services/visionApi.js)) is dead code — not imported anywhere active — but is a more security-conscious pattern (server-side proxy, strict JSON schema) than the current live Gemini integration. Worth deciding whether to formally retire it or use it as the template for hardening the Gemini path.

---

## 6. Consolidated Findings Table

| ID | Area | Severity | Summary |
|----|------|----------|---------|
| D1 | Judge (structure) | **CRITICAL** | Single artificial cue overrides strong nest evidence unconditionally |
| D2 | Prompt | **HIGH** | Beetle lock tags wrong incompatibility type (`morphologie_filiforme`) |
| D3 | Prompt | **HIGH** | ETAPE 1–5 fail-fast pipeline flattened/reordered — likely root cause of reported inconsistency |
| D4 | Prompt | MEDIUM | `STOP_EVALUATION_CIBLE` instruction dropped |
| D5 | Prompt | MEDIUM | Multiple additions beyond canonical wording — need per-item approval |
| D6 | Judge/Schema | MEDIUM | Two reason codes defined but unreachable in Judge logic |
| Gemini config | API | MEDIUM | No `response_schema` enforced on Gemini call |
| Gemini config | API | HIGH | API key shipped client-side (carried over) |
| D7 | Schema | LOW | `fond_dominant` enum split vs. canonical single value |
| D8 | Judge | INFO | Retake guidance more specific than canon — likely improvement, needs sign-off |
| D9 | Product/UX | INFO | Action model redesigned (sentences vs. tagged buttons) |

---

## 7. Open Questions for the Client

1. Which exact Gemini model + generation settings are used when you manually test the reference prompt (model version, temperature, any system-instruction settings in AI Studio)?
2. For each item in D5 (prompt additions beyond canonical wording): keep, revert, or refine?
3. For D8 (more specific retake guidance than canon): keep the improvement, or match canon's generic message?
4. For D9 (action button model vs. descriptive sentence): intentional product direction, or should the button-based UX be restored?

---

## 8. Recommended Milestone Plan (preliminary — effort in working days, to be refined once the open questions above are answered)

| Milestone | Scope | Estimate |
|---|---|---|
| **M1 — Prompt fidelity restoration** | Restore explicit ETAPE 1–5 structure; fix D2 tag bug; resolve each D5 addition per client decision; reconcile D7 enum split | 2–3 days |
| **M2 — Judge correctness fixes** | Fix D1 (critical, first priority); wire up D6's unreachable reason codes or remove them; resolve D8 per client decision | 2–3 days |
| **M3 — Gemini API hardening** | Add `response_schema`; evaluate/implement a server-side proxy for API key security (mirroring the retired OpenAI pattern); formally retire or repurpose `visionApi.js` | 2–4 days |
| **M4 — Regression test suite** | Build a labeled reference image set with expected observation/verdict pairs; automated harness to run `judge.js` (and ideally the full pipeline) against it so future changes can be verified against known-good behavior | 3–5 days (depends on reference image volume available) |
| **M5 — Production readiness** | Secrets hygiene (`eas.json`), EAS build config review, iOS/Android build & submit dry run, store metadata | 3–6 days |

---

*Prepared as a read-only audit deliverable. No source files were modified in the course of this review.*
