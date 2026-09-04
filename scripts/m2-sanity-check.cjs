// M2 sanity check — synthetic verification of every rule change in this milestone:
// beetle/hairy-body reason codes, the Non-Target Hymenoptera rule, the tightened
// European-hornet threshold, and the schema.js enum reconciliation.
//
// NOT the M2 acceptance deliverable — that requires the client's real reference
// images (wasp/Polistes, European hornet, Asian hornet, structure). This proves
// the code is correct ahead of receiving those.
//
// Run: node scripts/m2-sanity-check.cjs

global.__DEV__ = false;
require('./babel-esm-loader.cjs');
const path = require('path');
const { juger } = require(path.join(__dirname, '..', 'src', 'engine', 'judge.js'));
const { validateObservation } = require(path.join(__dirname, '..', 'src', 'core', 'schema.js'));

function makeInsectObs(overrides) {
  return {
    etape_1_declencheur: { insecte_exploitable: true, structure_visible: false, justification: 'test synthétique' },
    etape_2_individu: { individu_analyse_identifiable: true, vue_dorsale: true, sur_le_dos: false, support_nid_ouvert_visible: 'NON' },
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'test', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'test', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'NON', confidence: 'HIGH', elements_visibles: [], description_visible: 'test', lisibilite: 'haute' },
    incompatibilites_cible: [],
    structure: {
      evaluee: false, forme_globale: 'non_lisible', texture_papier_carton: 'NON_LISIBLE',
      strates_repetitives: 'NON_LISIBLE', suspension_visible: 'NON_LISIBLE', position: 'non_lisible',
      qualite_structure: 'LOW', structure_strength: 'WEAK',
      marqueurs_forts: [], marqueurs_faibles: [], indices_artificiels: [], pieges_vegetaux_possibles: [],
    },
    ...overrides,
  };
}

let pass = 0, fail = 0;
function check(name, obs, expectVerdict, expectReason) {
  validateObservation(obs); // must not throw
  const result = juger(obs);
  const ok = result.verdict_code === expectVerdict && result.reason_code === expectReason;
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}`);
  console.log(`   got: ${result.verdict_code} / ${result.reason_code}   expected: ${expectVerdict} / ${expectReason}`);
  if (ok) pass++; else fail++;
}

console.log('='.repeat(100));
console.log('M2 SANITY CHECK');
console.log('='.repeat(100) + '\n');

// 1. Beetle -> VERT with the new dedicated reason code
check('Beetle (carapace_dure_elytres_visibles) -> VERT / INSECT_BEETLE_FEATURES_VISIBLE',
  makeInsectObs({ incompatibilites_cible: ['carapace_dure_elytres_visibles'] }),
  'VERT', 'INSECT_BEETLE_FEATURES_VISIBLE');

// 2. Hairy body -> VERT with the new dedicated reason code
check('Hairy body (morphologie_velue_compacte) -> VERT / INSECT_HAIRY_BODY_INCOMPATIBLE',
  makeInsectObs({ incompatibilites_cible: ['morphologie_velue_compacte'] }),
  'VERT', 'INSECT_HAIRY_BODY_INCOMPATIBLE');

// 3. Tiny insect -> VERT / NONE (unchanged regression check)
check('Tiny insect (insecte_taille_minuscule_non_frelon) -> VERT / NONE (unchanged)',
  makeInsectObs({ incompatibilites_cible: ['insecte_taille_minuscule_non_frelon'] }),
  'VERT', 'NONE');

// 4. Wasp/Polistes lock, both core tags -> ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA
check('Wasp/Polistes, both core tags -> ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA',
  makeInsectObs({
    incompatibilites_cible: ['silhouette_fine_allongee', 'proportions_greles_non_robustes', 'rayures_jaune_noir_vif', 'abdomen_jaune_dominant'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'NON_TARGET_HYMENOPTERA');

// 4b. Round 2 tiered logic: 1 core + 1 supporting -> ORANGE_PROBABLE_NON_CIBLE (fixes photo #5-style case)
check('Wasp/Polistes, 1 core + 1 supporting tag -> ORANGE_PROBABLE_NON_CIBLE / NON_TARGET_HYMENOPTERA',
  makeInsectObs({
    incompatibilites_cible: ['proportions_greles_non_robustes', 'rayures_jaune_noir_vif'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'NON_TARGET_HYMENOPTERA');

// 4c. Round 2 tiered logic: 1 core tag ONLY, no supporting -> ORANGE_INSUFFISANCE, never VERT
check('Wasp/Polistes, 1 core tag only -> ORANGE_INSUFFISANCE (never VERT)',
  makeInsectObs({
    incompatibilites_cible: ['silhouette_fine_allongee'],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_MORPHOLOGY');

// 4d. Supporting tags only (0 core) -> wasp rule must NOT engage; falls through to existing
//     crabro logic instead (both supporting tags are also anti-crabro chromatic tags)
check('Wasp/Polistes, supporting tags only (0 core) -> wasp rule does not fire, falls through to crabro logic',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'test', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: ['rayures_jaune_noir_vif', 'abdomen_jaune_dominant'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 5. V1.14 (post-M2, Item 1): single chromatic marker is NO LONGER enough to route to
//    non-target, even at HIGH Q1/Q2 confidence -> the one-marker shortcut was removed
//    (it produced false negatives on real Asian hornets whose orange face Gemini misread as
//    tete_rousse_orangee). Now needs >= 2 markers. Falls through to a retake instead.
// V1.15 (post-M2, Item 2 v2) — thorax_roux seul est désormais suffisant, indépendamment de la
// confiance : c'est le marqueur le plus fiable du jeu de données (quasi jamais lu sur les 22
// échantillons frelon-asiatique confirmés du groupe A, contre 4-6/6 sur chaque frelon européen
// confirmé du groupe C — cf. changelog V1.15 en tête de judge.js). L'ancien seuil "1 marqueur +
// confiance HIGH" avait été retiré en V1.14 précisément parce qu'il se basait sur la confiance
// plutôt que sur la fiabilité du marqueur lui-même ; V1.15 corrige la bonne variable.
check('European hornet, thorax_roux alone (any confidence) -> ORANGE_PROBABLE_NON_CIBLE (V1.15: thorax_roux is the reliable marker)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'thorax roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'orange', zone_terminale_orangee: false, description_visible: 'abdomen roux', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], incompatibilites_visibles: [], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 5b. V1.14 (post-M2, Item 1): velutina counter-signal. Dark thorax (Q1=OUI) + terminal
//     orange band (zone_terminale_orangee=true) is the TARGET's own signature — it must
//     neutralise the CRABRO_LIKE_PROFILE route even with 3+ chromatic markers present.
check('Velutina counter-signal: Q1=OUI + zone_terminale_orangee + 3 crabro markers -> NOT crabro route',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'HIGH', description_visible: 'thorax sombre', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'mixte_jaune_noir_alterne', zone_terminale_orangee: true, description_visible: 'bande orange terminale', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'NON', confidence: 'HIGH', elements_visibles: [], description_visible: 'non confirmee', lisibilite: 'haute' },
    incompatibilites_cible: ['abdomen_segmente_jaune_noir_alterne', 'rayures_jaune_noir_vif', 'tete_rousse_orangee'],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_ABDOMEN');

// 6. V1.15 — same marker, MEDIUM confidence this time: identical result. The whole point of
//    hasConfidentChromaticExclusion() is that it does NOT read Q1/Q2 confidence at all — Gemini's
//    self-reported confidence was shown (client field data, cf. changelog) to behave as call-to-call
//    noise, not a real readout of image quality, so gating a reliable marker like thorax_roux behind
//    it just made the rule fire less often for no safety benefit.
check('European hornet, thorax_roux alone + MEDIUM confidence -> same result (confidence no longer gates this)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'thorax roux, incertain', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'orange', zone_terminale_orangee: false, description_visible: 'abdomen roux', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], incompatibilites_visibles: [], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 6b. NEW (Round 2, client-specified): European hornet, Q3=NON but >=3 crabro markers,
//     Q1=NON, Q2=NON -> ORANGE_PROBABLE_NON_CIBLE (fixes photo #6-style case)
check('European hornet, Q3=NON + 3 crabro markers -> ORANGE_PROBABLE_NON_CIBLE (was VERT before Round 2)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune dominant', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'NON', confidence: 'HIGH', elements_visibles: [], description_visible: 'jugee non conforme', lisibilite: 'haute' },
    incompatibilites_cible: ['abdomen_jaune_dominant', 'rayures_jaune_noir_vif', 'thorax_roux', 'tete_rousse_orangee'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 6c. V1.11 (field-test correction, Photo 2 vs Photo 3 instability): Q3=NON with only 2 crabro
// markers but HIGH Q1+Q2 confidence -> now reaches the non-target route directly, same threshold
// as the parallel Q3=OUI/NON_LISIBLE branch above, instead of bouncing between INSUFFISANCE and
// NON_CIBLE depending on which capture Gemini happened to read.
check('European hornet, Q3=NON + 2 crabro markers + HIGH Q1/Q2 confidence -> non-target route fires (was INSUFFISANCE pre-V1.11)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune dominant', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'NON', confidence: 'HIGH', elements_visibles: [], description_visible: 'jugee non conforme', lisibilite: 'haute' },
    incompatibilites_cible: ['abdomen_jaune_dominant', 'rayures_jaune_noir_vif'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 6d. V1.15 — same 2 markers WITHOUT high confidence: same result. abdomen_jaune_dominant +
//     >= 1 other anti-crabro marker is treated as confident exclusion regardless of confidence, for
//     the same reason as 6 above (Gemini rarely reports HIGH on real field photos of this kind —
//     confirmed on the client's C7_7 European-hornet regression case, cf. changelog V1.15).
check('European hornet, Q3=NON + 2 crabro markers (incl. abdomen_jaune_dominant) + MEDIUM confidence -> ORANGE_PROBABLE_NON_CIBLE',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'roux', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune dominant', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON', confidence: 'MEDIUM', elements_visibles: [], description_visible: 'jugee non conforme', lisibilite: 'moyenne' },
    incompatibilites_cible: ['abdomen_jaune_dominant', 'rayures_jaune_noir_vif'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 7. Regression: clean ROUGE case still works (Q1=Q2=Q3=OUI)
check('Clean ROUGE case unaffected by M2 changes',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'HIGH', description_visible: 'noir', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'HIGH', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], incompatibilites_visibles: [], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: [],
  }),
  'ROUGE', 'NONE');

// 7b. Regression: ROUGE fires on 3x OUI regardless of lisibilite/confidence level (V1.12's
// readability-gated ROUGE was tried, evaluated on repeated live data, and reverted on
// 2026-08-19 — see judge.js version history. This test locks in the restored V1.11 behaviour.)
check('ROUGE fires on 3x OUI even with MEDIUM confidence and moyenne lisibilite (V1.12 reverted)',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'noir', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'MEDIUM', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'MEDIUM', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'robuste', lisibilite: 'moyenne' },
    incompatibilites_cible: [],
  }),
  'ROUGE', 'NONE');

// 8. Schema: new fond_dominant enum value accepted, old split values rejected
try {
  const obsGood = makeInsectObs({ Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'mixte_jaune_noir_alterne', zone_terminale_orangee: false, description_visible: 'test', lisibilite: 'haute' } });
  validateObservation(obsGood);
  console.log('PASS — schema accepts reconciled fond_dominant value "mixte_jaune_noir_alterne"');
  pass++;
} catch (e) {
  console.log('FAIL — schema rejected "mixte_jaune_noir_alterne": ' + e.message);
  fail++;
}
try {
  const obsBad = makeInsectObs({ Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_noir_alterne', zone_terminale_orangee: false, description_visible: 'test', lisibilite: 'haute' } });
  validateObservation(obsBad);
  console.log('FAIL — schema should have rejected the old split value "jaune_noir_alterne" but did not');
  fail++;
} catch (e) {
  console.log('PASS — schema correctly rejects old split value "jaune_noir_alterne"');
  pass++;
}

// 9. V1.14 (post-M2, Item 1): tete_rousse_orangee WITHOUT thorax_roux does not count toward
//    antiCrabroHit -> 3 tags where one is an isolated tete_rousse_orangee behaves as 2.
// V1.15 — reason code updated: RETAKE_SHARPER is no longer the generic bucket for "markers present
// but inconclusive" (that would wrongly tell the user the photo itself was blurry). nbTotal >= 1
// here (3 markers), so the honest RETAKE_SPECIES_AMBIGUOUS applies; RETAKE_SHARPER is now reserved
// for nbTotal === 0 (see the "no markers at all" case further down).
check('Isolated tete_rousse_orangee (no thorax_roux): 3 tags incl. it -> falls to retake, not crabro route',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'thorax sombre', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'mixte_jaune_noir_alterne', zone_terminale_orangee: false, description_visible: 'bandes', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON', confidence: 'MEDIUM', elements_visibles: [], description_visible: 'non confirmee', lisibilite: 'moyenne' },
    incompatibilites_cible: ['tete_rousse_orangee', 'rayures_jaune_noir_vif', 'abdomen_segmente_jaune_noir_alterne'],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_SPECIES_AMBIGUOUS');

// 9b. Control: same 3 tags but WITH thorax_roux present -> tete_rousse_orangee counts, crabro route fires
check('tete_rousse_orangee + thorax_roux + 1 more (Q1=NON,Q2=NON,Q3=NON) -> crabro route (>=3 real markers)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'NON', confidence: 'HIGH', elements_visibles: [], description_visible: 'non conforme', lisibilite: 'haute' },
    incompatibilites_cible: ['tete_rousse_orangee', 'thorax_roux', 'rayures_jaune_noir_vif'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// --- V1.15 (post-M2, Item 2 v2) — symmetrical exclusion gate, client non-target regressions ---
// docs/ApiSave_Postvalidation_v2_Diagnosis.md §4. Real case: test_images_7/C7_1 — a Polistes wasp
// on its own open comb nest, backlit/soft, read Q1=Q2=Q3=OUI with ZERO chromatic tags in most live
// samples (the nest, not the insect's colouring, is the only available signal) — reached ROUGE at
// 92% confidence on the pre-fix build in 5 of 8 live runs.

// 9c. CRITICAL regression case: nest marker must block ROUGE even on an otherwise-clean 3xOUI read.
check('Nest tag (nid_alveoles_ouvertes_visible) blocks ROUGE even with Q1=Q2=Q3=OUI (C7_1 case)',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'sombre', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'MEDIUM', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'MEDIUM', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'compact', lisibilite: 'moyenne' },
    incompatibilites_cible: ['nid_alveoles_ouvertes_visible'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'NEST_STRUCTURE_INCOMPATIBLE');

// 9c2. V1.16 follow-up — the mandatory field must block ROUGE on its own, WITHOUT the optional tag.
// This is the exact failure mode found on live sampling: 3 of 8 C7_1 calls reported the tag on
// neither channel when it was the incompatibilites_cible tag alone; the mandatory question is the
// fix, so it must work standalone.
check('support_nid_ouvert_visible=OUI (mandatory field, no tag at all) blocks ROUGE (V1.16 fix)',
  makeInsectObs({
    etape_2_individu: { individu_analyse_identifiable: true, vue_dorsale: true, sur_le_dos: false, support_nid_ouvert_visible: 'OUI' },
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'sombre', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'MEDIUM', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'MEDIUM', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'compact', lisibilite: 'moyenne' },
    incompatibilites_cible: [],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'NEST_STRUCTURE_INCOMPATIBLE');

// 9c3. Control: support_nid_ouvert_visible=NON (the common case) must not affect a clean ROUGE read.
check('support_nid_ouvert_visible=NON does not block a genuine ROUGE',
  makeInsectObs({
    etape_2_individu: { individu_analyse_identifiable: true, vue_dorsale: true, sur_le_dos: false, support_nid_ouvert_visible: 'NON' },
    Q1_thorax: { reponse: 'OUI', confidence: 'HIGH', description_visible: 'noir', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'HIGH', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: [],
  }),
  'ROUGE', 'NONE');

// 9d. Symmetrical gate: a confident chromatic exclusion (thorax_roux) must also block ROUGE on an
// otherwise-clean 3xOUI read, not just when Q2/Q3 already read NON (this is what makes the gate
// "symmetrical" with the wasp-core-tag rule above, which already had this property).
check('thorax_roux blocks ROUGE even with Q1=Q2=Q3=OUI (symmetrical gate, no velutina counter-signal)',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'sombre', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'MEDIUM', fond_dominant: 'sombre', zone_terminale_orangee: false, description_visible: 'sombre', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'MEDIUM', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'compact', lisibilite: 'moyenne' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 9e. Velutina counter-signal still wins over the symmetrical gate: a genuine target signature
// (dark thorax + terminal orange band) is never excluded on chromatic evidence alone, even if a
// stray thorax_roux misread is also present (must not regress the group-A false-negative fix).
check('Velutina counter-signal beats symmetrical gate even with thorax_roux present',
  makeInsectObs({
    Q1_thorax: { reponse: 'OUI', confidence: 'MEDIUM', description_visible: 'sombre', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'OUI', confidence: 'MEDIUM', fond_dominant: 'sombre', zone_terminale_orangee: true, description_visible: 'sombre + orange', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'MEDIUM', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], description_visible: 'compact', lisibilite: 'moyenne' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ROUGE', 'NONE');

// 9f. Real case: test_images_7/C7_7 — a dead European hornet, live-sampled tag combination that
// used to fall through the old antiCrabroHit>=3-with-discount threshold straight to the generic
// RETAKE_SHARPER ("blurry image") fallback on a perfectly sharp photo.
check('European hornet (C7_7-style): abdomen_jaune_dominant + tete_rousse_orangee + abdomen_segmente, no thorax_roux -> ORANGE_PROBABLE_NON_CIBLE',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'roux', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune dominant', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON', confidence: 'MEDIUM', elements_visibles: [], description_visible: 'non conforme', lisibilite: 'moyenne' },
    incompatibilites_cible: ['abdomen_jaune_dominant', 'tete_rousse_orangee', 'abdomen_segmente_jaune_noir_alterne'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 9g. Group-A false-negative regression guard: the real Case1/Case4 tag pattern (chromatic markers
// without thorax_roux or abdomen_jaune_dominant) must NOT be confidently excluded — it must stay on
// the fail-safe ORANGE_INSUFFISANCE side, never ORANGE_PROBABLE_NON_CIBLE. This is the exact
// combination observed on 6-7 of 8 live samples of Case1_AsianHornet_FalseNegative_crabro_flying.jpeg
// (test_images_5/regression/v2-baseline.json).
check('Group-A false-negative pattern (rayures + tete_rousse + abdomen_segmente, no thorax_roux/abdomen_jaune_dominant) -> stays fail-safe, never NON_CIBLE',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON_LISIBLE', confidence: 'LOW', description_visible: 'incertain', lisibilite: 'non_lisible' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'mixte_jaune_noir_alterne', zone_terminale_orangee: false, description_visible: 'bandes', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON_LISIBLE', confidence: 'LOW', elements_visibles: [], description_visible: 'incertain', lisibilite: 'non_lisible' },
    incompatibilites_cible: ['rayures_jaune_noir_vif', 'tete_rousse_orangee', 'abdomen_segmente_jaune_noir_alterne'],
  }),
  'ORANGE_INSUFFISANCE', 'NO_CRITERIA_VISIBLE');

// 9h. Zero markers of any kind and Q3=NON -> falls through every branch in verrouVert() to the
// bottom fallback, where RETAKE_SHARPER remains correct (genuinely nothing to go on, not even a
// partial chromatic profile) — the one case where "retake a sharper photo" is still the honest ask.
check('No markers at all, Q3=NON -> ORANGE_INSUFFISANCE / RETAKE_SHARPER (bottom fallback, nbTotal=0)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'test', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'test', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON', confidence: 'MEDIUM', elements_visibles: [], description_visible: 'test', lisibilite: 'moyenne' },
    incompatibilites_cible: [],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_SHARPER');

// 10. V1.13 (post-M2, Item 3): distant structure, no strong nest markers, model rated MEDIUM
//     -> verdict stays VERT with a `suggestion` attached (never flips to orange).
{
  const distantObs = {
    etape_1_declencheur: { insecte_exploitable: false, structure_visible: true, justification: 'forme lointaine' },
    etape_2_individu: { individu_analyse_identifiable: false, vue_dorsale: false, sur_le_dos: false },
    Q1_thorax: { reponse: 'NON_LISIBLE', confidence: 'LOW', description_visible: 'n/a', lisibilite: 'non_lisible' },
    Q2_abdomen: { reponse: 'NON_LISIBLE', confidence: 'LOW', fond_dominant: 'non_lisible', zone_terminale_orangee: false, description_visible: 'n/a', lisibilite: 'non_lisible' },
    Q3_morphologie: { reponse: 'NON_LISIBLE', confidence: 'LOW', elements_visibles: [], description_visible: 'n/a', lisibilite: 'non_lisible' },
    incompatibilites_cible: [],
    structure: {
      evaluee: true, forme_globale: 'spherique', texture_papier_carton: 'NON_LISIBLE',
      strates_repetitives: 'NON_LISIBLE', suspension_visible: 'NON_LISIBLE', position: 'arbre',
      qualite_structure: 'LOW', structure_strength: 'MEDIUM', trop_distante_pour_evaluer: true,
      marqueurs_forts: [], marqueurs_faibles: [], indices_artificiels: [], pieges_vegetaux_possibles: [],
    },
  };
  validateObservation(distantObs);
  const r = juger(distantObs);
  const ok = r.verdict_code === 'VERT' && typeof r.suggestion === 'string' && r.suggestion.length > 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} — Distant structure (MEDIUM, no strong markers) -> VERT + suggestion`);
  console.log(`   got: ${r.verdict_code} / suggestion=${JSON.stringify(r.suggestion)}`);
  if (ok) pass++; else fail++;
}

// 10b. Control: a real nest (strong marker) with the distant flag still -> ORANGE_PLAFOND, no downgrade
{
  const nestObs = {
    etape_1_declencheur: { insecte_exploitable: false, structure_visible: true, justification: 'nid' },
    etape_2_individu: { individu_analyse_identifiable: false, vue_dorsale: false, sur_le_dos: false },
    Q1_thorax: { reponse: 'NON_LISIBLE', confidence: 'LOW', description_visible: 'n/a', lisibilite: 'non_lisible' },
    Q2_abdomen: { reponse: 'NON_LISIBLE', confidence: 'LOW', fond_dominant: 'non_lisible', zone_terminale_orangee: false, description_visible: 'n/a', lisibilite: 'non_lisible' },
    Q3_morphologie: { reponse: 'NON_LISIBLE', confidence: 'LOW', elements_visibles: [], description_visible: 'n/a', lisibilite: 'non_lisible' },
    incompatibilites_cible: [],
    structure: {
      evaluee: true, forme_globale: 'ovoide', texture_papier_carton: 'OUI',
      strates_repetitives: 'OUI', suspension_visible: 'OUI', position: 'arbre',
      qualite_structure: 'HIGH', structure_strength: 'STRONG', trop_distante_pour_evaluer: true,
      marqueurs_forts: ['enveloppe_cartonnee_continue'], marqueurs_faibles: [], indices_artificiels: [], pieges_vegetaux_possibles: [],
    },
  };
  validateObservation(nestObs);
  const r = juger(nestObs);
  const ok = r.verdict_code === 'ORANGE_PLAFOND';
  console.log(`${ok ? 'PASS' : 'FAIL'} — Distant flag but strong nest markers -> ORANGE_PLAFOND (no downgrade)`);
  console.log(`   got: ${r.verdict_code} / ${r.reason_code}`);
  if (ok) pass++; else fail++;
}

console.log('\n' + '='.repeat(100));
console.log(`${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
