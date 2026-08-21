# test_images_3/stability_check — Real reference-set before/after report

Model: `gemini-3.6-flash` | Generated: 2026-08-20T11:53:31.101Z

| # | File | Category | Path | Before | After | Expected | Match |
|---|---|---|---|---|---|---|---|
| 1 | photo1.jpeg | Photo 1 (the target case) | - | - | ERROR: Gemini HTTP 503: {
  "error": {
    "code": 503,
    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
 | ORANGE_INSUFFISANCE | ❌ |
| 2 | m1_ref_04.jpg | M1 confirmed ROUGE | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |
| 3 | m1_ref_08.jpg | M1 confirmed ROUGE | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |
| 4 | m1_ref_09.jpg | M1 confirmed ROUGE (MEDIUM-confidence case) | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |
| 5 | m2_ref_09.jpg | M2 confirmed ROUGE | INSECT (jugerMorphologie) | ROUGE / NONE | ROUGE / NONE | ROUGE | ✅ |

**4/5 match the client's expected verdict.**