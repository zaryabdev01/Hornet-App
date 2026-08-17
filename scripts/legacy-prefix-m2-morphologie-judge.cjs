// Verbatim reproduction of jugerMorphologie() + verrouVert() exactly as they
// existed BEFORE the M2 changes (src/engine/judge.js, pre-2026-08-08). Kept
// ONLY so the M2 report can show real before/after behavior side by side.
// Not imported by the app, not used anywhere in src/.
const ANTI_CRABRO_TYPES = new Set([
  'abdomen_jaune_dominant', 'rayures_jaune_noir_vif',
  'abdomen_segmente_jaune_noir_alterne', 'thorax_roux', 'tete_rousse_orangee',
]);
const MORPHO_TYPES = new Set([
  'morphologie_filiforme', 'silhouette_tres_fine',
  'morphologie_velue_compacte', 'jonction_etroite',
  'proportions_greles_non_robustes', 'silhouette_fine_allongee',
  'insecte_taille_minuscule_non_frelon',
]);

function effectiveReponse(reponse, confidence) {
  if (reponse === 'NON' && confidence === 'LOW') return 'NON_LISIBLE';
  return reponse;
}

function normalizeIncompat(rawIncompat) {
  const seenTypes = new Set();
  return (rawIncompat || [])
    .map(item => typeof item === 'string'
      ? { type: item, categorie: MORPHO_TYPES.has(item) ? 'morphologique' : 'chromatique' }
      : item)
    .filter(item => {
      if (seenTypes.has(item.type)) return false;
      seenTypes.add(item.type);
      return true;
    });
}

function verrouVertPreM2(obs, q1, q2, q3, surLeDos, incompat, nbMorpho, nbTotal, antiCrabroHit) {
  if (q1 === 'NON' && q2 === 'NON') {
    if (nbTotal >= 3 && nbMorpho >= 1) {
      return { verdict_code: 'VERT', reason_code: 'NONE' };
    }
  }

  const isCertitudeHaute = obs?.Q1_thorax?.confidence === 'HIGH' && obs?.Q2_abdomen?.confidence === 'HIGH';

  // Pre-M2 threshold: needed 3 hits, OR 2 hits + high Q1/Q2 confidence.
  if ((q3 === 'OUI' || q3 === 'NON_LISIBLE') && q1 === 'NON' && q2 === 'NON' && nbMorpho === 0) {
    if (antiCrabroHit >= 3 || (antiCrabroHit >= 2 && isCertitudeHaute)) {
      return { verdict_code: 'ORANGE_PROBABLE_NON_CIBLE', reason_code: 'CRABRO_LIKE_PROFILE' };
    }
  }

  if (q3 === 'OUI' || q3 === 'NON_LISIBLE') {
    if (nbMorpho >= 2) {
      return { verdict_code: 'VERT', reason_code: 'NONE' };
    }
    if (antiCrabroHit >= 2) {
      return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_LIGHTING_ANGLE' };
    }
    return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_PROFILE' };
  }

  if (q3 === 'NON') {
    if (nbMorpho === 0 && antiCrabroHit >= 1 && nbTotal < 3) {
      return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_LIGHTING_ANGLE' };
    }
    if (nbTotal >= 2) {
      return { verdict_code: 'VERT', reason_code: 'NONE' };
    }
  }

  return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: 'RETAKE_SHARPER' };
}

function jugerMorphologiePreM2(obs) {
  const surLeDos = obs.etape_2_individu.sur_le_dos;
  const q1conf = obs.Q1_thorax.confidence || 'MEDIUM';
  const q2conf = obs.Q2_abdomen.confidence || 'MEDIUM';
  const q3conf = obs.Q3_morphologie.confidence || 'MEDIUM';

  let q1 = effectiveReponse(obs.Q1_thorax.reponse, q1conf);
  let q2 = effectiveReponse(obs.Q2_abdomen.reponse, q2conf);
  let q3 = effectiveReponse(obs.Q3_morphologie.reponse, q3conf);

  if (obs.Q1_thorax.lisibilite === 'non_lisible' || q1 === 'NON_LISIBLE') q1 = 'NON_LISIBLE';
  if (obs.Q2_abdomen.lisibilite === 'non_lisible' || q2 === 'NON_LISIBLE') q2 = 'NON_LISIBLE';
  if (obs.Q3_morphologie.lisibilite === 'non_lisible' || q3 === 'NON_LISIBLE') q3 = 'NON_LISIBLE';

  const incompat = normalizeIncompat(obs.incompatibilites_cible);
  const nbMorpho = incompat.filter(i => i.categorie === 'morphologique').length;
  const nbTotal = incompat.length;
  const types = new Set(incompat.map(i => i.type));
  const antiCrabroHit = [...ANTI_CRABRO_TYPES].filter(t => types.has(t)).length;

  if (q3 === 'NON' && q3conf === 'HIGH' && types.has('insecte_taille_minuscule_non_frelon')) {
    return { verdict_code: 'VERT', reason_code: 'NONE' };
  }
  // Pre-M2: this generic shortcut is what swallowed wasp/Polistes AND hairy-body AND beetle
  // cases alike, with no distinguishing reason code.
  if (q3 === 'NON' && q3conf === 'HIGH' && nbMorpho >= 2) {
    return { verdict_code: 'VERT', reason_code: 'NONE' };
  }

  const reponses = [q1, q2, q3];
  const nbOui = reponses.filter(r => r === 'OUI').length;
  const nbNl = reponses.filter(r => r === 'NON_LISIBLE').length;

  if (nbOui === 3) return { verdict_code: 'ROUGE', reason_code: 'NONE' };
  if (nbOui === 0 && nbNl >= 2) return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: 'NO_CRITERIA_VISIBLE' };
  if (nbOui === 2 && nbNl === 1) {
    let reason = 'RETAKE_SHARPER';
    if (surLeDos) reason = 'RETAKE_DORSAL_VIEW';
    else if (q1 === 'NON_LISIBLE') reason = 'RETAKE_THORAX';
    else if (q2 === 'NON_LISIBLE') reason = 'RETAKE_ABDOMEN';
    else if (q3 === 'NON_LISIBLE') reason = 'RETAKE_MORPHOLOGY';
    return { verdict_code: 'ORANGE_INSUFFISANCE', reason_code: reason };
  }

  return verrouVertPreM2(obs, q1, q2, q3, surLeDos, incompat, nbMorpho, nbTotal, antiCrabroHit);
}

module.exports = { jugerMorphologiePreM2 };
