# ApiSave — M1 Validation Report

**Prepared for:** Nordine
**Model:** `gemini-3.6-flash` (stable, GA identifier, confirmed against Google's published documentation)
**Date:** 2026-08-05
**Dataset:** your 10-image reference set (ApiSave_M1_Reference_Dataset_With_Photos_v3.pdf), run against the live API

---

## Summary

**10/10 images produce the correct verdict after the fix**, matching your expected outcomes exactly.

Of the 10, **1 case actually changes outcome due to this fix** — Photo #1, the nest built against a metal weathervane. That is precisely the bug pattern identified in the audit: before the fix, this image would have been incorrectly cleared as "non-biological" because of the single metal-support cue, discarding strong, genuine nest evidence. After the fix, it correctly resolves to a nest-probable result.

The remaining 9 images were already correct both before and after — confirming the fix is precisely targeted, with no regressions elsewhere in the dataset.

**A note on coverage:** 7 of your 10 images exercise the specific code path this milestone fixed (`jugerStructure` — no insect visible, structure only). The other 3 (images where a hornet is visibly on the nest — #4, #8, #9) route through the insect-judging path instead, which this milestone did not touch — the Judge always follows the insect path whenever an insect is exploitable in frame, regardless of any nest also visible. Those three are still valuable as end-to-end pipeline confirmation, but they are not specific tests of the M1 fix.

---

## Summary table

| # | Photo | Category | Path | Before fix | After fix | Expected | Match |
|---|---|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | Nid sur Support Artificiel | Structure (fix applies) | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ Match |
| 2 | ref_image_02.jpg | Nid sous Grille Metal | Structure (fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ Match |
| 3 | ref_image_03.jpg | Piege Vegetal / Cocon | Structure (fix applies) | VERT / NONE | VERT / NONE | VERT | ✅ Match |
| 4 | ref_image_04.jpg | Insecte + Nid Primaire | Insect (unaffected) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ Match |
| 5 | ref_image_05.jpg | Faux Nid / Lanterne | Structure (fix applies) | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT | ✅ Match |
| 6 | ref_image_06.jpg | Nid sous Toiture + Tuyau | Structure (fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ Match |
| 7 | ref_image_07.jpg | Nid d'Hirondelle / Boue | Structure (fix applies) | VERT / NONE | VERT / NONE | VERT | ✅ Match |
| 8 | ref_image_08.jpg | Frelon + Nid Primaire | Insect (unaffected) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ Match |
| 9 | ref_image_09.jpg | Grappe de Frelons sur Nid | Insect (unaffected) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ Match |
| 10 | ref_image_10.jpg | Nid en Haut d'Arbre | Structure (fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ Match |

---

## Detailed results, with raw Gemini JSON per image

### Photo #1 — ref_image_01.jpg

**Category:** Nid sur Support Artificiel
**Description:** Nid spherique accroche sur une fleche / girouette metallique avec cable.
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE
**After fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL (confidence 72%)
**Motif:** Structure compatible avec nid social construit : 2 marqueur(s) fort(s), texture papier/carton, strates répétitives.
**Expected:** ORANGE_PLAFOND — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte exploitable visible, presence d'une structure cartonnee sur un support metallique."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "spherique",
    "texture_papier_carton": "OUI",
    "strates_repetitives": "OUI",
    "suspension_visible": "NON",
    "position": "support_artificiel",
    "qualite_structure": "HIGH",
    "structure_strength": "STRONG",
    "marqueurs_forts": [
      "enveloppe_cartonnee_continue",
      "stratification_lamellaire"
    ],
    "marqueurs_faibles": [
      "jonction_nette_structure_support",
      "repetition_couches_construites"
    ],
    "indices_artificiels": [
      "armature_metallique_plastique"
    ],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #2 — ref_image_02.jpg

**Category:** Nid sous Grille Metal
**Description:** Nid de frelons situe sous une grille metallique / barbecue.
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL
**After fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL (confidence 72%)
**Motif:** Structure compatible avec nid social construit : 2 marqueur(s) fort(s), texture papier/carton, strates répétitives.
**Expected:** ORANGE_PLAFOND — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte exploitable visible, presence d'une structure en forme de nid sous une grille."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "ovoide",
    "texture_papier_carton": "OUI",
    "strates_repetitives": "OUI",
    "suspension_visible": "NON",
    "position": "support_artificiel",
    "qualite_structure": "HIGH",
    "structure_strength": "STRONG",
    "marqueurs_forts": [
      "stratification_lamellaire",
      "enveloppe_cartonnee_continue"
    ],
    "marqueurs_faibles": [],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #3 — ref_image_03.jpg

**Category:** Piege Vegetal / Cocon
**Description:** Cocon / amas vegetal suspendu a une branche de pin.
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** VERT / NONE
**After fix:** VERT / NONE (confidence 85%)
**Motif:** Piège végétal possible sans marqueur construit confirmé.
**Expected:** VERT — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "aucun insecte visible, presence d'une structure soyeuse suspendue a une branche de pin"
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "ovoide",
    "texture_papier_carton": "NON",
    "strates_repetitives": "NON",
    "suspension_visible": "OUI",
    "position": "arbre",
    "qualite_structure": "HIGH",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [
      "jonction_nette_structure_support"
    ],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": [
      "cocon_vegetal",
      "amas_naturel_vegetal"
    ]
  }
}
```

---

### Photo #4 — ref_image_04.jpg

**Category:** Insecte + Nid Primaire
**Description:** Frelon asiatique actif sur un petit nid primaire fixe a une poutre rouillee.
**Path taken:** INSECT (jugerMorphologie — unaffected by M1)
**Before fix:** N/A (insect path)
**After fix:** ROUGE / NONE (confidence 97%)
**Motif:** Q1 + Q2 + Q3 = OUI valides sur le même individu.
**Expected:** ROUGE — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": true,
    "structure_visible": true,
    "justification": "Un insecte est nettement visible et exploitable au-dessus d'une structure."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": true,
    "vue_dorsale": true,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "description_visible": "Thorax de couleur tres sombre, noir/brun fonce.",
    "lisibilite": "haute"
  },
  "Q2_abdomen": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "fond_dominant": "sombre",
    "zone_terminale_orangee": true,
    "description_visible": "Abdomen a fond tres sombre sur les premiers segments avec une large zone orangee vers l'extremite.",
    "lisibilite": "haute"
  },
  "Q3_morphologie": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "elements_visibles": [
      "thorax_massif",
      "proportions_compactes_robustes"
    ],
    "incompatibilites_visibles": [],
    "description_visible": "Insecte trapu et robuste avec jonction thorax-abdomen large.",
    "lisibilite": "haute"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": false,
    "forme_globale": "non_lisible",
    "texture_papier_carton": "NON_LISIBLE",
    "strates_repetitives": "NON_LISIBLE",
    "suspension_visible": "NON_LISIBLE",
    "position": "non_lisible",
    "qualite_structure": "LOW",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #5 — ref_image_05.jpg

**Category:** Faux Nid / Lanterne
**Description:** Lanterne en papier plisse suspendue (structure synthetique reguliere).
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE
**After fix:** VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE (confidence 85%)
**Motif:** Indice(s) artificiel(s) visible(s) — structure non biologique.
**Expected:** VERT — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte visible, objet artificiel suspendu visible."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "ovoide",
    "texture_papier_carton": "NON",
    "strates_repetitives": "NON",
    "suspension_visible": "OUI",
    "position": "support_artificiel",
    "qualite_structure": "HIGH",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [],
    "indices_artificiels": [
      "geometrie_industrielle",
      "symetrie_artificielle",
      "armature_metallique_plastique",
      "texture_uniforme_manufacturee"
    ],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #6 — ref_image_06.jpg

**Category:** Nid sous Toiture + Tuyau
**Description:** Nid sous gouttiere a cote d'une descente de plomberie metallique.
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL
**After fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL (confidence 72%)
**Motif:** Structure compatible avec nid social construit : 3 marqueur(s) fort(s), texture papier/carton, strates répétitives.
**Expected:** ORANGE_PLAFOND — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte exploitable n'est visible, présence d'une structure construite sous l'avancée de toiture."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "ovoide",
    "texture_papier_carton": "OUI",
    "strates_repetitives": "OUI",
    "suspension_visible": "OUI",
    "position": "toiture",
    "qualite_structure": "HIGH",
    "structure_strength": "STRONG",
    "marqueurs_forts": [
      "stratification_lamellaire",
      "enveloppe_cartonnee_continue",
      "entree_identifiable"
    ],
    "marqueurs_faibles": [
      "jonction_nette_structure_support",
      "repetition_couches_construites"
    ],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #7 — ref_image_07.jpg

**Category:** Nid d'Hirondelle / Boue
**Description:** Nid en terre/boue sous rebord (structure non striee cartonnee).
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** VERT / NONE
**After fix:** VERT / NONE (confidence 85%)
**Motif:** Marqueurs structurels insuffisants pour une suspicion.
**Expected:** VERT — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte visible sur l'image, presence d'une structure granuleuse fixee sous un rebord."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "irreguliere",
    "texture_papier_carton": "NON",
    "strates_repetitives": "NON",
    "suspension_visible": "NON",
    "position": "support_artificiel",
    "qualite_structure": "MEDIUM",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [
      "jonction_nette_structure_support"
    ],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #8 — ref_image_08.jpg

**Category:** Frelon + Nid Primaire
**Description:** Frelon asiatique travaillant sur la cloche d'un nid primaire.
**Path taken:** INSECT (jugerMorphologie — unaffected by M1)
**Before fix:** N/A (insect path)
**After fix:** ROUGE / NONE (confidence 97%)
**Motif:** Q1 + Q2 + Q3 = OUI valides sur le même individu.
**Expected:** ROUGE — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": true,
    "structure_visible": true,
    "justification": "Un insecte est clairement visible et exploitable sur la structure."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": true,
    "vue_dorsale": true,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "description_visible": "Thorax de couleur noire dominante très sombre",
    "lisibilite": "haute"
  },
  "Q2_abdomen": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "fond_dominant": "sombre",
    "zone_terminale_orangee": true,
    "description_visible": "Abdomen majoritairement noir avec segment terminal orange-jaunâtre",
    "lisibilite": "haute"
  },
  "Q3_morphologie": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "elements_visibles": [
      "thorax_massif",
      "proportions_compactes_robustes",
      "jonction_thorax_abdomen_large",
      "abdomen_epais_non_elance"
    ],
    "incompatibilites_visibles": [],
    "description_visible": "Morphologie robuste et compacte avec thorax large",
    "lisibilite": "haute"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": false,
    "forme_globale": "non_lisible",
    "texture_papier_carton": "NON_LISIBLE",
    "strates_repetitives": "NON_LISIBLE",
    "suspension_visible": "NON_LISIBLE",
    "position": "non_lisible",
    "qualite_structure": "LOW",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #9 — ref_image_09.jpg

**Category:** Grappe de Frelons sur Nid
**Description:** Nid spherique recouvert de plusieurs frelons asiatiques actifs.
**Path taken:** INSECT (jugerMorphologie — unaffected by M1)
**Before fix:** N/A (insect path)
**After fix:** ROUGE / NONE (confidence 97%)
**Motif:** Q1 + Q2 + Q3 = OUI valides sur le même individu.
**Expected:** ROUGE — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": true,
    "structure_visible": true,
    "justification": "Plusieurs individus nets et exploitables sont visibles sur la structure."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": true,
    "vue_dorsale": true,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "description_visible": "Thorax de couleur majoritairement noire",
    "lisibilite": "haute"
  },
  "Q2_abdomen": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "fond_dominant": "sombre",
    "zone_terminale_orangee": true,
    "description_visible": "Abdomen a fond sombre avec zone orangee sur la partie terminale sans rayures jaunes alternees",
    "lisibilite": "haute"
  },
  "Q3_morphologie": {
    "reponse": "OUI",
    "confidence": "HIGH",
    "elements_visibles": [
      "thorax_massif",
      "jonction_thorax_abdomen_large",
      "abdomen_epais_non_elance",
      "proportions_compactes_robustes"
    ],
    "incompatibilites_visibles": [],
    "description_visible": "Morphologie robuste avec jonction large et abdomen massif",
    "lisibilite": "haute"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": false,
    "forme_globale": "non_lisible",
    "texture_papier_carton": "NON_LISIBLE",
    "strates_repetitives": "NON_LISIBLE",
    "suspension_visible": "NON_LISIBLE",
    "position": "non_lisible",
    "qualite_structure": "LOW",
    "structure_strength": "WEAK",
    "marqueurs_forts": [],
    "marqueurs_faibles": [],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

### Photo #10 — ref_image_10.jpg

**Category:** Nid en Haut d'Arbre
**Description:** Nid au sommet d'un conifere / sapin parmi les pignes et epines.
**Path taken:** STRUCTURE (jugerStructure — M1 fix applies)
**Before fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL
**After fix:** ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL (confidence 72%)
**Motif:** Structure compatible avec nid social construit : 2 marqueur(s) fort(s), texture papier/carton, strates répétitives.
**Expected:** ORANGE_PLAFOND — ✅ Match

**Raw Gemini JSON observation:**

```json
{
  "etape_1_declencheur": {
    "insecte_exploitable": false,
    "structure_visible": true,
    "justification": "Aucun insecte visible; présence d'une structure en haut d'un arbre."
  },
  "etape_2_individu": {
    "individu_analyse_identifiable": false,
    "vue_dorsale": false,
    "sur_le_dos": false
  },
  "Q1_thorax": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q2_abdomen": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "fond_dominant": "non_lisible",
    "zone_terminale_orangee": false,
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "Q3_morphologie": {
    "reponse": "NON_LISIBLE",
    "confidence": "LOW",
    "elements_visibles": [],
    "incompatibilites_visibles": [],
    "description_visible": "aucun insecte exploitable",
    "lisibilite": "non_lisible"
  },
  "incompatibilites_cible": [],
  "structure": {
    "evaluee": true,
    "forme_globale": "ovoide",
    "texture_papier_carton": "OUI",
    "strates_repetitives": "OUI",
    "suspension_visible": "OUI",
    "position": "arbre",
    "qualite_structure": "HIGH",
    "structure_strength": "STRONG",
    "marqueurs_forts": [
      "enveloppe_cartonnee_continue",
      "stratification_lamellaire"
    ],
    "marqueurs_faibles": [
      "jonction_nette_structure_support"
    ],
    "indices_artificiels": [],
    "pieges_vegetaux_possibles": []
  }
}
```

---

## Next steps

This report satisfies M1's acceptance criteria: the bug scenario is demonstrably fixed, shown at both the JSON and verdict level, with no regressions on previously-correct cases, all against your own reference images and expected outcomes.

Per our agreed sequencing, M2 will only be created once you've confirmed these results are satisfactory. The TestFlight/internal test build (part of M2) will let you validate further reference images directly in the app once M2 begins.
