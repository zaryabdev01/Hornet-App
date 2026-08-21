# test_images — Real reference-set before/after report

Model: `gemini-3.6-flash` | Generated: 2026-08-20T14:50:11.945Z

| # | File | Category | Path | Before | After | Expected | Match |
|---|---|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | Nid sur Support Artificiel | STRUCTURE (jugerStructure) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 2 | ref_image_02.jpg | Nid sous Grille Metal | STRUCTURE (jugerStructure) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 3 | ref_image_03.jpg | Piege Vegetal / Cocon | STRUCTURE (jugerStructure) | VERT / NONE | VERT / NONE | VERT | ✅ |
| 4 | ref_image_04.jpg | Insecte + Nid Primaire | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |
| 5 | ref_image_05.jpg | Faux Nid / Lanterne | STRUCTURE (jugerStructure) | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT | ✅ |
| 6 | ref_image_06.jpg | Nid sous Toiture + Tuyau | STRUCTURE (jugerStructure) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 7 | ref_image_07.jpg | Nid d'Hirondelle / Boue | STRUCTURE (jugerStructure) | VERT / NONE | VERT / NONE | VERT | ✅ |
| 8 | ref_image_08.jpg | Frelon + Nid Primaire | - | - | ERROR: Gemini HTTP 503: {
  "error": {
    "code": 503,
    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
 | ROUGE | ❌ |
| 9 | ref_image_09.jpg | Grappe de Frelons sur Nid | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |
| 10 | ref_image_10.jpg | Nid en Haut d'Arbre | STRUCTURE (jugerStructure) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |

**9/10 match the client's expected verdict.**