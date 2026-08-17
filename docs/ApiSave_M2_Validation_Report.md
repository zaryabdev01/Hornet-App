# ApiSave — M2 Validation Report

**Prepared for:** Nordine
**Model:** `gemini-3.6-flash`
**Dataset:** your 10-image M2 reference set (`ApiSave_M2_Reference_Dataset_With_Photos.pdf`) — European hornet, wasp/Polistes, and one Asian-hornet control case
**Date:** 2026-08-08

---

## Summary

**The Judge logic held up completely: zero routing mistakes.** Every observation it received, it processed correctly — including the two cases where the new wasp/Polistes rule is exactly what produced the right verdict. I checked each of the non-matching cases individually rather than just re-running, and none of them trace back to the Judge handling an observation incorrectly.

**3 of 10 images matched on the first pass.** Where results fell short, the gap sits upstream of the Judge — in how consistently Gemini fills in the observation JSON for these specific insect categories, which is a different (and more directly fixable, once we agree on an approach) kind of problem than a decision-logic bug.

Breaking the non-matches down by actual root cause:

| Cause | Images affected | Judge bug? |
|---|---|---|
| **A — Field ambiguity**: a vestigial JSON field causes the model to inconsistently misplace tags | #2, #3, #6, #10 (and likely #7) | No |
| **B — Genuinely hard photo**: one case where Gemini's own color reading disagreed with the expected label | #1 | No |
| **C — Structure-path design gap**: nest-only images can't be species-attributed at all today | #8 | No — architectural, needs your decision |

---

## Root Cause A — a vestigial field is causing tag misplacement (4–5 images)

The prompt instructs the model to add wasp/Polistes markers to the **top-level** `incompatibilites_cible` list. But the JSON template also contains a second, similarly-purposed field — `Q3_morphologie.incompatibilites_visibles` — that the prompt text never actually explains. I checked: **nothing in the Judge reads this field.** It's validated by the schema but never consumed in any decision. It's dead weight that's actively causing failures.

The model splits tags between the two fields inconsistently:

- **Photo #2 and #6** (European hornet): the model put `abdomen_jaune_dominant` — a valid top-level tag — into `Q3_morphologie.incompatibilites_visibles`, whose enum doesn't include it. That's a hard schema validation failure; the pipeline never even reached the Judge.
- **Photo #3 and #10** (wasp/Polistes): the model correctly identified the wasp markers, but split them — `rayures_jaune_noir_vif` went into the top-level list, while `silhouette_fine_allongee` and `proportions_greles_non_robustes` (the exact two tags the new Non-Target Hymenoptera rule checks for) went into the Q3 sub-field instead. My rule only checks the top-level list, per your specification, so it never saw them — the case fell through to a generic "insufficient data" result instead.
- **Photo #4**, for comparison, shows the model doing it *correctly* — all four tags landed in the top-level list, duplicated (harmlessly) into the Q3 field too — and that case matched. So this isn't a hard failure of the model's visual judgment; it's demonstrably inconsistent field placement on data the model is reading correctly in every case I checked.

**I have not changed anything to fix this yet.** Two options, and I'd like your direction before touching either:

1. **Clarify the prompt** — explicitly state what `Q3_morphologie.incompatibilites_visibles` is for, or instruct the model never to duplicate cross-list tags there.
2. **Remove the field entirely** — since nothing consumes it, dropping it removes the ambiguity at the source and simplifies the schema.

I'd lean toward option 2 since it's the smaller, more surgical change and the field currently serves no purpose — but it's your prompt to approve, not mine to decide silently.

## Root Cause B — one genuinely hard photo (1 image)

**Photo #1**: Gemini read this specific European hornet's thorax and abdomen as dark with an orange tip (`Q1=OUI`, `Q2=OUI`) rather than the reddish/tawny pattern the category implies — all three criteria came back OUI, so the Judge correctly returned ROUGE, exactly per the unambiguous canonical rule (three confirmed OUIs on the same individual is Asian-hornet territory by design). **I did not touch or loosen the ROUGE rule to accommodate this** — doing so would risk creating false negatives on genuine Asian hornet photos, which would be a far worse outcome than one European hornet occasionally misreading as red. This looks like an inherent limit of color-based reading on a specific photo (lighting, angle, or a genuinely darker crabro specimen), not a code defect. Worth a look at the source photo on your end — if it's representative of real field conditions, it's useful to know that; if it's an unusually poor example, a cleaner replacement would help future validation.

## Root Cause C — nest-only images can't be species-attributed (1 image, architectural)

**Photo #8** (wasp nest on a birch trunk, no individual insect visible): Gemini correctly reported no exploitable insect, so the Judge took the structure path — which has no species-related fields at all (by design: Q1–Q3 are fixed placeholders when in structure mode, per the "never invent" rule). It correctly returned `ORANGE_PLAFOND` ("probable constructed nest"), which is honest given what's visible, but it can never reach `ORANGE_PROBABLE_NON_CIBLE` for a nest-only shot — there's no reliable way to tell a wasp nest from an Asian hornet nest by architecture alone, and inventing that distinction would violate the core design principle this whole system is built on.

This is a genuine open question for you, not something I can resolve by code alone: is `ORANGE_PLAFOND` an acceptable outcome for nest-only wasp/hornet images (a person will investigate any orange verdict regardless), or is this something you'd like scoped as future work? I'd note that reliably solving it would likely require a fundamentally different approach (e.g. reasoning about nest architecture, which the current design deliberately avoids for reliability reasons) rather than a small Judge tweak.

## Also worth noting

**Photo #7** produced a response missing the `incompatibilites_cible` field entirely — consistent with the same field-ambiguity family as Root Cause A, though I don't have the raw response preserved to confirm that with the same certainty as #2/#3/#6/#10. I'd expect it to resolve alongside whichever fix we agree on for Root Cause A, but flagging it as slightly less certain than the others.

**Photo #4** initially failed on a transient Gemini server overload (HTTP 503, unrelated to anything in this app) — retried once and matched correctly (`ORANGE_PROBABLE_NON_CIBLE` / `NON_TARGET_HYMENOPTERA`), confirming the rule works end-to-end when the observation is well-formed.

---

## Summary table

| # | Photo | Category | Result | Expected | Match | Cause |
|---|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | Frelon Européen / Nid | ROUGE | ORANGE_PROBABLE_NON_CIBLE | ❌ | B — hard photo, Judge correct given inputs |
| 2 | ref_image_02.jpg | Frelon Européen / Insecte | validation error | ORANGE_PROBABLE_NON_CIBLE | ❌ | A — field ambiguity |
| 3 | ref_image_03.jpg | Guêpe / Nid | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | A — field ambiguity |
| 4 | ref_image_04.jpg | Guêpe / Essaim Souterrain | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | — (retried after transient 503) |
| 5 | ref_image_05.jpg | Guêpe / Poliste | ORANGE_PROBABLE_NON_CIBLE | ORANGE_PROBABLE_NON_CIBLE | ✅ | — |
| 6 | ref_image_06.jpg | Frelon Européen / Insecte | validation error | ORANGE_PROBABLE_NON_CIBLE | ❌ | A — field ambiguity |
| 7 | ref_image_07.jpg | Frelon Européen / Nichoir | validation error | ORANGE_PROBABLE_NON_CIBLE | ❌ | A (likely) — field ambiguity |
| 8 | ref_image_08.jpg | Guêpe / Nid d'Arbre | ORANGE_PLAFOND | ORANGE_PROBABLE_NON_CIBLE | ❌ | C — structure path, architectural |
| 9 | ref_image_09.jpg | Frelon Asiatique / Piège | ROUGE | ROUGE | ✅ | — control case, confirms ROUGE path intact |
| 10 | ref_image_10.jpg | Guêpe / Fleur | ORANGE_INSUFFISANCE | ORANGE_PROBABLE_NON_CIBLE | ❌ | A — field ambiguity |

Full raw JSON for every image is in `test_images_2/report.json`.

---

## What I need from you before continuing

1. **Root Cause A**: approve removing the unused `Q3_morphologie.incompatibilites_visibles` field (my recommendation), or clarifying it instead — either way, this should resolve #2, #3, #6, #10, and likely #7.
2. **Root Cause C**: your call on whether `ORANGE_PLAFOND` is an acceptable outcome for nest-only wasp/hornet shots, or whether this needs separate future scoping.
3. **Root Cause B**: no action needed from me, just flagging photo #1 as a hard case worth your own look.

Once Root Cause A is resolved, I'd expect a re-run to land at 8 or 9 out of 10 (everything except the architecturally-unresolved #8, and possibly #1 depending on the photo). I did not want to make further prompt changes without your sign-off, given how this milestone started.
