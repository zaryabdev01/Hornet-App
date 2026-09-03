# test_images_5 — M2 post-validation diagnostic

Model `gemini-3.6-flash` · 8 samples/image · 2026-09-03T14:08:22.152Z

## Case1_AsianHornet_FalseNegative_crabro_flying.jpeg

- Ground truth: Vespa velutina (Asian hornet). In-flight, motion blur, INRA photo credit (K. Monceau).
- Expected: ROUGE · prohibited: ORANGE_PROBABLE_NON_CIBLE, VERT
- **Verdict distribution:** {"ORANGE_INSUFFISANCE":7,"ROUGE":1}
- **Prohibited-verdict hits: 0/8**
- Tag frequency: {"tete_rousse_orangee":7,"abdomen_segmente_jaune_noir_alterne":3,"rayures_jaune_noir_vif":5,"abdomen_jaune_dominant":1}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, tete_rousse_orangee |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, tete_rousse_orangee |
| 4 | ORANGE_INSUFFISANCE / RETAKE_SHARPER | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_jaune_dominant, tete_rousse_orangee |
| 5 | ROUGE / NONE | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | sombre | true | 0 |  |
| 6 | ORANGE_INSUFFISANCE / RETAKE_SHARPER | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, tete_rousse_orangee |
| 8 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |

## Case2_AsianHornet_FalseNegative_crabro_predation.jpeg

- Ground truth: Vespa velutina (Asian hornet) predating a honeybee. Textbook specimen: black thorax, single orange 4th tergite, bright yellow leg tips. NOTE: a second insect (the honeybee prey) is in frame.
- Expected: ROUGE · prohibited: ORANGE_PROBABLE_NON_CIBLE, ORANGE_INSUFFISANCE, VERT
- **Verdict distribution:** {"ORANGE_INSUFFISANCE":4,"ROUGE":4}
- **Prohibited-verdict hits: 4/8**
- Tag frequency: {"tete_rousse_orangee":2,"abdomen_segmente_jaune_noir_alterne":3}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 1 | tete_rousse_orangee |
| 2 | ROUGE / NONE | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/MEDIUM/haute | OUI/MEDIUM/haute | OUI/MEDIUM/haute | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | sombre | true | 0 |  |
| 5 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM/haute | NON/MEDIUM/haute | OUI/MEDIUM/haute | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_INSUFFISANCE / RETAKE_ABDOMEN | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | true | 1 | abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM/haute | NON/MEDIUM/haute | OUI/MEDIUM/haute | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |
| 8 | ROUGE / NONE | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | OUI/MEDIUM/moyenne | sombre | true | 0 |  |

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

## Case4_AsianHornet_FalseNegative_crabro_jar.jpeg

- Ground truth: Vespa velutina (Asian hornet), dead, on its side in a glass jar. Dark thorax, yellow-orange 4th-tergite band, bright yellow leg tips. Client tested twice on the current build: both -> ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE (screenshot IMG_8480.png).
- Expected: ROUGE · prohibited: ORANGE_PROBABLE_NON_CIBLE, VERT
- **Verdict distribution:** {"ORANGE_INSUFFISANCE":8}
- **Prohibited-verdict hits: 0/8**
- Tag frequency: {"tete_rousse_orangee":8,"abdomen_segmente_jaune_noir_alterne":7,"abdomen_jaune_dominant":1,"rayures_jaune_noir_vif":2}

| run | verdict / reason | Q1 (r/c/l) | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_DORSAL_VIEW | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_INSUFFISANCE / RETAKE_DORSAL_VIEW | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_jaune_dominant |
| 5 | ORANGE_INSUFFISANCE / RETAKE_DORSAL_VIEW | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_INSUFFISANCE / RETAKE_DORSAL_VIEW | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | OUI/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_INSUFFISANCE / RETAKE_SHARPER | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 8 | ORANGE_INSUFFISANCE / RETAKE_SHARPER | OUI/MEDIUM/moyenne | NON/MEDIUM/moyenne | NON/MEDIUM/moyenne | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
