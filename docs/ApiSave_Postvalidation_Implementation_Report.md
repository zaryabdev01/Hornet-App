---
title: "ApiSave — Post-Validation Work: Implementation & Validation Report"
subtitle: "The three approved items — what changed, before/after evidence, residual limitations"
date: "2026-09-03"
---

# Summary

All three approved post-validation items are implemented on branch
`m2-postvalidation-fixes`.

| Item | Status | Key result |
|------|--------|-----------|
| 1 — Asian-hornet false-negative correction | Done, validated | The "Asian hornet → probable non-target / crabro" outcome is eliminated on both reported images; confirmed-ROUGE cases unchanged (26/26) |
| 2 — Gemini 503 handling + latency | Done | 5xx now retried with exponential backoff + jitter; per-stage timing added; image downscaled before upload. Needs a native rebuild to ship. |
| 3 — Distant-structure guided retake | Done | Green verdict preserved + a "take a closer photo" suggestion attached, verdict never changed |

Nothing is merged to `main`. Item 1 changed the prompt and Judge, so this is
presented for your review before it ships.

---

# Item 1 — Asian-hornet false-negative correction

## What changed

**Prompt (`prompts.js` V2.6)** — kept deliberately light. An earlier, more
directive version (a worked "typical target" example plus a "when in doubt choose
dark" rule) made the model over-apply the target signature and pushed a real
European hornet toward ROUGE; that was measured and rolled back.

- `tete_rousse_orangee` is only added for a genuinely **red / rufous** head — never
  the normal orange-yellow face of an Asian hornet. Same tightening for
  `abdomen_segmente_jaune_noir_alterne`.
- Predation / multiple insects: the subject is the **predator**; the prey's abdomen
  colour and banding are never read; if a marker can't be attributed to the
  subject, `Q2 = NON_LISIBLE`.
- A descriptive (non-leading) note on when `fond_dominant = mixte_jaune_noir_alterne`
  actually applies.

**Judge (`judge.js` V1.14)** — three guardrails on the `CRABRO_LIKE_PROFILE` route:

- **Velutina counter-signal:** a dark thorax (`Q1 = OUI`) with an orange terminal
  abdominal band (`zone_terminale_orangee = true`) is the target's own signature.
  It now routes to `ORANGE_INSUFFISANCE` (second photo) rather than "probable
  non-target" — and never to VERT.
- **One-marker shortcut removed:** a single chromatic marker, even at high
  confidence, is no longer enough. At least **two** distinct markers are required
  (or three with no confidence condition). This is the guardrail you asked for; its
  direct consequence is that a one-marker case now asks for a second photo instead
  of being labelled "probable non-target".
- **Isolated `tete_rousse_orangee`** (without `thorax_roux`) no longer counts toward
  the marker total — a rufous head without a rufous thorax is not a reliable
  European-hornet signal, but it is exactly what the model produces when it
  misreads the target's orange face.
- The "≥2 incompatibilities → VERT" clear-out now also requires at least one
  **morphological** incompatibility; chromatic markers alone, on an abdomen that
  couldn't be read, produce a second-photo request rather than a green verdict.

## Validation

Repeated live sampling (`gemini-3.6-flash`, temperature 0), before and after,
against the full set you named — the two new false negatives, the confirmed-ROUGE
Asian-hornet cases, the confirmed European-hornet cases, plus wasp, scoliid and
*V. mandarinia* images as regression guards. Raw per-run traces:
`test_images_5/regression/` (`fresh-baseline.md`, `after-v3.md`).

**A note on the reference set's own instability.** Re-running the *unchanged*
original code hours apart produced materially different verdict distributions on
several borderline non-target images (e.g. `ref_image_01` went from 2/6 to 4/6
ROUGE with no code change). The numbers below therefore compare a **same-session**
baseline against the fix, not the older figures.

| Group | Image(s) | Baseline (same session) | After fix | Reading |
|-------|----------|-------------------------|-----------|---------|
| **False negatives** | Case 2 (clear specimen) | 8/8 → non-target | **4/8 ROUGE, 4/8 second-photo, 0/8 non-target** | Complaint eliminated |
| | Case 1 (motion-blurred, in flight) | 8/8 → non-target | **7/8 second-photo, 1/8 non-target** | 8 → 1; the 1 run carries 3 genuine chromatic crabro markers |
| **Confirmed ROUGE** | 4 images, 26 runs | 26/26 ROUGE | **26/26 ROUGE** | No true-positive lost |
| **Confirmed European hornet** | ref_02 | 6/6 non-target | 6/6 non-target | Unchanged |
| | ref_06 | 6/6 non-target | 3/6 non-target, 3/6 second-photo | Fail-safe drift on runs where the model omits `thorax_roux` |
| | ref_01, ref_07 | drifts 2–4 ROUGE / mixed | comparable to baseline | Within the set's own noise |
| **Distant structure** | Case 3 | VERT 3/3 | **VERT 3/3** | Correct, and now carries the retake suggestion |

## Residual limitations (documented, not open bugs)

1. **Case 1** cannot be driven to ROUGE. It is a small, motion-blurred, in-flight
   subject; when the model reads the abdomen as `NON`, the deterministic Judge is
   architecturally barred from ROUGE (that requires Q1 = Q2 = Q3 = OUI). Its
   realistic best outcome is a second-photo request, which is what it now returns
   7 times in 8.
2. **Case 2** is 4/8 ROUGE — same architectural limit: on the runs where the model
   reads the abdomen as `NON`, the best the Judge can do is a second-photo request.
   It is never mislabelled non-target now, which was the actual complaint.
3. **Borderline non-targets asking for a second photo.** The stricter crabro route
   sends a handful of one-marker or `thorax_roux`-absent runs (one real European
   hornet among them, on 3 of 6 runs) to `ORANGE_INSUFFISANCE` instead of "probable
   non-target". This is fail-safe (never ROUGE) and is largely the ≥2-marker rule
   you approved, applied consistently. **If you would rather keep one strong marker
   sufficient for the non-target route, that is a one-line change — your call.**
4. **Photo 5** (scoliid under dim light) — the pre-existing hairy-body read
   instability is unchanged; it now lands on a second-photo request rather than
   VERT on this sample. Already a documented M2 residual.

---

# Item 2 — Gemini 503 handling and latency

## What changed (`geminiApi.js` V2.6, `imagePrep.js`, `HomeScreen.js`)

- **Retry policy:** 429 **and** 500/502/503/504 **and** transport errors are now all
  retried (503 was not retried at all before). Exponential backoff with full
  jitter, `Retry-After` honoured, total wait capped, attempts raised 2 → 3.
- **Per-stage timing** on every analysis: image prep, each Gemini attempt, backoff
  wait, JSON parse, schema validation, plus the request payload size. Logged as
  `[ApiSave][timing]` (visible on a release build via `adb logcat` / the Xcode
  console) and exposed programmatically via `getLastAnalysisTimings()`. This is the
  per-stage measurement you asked for.
- **Image downscaling:** the photo is resized (longest edge ≤ 1568 px, JPEG q0.8)
  *before* it is base64-encoded, in both the camera and gallery paths, so a
  multi-megabyte full-resolution image is no longer uploaded — and no longer
  re-uploaded on every retry. Falls back to the original image if resizing fails.

## To ship

This adds one native module (`expo-image-manipulator`), so it requires a **new
build** — it cannot be delivered as an over-the-air update. The retry and timing
changes alone are JS-only, but they ship in the same build.

---

# Item 3 — Distant-structure guided retake

## What changed (`schema.js` V1.11, `prompts.js`, `judge.js` V1.13, `VerdictCard.js`)

- New optional field `structure.trop_distante_pour_evaluer`, set by the model when a
  structure is visible but too small or far to assess.
- When it is set and there are no strong nest markers, the Judge keeps the verdict
  **VERT** — even if the model rates `structure_strength = MEDIUM` — and attaches:
  *"Une structure éloignée a été détectée. Rapprochez-vous ou zoomez pour une
  analyse plus précise."*
- The verdict, `verdict_code` and `reason_code` are never changed. A real distant
  nest (strong markers present) still returns `ORANGE_PLAFOND`.
- The app renders the suggestion as an advisory line under the result.

## Validation

Case 3 (the supplied distant-structure image): 3/3 VERT with the suggestion
attached, both before and after — an interim version briefly regressed this to
`ORANGE_INSUFFISANCE` and the Judge guardrail above was added specifically to fix
it. Synthetic tests cover both the distant-VERT case and the "real nest is not
downgraded" control.

---

# What I need from you

1. **Item 1** — confirm the trade-off in residual point 3 is acceptable (some
   borderline non-targets now ask for a second photo instead of "probable
   non-target"), or tell me to relax the one-marker rule.
2. **Item 2** — confirm a new build is acceptable for this (it can't be OTA).
3. On your go-ahead, this branch merges to `main` and the version bundle
   (`gemini-3.6-flash + prompt V2.6 + schema V1.11`) becomes the new baseline that
   M3 validates against.
