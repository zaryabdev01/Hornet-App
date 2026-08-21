# test_images_3 — Real reference-set before/after report

Model: `gemini-3.6-flash` | Generated: 2026-08-20T14:57:42.757Z

| # | File | Category | Path | Before | After | Expected | Match |
|---|---|---|---|---|---|---|---|
| 1 | Photo_01_Confirmed_Asian_Hornets_Distant.jpeg | Confirmed Asian hornets, distant group on jar | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ORANGE_INSUFFISANCE | ❌ |
| 2 | Photo_02_European_Hornet_Under_Glass_Run_A.jpeg | European hornet under glass, Run A | INSECT (jugerMorphologie) | ORANGE_INSUFFISANCE / RETAKE_PROFILE | ORANGE_INSUFFISANCE / RETAKE_PROFILE | ORANGE_PROBABLE_NON_CIBLE | ❌ |
| 3 | Photo_03_European_Hornet_Under_Glass_Run_B.jpeg | Same European specimen, Run B (control pass already achieved) | - | - | ERROR: Gemini HTTP 503: {
  "error": {
    "code": 503,
    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
 | ORANGE_PROBABLE_NON_CIBLE | ❌ |
| 4 | Photo_04_Clear_Wasp_Non_Target.jpeg | Clear wasp-like non-target on red background | INSECT (jugerMorphologie) | VERT / NONE | ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA | ORANGE_PROBABLE_NON_CIBLE | ✅ |
| 5 | Photo_05_Scoliid_Hairy_Body.jpeg | Scoliid / mammoth wasp, dense hairy body | INSECT (jugerMorphologie) | ORANGE_INSUFFISANCE / RETAKE_PROFILE | ORANGE_INSUFFISANCE / RETAKE_PROFILE | VERT | ❌ |
| 6 | Photo_06_Scoliid_On_Flower.jpeg | Scoliid / mammoth wasp on flower, strong hair evidence | INSECT (jugerMorphologie) | ORANGE_INSUFFISANCE / RETAKE_SHARPER | VERT / INSECT_HAIRY_BODY_INCOMPATIBLE | VERT | ✅ |

**2/6 match the client's expected verdict.**