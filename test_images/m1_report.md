# M1 — Real reference-set before/after report

Model: `gemini-3.6-flash` | Generated: 2026-08-05T08:19:26.332Z

| # | File | Category | Path | Before fix | After fix | Expected | Match |
|---|---|---|---|---|---|---|---|
| 1 | ref_image_01.jpg | Nid sur Support Artificiel | STRUCTURE (jugerStructure — M1 fix applies) | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 2 | ref_image_02.jpg | Nid sous Grille Metal | STRUCTURE (jugerStructure — M1 fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 3 | ref_image_03.jpg | Piege Vegetal / Cocon | STRUCTURE (jugerStructure — M1 fix applies) | VERT / NONE | VERT / NONE | VERT | ✅ |
| 4 | ref_image_04.jpg | Insecte + Nid Primaire | INSECT (jugerMorphologie — unaffected by M1) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ |
| 5 | ref_image_05.jpg | Faux Nid / Lanterne | STRUCTURE (jugerStructure — M1 fix applies) | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE | VERT | ✅ |
| 6 | ref_image_06.jpg | Nid sous Toiture + Tuyau | STRUCTURE (jugerStructure — M1 fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |
| 7 | ref_image_07.jpg | Nid d'Hirondelle / Boue | STRUCTURE (jugerStructure — M1 fix applies) | VERT / NONE | VERT / NONE | VERT | ✅ |
| 8 | ref_image_08.jpg | Frelon + Nid Primaire | INSECT (jugerMorphologie — unaffected by M1) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ |
| 9 | ref_image_09.jpg | Grappe de Frelons sur Nid | INSECT (jugerMorphologie — unaffected by M1) | N/A (insect path) | ROUGE / NONE | ROUGE | ✅ |
| 10 | ref_image_10.jpg | Nid en Haut d'Arbre | STRUCTURE (jugerStructure — M1 fix applies) | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND / STRUCTURE_STRONG_GLOBAL | ORANGE_PLAFOND | ✅ |

**10/10 match the client's expected verdict.**

Full raw JSON observations per image are in `m1_report.json`.