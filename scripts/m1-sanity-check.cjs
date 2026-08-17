// M1 sanity check — synthetic before/after demonstration of the structure-Judge fix.
//
// This is NOT the M1 acceptance deliverable. The real deliverable is the client's
// nest/structure reference images run through the live Gemini API, once provided.
// This script proves the code-level fix behaves as specified, using hand-built
// observation objects that reproduce the exact bug pattern from the audit
// (Finding D1 / M1 critical bug), ahead of receiving those images.
//
// Run: node scripts/m1-sanity-check.cjs

// React Native injects this global at build time via Metro; plain Node doesn't have it.
global.__DEV__ = false;

require('./babel-esm-loader.cjs');
const path = require('path');
const { juger } = require(path.join(__dirname, '..', 'src', 'engine', 'judge.js'));

// Verbatim copy of the pre-fix gate that used to live in src/engine/judge.js,
// kept ONLY here for before/after comparison. Not imported by the app.
function preFixArtificialGate(structure) {
  return structure.indices_artificiels.length >= 1;
}

function makeStructureObs(structureOverrides) {
  return {
    etape_1_declencheur: { insecte_exploitable: false, structure_visible: true, justification: 'test synthétique' },
    etape_2_individu: { individu_analyse_identifiable: false, vue_dorsale: false, sur_le_dos: false },
    Q1_thorax: { reponse: 'NON_LISIBLE', confidence: 'LOW', description_visible: 'aucun insecte exploitable', lisibilite: 'non_lisible' },
    Q2_abdomen: { reponse: 'NON_LISIBLE', confidence: 'LOW', fond_dominant: 'non_lisible', zone_terminale_orangee: false, description_visible: 'aucun insecte exploitable', lisibilite: 'non_lisible' },
    Q3_morphologie: { reponse: 'NON_LISIBLE', confidence: 'LOW', elements_visibles: [], incompatibilites_visibles: [], description_visible: 'aucun insecte exploitable', lisibilite: 'non_lisible' },
    incompatibilites_cible: [],
    structure: {
      evaluee: true,
      forme_globale: 'ovoide',
      texture_papier_carton: 'NON',
      strates_repetitives: 'NON',
      suspension_visible: 'NON',
      position: 'toiture',
      qualite_structure: 'MEDIUM',
      structure_strength: 'WEAK',
      marqueurs_forts: [],
      marqueurs_faibles: [],
      indices_artificiels: [],
      pieges_vegetaux_possibles: [],
      ...structureOverrides,
    },
  };
}

const cases = [
  {
    name: 'A — THE BUG SCENARIO: strong confirmed nest, built against a metal support (1 artificial cue)',
    expectation: 'Must now be treated as a probable nest (ORANGE_PLAFOND), not waved through as VERT.',
    structure: {
      marqueurs_forts: ['enveloppe_cartonnee_continue'],
      texture_papier_carton: 'OUI',
      strates_repetitives: 'OUI',
      structure_strength: 'STRONG',
      indices_artificiels: ['armature_metallique_plastique'], // e.g. nest built against a gutter bracket
    },
  },
  {
    name: 'B — regression check: genuine artificial object, no nest signal at all',
    expectation: 'Must remain VERT / non-biological — the fix must not weaken real artificial-object detection.',
    structure: {
      indices_artificiels: ['geometrie_industrielle', 'symetrie_artificielle'],
    },
  },
  {
    name: 'C — regression check: clean confirmed nest, zero artificial cues',
    expectation: 'Must remain ORANGE_PLAFOND, unaffected by this fix.',
    structure: {
      marqueurs_forts: ['enveloppe_cartonnee_continue', 'stratification_lamellaire'],
      texture_papier_carton: 'OUI',
      strates_repetitives: 'OUI',
      structure_strength: 'STRONG',
    },
  },
  {
    name: 'D — edge case: single artificial cue, weak/no nest signal (genuinely ambiguous)',
    expectation: 'Falls through to the normal scoring logic instead of an automatic override — expected to resolve low/VERT via score, not via the artificial-object shortcut.',
    structure: {
      indices_artificiels: ['materiau_translucide_synthetique'],
    },
  },
];

console.log('='.repeat(100));
console.log('M1 SANITY CHECK — synthetic before/after, structure-Judge fix');
console.log('='.repeat(100));

for (const c of cases) {
  const obs = makeStructureObs(c.structure);
  const after = juger(obs);
  const beforeWouldTrigger = preFixArtificialGate(obs.structure);

  console.log('\n' + '-'.repeat(100));
  console.log(c.name);
  console.log('Expectation: ' + c.expectation);
  console.log('structure fields:', JSON.stringify(c.structure));
  console.log(
    'PRE-FIX gate would have fired:', beforeWouldTrigger,
    beforeWouldTrigger ? '(=> would have forced VERT / OBJECT_NON_BIOLOGICAL_STRUCTURE regardless of nest evidence)' : '(=> would have fallen through to scoring, same as after-fix path)'
  );
  console.log('AFTER-FIX verdict:', after.verdict_code, '| reason:', after.reason_code, '| confidence:', after.confiance);
  console.log('AFTER-FIX motif:', after.motif_principal);
}

console.log('\n' + '='.repeat(100));
console.log('Done. Case A is the critical one: pre-fix gate would fire (forcing VERT) despite');
console.log('strong nest evidence; after-fix verdict should be ORANGE_PLAFOND. Cases B and C');
console.log('confirm no regression on already-correct behavior.');
