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
    etape_2_individu: { individu_analyse_identifiable: true, vue_dorsale: true, sur_le_dos: false },
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

// 5. European hornet, single marker, HIGH confidence Q1+Q2 -> ORANGE_PROBABLE_NON_CIBLE (tightened threshold)
check('European hornet, 1 marker + high Q1/Q2 confidence -> ORANGE_PROBABLE_NON_CIBLE (was ORANGE_INSUFFISANCE before M2)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'HIGH', description_visible: 'thorax roux', lisibilite: 'haute' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'orange', zone_terminale_orangee: false, description_visible: 'abdomen roux', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], incompatibilites_visibles: [], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ORANGE_PROBABLE_NON_CIBLE', 'CRABRO_LIKE_PROFILE');

// 6. European hornet, single marker, but LOW/MEDIUM confidence -> should NOT trigger the tightened
//    threshold (confirms we didn't over-loosen) -> falls through to ORANGE_INSUFFISANCE
check('European hornet, 1 marker + MEDIUM confidence -> stays ORANGE_INSUFFISANCE (threshold not over-loosened)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'thorax roux, incertain', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'HIGH', fond_dominant: 'orange', zone_terminale_orangee: false, description_visible: 'abdomen roux', lisibilite: 'haute' },
    Q3_morphologie: { reponse: 'OUI', confidence: 'HIGH', elements_visibles: ['thorax_massif', 'proportions_compactes_robustes'], incompatibilites_visibles: [], description_visible: 'robuste', lisibilite: 'haute' },
    incompatibilites_cible: ['thorax_roux'],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_PROFILE');

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

// 6d. Regression: same 2 markers WITHOUT high confidence -> threshold still respected, still a retake
check('European hornet, Q3=NON + 2 crabro markers + MEDIUM confidence -> still ORANGE_INSUFFISANCE (threshold respected)',
  makeInsectObs({
    Q1_thorax: { reponse: 'NON', confidence: 'MEDIUM', description_visible: 'roux', lisibilite: 'moyenne' },
    Q2_abdomen: { reponse: 'NON', confidence: 'MEDIUM', fond_dominant: 'jaune_vif', zone_terminale_orangee: false, description_visible: 'jaune dominant', lisibilite: 'moyenne' },
    Q3_morphologie: { reponse: 'NON', confidence: 'MEDIUM', elements_visibles: [], description_visible: 'jugee non conforme', lisibilite: 'moyenne' },
    incompatibilites_cible: ['abdomen_jaune_dominant', 'rayures_jaune_noir_vif'],
  }),
  'ORANGE_INSUFFISANCE', 'RETAKE_LIGHTING_ANGLE');

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

console.log('\n' + '='.repeat(100));
console.log(`${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
