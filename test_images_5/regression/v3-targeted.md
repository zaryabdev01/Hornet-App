# Post-validation Item 1 regression — `v3-targeted`

Model `gemini-3.6-flash` · 2026-09-04T14:48:25.691Z

| Grp | Image | Goal | Distribution | Majority | All-acceptable |
|---|---|---|---|---|---|
| A | test_images_5/Case1_AsianHornet_FalseNegative_crabro_flying.jpeg | ROUGE | {"ORANGE_PROBABLE_NON_CIBLE":2,"ORANGE_INSUFFISANCE":6} | ORANGE_INSUFFISANCE | NO |
| A | test_images_5/Case2_AsianHornet_FalseNegative_crabro_predation.jpeg | ROUGE | {"ORANGE_PROBABLE_NON_CIBLE":4,"ORANGE_INSUFFISANCE":3,"ROUGE":1} | ORANGE_PROBABLE_NON_CIBLE | NO |
| C | test_images_2/ref_image_01.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ROUGE":4,"ORANGE_PROBABLE_NON_CIBLE":2} | ROUGE | NO |
| G | test_images_7/C7_1_Polistes_on_open_comb_nest_FALSE_ROUGE.png | not-ROUGE (Polistes on open comb nest) | {"ORANGE_PROBABLE_NON_CIBLE":2,"ROUGE":6} | ROUGE | NO |
| G | test_images_7/C7_4_volucella_hoverfly_on_mint.png | not a retake | {"ORANGE_INSUFFISANCE":2,"ORANGE_PROBABLE_NON_CIBLE":4} | ORANGE_PROBABLE_NON_CIBLE | NO |
| G | test_images_7/C7_7_european_hornet_dead_on_side.png | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":6} | ORANGE_PROBABLE_NON_CIBLE | yes |

## Per-run traces

### [A] test_images_5/Case1_AsianHornet_FalseNegative_crabro_flying.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | rayures_jaune_noir_vif, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne, abdomen_jaune_dominant |
| 6 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 8 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |

### [A] test_images_5/Case2_AsianHornet_FalseNegative_crabro_predation.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 2 | ORANGE_INSUFFISANCE / RETAKE_ABDOMEN | OUI/HIGH | NON/HIGH | OUI/HIGH | sombre | true | 1 | tete_rousse_orangee |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 3 | thorax_roux, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | tete_rousse_orangee, thorax_roux, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 8 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 1 | tete_rousse_orangee |

### [C] test_images_2/ref_image_01.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 3 | thorax_roux, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_jaune_dominant, tete_rousse_orangee |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [G] test_images_7/C7_1_Polistes_on_open_comb_nest_FALSE_ROUGE.png

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / NEST_STRUCTURE_INCOMPATIBLE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 | nid_alveoles_ouvertes_visible |
| 2 | ORANGE_PROBABLE_NON_CIBLE / NEST_STRUCTURE_INCOMPATIBLE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 | nid_alveoles_ouvertes_visible |
| 3 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 7 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 8 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |

### [G] test_images_7/C7_4_volucella_hoverfly_on_mint.png

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | thorax_roux, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | silhouette_fine_allongee, proportions_greles_non_robustes, rayures_jaune_noir_vif |
| 4 | ORANGE_INSUFFISANCE / RETAKE_SPECIES_AMBIGUOUS | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, rayures_jaune_noir_vif, proportions_greles_non_robustes |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |

### [G] test_images_7/C7_7_european_hornet_dead_on_side.png

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 5 | abdomen_jaune_dominant, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee, thorax_roux |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, abdomen_jaune_dominant, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 5 | tete_rousse_orangee, thorax_roux, abdomen_jaune_dominant, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | abdomen_jaune_dominant, tete_rousse_orangee, thorax_roux, abdomen_segmente_jaune_noir_alterne |
