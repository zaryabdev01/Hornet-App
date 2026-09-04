---
title: "ApiSave — Post-Validation Build: Diagnosis of the Non-Target Regressions"
subtitle: "Why the new caution logic broke non-target classification, and the proposed direction"
date: "2026-09-04"
---

# Summary

You are right on every point. The Asian-hornet correction and the distant-structure
behaviour are good and will be kept. The caution logic added alongside them **over-corrected**
and has broken non-target classification in three ways: a European hornet can now reach
`ROUGE`, visibly non-target insects are sent to "insufficient data", and the retake reason
codes no longer describe the real limitation.

**No code has been changed.** This document is the diagnosis you asked for. Every claim
below is backed by the repeated-sampling regression runs already on file
(`test_images_5/regression/`), comparing the same reference images on the *previous* logic
and on the *current* build, run in the same session so the numbers are not distorted by the
model's day-to-day drift.

---

# 1. What stays — no change planned

- **Distant / unclear structures.** When a structure is detected but too far or unclear to
  assess, the verdict stays green and the app advises a closer or zoomed photo. Approved,
  preserved, in the regression set.
- **Asian-hornet detection on the reported false negatives.** The four hornet images you
  flagged (in-flight, predation, jar, ...) no longer land on "probable non-target". That
  gain is kept.
- The confirmed-`ROUGE` Asian-hornet reference images are unchanged (26 / 26 runs `ROUGE`,
  before and after).

---

# 2. The five reported issues — root cause

## 2.1 A European hornet classified as "Asian hornet highly probable" (`ROUGE`) — critical

**Confirmed.** On the confirmed-European-hornet reference image, the previous logic gave
2 / 6 runs `ROUGE`; the current build gives **4 / 6 runs `ROUGE`**, all as a direct verdict
(`Q1 + Q2 + Q3 = OUI`).

**Cause — two layers:**

1. **Prompt.** The revised wording tells the model to describe the abdomen ground by what
   visually dominates (rather than defaulting to "mixed yellow/black"), and restricts the
   "rufous head" marker to a *genuinely red* head. On a European hornet — dark-ish abdomen,
   orange-red head that is not vivid red — the model now more often reads the abdomen as
   *dark* and drops the rufous-head marker. The result is `Q1 = Q2 = Q3 = OUI` — the full
   Asian-hornet signature.

2. **Judge structure.** The Judge concludes `ROUGE` **the instant `Q1 = Q2 = Q3 = OUI`**.
   This check runs *before* any of the exclusion routes (`CRABRO_LIKE_PROFILE`, the
   target-incompatibility logic). There is **no symmetrical guard**: nothing asks "does this
   individual also show several markers that are incompatible with *Vespa velutina*?" before
   awarding `ROUGE`. So a European hornet that the model happens to read as a clean
   Asian-hornet signature goes straight to `ROUGE`, and the crabro logic is never consulted.

This is exactly the asymmetry you identified: the structured `Q1 + Q2 + Q3` rule exists for
Asian hornets but there is no mirror of it for the look-alikes.

## 2.2 Visibly non-target insects sent to "Insufficient data"

**Confirmed.** On the same reference set:

| Image (ground truth) | Previous logic | Current build |
|---|---|---|
| European hornet, clear dorsal | 6 / 6 "probable non-target" | 3 / 6 non-target, **3 / 6 "insufficient"** |
| European hornet under glass, run B | mixed (3 / 6 non-target) | **6 / 6 "insufficient"** |
| Wasp on flower | 3 / 3 "probable non-target" | **3 / 3 "insufficient"** |
| Clear wasp, red background | 3 / 3 "probable non-target" | 1 / 3 non-target, **2 / 3 "insufficient"** |

**Cause — four caution rules, each individually defensible, together too strict:**

1. **The "one strong marker is enough" path was removed.** Previously, a single clear
   chromatic exclusion marker read with high confidence was enough to route to "probable
   non-target". Now **two distinct** markers are required. A European hornet or wasp that a
   given run reads with only one clear marker falls through to "insufficient".

2. **The rufous-head marker no longer counts on its own.** It is only counted when a rufous
   *thorax* is also reported on the same run. A European hornet run that reports the red head
   but not (that run) the red thorax drops below the two-marker bar.

3. **The "several incompatibilities → clear" path now also requires a *morphological*
   incompatibility.** In practice the model frequently reports *chromatic* exclusion markers
   (bands, yellow-dominant abdomen, red head) without a shape marker. Those runs used to
   conclude; now they fall to the generic "insufficient / retake" fallback.

4. **The Asian-hornet counter-signal can pre-empt the crabro route.** A dark thorax plus an
   orange band near the abdomen tip now short-circuits to "insufficient" *before* the crabro
   logic runs. If the model reports an orange-tipped abdomen on a European hornet (plausible),
   that individual never reaches `CRABRO_LIKE_PROFILE`.

## 2.3 Reason codes that do not match the photo problem

**Confirmed.** When the caution rules divert a case to "insufficient", the reason code is
whatever the diverting branch happens to carry — not a description of an actual reading
limitation. In the current runs the diverted European-hornet / wasp cases carry
`RETAKE_SHARPER` ("blurry image") and `RETAKE_LIGHTING_ANGLE` ("photograph under natural
light") even though the images are sharp and were taken outdoors in daylight.

**Cause.** `ORANGE_INSUFFISANCE` is being produced as a *"cannot decide the species"*
outcome, and the reason code attached to it is a bucket, not a diagnosis. The two generic
fallbacks — `RETAKE_SHARPER` and `RETAKE_LIGHTING_ANGLE` — are returned whenever the crabro
thresholds are *nearly* but not *quite* met, regardless of whether any criterion was
actually unreadable.

## 2.4 & 2.5 "Take a less blurry photo" on a sharp image / "use natural light" outdoors

Same cause as 2.3. These are the user-facing labels of `RETAKE_SHARPER` and
`RETAKE_LIGHTING_ANGLE`, returned as defaults. When a photo is sharp and well-lit and every
criterion was readable, the system should not be asking for a retake at all — it should be
concluding.

---

# 3. Are `CRABRO_LIKE_PROFILE`, `NON_TARGET_HYMENOPTERA` and the incompatibility logic correctly applied?

Verified against the current build:

- **`NON_TARGET_HYMENOPTERA` (wasp / Polistes):** still runs, and still runs *before* the
  `ROUGE` decision. It fires correctly when the model reports the wasp *shape* markers
  (fine, elongated silhouette; slender, non-robust proportions). On the clear-wasp reference
  images that get those tags, the verdict is correct 3 / 3. Where it fails is when the model
  reports only *colour* markers (bands) and no shape marker — then this rule does not engage
  and the case falls to the crabro route, where the caution thresholds (§2.2) now divert it
  to "insufficient".

- **`CRABRO_LIKE_PROFILE`:** present, but only reachable **if the individual is not already
  read as `Q1 = Q2 = Q3 = OUI`**. A European hornet read as a clean Asian-hornet signature
  never reaches it. And when it *is* reached, its thresholds were tightened (§2.2), so
  genuine European hornets that used to hit it now sometimes fall to "insufficient".

- **Target-incompatibility routes:** intact for the absolute cases (beetle, dense hair,
  tiny insect → green). Not intact as a general "this is clearly not velutina" conclusion —
  there is no such general rule.

**So the answer to your question is: the exclusion mechanisms are not being overridden by
the new caution logic *as such* — the problem is structural.** The `ROUGE` short-circuit sits
*above* the crabro route, and the caution thresholds sit *inside* it, so a clearly non-target
insect either (a) is read as a clean target signature and goes straight to `ROUGE`, or
(b) reaches the crabro route but is diverted to "insufficient" before it can conclude.

---

# 4. Proposed direction (for your approval — no code yet)

This implements the symmetrical logic you described.

## 4.1 A symmetrical exclusion gate, evaluated *before* the `ROUGE` decision

Mirror the `Q1 + Q2 + Q3` rule. Define a small set of reliable non-*velutina* markers:

- multiple regular yellow/black bands across most of the abdomen;
- yellow-dominant abdomen;
- reddish head **or** reddish thorax;
- wasp morphology (fine / elongated silhouette, slender proportions).

**If two or more distinct markers from this set are clearly visible, the Judge concludes
`ORANGE_PROBABLE_NON_CIBLE` — "other vespid" — regardless of `Q1 / Q2 / Q3`**, with the
reason code that matches (`NON_TARGET_HYMENOPTERA` when the wasp-shape markers are present,
`CRABRO_LIKE_PROFILE` otherwise).

- Fixes 2.1: a European hornet that visibly shows red head + banded abdomen can no longer
  reach `ROUGE`.
- Fixes 2.2: a visibly non-target insect concludes as non-target instead of "insufficient".
- Safe for Asian hornets: a real *velutina* carries none, or at most one, of these markers,
  so the gate does not fire and `Q1 + Q2 + Q3 = OUI → ROUGE` is unchanged. This will be
  proven with the confirmed-`ROUGE` regression images before/after.

## 4.2 Roll the over-cautious thresholds back toward the previous behaviour

- Restore the "one strong chromatic marker, read with confidence → probable non-target" path.
- Let the rufous-head marker count on its own again.
- Drop the "must also have a morphological marker" requirement for the chromatic-only
  conclusion.
- Scope the Asian-hornet counter-signal so it cannot fire on an individual that also carries
  two or more non-*velutina* markers.

Keep only the parts of the caution logic that genuinely protect against Asian-hornet false
negatives (needed for the four hornet images) — the parts that also catch European hornets
and wasps are removed.

## 4.3 Reserve retakes for a genuinely unreadable criterion

`ORANGE_INSUFFISANCE` is returned **only** when a specific criterion is actually
`NON_LISIBLE` — Q1, Q2, Q3, or a structural marker the model could not read because of blur,
distance, lighting, occlusion or the insect's posture. The reason code names *which* one and
*why*:

| Situation | Reason code |
|---|---|
| Thorax not readable | `RETAKE_THORAX` |
| Abdomen pattern not readable | `RETAKE_ABDOMEN` |
| Body shape not readable (too small / distant) | `RETAKE_MORPHOLOGY` |
| Ventral view / on its back | `RETAKE_DORSAL_VIEW` |
| Genuinely blurred | `RETAKE_SHARPER` |
| Genuine glare / colour cast from a coloured background | `RETAKE_LIGHTING_ANGLE` |

The two generic fallbacks stop being default returns. "Every criterion was readable but the
species is ambiguous" is **not** an insufficiency — it goes through the exclusion gate
(§4.1) or, failing that, to a definite outcome.

---

# 5. Validation plan

Before/after repeated-sampling (5–8 runs per image, more on the `ROUGE`-adjacent ones)
against the full regression set:

- the confirmed-`ROUGE` Asian-hornet images — must stay `ROUGE`;
- the four post-validation hornet images — must stay off "probable non-target";
- the confirmed European-hornet images — must be "probable non-target", **not** `ROUGE`,
  **not** "insufficient";
- the wasp / Polistes images — must be "probable non-target";
- the scoliid (hairy body) and *V. mandarinia* images — unchanged;
- **the new screenshots you are sending** — added as permanent regression cases.

No change ships without this evidence in front of you.

---

# 6. What I need from you

1. The screenshots from your latest testing, so each failing image becomes a permanent
   regression case with its expected verdict recorded.
2. Your agreement on the direction in §4 (the symmetrical exclusion gate, the threshold
   rollback, the retake discipline) before any code is written.
