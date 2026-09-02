---
title: "ApiSave — Post-Validation Work: Scope, Price and Sequencing"
subtitle: "Response to the M2 post-validation approval — the three approved items"
date: "2026-09-02"
---

# Purpose

You have approved the direction for all three post-validation items. This document gives the
fixed price, the split across the three items, the recommended sequence, and a
recommendation on whether each belongs inside M3.

**Fixed price for all three items combined: $300**, split as below. This is a fixed fee for
the defined scope, not a day-rate estimate.

| Item | Scope | Price |
|---|---|---|
| 1 — Asian-hornet false-negative correction | Prompt + Judge + schema changes, full before/after repeated-sampling regression | **$150** |
| 2 — Gemini 503 handling and latency | Stage timing, 5xx retry with backoff + jitter, image downscaling | **$90** |
| 3 — Distant-structure guided retake | Schema flag + Judge suggestion + UI | **$60** |
| **Total** | | **$300** |

---

# Item 1 — Asian-hornet false-negative correction — $150

**Nature:** detection-logic change (prompt + Judge + observation schema). Target-adjacent.
Largest of the three: it carries the full regression obligation and is likely to need
several tuning rounds.

**Approved changes:**

1. Prompt — sharpen the abdomen interpretation so a dark ground with one broad orange band
   and thin pale segment margins resolves to `Q2 = OUI` / `fond_dominant = sombre`, not
   `mixte_jaune_noir_alterne`. Add a worked *velutina* abdomen example.
2. Prompt + schema — tighten the "rufous head" marker (`tete_rousse_orangee`) so the normal
   orange-yellow *velutina* face does not trigger it.
3. Judge — retire the "one chromatic marker is enough at HIGH confidence" shortcut on the
   `CRABRO_LIKE_PROFILE` route; require at least two, or `Q1 = NON`.
4. Judge — use `zone_terminale_orangee = true` together with a dark thorax as a
   *velutina*-positive counter-signal that blocks the crabro route.
5. Prompt — strengthen the single-individual instruction for images containing prey or more
   than one insect.

**Validation (as you required):** before-and-after, repeated-sampling, against the **full
regression set** — the two new false-negative cases (`test_images_5`), the existing
confirmed-`ROUGE` Asian-hornet cases, the confirmed European-hornet cases, and the wider M2
reference set (`test_images_2`, `test_images_3`). ROUGE-adjacent cases are sampled 5–8 times
each, not once (the Photo 1 lesson). No new regressions is the acceptance bar.

**Deliverable:** the modified prompt / Judge / schema, plus a report with raw before/after
decision traces for every regression case.

**Inside M3? — No, recommended separate, and done first.** M3's headline metric is the
native-valid JSON rate. Changing the prompt and schema mid-M3 makes that number impossible
to attribute — the same reason the photo-#10 experiment was scoped outside M3. This work
bumps the prompt and schema versions; M3's atomic protocol bundle then simply references the
corrected versions and validates against the corrected baseline.

---

# Item 2 — Gemini 503 handling and latency — $90

**Nature:** transport layer. No detection logic touched.

**Scope:**

1. Stage-timing instrumentation — image prep, Gemini call, retries, schema validation, Judge
   — surfaced in a debug log. (This is also the per-stage measurement you asked for.)
2. Retry policy rework: include 500/502/503/504, exponential backoff with jitter, honour
   `Retry-After`, cap the retry budget.
3. Downscale the image (longest edge ~1024–1568 px) before base64 encoding, so a multi-MB
   full-resolution photo is not uploaded — and re-uploaded on every retry.

**Validation:** measured before/after latency on a real device; the M2 reference set re-run
at the reduced resolution to confirm no accuracy change from downscaling.

**Inside M3? — No, independent.** It can run in parallel with Item 1 or immediately after,
and gives immediate relief from the 503s being seen now.

---

# Item 3 — Distant-structure guided retake — $60

**Nature:** new advisory feature. No verdict ever changes. Smallest and lowest-risk of the
three.

**Scope:**

1. Schema + prompt — add `structure.trop_distante_pour_evaluer`, set by the model when a
   structure is visible but too small/far to assess (the model already says "distant" in its
   free text; this captures it).
2. Judge — when that flag is set and the structure path resolves to `VERT`, attach the
   suggested wording ("A distant structure has been detected. Zoom in or take a closer photo
   for a more precise analysis.") without changing `verdict` / `verdict_code`.
3. UI — render the suggestion beneath the green result.

**Validation:** the flag fires on distant-structure images; zero verdict changes across the
existing structure regression set (`test_images`, `test_images_5` Case 3).

**Inside M3? — No, independent.** Product feature, unrelated to M3 infrastructure.

---

# Recommended sequence

| Order | Item | Price | Why here |
|---|---|---|---|
| 1 | **Item 1** — false-negative correction | $150 | Safety-critical (false negative on the target species). The detection baseline must be stable before any further build ships or M3 validates against it. |
| 2 | **Item 2** — 503 / latency | $90 | Immediate user-visible pain. Independent of Item 1; can overlap its validation waits. |
| 3 | **Item 3** — distant-structure advisory | $60 | Lowest urgency and risk. Can run in parallel with Item 2. |
| — | **M3** | (its own scope) | Proceeds separately once you confirm the hosting platform. Built on the Item 1 corrected prompt/schema. |

The three items are billed **separately from M3**. If you would rather treat them as one
approval and one payment of $300 rather than three, that is fine — the sequence is unchanged.

---

# What I need from you

1. Confirm the $300 fixed price, the split, and the sequence above — or tell me what to
   adjust.
2. The hosting platform for M3, when you have it (you said you would send this separately).

Implementation on Item 1 starts as soon as you confirm point 1.
