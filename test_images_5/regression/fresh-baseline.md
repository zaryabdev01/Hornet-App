# Post-validation Item 1 regression — `fresh-baseline`

Model `gemini-3.6-flash` · 2026-09-03T09:24:47.034Z

| Grp | Image | Goal | Distribution | Majority | All-acceptable |
|---|---|---|---|---|---|
| A | test_images_5/Case1_AsianHornet_FalseNegative_crabro_flying.jpeg | ROUGE | {"ORANGE_PROBABLE_NON_CIBLE":8} | ORANGE_PROBABLE_NON_CIBLE | NO |
| A | test_images_5/Case2_AsianHornet_FalseNegative_crabro_predation.jpeg | ROUGE | {"ORANGE_PROBABLE_NON_CIBLE":8} | ORANGE_PROBABLE_NON_CIBLE | NO |
| B | test_images_2/ref_image_09.jpg | ROUGE | {"ROUGE":8} | ROUGE | yes |
| B | test_images/ref_image_04.jpg | ROUGE | {"ROUGE":6} | ROUGE | yes |
| B | test_images/ref_image_08.jpg | ROUGE | {"ROUGE":6} | ROUGE | yes |
| B | test_images/ref_image_09.jpg | ROUGE | {"ROUGE":6} | ROUGE | yes |
| C | test_images_2/ref_image_01.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":2,"ROUGE":4} | ROUGE | NO |
| C | test_images_2/ref_image_02.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":6} | ORANGE_PROBABLE_NON_CIBLE | yes |
| C | test_images_2/ref_image_06.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":6} | ORANGE_PROBABLE_NON_CIBLE | yes |
| C | test_images_2/ref_image_07.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":4,"ORANGE_INSUFFISANCE":2} | ORANGE_PROBABLE_NON_CIBLE | NO |
| C | test_images_3/Photo_02_European_Hornet_Under_Glass_Run_A.jpeg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_INSUFFISANCE":6} | ORANGE_INSUFFISANCE | NO |
| C | test_images_3/Photo_03_European_Hornet_Under_Glass_Run_B.jpeg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_INSUFFISANCE":2,"ORANGE_PROBABLE_NON_CIBLE":3,"VERT":1} | ORANGE_PROBABLE_NON_CIBLE | NO |
| D | test_images_2/ref_image_03.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_INSUFFISANCE":2,"ORANGE_PROBABLE_NON_CIBLE":1} | ORANGE_INSUFFISANCE | NO |
| D | test_images_2/ref_image_04.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| D | test_images_2/ref_image_05.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| D | test_images_2/ref_image_10.jpg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| D | test_images_3/Photo_04_Clear_Wasp_Non_Target.jpeg | ORANGE_PROBABLE_NON_CIBLE | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| E | test_images_3/Photo_01_Confirmed_Asian_Hornets_Distant.jpeg | ORANGE_INSUFFISANCE | {"ROUGE":4} | ROUGE | NO |
| E | test_images_3/Photo_05_Scoliid_Hairy_Body.jpeg | VERT | {"VERT":2,"ORANGE_PROBABLE_NON_CIBLE":1} | VERT | NO |
| E | test_images_3/Photo_06_Scoliid_On_Flower.jpeg | VERT | {"VERT":3} | VERT | yes |
| E | test_images_5/Case3_DistantStructure_correct_green_wants_guided_retake.jpeg | VERT | {"VERT":3} | VERT | yes |
| E | test_images_2/ref_image_08.jpg | ORANGE_PLAFOND | {"ORANGE_PLAFOND":3} | ORANGE_PLAFOND | yes |
| F | test_images_4/WhatsApp Image 2026-08-24 at 7.41.58 PM.jpeg | not-ROUGE (known residual) | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| F | test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM.jpeg | not-ROUGE (known residual) | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |
| F | test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM (1).jpeg | not-ROUGE (known residual) | {"ROUGE":3} | ROUGE | NO |
| F | test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM (2).jpeg | not-ROUGE (known residual) | {"ORANGE_PROBABLE_NON_CIBLE":3} | ORANGE_PROBABLE_NON_CIBLE | yes |

## Per-run traces

### [A] test_images_5/Case1_AsianHornet_FalseNegative_crabro_flying.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne, thorax_roux |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne, rayures_jaune_noir_vif |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne, rayures_jaune_noir_vif |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_jaune_dominant |
| 7 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_jaune_dominant, tete_rousse_orangee |
| 8 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee, abdomen_jaune_dominant |

### [A] test_images_5/Case2_AsianHornet_FalseNegative_crabro_predation.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | true | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee, thorax_roux |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 7 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | sombre | true | 1 | tete_rousse_orangee |
| 8 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 3 | tete_rousse_orangee, thorax_roux, abdomen_segmente_jaune_noir_alterne |

### [B] test_images_2/ref_image_09.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 7 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 8 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [B] test_images/ref_image_04.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [B] test_images/ref_image_08.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [B] test_images/ref_image_09.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |

### [C] test_images_2/ref_image_01.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, tete_rousse_orangee, thorax_roux |
| 2 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 3 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 4 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 5 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 6 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [C] test_images_2/ref_image_02.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | thorax_roux, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | thorax_roux, tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |

### [C] test_images_2/ref_image_06.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | jaune_vif | false | 3 | thorax_roux, abdomen_jaune_dominant, tete_rousse_orangee |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | jaune_vif | false | 3 | abdomen_jaune_dominant, tete_rousse_orangee, thorax_roux |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | jaune_vif | false | 3 | thorax_roux, abdomen_jaune_dominant, tete_rousse_orangee |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 4 | abdomen_jaune_dominant, rayures_jaune_noir_vif, thorax_roux, tete_rousse_orangee |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | jaune_vif | false | 4 | thorax_roux, tete_rousse_orangee, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | jaune_vif | false | 4 | thorax_roux, abdomen_jaune_dominant, tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |

### [C] test_images_2/ref_image_07.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 3 | thorax_roux, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 4 | thorax_roux, abdomen_jaune_dominant, rayures_jaune_noir_vif, tete_rousse_orangee |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | thorax_roux, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 3 | thorax_roux, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 5 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | NON/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 2 | thorax_roux, abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 3 | thorax_roux, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |

### [C] test_images_3/Photo_02_European_Hornet_Under_Glass_Run_A.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM | NON/MEDIUM | OUI/MEDIUM | jaune_clair | false | 1 | abdomen_jaune_dominant |
| 5 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |
| 6 | ORANGE_INSUFFISANCE / RETAKE_PROFILE | OUI/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 1 | abdomen_segmente_jaune_noir_alterne |

### [C] test_images_3/Photo_03_European_Hornet_Under_Glass_Run_B.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | abdomen_jaune_dominant, rayures_jaune_noir_vif |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 4 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 3 | abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne, thorax_roux |
| 5 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/MEDIUM | NON/MEDIUM | OUI/MEDIUM | mixte_jaune_noir_alterne | false | 3 | thorax_roux, abdomen_jaune_dominant, abdomen_segmente_jaune_noir_alterne |
| 6 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | morphologie_velue_compacte, abdomen_segmente_jaune_noir_alterne |

### [D] test_images_2/ref_image_03.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, silhouette_fine_allongee |
| 3 | ORANGE_INSUFFISANCE / RETAKE_LIGHTING_ANGLE | OUI/MEDIUM | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |

### [D] test_images_2/ref_image_04.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | silhouette_fine_allongee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | silhouette_fine_allongee, proportions_greles_non_robustes, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/MEDIUM | NON/MEDIUM | NON/MEDIUM | mixte_jaune_noir_alterne | false | 2 | silhouette_fine_allongee, proportions_greles_non_robustes, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |

### [D] test_images_2/ref_image_05.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | silhouette_fine_allongee, proportions_greles_non_robustes, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | silhouette_fine_allongee, proportions_greles_non_robustes, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, silhouette_fine_allongee, proportions_greles_non_robustes |

### [D] test_images_2/ref_image_10.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | sombre | false | 1 | rayures_jaune_noir_vif |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | sombre | false | 1 | rayures_jaune_noir_vif |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 2 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |

### [D] test_images_3/Photo_04_Clear_Wasp_Non_Target.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, silhouette_fine_allongee |
| 2 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, silhouette_fine_allongee, proportions_greles_non_robustes |
| 3 | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, silhouette_fine_allongee |

### [E] test_images_3/Photo_01_Confirmed_Asian_Hornets_Distant.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |
| 4 | ROUGE / NONE | OUI/MEDIUM | OUI/MEDIUM | OUI/MEDIUM | sombre | true | 0 |  |

### [E] test_images_3/Photo_05_Scoliid_Hairy_Body.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | sombre | false | 0 | morphologie_velue_compacte |
| 2 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 1 | rayures_jaune_noir_vif, morphologie_velue_compacte |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | sombre | false | 1 | rayures_jaune_noir_vif |

### [E] test_images_3/Photo_06_Scoliid_On_Flower.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 0 | morphologie_velue_compacte |
| 2 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 0 | morphologie_velue_compacte |
| 3 | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 0 | morphologie_velue_compacte |

### [E] test_images_5/Case3_DistantStructure_correct_green_wants_guided_retake.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | VERT / NONE | - | - | - | - | null | 0 |  |
| 2 | VERT / NONE | - | - | - | - | null | 0 |  |
| 3 | VERT / NONE | - | - | - | - | null | 0 |  |

### [E] test_images_2/ref_image_08.jpg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | - | - | - | - | null | 0 |  |
| 2 | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | - | - | - | - | null | 0 |  |
| 3 | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | - | - | - | - | null | 0 |  |

### [F] test_images_4/WhatsApp Image 2026-08-24 at 7.41.58 PM.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | true | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | true | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | true | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |

### [F] test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM.jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | false | 3 | rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne, tete_rousse_orangee |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | OUI/HIGH | NON/HIGH | OUI/HIGH | orange | false | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |

### [F] test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM (1).jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 2 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |
| 3 | ROUGE / NONE | OUI/HIGH | OUI/HIGH | OUI/HIGH | sombre | true | 0 |  |

### [F] test_images_4/WhatsApp Image 2026-08-24 at 7.41.59 PM (2).jpeg

| run | verdict / reason | Q1 | Q2 | Q3 | fond | zoneOr | antiCrabro | tags |
|---|---|---|---|---|---|---|---|---|
| 1 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | true | 2 | tete_rousse_orangee, abdomen_segmente_jaune_noir_alterne |
| 2 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | NON/HIGH | mixte_jaune_noir_alterne | true | 3 | tete_rousse_orangee, rayures_jaune_noir_vif, abdomen_segmente_jaune_noir_alterne |
| 3 | ORANGE_PROBABLE_NON_CIBLE / CRABRO_LIKE_PROFILE | NON/HIGH | NON/HIGH | OUI/HIGH | mixte_jaune_noir_alterne | true | 1 | tete_rousse_orangee |
