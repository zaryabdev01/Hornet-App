---
title: "ApiSave — M2 Post-Validation Observations"
subtitle: "Diagnosis and proposed next-stage scope for the three points raised on M2 acceptance"
date: "2026-09-02"
---

# Context

M2 is validated. This document records the three observations raised alongside that
validation, gives the diagnosis for each, and proposes how each is handled in the next
development stage. None of this reopens M2.

The two false-negative images and the distant-structure image have been added to the
permanent regression set as `test_images_5/`, with an `expected_outcomes.json` that
encodes the ground truth and the prohibited verdicts.

---

# 1. False negatives — two Asian hornets classified as probable non-target (crabro)

## What the system did

Both images produced:

- **Verdict:** `ORANGE_PROBABLE_NON_CIBLE`
- **Reason code:** `CRABRO_LIKE_PROFILE`
- **Motif:** "Signature chromatique crabro très forte (>= 3 marqueurs distincts) malgré une
  morphologie non confirmée : espèce voisine probable."

## Where the decision is made

This is a single, deterministic branch in the Judge — `src/engine/judge.js`, function
`verrouVert()`:

```
if (q2 === 'NON' && q3 === 'NON' && antiCrabroHit >= 3) {
    return ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE
}
```

`antiCrabroHit` counts how many *distinct* tags from this set appear in Gemini's
`incompatibilites_cible` list:

`abdomen_jaune_dominant`, `rayures_jaune_noir_vif`, `abdomen_segmente_jaune_noir_alterne`,
`thorax_roux`, `tete_rousse_orangee`.

For the route to fire, Gemini must return **Q2 (abdomen) = NON, Q3 (morphology) = NON, and at
least three of those five chromatic tags** — on an image that is, in fact, an Asian hornet.

The Judge is doing exactly what its rules say. The error originates one layer up, in the
structured observation Gemini produces, and is then confirmed rather than caught by the
Judge because that route's bar is low.

## Why Gemini's observation goes wrong here

Three compounding factors:

1. **The wasp/Polistes lock in the prompt** (`src/core/prompts.js`, ÉTAPE 3) force-adds
   *two* of the five anti-crabro tags at once — `rayures_jaune_noir_vif` and
   `abdomen_jaune_dominant` — whenever it reads "transverse stripes" or an "alternating
   yellow/black pattern". From there a single further tag
   (`abdomen_segmente_jaune_noir_alterne`) reaches the threshold of three.

2. **Case 2 has a second insect in the frame** — the honeybee being predated, which has a
   banded orange/black abdomen. Despite the "choose a single individual" instruction,
   abdominal-marker contamination from the second insect is the most likely trigger.

3. **The `Q1 = NON` guard was deliberately removed from every crabro route in Judge V1.11**
   (to fix a genuine European hornet, "Photo 2", in the field-test round). That removed the
   thorax-colour backstop and left no requirement for any *morphological* crabro evidence —
   three chromatic tags alone are now sufficient. These false negatives are the cost of that
   loosening surfacing on real targets.

Strictly, this is not `ROUGE` being overridden — `ROUGE` requires Q1 = Q2 = Q3 = OUI, and
here Q2 and Q3 are read as NON. But the practical outcome is a false negative on a target,
and the observation "the crabro rule overrides Asian hornet markers too strongly" is
accurate.

## Repeated-sampling evidence

Each image was run **8 times** live against `gemini-3.6-flash` at `temperature: 0`, through
the exact production prompt, schema and Judge (`scripts/m2-postval-diagnostic.cjs`; raw data
in `test_images_5/postval-diagnostic.json`).

| Image | ROUGE | ORANGE_PROBABLE_NON_CIBLE | Prohibited-verdict hits |
|---|---|---|---|
| Case 1 (flying, motion blur) | 1/8 | 7/8 | 7/8 |
| Case 2 (predation, clear specimen) | 1/8 | 7/8 | 7/8 |

The outcome is **not a fixed misclassification — it is call-to-call variance**, the same
pattern seen in the Photo 1 saga. But unlike Photo 1, here the variance lands on the wrong
side ~7 times out of 8.

**The pivot is a single field: `Q2_abdomen`.** The correlation across all 16 target samples
is exact:

| Gemini's abdomen read | Verdict | Count |
|---|---|---|
| `Q2 = OUI`, `fond_dominant = sombre` | `ROUGE` | 2 / 2 |
| `Q2 = NON`, `fond_dominant = mixte_jaune_noir_alterne` | `ORANGE_PROBABLE_NON_CIBLE` | 14 / 14 |

Every other field (Q1, Q3, individual tags) flickers run to run and does not change the
result. On these two genuine Asian hornets Gemini reads the abdomen background as
"alternating yellow/black" rather than "dark" **~87 % of the time**, and that read alone
decides the verdict.

Contributing details from the traces:

- **`tete_rousse_orangee` fires in 12 / 16 runs.** Gemini is reading the normal
  orange-yellow *velutina* face as a rufous/orange "crabro" head marker. This tag is
  frequently the one that tips `antiCrabroHit` over the line.
- **`zone_terminale_orangee = true` in 4 runs** — Gemini *detected* the velutina terminal
  orange band — but still returned `Q2 = NON`, and the Judge does not use
  `zone_terminale_orangee` at all, so the signal is wasted.
- **The `>= 3 marqueurs` motif shown to the client is only one of three ways in.** Several
  false-negative runs had `antiCrabroHit` of just 1 or 2 and still routed to
  `CRABRO_LIKE_PROFILE`, via the V1.9 shortcut "one chromatic tag is enough if Q1 and Q2
  confidence are both HIGH" — and Gemini rates almost everything HIGH on these images.

## Proposed next-stage handling

Diagnose → propose → **client sign-off** → implement → validate. This route is
target-adjacent, so nothing changes without written sign-off, and every change is validated
against the existing confirmed-`ROUGE` and confirmed-crabro regression cases both before and
after — not on these two images alone.

The evidence points at three specific, independently-testable levers, in priority order:

1. **Prompt — the `Q2` abdomen read (root cause).** The *velutina* abdomen (dark ground,
   one broad orange fourth tergite, thin pale segment margins) is being classified as
   `mixte_jaune_noir_alterne`. The "REGLE ANTI-ARTEFACT TRIPLE" already says fine
   inter-segment margins do not break `Q2 = OUI` "si le fond reste sombre" — but Gemini
   never gets to that rule because it has already called the ground "mixte". Tighten the
   `fond_dominant` definition and add a worked *velutina* abdomen example so a single orange
   band plus pale margins on a dark ground resolves to `sombre` / `Q2 = OUI`.
2. **Prompt / tag definition — `tete_rousse_orangee`.** Restrict it to a genuinely
   red / reddish-brown head, explicitly excluding the orange-yellow face that a normal Asian
   hornet has. Removing this false hit alone would drop most runs below the crabro
   threshold.
3. **Judge — two guardrails on the crabro route:**
   - Require `antiCrabroHit >= 2` even when Q1/Q2 confidence is HIGH (retire the
     one-tag shortcut, or make it need `Q1 = NON`).
   - When `zone_terminale_orangee = true` **and** the thorax is dark, treat it as a
     *velutina*-positive counter-signal that blocks the `CRABRO_LIKE_PROFILE` route.

- **Regression set:** both images are already in `test_images_5/` as permanent cases.

## Proposed next-stage handling

Diagnose → propose → **client sign-off** → implement → validate. This route is
target-adjacent, so nothing changes without written sign-off, and every change is validated
against the existing confirmed-`ROUGE` and confirmed-crabro regression cases both before and
after — not on these two images alone.

Candidate changes, to be chosen after the sampling evidence is reviewed:

- **Judge:** re-introduce a guard on the `antiCrabroHit >= 3` route — require `Q1 = NON`
  *or* at least one genuine morphological crabro marker *or* HIGH confidence on both Q1 and
  Q2. Pure chromatic tags on a blurred or co-framed target would then no longer be
  sufficient on their own.
- **Judge:** treat `zone_terminale_orangee = true` together with a dark thorax as a
  velutina-positive signal that offsets chromatic crabro tags.
- **Prompt:** sharpen the velutina-vs-crabro abdomen description (velutina — one broad
  orange fourth tergite, yellow leg tips; crabro — paired teardrop marks on a yellow ground,
  reddish thorax) and add an explicit instruction for when prey or a second insect is in
  frame.
- **Regression set:** both images are already in `test_images_5/` as permanent cases.

---

# 2. Gemini 503 errors and latency

All of the following is established directly from `src/services/geminiApi.js` and
`src/screens/HomeScreen.js` — no measurement required to answer the structural questions.

## Origin of the 503 errors

**Gemini itself.** The M2 build calls `generativelanguage.googleapis.com` directly (the
server-side proxy is M3 and is not deployed). HTTP 503 from that endpoint means the model is
temporarily overloaded on Google's side. It is not the application and not a backend of
ours. It is transient and not correlated with our request pattern.

## Is exponential backoff with jitter implemented for 503?

**No — on three counts:**

- **503 is not retried at all.** The retry logic matches HTTP 429 and network/timeout
  errors only. A 503 falls straight through to a generic error and is surfaced to the user
  immediately, with zero retry attempts. The same is true of 500, 502 and 504.
- The retries that *do* exist use **linear** backoff (`1s, 2s` for network errors; `2s, 4s`
  for 429), not exponential.
- There is **no jitter**, and the `Retry-After` response header is not read.

## Can the frequency be reduced?

Substantially, though not to zero. Adding 500/502/503/504 to the retry set with true
exponential backoff, jitter, and `Retry-After` support would convert most transient
overloads into a slightly slower success instead of a visible failure. Sustained capacity
problems on Google's side would still occasionally surface.

## Can analysis time be reduced?

Likely yes, materially:

- **The image is sent at full resolution.** `takePictureAsync` / `launchImageLibraryAsync`
  are called with `{ base64: true, quality: 0.85 }` and **no resize step**
  (`expo-image-manipulator` is not used anywhere in the analysis path). A modern phone photo
  is several megabytes; base64 encoding adds a further ~33%; and the whole payload is
  **re-uploaded on every retry**. Downscaling the longest edge to roughly 1024–1568 px
  before encoding would cut upload time significantly with no accuracy cost at this task.
- The per-attempt timeout is a flat 35 s.

## Can we measure time per stage?

**Not today — there is no instrumentation.** Nothing in the analysis path records the time
spent on image preparation, the Gemini call, retries, schema validation, or the local Judge.
Adding lightweight timing around each stage is a small, safe change and is the right first
step: it turns "latency feels high" into a measured breakdown that tells us whether the cost
is upload, Gemini, or retries.

## Proposed next-stage handling

This is transport-layer work and touches no detection logic. It can be a small standalone
hardening pass or folded into M3 (the proxy is the natural home for retry and latency
policy). Scope:

1. Stage timing instrumentation (do this first — it is also the measurement the client
   asked for).
2. Retry policy: 5xx included, exponential backoff with jitter, `Retry-After` honoured,
   retry budget capped.
3. Image downscaling before encoding.

---

# 3. Distant structures — guided retake without changing the verdict

## Current behaviour

When a structure is present but the construction evidence is weak, the Judge
(`jugerStructure()` in `src/engine/judge.js`) returns `VERT`. This is correct and the client
wants it kept. The supplied image was run 8 times: **8/8 `VERT`, zero prohibited verdicts** —
the verdict is stable and right.

Notably, in every run Gemini's own free-text already says the object is *distant* (e.g.
"Presence d'une forme arrondie distante accrochee dans un arbre") and sets
`structure_strength = WEAK`. The distance information is being observed — it just has
nowhere structured to go.

## The gap

There is no signal in the observation schema for "a structure is visible but is too small or
too far away to assess." `structure_strength` (STRONG / MEDIUM / WEAK) describes how much
*construction evidence* is present, not the apparent size of the object in the frame. And
there is currently no way to attach an advisory message to a verdict without changing the
verdict itself.

## Proposed next-stage handling

This mirrors a rule that already exists for insects — the size/distance confidence ceiling
in `prompts.js` V2.5, which caps confidence at MEDIUM when the subject occupies too little
of the frame.

- **Schema + prompt:** add `structure.trop_distante_pour_evaluer` (boolean), set by Gemini
  when a structure is detected but is too small/distant for reliable assessment.
- **Judge:** when that flag is set and the structure path resolves to `VERT`, attach a
  suggestion field carrying the client's wording — *"A distant structure has been detected.
  Zoom in or take a closer photo for a more precise analysis."* — while leaving `verdict`
  and `verdict_code` unchanged. The verdict only becomes orange if real suspicious
  structural markers are detected, exactly as today.
- **UI:** render the suggestion beneath the green result.

Risk is low — this never touches the insect or `ROUGE` path and never changes a verdict —
but it is a four-surface change (prompt, schema, Judge, UI), so it is scoped as next-stage
work rather than a patch.

---

# Summary

| # | Observation | Nature | Next-stage work |
|---|---|---|---|
| 1 | Two Asian hornets → probable non-target (crabro) | Detection logic — target-adjacent | Judge guard + prompt sharpening, client sign-off, before/after regression |
| 2 | Gemini 503s and latency | Transport layer — no detection impact | Stage timing, 5xx retry with backoff+jitter, image downscaling |
| 3 | Distant structure — guided retake | New advisory feature — no verdict change | New schema flag + Judge suggestion + UI |

Effort and sequencing for each can be quoted once the direction on point 1 is agreed, since
that is the only one touching detection behaviour.
