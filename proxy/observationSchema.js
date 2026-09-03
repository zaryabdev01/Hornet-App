// Gemini-native responseSchema for the observation JSON — built directly from the current,
// authoritative validation rules in ../src/core/schema.js (not the stale OpenAI-era schema that
// used to live in src/services/visionApi.js, which predates the M2 field reconciliation).
//
// Deliberately stricter than schema.js in one respect: schema.js treats `confidence` and the
// structure sub-fields as optional, for backward compatibility with older stored history
// objects. Here we're constraining what Gemini is asked to GENERATE going forward, and
// prompts.js already instructs the model to always fill every field regardless of mode — so
// everything the prompt already always asks for is marked `required`, tightening the contract
// rather than mechanically mirroring schema.js's leniency (which exists for a different,
// backward-compat reason unrelated to live generation).
//
// Verified against the live API: Gemini's REST endpoint accepts both "OBJECT"/"STRING" and
// "object"/"string" casing for Schema.type — uppercase used here as the documented canonical form.

const VALID_INCOMPAT_TYPES = [
  'thorax_roux', 'abdomen_jaune_dominant', 'rayures_jaune_noir_vif',
  'abdomen_segmente_jaune_noir_alterne', 'tete_rousse_orangee',
  'morphologie_filiforme', 'silhouette_tres_fine',
  'morphologie_velue_compacte', 'jonction_etroite',
  'proportions_greles_non_robustes', 'silhouette_fine_allongee',
  'insecte_taille_minuscule_non_frelon', 'carapace_dure_elytres_visibles',
];

const REPONSE_ENUM = ['OUI', 'NON', 'NON_LISIBLE'];
const CONFIDENCE_ENUM = ['LOW', 'MEDIUM', 'HIGH'];
const LISIBILITE_ENUM = ['haute', 'moyenne', 'non_lisible'];
const TRI_ENUM = ['OUI', 'NON', 'NON_LISIBLE'];

const OBSERVATION_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    etape_1_declencheur: {
      type: 'OBJECT',
      properties: {
        insecte_exploitable: { type: 'BOOLEAN' },
        structure_visible: { type: 'BOOLEAN' },
        justification: { type: 'STRING' },
      },
      required: ['insecte_exploitable', 'structure_visible', 'justification'],
    },
    etape_2_individu: {
      type: 'OBJECT',
      properties: {
        individu_analyse_identifiable: { type: 'BOOLEAN' },
        vue_dorsale: { type: 'BOOLEAN' },
        sur_le_dos: { type: 'BOOLEAN' },
      },
      required: ['individu_analyse_identifiable', 'vue_dorsale', 'sur_le_dos'],
    },
    Q1_thorax: {
      type: 'OBJECT',
      properties: {
        reponse: { type: 'STRING', enum: REPONSE_ENUM },
        confidence: { type: 'STRING', enum: CONFIDENCE_ENUM },
        description_visible: { type: 'STRING' },
        lisibilite: { type: 'STRING', enum: LISIBILITE_ENUM },
      },
      required: ['reponse', 'confidence', 'description_visible', 'lisibilite'],
    },
    Q2_abdomen: {
      type: 'OBJECT',
      properties: {
        reponse: { type: 'STRING', enum: REPONSE_ENUM },
        confidence: { type: 'STRING', enum: CONFIDENCE_ENUM },
        fond_dominant: { type: 'STRING', enum: ['sombre', 'jaune_clair', 'jaune_vif', 'orange', 'mixte_jaune_noir_alterne', 'non_lisible'] },
        zone_terminale_orangee: { type: 'BOOLEAN' },
        description_visible: { type: 'STRING' },
        lisibilite: { type: 'STRING', enum: LISIBILITE_ENUM },
      },
      required: ['reponse', 'confidence', 'fond_dominant', 'zone_terminale_orangee', 'description_visible', 'lisibilite'],
    },
    Q3_morphologie: {
      type: 'OBJECT',
      properties: {
        reponse: { type: 'STRING', enum: REPONSE_ENUM },
        confidence: { type: 'STRING', enum: CONFIDENCE_ENUM },
        elements_visibles: {
          type: 'ARRAY',
          items: { type: 'STRING', enum: ['thorax_massif', 'jonction_thorax_abdomen_large', 'abdomen_epais_non_elance', 'proportions_compactes_robustes'] },
        },
        description_visible: { type: 'STRING' },
        lisibilite: { type: 'STRING', enum: LISIBILITE_ENUM },
      },
      required: ['reponse', 'confidence', 'elements_visibles', 'description_visible', 'lisibilite'],
    },
    incompatibilites_cible: {
      type: 'ARRAY',
      items: { type: 'STRING', enum: VALID_INCOMPAT_TYPES },
    },
    structure: {
      type: 'OBJECT',
      properties: {
        evaluee: { type: 'BOOLEAN' },
        forme_globale: { type: 'STRING', enum: ['ovoide', 'spherique', 'irreguliere', 'aplatie', 'non_lisible'] },
        texture_papier_carton: { type: 'STRING', enum: TRI_ENUM },
        strates_repetitives: { type: 'STRING', enum: TRI_ENUM },
        suspension_visible: { type: 'STRING', enum: TRI_ENUM },
        position: { type: 'STRING', enum: ['arbre', 'toiture', 'haie', 'sol', 'cavite', 'support_artificiel', 'non_lisible'] },
        qualite_structure: { type: 'STRING', enum: ['LOW', 'MEDIUM', 'HIGH'] },
        structure_strength: { type: 'STRING', enum: ['STRONG', 'MEDIUM', 'WEAK'] },
        // post-M2 Item 3 (schema V1.11) — structure visible mais trop petite/lointaine pour
        // être évaluée. N'influence jamais le verdict ; déclenche une suggestion de reprise.
        trop_distante_pour_evaluer: { type: 'BOOLEAN' },
        marqueurs_forts: { type: 'ARRAY', items: { type: 'STRING', enum: ['stratification_lamellaire', 'enveloppe_cartonnee_continue', 'entree_identifiable'] } },
        marqueurs_faibles: { type: 'ARRAY', items: { type: 'STRING', enum: ['jonction_nette_structure_support', 'repetition_couches_construites'] } },
        indices_artificiels: { type: 'ARRAY', items: { type: 'STRING', enum: ['geometrie_industrielle', 'symetrie_artificielle', 'armature_metallique_plastique', 'materiau_translucide_synthetique', 'texture_uniforme_manufacturee', 'elements_mecaniques_visibles'] } },
        pieges_vegetaux_possibles: { type: 'ARRAY', items: { type: 'STRING', enum: ['galle_vegetale', 'fruit_sec_ou_deforme', 'excroissance_vegetale', 'cocon_vegetal', 'amas_naturel_vegetal', 'gui', 'boule_vegetale'] } },
      },
      required: [
        'evaluee', 'forme_globale', 'texture_papier_carton', 'strates_repetitives',
        'suspension_visible', 'position', 'qualite_structure', 'structure_strength',
        'trop_distante_pour_evaluer',
        'marqueurs_forts', 'marqueurs_faibles', 'indices_artificiels', 'pieges_vegetaux_possibles',
      ],
    },
  },
  required: ['etape_1_declencheur', 'etape_2_individu', 'Q1_thorax', 'Q2_abdomen', 'Q3_morphologie', 'incompatibilites_cible', 'structure'],
};

const REQUIRED_TOP_LEVEL_KEYS = [
  'etape_1_declencheur', 'etape_2_individu',
  'Q1_thorax', 'Q2_abdomen', 'Q3_morphologie',
  'incompatibilites_cible', 'structure',
];

// Lightweight proxy-side sanity gate — NOT a full reimplementation of src/core/schema.js's
// deep enum validation. The mobile app already runs the complete validateObservation() on
// whatever the proxy returns, regardless of path; this only needs to decide whether the
// native-schema-constrained attempt is trustworthy enough to skip the fallback call, so it
// stays a light, cheap check rather than a second copy of the full rule set (avoiding drift
// between two maintained copies of the same validation logic).
function isWellFormedObservation(text) {
  let obs;
  try {
    obs = JSON.parse(text);
  } catch {
    return false;
  }
  if (typeof obs !== 'object' || obs === null) return false;
  return REQUIRED_TOP_LEVEL_KEYS.every(k => k in obs);
}

module.exports = { OBSERVATION_RESPONSE_SCHEMA, isWellFormedObservation };
