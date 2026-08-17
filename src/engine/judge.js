// APISAVE - MOTEUR DE DECISION (LE JUGE) - JavaScript
// BEEALERT CORE V13.5+ MES-1 — Version 1.10 (M2)
//
// V1.7 : verdict ORANGE_PROBABLE_NON_CIBLE pour espèces voisines évidentes
// V1.8 : champs confidence (Q1/Q2/Q3) — LOW NON → NON_LISIBLE (anti-faux-négatif)
// V1.8.3 : nouveaux verrous morpho absolu, auto-normalisation incompatibilités,
//           structure_strength, NO_CRITERIA_VISIBLE, CRABRO_LIKE_PROFILE avec certitude haute
// V1.8.4 : correction M1 — structure : indice artificiel isolé n'écarte plus un nid fort (Finding D1)
// V1.9 (M2) :
//   - carapace_dure_elytres_visibles / morphologie_velue_compacte : reason codes dédiés
//     (INSECT_BEETLE_FEATURES_VISIBLE / INSECT_HAIRY_BODY_INCOMPATIBLE), verdict VERT inchangé (Finding D6)
//   - Règle Hyménoptère Non Cible : guêpe/Polistes détecté partage désormais la route
//     ORANGE_PROBABLE_NON_CIBLE avec le frelon européen (reason NON_TARGET_HYMENOPTERA) au lieu
//     d'un VERT générique — VERT reste réservé aux objets non biologiques, pièges végétaux,
//     insectes minuscules, coléoptères et corps velus
//   - Seuil crabro assoupli : un seul marqueur suffit si confiance Q1+Q2 haute (plus besoin de 2-3)
// V1.10 (M2, Round 2 validation, client-specified logic) :
//   - Règle Hyménoptère Non Cible passée en logique à paliers (cf. WASP_CORE_TAGS/WASP_SUPPORTING_TAGS) :
//     ORANGE_PROBABLE_NON_CIBLE si 2 tags "core" OU 1 "core" + 1 "supporting" ; ORANGE_INSUFFISANCE
//     (jamais VERT) si un seul tag pertinent est présent — corrige photos #3/#5/#10 (Round 2) sans
//     élargir la route au point de risquer une confusion avec un frelon asiatique réel
//   - Frelon européen : nouvelle route ORANGE_PROBABLE_NON_CIBLE quand Q1=NON, Q2=NON, Q3=NON et
//     >= 3 marqueurs crabro distincts — corrige photo #6 (Round 2). Structurellement impossible de
//     court-circuiter ROUGE (qui exige Q1=OUI). Logique Q1/Q2/Q3 elle-même non modifiée.

import { CONFIANCE, ACTIONS, REASON_CODES } from '../constants/verdicts';
import { ENGINE } from '../constants/branding';

const ANTI_CRABRO_TYPES = new Set([
  'abdomen_jaune_dominant',
  'rayures_jaune_noir_vif',
  'abdomen_segmente_jaune_noir_alterne',
  'thorax_roux',
  'tete_rousse_orangee',
]);

// V1.10 (M2) — signature à paliers du verrou guêpe/Polistes. "Core" = les deux tags
// morphologiques que le verrou ajoute toujours ensemble en théorie ; "supporting" = les deux
// tags chromatiques du même verrou. Cf. décision client Round 2.
const WASP_CORE_TAGS = new Set(['silhouette_fine_allongee', 'proportions_greles_non_robustes']);
const WASP_SUPPORTING_TAGS = new Set(['rayures_jaune_noir_vif', 'abdomen_jaune_dominant']);

// V1.8.3 — pour l'auto-catégorisation des incompatibilités non-structurées
// V1.9 — ajout carapace_dure_elytres_visibles (remplace le tag erroné morphologie_filiforme)
const MORPHO_TYPES = new Set([
  'morphologie_filiforme', 'silhouette_tres_fine',
  'morphologie_velue_compacte', 'carapace_dure_elytres_visibles', 'jonction_etroite',
  'proportions_greles_non_robustes', 'silhouette_fine_allongee',
  'insecte_taille_minuscule_non_frelon',
]);

const EMOJI_MAP = {
  ROUGE: 'rouge',
  ORANGE_PLAFOND: 'orange_plafond',
  ORANGE_PROBABLE_NON_CIBLE: 'orange_probable_non_cible',
  ORANGE_INSUFFISANCE: 'orange_insuffisance',
  VERT: 'vert',
};

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function formatVerdict(verdictKey, motif, reasonCode, analyseId, timestamp) {
  if (!(reasonCode in REASON_CODES)) {
    throw new Error(`reason_code inconnu : ${reasonCode}`);
  }
  return {
    analyse_id: analyseId,
    timestamp,
    verdict: EMOJI_MAP[verdictKey],
    verdict_code: verdictKey,
    confiance: CONFIANCE[verdictKey],
    motif_principal: motif,
    reason_code: reasonCode,
    action_recommandee: ACTIONS[verdictKey],
    avis: "Analyse indicative basée uniquement sur les éléments visibles. Confirmation professionnelle recommandée en cas de doute.",
    protocole_version: ENGINE.protocole,
  };
}

// V1.8 — NON avec faible certitude → traité comme NON_LISIBLE (anti-faux-négatif)
function effectiveReponse(reponse, confidence) {
  if (reponse === 'NON' && confidence === 'LOW') return 'NON_LISIBLE';
  return reponse;
}

// V1.8 — Calibration du score confiance affiché (ne change pas le verdict)
function calibrateConfiance(baseConfiance, q1conf, q2conf, q3conf) {
  const confs = [q1conf, q2conf, q3conf].filter(Boolean);
  if (confs.length === 0) return baseConfiance;
  const highCount = confs.filter(c => c === 'HIGH').length;
  const lowCount = confs.filter(c => c === 'LOW').length;
  let adjusted = baseConfiance;
  if (highCount === 3) adjusted = Math.min(adjusted + 5, 98);
  else if (lowCount >= 2) adjusted = Math.max(adjusted - 15, 30);
  else if (lowCount === 1) adjusted = Math.max(adjusted - 8, 35);
  return adjusted;
}

function identifierCritereManquant(q1, q2, q3, surLeDos) {
  if (surLeDos) return 'RETAKE_DORSAL_VIEW';
  if (q1 === 'NON_LISIBLE') return 'RETAKE_THORAX';
  if (q2 === 'NON_LISIBLE') return 'RETAKE_ABDOMEN';
  if (q3 === 'NON_LISIBLE') return 'RETAKE_MORPHOLOGY';
  return 'RETAKE_SHARPER';
}

// V1.8.3 — Normalise les incompatibilités : dédupplication + auto-catégorisation si string
function normalizeIncompat(rawIncompat) {
  const seenTypes = new Set();
  return (rawIncompat || [])
    .map(item =>
      typeof item === 'string'
        ? { type: item, categorie: MORPHO_TYPES.has(item) ? 'morphologique' : 'chromatique' }
        : item
    )
    .filter(item => {
      if (seenTypes.has(item.type)) return false;
      seenTypes.add(item.type);
      return true;
    });
}

function verrouVert(obs, q1, q2, q3, surLeDos, analyseId, timestamp, incompat, nbMorpho, nbTotal, antiCrabroHit) {
  const types = new Set(incompat.map(i => i.type));

  // V1.10 (M2, Round 2, client-specified) — évidence chromatique crabro très forte : peut
  // atteindre la route non-cible même si Q3 = NON, mais seulement avec Q1 = NON, Q2 = NON et
  // >= 3 marqueurs crabro distincts. Placé avant tout autre verrou de ce bloc pour que ce
  // signal explicite prenne le pas sur les raccourcis génériques. Q1 = NON exclut déjà
  // structurellement ROUGE (qui exige Q1 = OUI) : ne peut jamais court-circuiter une route ROUGE valide.
  if (q1 === 'NON' && q2 === 'NON' && q3 === 'NON' && antiCrabroHit >= 3) {
    return formatVerdict('ORANGE_PROBABLE_NON_CIBLE',
      'Signature chromatique crabro très forte (>= 3 marqueurs distincts) malgré une morphologie non confirmée : espèce voisine probable.',
      'CRABRO_LIKE_PROFILE', analyseId, timestamp);
  }

  // Profil fortement incompatible (V1.3)
  if (q1 === 'NON' && q2 === 'NON') {
    if (nbTotal >= 3 && nbMorpho >= 1) {
      return formatVerdict('VERT',
        'Profil fortement incompatible avec Vespa velutina.',
        'NONE', analyseId, timestamp);
    }
  }

  // V1.8.3 — ORANGE_PROBABLE_NON_CIBLE : 3 hits crabro OU 2 hits + certitude haute Q1+Q2
  // V1.9 (M2) — seuil assoupli : 1 seul hit suffit si Q1+Q2 sont HIGH. Un frelon européen
  // clairement identifié (thorax/abdomen roux lus avec certitude) ne doit jamais retomber sur
  // une simple demande de seconde photo faute d'un deuxième marqueur chromatique — il doit
  // atteindre la route non-cible de façon fiable, dès qu'un marqueur net est présent.
  const isCertitudeHaute =
    obs?.Q1_thorax?.confidence === 'HIGH' && obs?.Q2_abdomen?.confidence === 'HIGH';

  if ((q3 === 'OUI' || q3 === 'NON_LISIBLE') && q1 === 'NON' && q2 === 'NON' && nbMorpho === 0) {
    if (antiCrabroHit >= 3 || (antiCrabroHit >= 1 && isCertitudeHaute)) {
      return formatVerdict(
        'ORANGE_PROBABLE_NON_CIBLE',
        'Convergence forte de marqueurs chromatiques type crabro avec morphologie frelon compatible : espèce voisine probable.',
        'CRABRO_LIKE_PROFILE', analyseId, timestamp
      );
    }
  }

  // Q3 = OUI ou NON_LISIBLE : morphologie potentiellement compatible frelon
  if (q3 === 'OUI' || q3 === 'NON_LISIBLE') {
    if (nbMorpho >= 2) {
      return formatVerdict('VERT',
        '>=2 incompatibilités morphologiques claires malgré morphologie frelon.',
        'NONE', analyseId, timestamp);
    }
    if (antiCrabroHit >= 2) {
      const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_LIGHTING_ANGLE';
      return formatVerdict('ORANGE_INSUFFISANCE',
        'Profil chromatique fortement non velutina, mais morphologie encore compatible : seconde photo requise.',
        reason, analyseId, timestamp);
    }
    const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_PROFILE';
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Morphologie compatible frelon, incompatibilité chromatique seule insuffisante.',
      reason, analyseId, timestamp);
  }

  // Q3 = NON
  if (q3 === 'NON') {
    if (nbMorpho === 0 && antiCrabroHit >= 1 && nbTotal < 3) {
      const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_LIGHTING_ANGLE';
      return formatVerdict('ORANGE_INSUFFISANCE',
        'Morphologie déviante mais profil chromatique crabro : seconde photo requise pour exclure une variante velutina atypique.',
        reason, analyseId, timestamp);
    }
    if (nbTotal >= 2) {
      return formatVerdict('VERT',
        '>=2 incompatibilités claires avec Vespa velutina.',
        'NONE', analyseId, timestamp);
    }
  }

  return formatVerdict('ORANGE_INSUFFISANCE',
    'Critères insuffisants pour conclure.',
    'RETAKE_SHARPER', analyseId, timestamp);
}

function jugerMorphologie(obs, analyseId, timestamp) {
  const surLeDos = obs.etape_2_individu.sur_le_dos;

  const q1conf = obs.Q1_thorax.confidence || 'MEDIUM';
  const q2conf = obs.Q2_abdomen.confidence || 'MEDIUM';
  const q3conf = obs.Q3_morphologie.confidence || 'MEDIUM';

  let q1 = effectiveReponse(obs.Q1_thorax.reponse, q1conf);
  let q2 = effectiveReponse(obs.Q2_abdomen.reponse, q2conf);
  let q3 = effectiveReponse(obs.Q3_morphologie.reponse, q3conf);

  // Forçage lisibilité physique
  if (obs.Q1_thorax.lisibilite === 'non_lisible' || q1 === 'NON_LISIBLE') q1 = 'NON_LISIBLE';
  if (obs.Q2_abdomen.lisibilite === 'non_lisible' || q2 === 'NON_LISIBLE') q2 = 'NON_LISIBLE';
  if (obs.Q3_morphologie.lisibilite === 'non_lisible' || q3 === 'NON_LISIBLE') q3 = 'NON_LISIBLE';

  if (__DEV__) {
    console.log(`[JugeV183] Q1: ${obs.Q1_thorax.reponse}(${q1conf}) → ${q1}`);
    console.log(`[JugeV183] Q2: ${obs.Q2_abdomen.reponse}(${q2conf}) → ${q2}`);
    console.log(`[JugeV183] Q3: ${obs.Q3_morphologie.reponse}(${q3conf}) → ${q3}`);
  }

  // V1.8.3 — normalisation des incompatibilités
  const incompat = normalizeIncompat(obs.incompatibilites_cible);
  const nbMorpho = incompat.filter(i => i.categorie === 'morphologique').length;
  const nbTotal = incompat.length;
  const types = new Set(incompat.map(i => i.type));
  const antiCrabroHit = [...ANTI_CRABRO_TYPES].filter(t => types.has(t)).length;

  // V1.8.3 — court-circuits morphologiques absolus (certitude haute requise)
  if (q3 === 'NON' && q3conf === 'HIGH' && types.has('insecte_taille_minuscule_non_frelon')) {
    return formatVerdict('VERT', 'Insecte minuscule non compatible avec un frelon.', 'NONE', analyseId, timestamp);
  }

  // V1.10 (M2, Round 2) — Hyménoptère non cible (guêpe/Polistes), logique à paliers.
  // N'intervient que si au moins un tag "core" (morphologique) est présent — les tags
  // "supporting" (chromatiques) seuls ne suffisent jamais et n'engagent pas cette règle,
  // laissant le cas retomber naturellement sur la route crabro / logique générique existante.
  const nbWaspCore = [...WASP_CORE_TAGS].filter(t => types.has(t)).length;
  const nbWaspSupporting = [...WASP_SUPPORTING_TAGS].filter(t => types.has(t)).length;

  if (nbWaspCore >= 2 || (nbWaspCore >= 1 && nbWaspSupporting >= 1)) {
    return formatVerdict('ORANGE_PROBABLE_NON_CIBLE',
      'Profil compatible avec une guêpe ou un Polistes : hyménoptère non cible identifié.',
      'NON_TARGET_HYMENOPTERA', analyseId, timestamp);
  }
  if (nbWaspCore === 1 && nbWaspSupporting === 0) {
    const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_MORPHOLOGY';
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Un seul marqueur guêpe/Polistes détecté : confirmation insuffisante, seconde photo requise.',
      reason, analyseId, timestamp);
  }

  // V1.9 (M2) — reason codes dédiés pour les verrous bourdon/coléoptère (Finding D6).
  // Verdict inchangé (VERT, confirmé par le client) — seul le reason_code devient spécifique
  // au lieu de retomber dans le raccourci générique ci-dessous.
  if (types.has('morphologie_velue_compacte')) {
    return formatVerdict('VERT', 'Corps velu/massif incompatible avec un frelon.', 'INSECT_HAIRY_BODY_INCOMPATIBLE', analyseId, timestamp);
  }
  if (types.has('carapace_dure_elytres_visibles')) {
    return formatVerdict('VERT', 'Caractéristiques de coléoptère visibles, incompatibles avec un frelon.', 'INSECT_BEETLE_FEATURES_VISIBLE', analyseId, timestamp);
  }

  if (q3 === 'NON' && q3conf === 'HIGH' && nbMorpho >= 2) {
    return formatVerdict('VERT', 'Incompatibilité morphologique absolue.', 'NONE', analyseId, timestamp);
  }

  const reponses = [q1, q2, q3];
  const nbOui = reponses.filter(r => r === 'OUI').length;
  const nbNl = reponses.filter(r => r === 'NON_LISIBLE').length;

  if (nbOui === 3) {
    return formatVerdict('ROUGE',
      'Q1 + Q2 + Q3 = OUI valides sur le même individu.',
      'NONE', analyseId, timestamp);
  }

  // V1.8.3 — absence totale de critères lisibles
  if (nbOui === 0 && nbNl >= 2) {
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Absence de critères lisibles suffisants.',
      'NO_CRITERIA_VISIBLE', analyseId, timestamp);
  }

  if (nbOui === 2 && nbNl === 1) {
    const reason = identifierCritereManquant(q1, q2, q3, surLeDos);
    return formatVerdict('ORANGE_INSUFFISANCE',
      '2 critères valides, 1 critère non lisible.',
      reason, analyseId, timestamp);
  }

  return verrouVert(obs, q1, q2, q3, surLeDos, analyseId, timestamp, incompat, nbMorpho, nbTotal, antiCrabroHit);
}

// V1.8.4 — Juge structurel avec structure_strength + score texture/strates amélioré
// V1.8.4 : correction M1 — un indice artificiel isolé ne doit plus écarter une structure
//          par ailleurs fortement compatible avec un nid (cf. audit finding D1/critique).
function jugerStructure(obs, analyseId, timestamp) {
  const s = obs.structure;

  if (!s.evaluee) {
    return formatVerdict('VERT', 'Absence de structure construite exploitable.',
      'NONE', analyseId, timestamp);
  }

  const forts = s.marqueurs_forts.length;
  const faibles = Math.min(s.marqueurs_faibles.length, 2);
  const hasPiegeVeg = s.pieges_vegetaux_possibles.length >= 1;

  const texture = s.texture_papier_carton || 'NON_LISIBLE';
  const strates = s.strates_repetitives || 'NON_LISIBLE';
  const forme = s.forme_globale || 'non_lisible';
  const suspension = s.suspension_visible || 'NON_LISIBLE';
  const qualite = s.qualite_structure || 'MEDIUM';
  const strength = s.structure_strength || 'WEAK'; // V1.8.3

  // V1.8.4 — Anti-false-positive absolu : objet artificiel identifié, MAIS seulement
  // si aucun marqueur de nid fort concurrent n'est présent. Un indice artificiel isolé
  // (ex: nid construit contre une gouttière) ne suffit plus seul à écarter la structure.
  const hasStrongNestMarkers = forts >= 1 || texture === 'OUI' || strates === 'OUI' || strength === 'STRONG';
  const artificialOnly = s.indices_artificiels.length > 1 && !hasStrongNestMarkers;

  if (artificialOnly) {
    return formatVerdict('VERT',
      'Indice(s) artificiel(s) visible(s) — structure non biologique.',
      'OBJECT_NON_BIOLOGICAL_STRUCTURE', analyseId, timestamp);
  }

  // Anti-false-positive végétal : piège possible sans signal construit → VERT direct
  if (hasPiegeVeg && forts === 0 && texture !== 'OUI' && strates !== 'OUI') {
    return formatVerdict('VERT',
      'Piège végétal possible sans marqueur construit confirmé.',
      'NONE', analyseId, timestamp);
  }

  // V1.8.3 — Score structurel amélioré
  let score = 0;
  score += forts * 2;
  score += faibles;
  // Texture + strates ensemble = signal fort (7 pts) vs séparés
  if (texture === 'OUI' && strates === 'OUI') score += 7;
  else if (texture === 'OUI') score += 3;
  if (strates === 'OUI') score += 2;
  if (forme === 'ovoide' || forme === 'spherique') score += 1;
  if (suspension === 'OUI') score += 1;
  if (qualite === 'HIGH') score += 1;
  if (qualite === 'LOW') score -= 1;
  if (hasPiegeVeg) score -= 2;

  const hasPositiveSignal = forts >= 1 || texture === 'OUI' || strates === 'OUI';

  if (__DEV__) {
    console.log(`[JugeV183 Structure] score=${score} forts=${forts} texture=${texture} strates=${strates} strength=${strength} piegeVeg=${hasPiegeVeg}`);
  }

  if (score >= 3 && hasPositiveSignal) {
    const parts = [];
    if (forts >= 1) parts.push(`${forts} marqueur(s) fort(s)`);
    if (texture === 'OUI') parts.push('texture papier/carton');
    if (strates === 'OUI') parts.push('strates répétitives');
    if (parts.length === 0) parts.push('convergence de signaux structurels');
    return formatVerdict('ORANGE_PLAFOND',
      `Structure compatible avec nid social construit : ${parts.join(', ')}.`,
      'STRUCTURE_STRONG_GLOBAL', analyseId, timestamp);
  }

  // V1.8.3 — Lecture globale via structure_strength si score insuffisant
  if (strength === 'STRONG') {
    return formatVerdict('ORANGE_PLAFOND',
      'Structure fortement compatible avec un nid social construit (lecture globale).',
      'STRUCTURE_STRONG_GLOBAL', analyseId, timestamp);
  }
  if (strength === 'MEDIUM') {
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Structure partiellement compatible — confirmation requise.',
      'STRUCTURE_MEDIUM_GLOBAL', analyseId, timestamp);
  }

  return formatVerdict('VERT', 'Marqueurs structurels insuffisants pour une suspicion.',
    'NONE', analyseId, timestamp);
}

// Point d'entrée principal — fonction pure déterministe
export function juger(obs) {
  const analyseId = generateId();
  const timestamp = new Date().toISOString();

  const insecte = obs.etape_1_declencheur.insecte_exploitable;
  const structure = obs.etape_1_declencheur.structure_visible;

  if (!insecte && !structure) {
    return formatVerdict('VERT', "Absence d'élément exploitable.",
      'NONE', analyseId, timestamp);
  }

  const verdict = insecte
    ? jugerMorphologie(obs, analyseId, timestamp)
    : jugerStructure(obs, analyseId, timestamp);

  // V1.8 : calibration du score confiance affiché (insecte uniquement)
  if (insecte && obs.Q1_thorax.confidence) {
    const q1conf = obs.Q1_thorax.confidence;
    const q2conf = obs.Q2_abdomen.confidence || 'MEDIUM';
    const q3conf = obs.Q3_morphologie.confidence || 'MEDIUM';
    verdict.confiance = calibrateConfiance(verdict.confiance, q1conf, q2conf, q3conf);

    if (__DEV__) {
      console.log(`[JugeV183] Verdict: ${verdict.verdict_code} confiance: ${verdict.confiance}%`);
    }
  }

  return verdict;
}
