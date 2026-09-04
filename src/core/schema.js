// Validation du schéma JSON observation V1.12
// V1.12 (post-M2, Item 2 v2, client observation 2026-09-04, non-cibles diagnosis) : ajout du type
//   nid_alveoles_ouvertes_visible dans incompatibilites_cible — nid a alveoles hexagonales a
//   decouvert, sans enveloppe/coque fermee (rayon de guepier ouvert type Polistes), structurellement
//   incompatible avec Vespa velutina (nid toujours enferme dans une enveloppe cartonnee continue).
//   Seul signal disponible pour un individu dont Q1/Q2/Q3 se lisent par ailleurs comme la cible mais
//   qui est pose sur un support qui l'exclut d'emblee (cf. docs/ApiSave_Postvalidation_v2_Diagnosis.md §4).
// V1.11 (post-M2, Item 3, client observation 2026-09-02) : ajout du champ optionnel
//   structure.trop_distante_pour_evaluer (booléen) — structure visible mais trop petite ou
//   trop lointaine pour être évaluée de façon fiable. N'influence jamais le verdict ; sert
//   uniquement à déclencher une suggestion de reprise sur un verdict VERT inchangé.
// V1.5 : ajout du champ confidence par critère (Q1/Q2/Q3)
// V1.6 : enrichissement champs structure (forme, texture, strates, suspension, position, qualite)
// V1.7 : ajout structure_strength (V3.5+) + insecte_taille_minuscule_non_frelon
// V1.8 (M2, audit finding D7) : fond_dominant reconcilié sur mixte_jaune_noir_alterne (valeur
//   unique, conforme à la spécification canonique — remplace le couple mixte/jaune_noir_alterne)
// V1.9 (M2, validation finding) : suppression de Q3_morphologie.incompatibilites_visibles — champ
//   non consommé par le Judge, dont la coexistence avec incompatibilites_cible provoquait un
//   placement incohérent des tags par le modèle (confirmé sur le jeu de référence M2)
// V1.10 (M2, Round 3 validation finding) : Q3_morphologie.elements_visibles est CONSERVÉ (client
//   decision 2026-08-09) — cette validation était déjà correcte (elle rejette tout tag hors des 4
//   éléments positifs ci-dessous), c'est le prompt qui a été clarifié pour empêcher le modèle d'y
//   placer des tags d'exclusion. Ne jamais élargir VALID_Q3_ELEMENTS pour "absorber" un tag négatif
//   qui y apparaîtrait par erreur — la correction va dans le prompt, pas dans l'assouplissement du schéma.

const VALID_REPONSES = new Set(['OUI', 'NON', 'NON_LISIBLE']);
const VALID_CONFIDENCE = new Set(['LOW', 'MEDIUM', 'HIGH']);
const VALID_LISIBILITE = new Set(['haute', 'moyenne', 'non_lisible']);
const VALID_FOND_DOMINANT = new Set([
  'sombre', 'jaune_clair', 'jaune_vif', 'orange',
  'mixte_jaune_noir_alterne', 'non_lisible',
]);
// Uniquement les 4 traits positifs justifiant Q3 = OUI — jamais de tag négatif/exclusion ici,
// ceux-ci vont exclusivement dans incompatibilites_cible (cf. prompts.js, REGLE DE SEPARATION DES CHAMPS Q3).
const VALID_Q3_ELEMENTS = new Set([
  'thorax_massif', 'jonction_thorax_abdomen_large',
  'abdomen_epais_non_elance', 'proportions_compactes_robustes',
]);
const VALID_INCOMPAT_TYPES = new Set([
  'thorax_roux', 'abdomen_jaune_dominant', 'rayures_jaune_noir_vif',
  'abdomen_segmente_jaune_noir_alterne', 'tete_rousse_orangee',
  'morphologie_filiforme', 'silhouette_tres_fine',
  'morphologie_velue_compacte', 'jonction_etroite',
  'proportions_greles_non_robustes', 'silhouette_fine_allongee',
  'insecte_taille_minuscule_non_frelon', // V1.7
  'carapace_dure_elytres_visibles', // V1.8 (M2, audit finding D2) — remplace le tag erroné 'morphologie_filiforme' pour ce cas
  'nid_alveoles_ouvertes_visible', // V1.12 (post-M2, Item 2 v2) — nid a alveoles a decouvert, sans enveloppe (support de l'individu)
]);
const VALID_INCOMPAT_CATEGORIES = new Set(['chromatique', 'morphologique']);
const VALID_MARQUEURS_FORTS = new Set([
  'stratification_lamellaire', 'enveloppe_cartonnee_continue', 'entree_identifiable',
]);
const VALID_MARQUEURS_FAIBLES = new Set([
  'jonction_nette_structure_support', 'repetition_couches_construites',
]);
const VALID_INDICES_ARTIFICIELS = new Set([
  'geometrie_industrielle', 'symetrie_artificielle', 'armature_metallique_plastique',
  'materiau_translucide_synthetique', 'texture_uniforme_manufacturee',
  'elements_mecaniques_visibles',
]);
const VALID_PIEGES_VEGETAUX = new Set([
  'galle_vegetale', 'fruit_sec_ou_deforme', 'excroissance_vegetale',
  'cocon_vegetal', 'amas_naturel_vegetal', 'gui', 'boule_vegetale',
]);

// V1.6 — champs structure étendus
const VALID_TRI = new Set(['OUI', 'NON', 'NON_LISIBLE']);
const VALID_FORME_GLOBALE = new Set(['ovoide', 'spherique', 'irreguliere', 'aplatie', 'non_lisible']);
const VALID_POSITION = new Set(['arbre', 'toiture', 'haie', 'sol', 'cavite', 'support_artificiel', 'non_lisible']);
const VALID_QUALITE = new Set(['LOW', 'MEDIUM', 'HIGH']);
const VALID_STRUCTURE_STRENGTH = new Set(['STRONG', 'MEDIUM', 'WEAK']); // V1.7

function assertType(value, type, path) {
  if (typeof value !== type) {
    throw new Error(`Validation: ${path} doit être ${type}, reçu ${typeof value}`);
  }
}

function assertEnum(value, validSet, path) {
  if (!validSet.has(value)) {
    throw new Error(`Validation: ${path} valeur invalide: "${value}"`);
  }
}

function assertArrayOfEnum(arr, validSet, path) {
  if (!Array.isArray(arr)) {
    throw new Error(`Validation: ${path} doit être un tableau`);
  }
  arr.forEach((v, i) => {
    if (!validSet.has(v)) {
      throw new Error(`Validation: ${path}[${i}] valeur invalide: "${v}"`);
    }
  });
}

export function validateObservation(obs) {
  if (typeof obs !== 'object' || obs === null) {
    throw new Error('Validation: observation doit être un objet');
  }

  const required = [
    'etape_1_declencheur', 'etape_2_individu',
    'Q1_thorax', 'Q2_abdomen', 'Q3_morphologie',
    'incompatibilites_cible', 'structure',
  ];
  required.forEach(k => {
    if (!(k in obs)) throw new Error(`Validation: champ requis manquant: ${k}`);
  });

  // etape_1_declencheur
  const e1 = obs.etape_1_declencheur;
  assertType(e1.insecte_exploitable, 'boolean', 'etape_1_declencheur.insecte_exploitable');
  assertType(e1.structure_visible, 'boolean', 'etape_1_declencheur.structure_visible');
  assertType(e1.justification, 'string', 'etape_1_declencheur.justification');

  // etape_2_individu
  const e2 = obs.etape_2_individu;
  assertType(e2.individu_analyse_identifiable, 'boolean', 'etape_2_individu.individu_analyse_identifiable');
  assertType(e2.vue_dorsale, 'boolean', 'etape_2_individu.vue_dorsale');
  assertType(e2.sur_le_dos, 'boolean', 'etape_2_individu.sur_le_dos');

  // Q1
  const q1 = obs.Q1_thorax;
  assertEnum(q1.reponse, VALID_REPONSES, 'Q1_thorax.reponse');
  if (q1.confidence !== undefined) {
    assertEnum(q1.confidence, VALID_CONFIDENCE, 'Q1_thorax.confidence');
  }
  assertType(q1.description_visible, 'string', 'Q1_thorax.description_visible');
  assertEnum(q1.lisibilite, VALID_LISIBILITE, 'Q1_thorax.lisibilite');

  // Q2
  const q2 = obs.Q2_abdomen;
  assertEnum(q2.reponse, VALID_REPONSES, 'Q2_abdomen.reponse');
  if (q2.confidence !== undefined) {
    assertEnum(q2.confidence, VALID_CONFIDENCE, 'Q2_abdomen.confidence');
  }
  assertEnum(q2.fond_dominant, VALID_FOND_DOMINANT, 'Q2_abdomen.fond_dominant');
  assertType(q2.zone_terminale_orangee, 'boolean', 'Q2_abdomen.zone_terminale_orangee');
  assertType(q2.description_visible, 'string', 'Q2_abdomen.description_visible');
  assertEnum(q2.lisibilite, VALID_LISIBILITE, 'Q2_abdomen.lisibilite');

  // Q3
  const q3 = obs.Q3_morphologie;
  assertEnum(q3.reponse, VALID_REPONSES, 'Q3_morphologie.reponse');
  if (q3.confidence !== undefined) {
    assertEnum(q3.confidence, VALID_CONFIDENCE, 'Q3_morphologie.confidence');
  }
  assertArrayOfEnum(q3.elements_visibles, VALID_Q3_ELEMENTS, 'Q3_morphologie.elements_visibles');
  assertType(q3.description_visible, 'string', 'Q3_morphologie.description_visible');
  assertEnum(q3.lisibilite, VALID_LISIBILITE, 'Q3_morphologie.lisibilite');

  // incompatibilites_cible — V1.7 : tolérance type string en plus de l'objet (auto-normalisation juge)
  if (!Array.isArray(obs.incompatibilites_cible)) {
    throw new Error('Validation: incompatibilites_cible doit être un tableau');
  }
  obs.incompatibilites_cible.forEach((inc, i) => {
    if (typeof inc === 'string') return; // Toléré — le juge normalise
    if (!VALID_INCOMPAT_TYPES.has(inc.type)) {
      throw new Error(`Validation: incompatibilites_cible[${i}].type invalide: "${inc.type}"`);
    }
    if (!VALID_INCOMPAT_CATEGORIES.has(inc.categorie)) {
      throw new Error(`Validation: incompatibilites_cible[${i}].categorie invalide: "${inc.categorie}"`);
    }
  });

  // structure
  const s = obs.structure;
  assertType(s.evaluee, 'boolean', 'structure.evaluee');

  // V1.6 — champs étendus (optionnels pour rétrocompatibilité)
  if (s.forme_globale !== undefined) {
    assertEnum(s.forme_globale, VALID_FORME_GLOBALE, 'structure.forme_globale');
  }
  if (s.texture_papier_carton !== undefined) {
    assertEnum(s.texture_papier_carton, VALID_TRI, 'structure.texture_papier_carton');
  }
  if (s.strates_repetitives !== undefined) {
    assertEnum(s.strates_repetitives, VALID_TRI, 'structure.strates_repetitives');
  }
  if (s.suspension_visible !== undefined) {
    assertEnum(s.suspension_visible, VALID_TRI, 'structure.suspension_visible');
  }
  if (s.position !== undefined) {
    assertEnum(s.position, VALID_POSITION, 'structure.position');
  }
  if (s.qualite_structure !== undefined) {
    assertEnum(s.qualite_structure, VALID_QUALITE, 'structure.qualite_structure');
  }
  // V1.7 — structure_strength
  if (s.structure_strength !== undefined) {
    assertEnum(s.structure_strength, VALID_STRUCTURE_STRENGTH, 'structure.structure_strength');
  }
  // V1.11 (post-M2, Item 3) — structure visible mais trop petite/lointaine pour être évaluée.
  // N'influence jamais le verdict : sert uniquement à déclencher une suggestion de reprise
  // (photo plus proche) attachée à un verdict VERT inchangé. Optionnel (rétrocompatibilité).
  if (s.trop_distante_pour_evaluer !== undefined) {
    assertType(s.trop_distante_pour_evaluer, 'boolean', 'structure.trop_distante_pour_evaluer');
  }

  assertArrayOfEnum(s.marqueurs_forts, VALID_MARQUEURS_FORTS, 'structure.marqueurs_forts');
  assertArrayOfEnum(s.marqueurs_faibles, VALID_MARQUEURS_FAIBLES, 'structure.marqueurs_faibles');
  assertArrayOfEnum(s.indices_artificiels, VALID_INDICES_ARTIFICIELS, 'structure.indices_artificiels');
  assertArrayOfEnum(s.pieges_vegetaux_possibles, VALID_PIEGES_VEGETAUX, 'structure.pieges_vegetaux_possibles');

  return true;
}
