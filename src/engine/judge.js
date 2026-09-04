// APISAVE - MOTEUR DE DECISION (LE JUGE) - JavaScript
// BEEALERT CORE V13.5+ MES-1 — Version 1.14 (post-M2)
//
// V1.17 (post-M2, Item 2 v2, follow-up 2026-09-04, live-data replay finding) :
//   V1.16's targeted live re-test surfaced a real safety regression missed by the first full run's
//   aggregate pass count: hasConfidentChromaticExclusion's abdomen_jaune_dominant+antiCrabroHit>=2
//   clause was wrongly excluding confirmed Asian-hornet photos (Case1/Case2) at a materially higher
//   rate (~5/24 each) than the original ~1-in-8 estimate. Diagnosed by pooling and replaying every
//   sample captured across this fix's four live regression runs (404 total observations) through
//   candidate thresholds with zero additional API cost — see hasConfidentChromaticExclusion() below
//   for the full reasoning and data. Net change: removed that clause; kept thorax_roux-alone and the
//   antiCrabroHit>=4 saturation fallback. Trades back part of the C7_7 (European hornet) fix to cut
//   the Case1/Case2 false-exclusion rate roughly in half — the correct trade given this app's
//   fail-safe design principle (a missed real target is worse than an extra non-target retake).
// V1.16 (post-M2, Item 2 v2, follow-up 2026-09-04, live regression finding) :
//   Après la première passe V1.15, un run de validation complet (181 appels réels,
//   test_images_5/regression/v2-baseline.* vs v2-after-v1.*) a montré le portail nid trop
//   dépendant du tag facultatif nid_alveoles_ouvertes_visible : sur le cas critique C7_1, le
//   modèle ne l'ajoutait que 5 fois sur 8, et les 3 autres appels sans AUCUNE incompatibilité
//   laissaient ROUGE se déclencher faute de signal (3/8 encore ROUGE après V1.15, contre 5/8 avant).
//   Ajout du champ obligatoire etape_2_individu.support_nid_ouvert_visible (prompts.js V2.8,
//   schema.js V1.13), vérifié en OU logique avec le tag existant — voir commentaire détaillé dans
//   jugerMorphologie(). Seul changement de cette version ; le reste de la calibration V1.15
//   (hasConfidentChromaticExclusion, reason codes) est inchangé et déjà validé par sampling répété.
// V1.15 (post-M2, Item 2 v2 — régressions non-cibles, client obs. 2026-09-04, diagnosis
//   docs/ApiSave_Postvalidation_v2_Diagnosis.md §4, approuvé par le client) :
//   Sept cas rapportés (test_images_6/7) : une guêpe sur son nid ouvert lue ROUGE à 92%, plusieurs
//   guêpes/mouches Volucella/frelon européen renvoyées en ORANGE_INSUFFISANCE avec des reason codes
//   ne correspondant pas à la photo réelle ("image floue" sur des photos nettes, "lumière naturelle"
//   sur des photos en plein jour). Calibré par échantillonnage répété (4-8 tirs/cas) sur le jeu de
//   référence complet (groupes A-G, test_images_5/regression/v2-baseline.* puis *-after-*).
//   - Portail d'exclusion symétrique (jugerMorphologie, avant le court-circuit ROUGE) : un nid à
//     alvéoles ouvertes visible sous l'individu (nouveau tag nid_alveoles_ouvertes_visible,
//     prompts.js V2.7) ou un profil chromatique anti-crabro net (cf. hasConfidentChromaticExclusion)
//     écarte désormais la cible AVANT que Q1=Q2=Q3=OUI puisse produire ROUGE — symétrique de la
//     règle guêpe/Polistes déjà en place, qui bloquait ROUGE mais pas les deux autres cas.
//   - hasConfidentChromaticExclusion() centralise le seuil "conviction suffisante" utilisé à la fois
//     par ce portail et par verrouVert() : thorax_roux seul (le signal le plus fiable — quasi jamais
//     lu sur les 22 échantillons frelon-asiatique confirmés du groupe A, contre 4/6 à 6/6 sur chaque
//     référence crabro du groupe C), OU abdomen_jaune_dominant + >= 2 marqueurs anti-crabro au total,
//     OU >= 4 marqueurs anti-crabro (saturation). Remplace l'ancien couple "antiCrabroHit >= 3" /
//     "antiCrabroHit >= 2 && confiance Q1+Q2 HIGH-HIGH" : ce dernier seuil de certitude ne se
//     déclenchait quasiment jamais en pratique (Gemini rapporte MEDIUM, pas HIGH, sur la quasi-
//     totalité des échantillons crabro/guêpe réels — cf. cas C7_6 du diagnostic v2, bloqué 6/6 par ce
//     seuil), et le seuil brut >= 3 marqueurs perdait son effet dès qu'une décote s'appliquait
//     (tete_rousse_orangee isolé), rouvrant exactement le risque qu'il visait à fermer (cas C7_7).
//     La décote tete_rousse_orangee (ci-dessous) est conservée pour les branches héritées qui
//     comptent encore antiCrabroHit brut — elle protège les 22 échantillons du groupe A, dont aucun
//     ne lit jamais thorax_roux ni (sauf 1 cas sur 22) abdomen_jaune_dominant.
//   - Reason codes : RETAKE_SHARPER et RETAKE_LIGHTING_ANGLE ne sont plus utilisés comme fourre-tout
//     génériques quand des marqueurs anti-crabro existent mais restent sous le seuil de conviction —
//     nouveau code RETAKE_SPECIES_AMBIGUOUS ("espèce incertaine", pas "photo floue"/"mauvaise
//     lumière"). RETAKE_SHARPER reste réservé au cas où aucun marqueur d'aucune sorte n'est présent
//     (nbTotal === 0) : là, une reprise plus nette est réellement la seule piste disponible.
// V1.14 (post-M2, Item 1 — faux négatifs frelon asiatique -> crabro, client obs. 2026-09-02) :
//   Trois garde-fous sur la route CRABRO_LIKE_PROFILE, validés avant/après par échantillonnage
//   répété (test_images_5/regression/) contre les cas confirmés ROUGE et frelon européen :
//   - Contre-signal velutina : zone_terminale_orangee = true + q1 = OUI (abdomen sombre à bande
//     orange terminale + thorax sombre = signature cible) -> ORANGE_INSUFFISANCE, pas non-cible.
//   - Retrait du raccourci "1 seul marqueur chromatique suffit si Q1+Q2 HIGH" -> >= 2 marqueurs
//     distincts requis (ou >= 3 sans condition de certitude). Conséquence voulue : un cas à
//     marqueur unique redemande une seconde photo au lieu d'être classé « non-cible probable ».
//   - tete_rousse_orangee isolé (sans thorax_roux) ne compte plus dans antiCrabroHit.
//   Le vrai correctif de fond est côté prompt (prompts.js V2.6). Le Juge ne fabrique jamais de ROUGE.
//
// V1.13 (post-M2, Item 3 — distant-structure guided retake, client observation 2026-09-02) :
//   - jugerStructure() : si structure.trop_distante_pour_evaluer = true et qu'aucun marqueur de
//     nid fort n'est présent, le verdict reste VERT même si structure_strength est lu "MEDIUM"
//     (le champ ne doit jamais faire basculer un objet lointain non confirmé en orange).
//   - juger() attache un champ `suggestion` (reprise "photo plus proche") sur ce VERT.
//   Aucun changement de verdict la où de vrais marqueurs structurels existent.
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
// V1.11 (M2, field-test correction 2026-08-19, client report ApiSave_M2_Android_Field_Test_Findings) :
//   - Toutes les routes crabro (verrouVert, palier Q3=OUI/NON_LISIBLE, palier Q3=NON) ne requièrent
//     plus Q1=NON. Q1 (couleur du thorax) n'est pas discriminant entre velutina et crabro — les deux
//     ont un thorax sombre — donc l'exiger à NON verrouillait ces routes à tort sur des specimens
//     crabro réels lus Q1=OUI par Gemini (Photo 2). Sans risque pour ROUGE : verrouVert() n'est
//     jamais atteint quand Q1=Q2=Q3=OUI (court-circuit géré en amont dans jugerMorphologie).
//   - Palier Q3=NON : ajout d'une route ORANGE_PROBABLE_NON_CIBLE à seuil de certitude haute
//     (identique au palier Q3=OUI), pour stabiliser le cas "même spécimen, deux prises, deux
//     verdicts" (Photo 2 vs Photo 3) — la variance provenait de ce palier manquant, pas d'un besoin
//     réel de seconde photo.
// V1.12 (M2, client-approved 2026-08-19, Photo 1 targeted fix — readability-gated ROUGE,
//   IMPLEMENTED THEN REVERTED, same day) :
//   - Tried: ROUGE (Q1=Q2=Q3=OUI) additionally required lisibilite='haute' on all 3 criteria,
//     instead of a rejected earlier option requiring confidence=HIGH on all 3 (too volatile,
//     would have raised the retake rate on real targets — client rejected it, cf. Option A).
//     Single-sample-per-case evidence looked clean (all 4 confirmed-ROUGE regression cases read
//     lisibilite='haute'), and Photo 1 improved to 6/6 on repeated live testing.
//   - Reverted: repeated sampling (7-8 runs per case, not 1) showed 2 of the 4 confirmed-ROUGE
//     regression cases had a real ~1-in-3 rate of dropping to lisibilite='moyenne' on genuine,
//     correctly-identifiable targets — a materially larger retake-rate cost than the single-sample
//     check suggested. A follow-up bounded diagnostic (comparing every field, including free-text
//     descriptions, across all Photo-1 calls vs. the confirmed-target misses) found no reliable
//     distinguishing signal in existing fields — lisibilite/confidence behaved as call-to-call
//     self-rating noise on both groups, not a stable readout of real image properties. Client
//     decision 2026-08-19: revert to V1.11 behaviour, keep Photo 1 (and Photo 5, cf. prompts.js
//     V2.5) as documented residual limitations. A deterministic (non-self-reported) subject-size
//     signal was identified as the only path likely to actually work, but explicitly deferred —
//     out of M2 scope, to be reconsidered only if M4 shows this is a frequent real-world pattern.
//   - V1.11 is the active M2 baseline as of this revert — the code above is unchanged from V1.11.

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
  'nid_alveoles_ouvertes_visible', // V1.15 (post-M2, Item 2 v2)
]);

// V1.15 (post-M2, Item 2 v2) — nid à alvéoles hexagonales visibles à découvert, sans enveloppe
// fermée (rayon de guêpier ouvert type Polistes) : structurellement incompatible avec Vespa
// velutina, dont le nid est toujours clos dans une enveloppe cartonnée continue. Porte sur le
// support de l'individu, pas sur l'individu lui-même — vérifié indépendamment de Q1/Q2/Q3.
const NEST_EXCLUSION_TAG = 'nid_alveoles_ouvertes_visible';

// V1.15 (post-M2, Item 2 v2) — seuil unique de "conviction suffisante" pour écarter la cible sur
// preuve chromatique seule, utilisé à la fois par le portail pré-ROUGE et par verrouVert(). Voir le
// changelog V1.15 en tête de fichier pour le raisonnement et les données de calibration.
function hasConfidentChromaticExclusion(types, antiCrabroHit) {
  if (types.has('thorax_roux')) return true;
  if (antiCrabroHit >= 4) return true;
  return false;
}
// V1.17 (post-M2, Item 2 v2, follow-up 2026-09-04, replay-calibrated) — the abdomen_jaune_dominant
// + antiCrabroHit>=2 clause from V1.15 was removed here. A live-data replay across 404 samples
// pooled from every run captured for this fix (test_images_5/regression/v2-baseline.json,
// v2-after-v1.json, v3-targeted.json, v3-targeted2.json — script kept at
// C:\...\scratchpad\replay.cjs for this session, re-derivable from those 4 files) showed it was
// responsible for the majority of a real safety regression: Case1/Case2 (confirmed Asian-hornet
// false-negative photos) wrongly reached ORANGE_PROBABLE_NON_CIBLE in 5 of 24 samples each with it
// in place — a genuine "non-target, do not report" verdict on a real target, the single worst
// failure mode this app can produce. Every one of those misreads shared abdomen_jaune_dominant with
// only 2 other chromatic tags, discounted from raw >=3 by the tete_rousse_orangee rule below — the
// exact same tag composition Gemini also reports on real crabro (C7_7). The two populations are not
// separable on this tag combination alone; keeping the clause traded a rare non-target retake for a
// more frequent real-target false exclusion, which this app's whole design (fail-safe over silence)
// says is the wrong side to err on. Removing it costs back part of the C7_7 fix (falls to the
// ambiguous-retake fallback on that specific combination instead of confidently excluding) but drops
// Case1/Case2's false-exclusion rate roughly in half. thorax_roux-alone is kept: it is much rarer on
// real velutina (3 of 64 group-A samples across the same pool, always co-occurring with 2+ other
// markers, never isolated) and is the sole mechanism keeping the hoverfly fix (C7_5/C7_6) working,
// since those are frequently reported with thorax_roux as the ONLY tag.

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
  // V1.14 (post-M2, Item 1) — contre-signal velutina. Un abdomen sombre portant une bande
  // orange terminale (zone_terminale_orangee = true) avec un thorax lu comme sombre/compatible
  // (q1 = OUI) est la signature de la CIBLE, pas de crabro (dont l'abdomen est jaune à bandes
  // sombres réparties, sans zone orange terminale distincte). Quand ce contre-signal est présent,
  // la route CRABRO_LIKE_PROFILE est neutralisée : on ne classe pas un tel individu en « espèce
  // voisine probable ». ROUGE reste inatteignable ici (exige Q1+Q2+Q3 = OUI en amont) ; le repli
  // naturel est ORANGE_INSUFFISANCE (demande de seconde photo), verdict qui échoue du côté sûr.
  // Sans effet sur les vrais crabro du jeu de référence : ils sont tous lus zone_terminale_orangee
  // = false. Voir test_images_5/regression/*.md.
  const velutinaCounterSignal =
    obs?.Q2_abdomen?.zone_terminale_orangee === true && q1 === 'OUI';

  // V1.14 — quand le contre-signal velutina est présent et que l'abdomen n'est PAS déjà lu OUI,
  // on ne descend dans aucune branche non-cible ni VERT : un individu qui pourrait être la cible,
  // dont le thorax est sombre et l'extrémité abdominale orange, mais dont le motif abdominal est
  // lu de façon ambiguë, doit repartir sur une seconde photo — jamais « rien de suspect » ni
  // « espèce voisine probable ». Échoue du côté sûr.
  if (velutinaCounterSignal && q2 !== 'OUI') {
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Signature possible de frelon asiatique (thorax sombre, extrémité abdominale orange) mais lecture du motif abdominal ambiguë : seconde photo requise.',
      surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_ABDOMEN', analyseId, timestamp);
  }

  // V1.15 (post-M2, Item 2 v2) — La route CRABRO_LIKE_PROFILE sur preuve chromatique seule
  // (hasConfidentChromaticExclusion) est désormais vérifiée par le portail symétrique dans
  // jugerMorphologie, AVANT que cette fonction ne soit atteinte, et s'applique quel que soit
  // Q1/Q2/Q3 (pas seulement Q2=NON/Q3=NON). Si l'exécution arrive ici, c'est que cette preuve
  // n'était pas suffisante (ou que le contre-signal velutina ci-dessus l'a neutralisée) — pas la
  // peine de la re-tester. Les branches restantes ci-dessous gèrent les cas où l'évidence est
  // réelle mais insuffisante pour une conclusion ferme : elles échouent du côté sûr (retake).

  // Profil fortement incompatible (V1.3)
  if (q1 === 'NON' && q2 === 'NON') {
    if (nbTotal >= 3 && nbMorpho >= 1) {
      return formatVerdict('VERT',
        'Profil fortement incompatible avec Vespa velutina.',
        'NONE', analyseId, timestamp);
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
      // V1.15 (post-M2, Item 2 v2) — RETAKE_LIGHTING_ANGLE remplacé : la photo n'a pas de problème
      // de lumière ici, c'est l'espèce qui reste ambiguë entre cible et crabro/guêpe.
      const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_SPECIES_AMBIGUOUS';
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
      // V1.15 (post-M2, Item 2 v2) — idem : profil ambigu, pas un problème de lumière.
      const reason = surLeDos ? 'RETAKE_DORSAL_VIEW' : 'RETAKE_SPECIES_AMBIGUOUS';
      return formatVerdict('ORANGE_INSUFFISANCE',
        'Morphologie déviante mais profil chromatique crabro : seconde photo requise pour exclure une variante velutina atypique.',
        reason, analyseId, timestamp);
    }
    // V1.14 (post-M2, Item 1) — le dégagement VERT "≥2 incompatibilités" exige désormais au
    // moins une incompatibilité MORPHOLOGIQUE. Des marqueurs uniquement chromatiques, sur un
    // abdomen dont le motif n'a pas pu être lu (Q2 = NON, Q3 = NON), ne suffisent pas à
    // conclure « rien de suspect » : on redemande une photo plutôt que de dégager en VERT
    // (évite qu'un frelon asiatique atypique/flou soit blanchi sur la seule couleur).
    if (nbTotal >= 2 && nbMorpho >= 1) {
      return formatVerdict('VERT',
        '>=2 incompatibilités claires (dont morphologique) avec Vespa velutina.',
        'NONE', analyseId, timestamp);
    }
  }

  // V1.15 (post-M2, Item 2 v2) — RETAKE_SHARPER n'est plus le fourre-tout final : il ne reste
  // adapté que quand AUCUN marqueur d'aucune sorte n'est présent (nbTotal === 0), auquel cas une
  // reprise plus nette est réellement la seule piste. Dès qu'un marqueur existe (nbTotal >= 1), le
  // vrai problème est que l'espèce reste ambiguë entre cible et espèce voisine — pas la netteté.
  if (nbTotal === 0) {
    return formatVerdict('ORANGE_INSUFFISANCE',
      'Critères insuffisants pour conclure.',
      'RETAKE_SHARPER', analyseId, timestamp);
  }
  return formatVerdict('ORANGE_INSUFFISANCE',
    'Critères insuffisants pour conclure : marqueurs présents mais non concluants.',
    'RETAKE_SPECIES_AMBIGUOUS', analyseId, timestamp);
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
  let antiCrabroHit = [...ANTI_CRABRO_TYPES].filter(t => types.has(t)).length;
  // V1.14 (post-M2, Item 1) — un « tete_rousse_orangee » isolé (sans thorax_roux) n'est pas un
  // signal crabro fiable : le frelon europeen presente tete ET thorax roux ensemble, tandis que
  // la cible peut avoir une face jaune-orange seule que Gemini lit parfois « rousse ». On ne le
  // compte donc pas dans antiCrabroHit s'il est le seul marqueur de couleur tete/thorax.
  if (types.has('tete_rousse_orangee') && !types.has('thorax_roux')) {
    antiCrabroHit -= 1;
  }

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

  // V1.15 (post-M2, Item 2 v2) — Portail d'exclusion symétrique, vérifié AVANT le court-circuit
  // ROUGE ci-dessous. Jusqu'ici, seule la règle guêpe/Polistes (ci-dessus) pouvait empêcher un
  // Q1=Q2=Q3=OUI de produire ROUGE ; un nid à alvéoles ouvertes ou un profil chromatique crabro net
  // ne le pouvaient pas, alors qu'ils sont tout aussi disqualifiants (cas C7_1 du diagnostic v2 :
  // guêpe Polistes sur nid ouvert lue Q1=Q2=Q3=OUI sans aucun tag chromatique, ROUGE à 92% dans
  // 5 tirs sur 8). Protégé par le même contre-signal velutina que verrouVert() : un individu dont
  // le thorax est sombre et l'extrémité abdominale orange (signature cible plausible) n'est jamais
  // écarté sur la seule preuve chromatique — voir commentaire détaillé dans verrouVert().
  const velutinaCounterSignal =
    obs?.Q2_abdomen?.zone_terminale_orangee === true && q1 === 'OUI';

  // V1.16 (post-M2, Item 2 v2, follow-up 2026-09-04, live regression finding) — deux canaux
  // indépendants pour le même signal : support_nid_ouvert_visible (question obligatoire,
  // etape_2_individu, prompts.js V2.8) OU le tag facultatif nid_alveoles_ouvertes_visible.
  // Sur échantillonnage réel (test_images_5/regression/v2-after-v1.json), le tag facultatif seul
  // ne recevait de réponse que sur 5 appels sur 8 pour le cas C7_1 (guêpe sur nid ouvert) : les
  // 3 autres appels ne rapportaient aucune incompatibilité, laissant ROUGE se déclencher faute de
  // tout signal. Une question à réponse obligatoire est bien plus fiable qu'un ajout facultatif à
  // une liste. Les deux canaux réunis par un OU logique : aucune régression possible côté cas déjà
  // couverts par le tag seul, gain net sur les appels où seule la question obligatoire répond.
  if (obs?.etape_2_individu?.support_nid_ouvert_visible === 'OUI' || types.has(NEST_EXCLUSION_TAG)) {
    return formatVerdict('ORANGE_PROBABLE_NON_CIBLE',
      'Nid à alvéoles ouvertes visible sous l\'individu : support structurellement incompatible avec Vespa velutina.',
      'NEST_STRUCTURE_INCOMPATIBLE', analyseId, timestamp);
  }
  if (!velutinaCounterSignal && hasConfidentChromaticExclusion(types, antiCrabroHit)) {
    return formatVerdict('ORANGE_PROBABLE_NON_CIBLE',
      'Signature chromatique crabro très forte : espèce voisine probable, quelle que soit la lecture Q1/Q2/Q3.',
      'CRABRO_LIKE_PROFILE', analyseId, timestamp);
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

  // V1.13 (post-M2, Item 3) — structure visible mais trop petite/lointaine pour être évaluée :
  // tant qu'aucun marqueur de nid fort n'est présent, le verdict reste VERT (la suggestion de
  // reprise « photo plus proche » est ajoutée par juger()). Empêche qu'une lecture de force
  // « MEDIUM » incertaine sur un objet lointain bascule en orange — le verdict n'est censé
  // devenir orange que si de vrais marqueurs structurels suspects sont détectés.
  if (s.trop_distante_pour_evaluer === true && !hasStrongNestMarkers) {
    return formatVerdict('VERT',
      'Structure trop éloignée pour une évaluation fiable — aucun marqueur de nid confirmé.',
      'NONE', analyseId, timestamp);
  }

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

  // V1.13 (post-M2, Item 3) — structure visible mais trop petite/lointaine pour être évaluée :
  // on attache une suggestion de reprise (photo plus proche) SANS jamais changer le verdict.
  // Le verdict ne passe à l'orange que si de vrais marqueurs structurels suspects sont détectés,
  // exactement comme aujourd'hui.
  if (!insecte
      && obs.structure?.trop_distante_pour_evaluer === true
      && obs.structure?.evaluee === true
      && verdict.verdict_code === 'VERT') {
    verdict.suggestion =
      'Une structure éloignée a été détectée. Rapprochez-vous ou zoomez pour une analyse plus précise.';
  }

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
