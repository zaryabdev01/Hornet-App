# ApiSave — Photo 1: Bounded Diagnostic (no implementation)

**Prepared for:** Nordine
**Date:** 2026-08-19
**Status:** Analysis only — nothing implemented, `judge.js` unchanged since the last delivery, build still on hold.

---

## Direct answer, upfront

**No reliable distinguishing signal exists in the current data or current fields.** I compared every available field, including the free-text descriptions, across all 9 Photo 1 calls and the 5 confirmed-target misses. The two groups are not separable — the same visual description language, the same field values, and the same `lisibilite`/`confidence` split show up on both sides. Details and evidence below, then my answer to your architecture question, then a recommendation.

## What I compared

**Group A — Photo 1**, every raw call I have data for today: 2 from earlier testing plus the 6 fresh stability-check passes (8 with full detail; a 9th earlier call also exists with a different profile, noted below) — every field: `reponse`, `confidence`, `lisibilite`, `description_visible`, `elements_visibles`, and the `etape_1_declencheur.justification` free text.

**Group B — the 5 confirmed-target misses**, same full detail: 2 misses from `ref_image_04.jpg`, 3 from `ref_image_09.jpg`, compared directly against the *passing* calls of the exact same two images (so the comparison is apples-to-apples: same physical photo, different call outcome).

## Finding 1: `lisibilite`/`confidence` don't correlate with anything visible in the description text

For both `ref_image_04.jpg` and `ref_image_09.jpg`, I lined up a passing call against a failing call of the *same photo* side by side. The description text is substantively identical between them — same claims about thorax colour, same abdomen description, same morphology language — just reworded. Example, `ref_image_04.jpg`:

- **Pass 1 (miss, lisibilite moyenne):** "Thorax de couleur majoritairement noire et sombre."
- **Pass 3 (hit, lisibilite haute):** "Thorax de couleur noire mate homogène."

Nothing in either sentence describes a smaller, blurrier, or more distant subject — they're describing the same thing with different words. This pattern repeats across every pair I compared. **My read: `lisibilite` and `confidence` are largely self-rating noise on these two reference images, not a measurement of anything that actually changed about the photo.**

## Finding 2: the "multiple insects in frame" theory doesn't hold either

Photo 1's `justification` field does consistently mention multiple insects ("plusieurs insectes... sur le couvercle d'un bocal"), which looked like a promising lead — a group shot inherently gives each individual insect less of the frame. But `ref_image_09.jpg`, a *confirmed, correctly-classified* target, **also** frequently describes multiple insects ("Plusieurs individus exploitables sont clairement visibles") — including on calls that correctly fired ROUGE. `ref_image_04.jpg` describes a single insect throughout, on both its hits and its misses. So "multiple insects present" doesn't separate the groups either — it shows up on both sides of both the pass/fail line and the Photo-1/confirmed-target line.

## Finding 3: no schema field currently exists for frame occupancy or distance

I checked `schema.js` directly. The only size-related field is `insecte_taille_minuscule_non_frelon` — a species-disqualification tag meaning "this insect is objectively tiny relative to a visible reference object," used to rule out non-hornet insects. It's a different concept entirely (it wouldn't even apply here, since it only fires when Q3 = NON, and Photo 1's problem calls all have Q3 = OUI). There is no field today that captures "how much of the frame does the subject occupy."

---

## Your second question: could a dedicated, measurable signal be added?

Yes, but with an important caveat, and it's a genuinely different kind of change from anything done in M2 so far — worth being precise about the trade-off before you decide.

**Option: ask the model to self-report a size/framing estimate** (e.g., "what fraction of the frame does the subject occupy"). This would be a schema addition (new field), not just a Judge or prompt change. But Findings 1-2 above are the reason I'm not confident this would actually help: it would be the model self-rating its own view *again*, from the same image, the same way `confidence` and `lisibilite` already are — and those two fields already show exactly this kind of same-photo, call-to-call noise. I don't have a good reason to expect a third self-rated field to be meaningfully more stable than the two you already have.

**Option: a real, deterministic measurement** — e.g., asking the model for the subject's bounding box in pixel/relative coordinates, then computing frame-occupancy as actual arithmetic rather than a self-rated judgment. This is a fundamentally different, more reliable class of signal, because it turns "is this photo good enough" from an opinion into a number. But it's a genuinely bigger change: a new schema field, new Judge logic to consume it, and validation that the model's bounding-box coordinates themselves are trustworthy (a separate question from what's tested here). This is architecture-level, not a bounded tweak, and I'd want to scope and cost it as its own piece of work rather than fold it into M2's remaining time.

## Your third question: is this diagnostic within M2, and did it cost anything additional?

**Yes to both — within scope, no additional cost.** This was pure analysis against data and test infrastructure already produced under M2 (the stability-check set, the regression sets, the sanity-check harness) — no new Gemini calls, no new code. The bounding-box option above, if you want to pursue it, would be the first thing that goes beyond M2's current scope and would need to be scoped and priced separately, as you asked.

---

## Recommendation

Per your own fallback: **revert V1.12 and keep Photo 1 as a documented residual limitation for now**, the same treatment as Photo 5. I don't have evidence of a narrower rule that would work with what's currently available, and I'd rather tell you that plainly than keep iterating on signals I've already shown don't separate the two groups. If you want the deterministic bounding-box approach scoped as separate work later, I'm glad to put together what that would actually involve — but that's a decision for a different conversation, not something to fold into M2's remaining time.

Nothing has been implemented. Waiting on your go-ahead to revert.
