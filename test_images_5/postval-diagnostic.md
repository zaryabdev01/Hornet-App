# test_images_5 — M2 post-validation diagnostic

Model `gemini-3.6-flash` · 8 samples/image · 2026-09-02T10:58:12.612Z

## Case1_AsianHornet_FalseNegative_crabro_flying.jpeg

- Ground truth: Vespa velutina (Asian hornet). In-flight, motion blur, INRA photo credit (K. Monceau).
- Expected: ROUGE · prohibited: ORANGE_PROBABLE_NON_CIBLE, VERT
- **Verdict distribution:** {"ORANGE_PROBABLE_NON_CIBLE":7,"ROUGE":1}
- **Prohibited-verdict hits: 7/8**
- Tag frequency: {"abdomen_jaune_dominant":1,"abdomen_segmente_jaune_noir_alterne":6,"tete_rousse_orangee":7,"thorax_roux":2,"rayures_jaune_noir_vif":4}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | false | 4 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee, thorax_roux |
| 2 | ROUGE / NONE | OUI/HIGH/haute | OUI/HIGH/haute | OUI/HIGH/haute | sombre | true | 0 |  |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | false | 4 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee, thorax_roux |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | true | 2 | rayures_jaune_noir_vif, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 8 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |

## Case2_AsianHornet_FalseNegative_crabro_predation.jpeg

- Ground truth: Vespa velutina (Asian hornet) predating a honeybee. Textbook specimen: black thorax, single orange 4th tergite, bright yellow leg tips. NOTE: a second insect (the honeybee prey) is in frame.
- Expected: ROUGE · prohibited: ORANGE_PROBABLE_NON_CIBLE, ORANGE_INSUFFISANCE, VERT
- **Verdict distribution:** {"ORANGE_PROBABLE_NON_CIBLE":7,"ROUGE":1}
- **Prohibited-verdict hits: 7/8**
- Tag frequency: {"tete_rousse_orangee":5,"abdomen_segmente_jaune_noir_alterne":6,"rayures_jaune_noir_vif":2,"thorax_roux":1}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ROUGE / NONE | OUI/HIGH/haute | OUI/HIGH/haute | OUI/HIGH/haute | sombre | true | 0 |  |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | false | 4 | abdomen_segmente_jaune_noir_alterne, rayures_jaune_noir_vif, tete_rousse_orangee, thorax_roux |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | true | 2 | abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | false | 2 | abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | NON/HIGH/haute | mixte_jaune_noir_alterne | true | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |
| 8 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH/haute | NON/HIGH/haute | OUI/HIGH/haute | mixte_jaune_noir_alterne | true | 1 | tete_rousse_orangee |

## Case3_DistantStructure_correct_green_wants_guided_retake.jpeg

- Ground truth: Distant object in a tree canopy, too small/far to assess as a nest. Green verdict is CORRECT and must stay green.
- Expected: VERT · prohibited: ORANGE_PLAFOND, ORANGE_INSUFFISANCE
- **Verdict distribution:** {"VERT":8}
- **Prohibited-verdict hits: 0/8**
- Tag frequency: {}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | VERT / NONE | - | - | - | - | null | 0 |  |
| 2 | VERT / NONE | - | - | - | - | null | 0 |  |
| 3 | VERT / NONE | - | - | - | - | null | 0 |  |
| 4 | VERT / NONE | - | - | - | - | null | 0 |  |
| 5 | VERT / NONE | - | - | - | - | null | 0 |  |
| 6 | VERT / NONE | - | - | - | - | null | 0 |  |
| 7 | VERT / NONE | - | - | - | - | null | 0 |  |
| 8 | VERT / NONE | - | - | - | - | null | 0 |  |
