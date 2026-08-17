// Service d'appel à l'API OpenAI vision
// V1.5 : JSON Schema natif strict + guide d'analyse séquentiel (CoT implicite)
// Le modèle retourne UNIQUEMENT un JSON d'observation neutre
// Le verdict est calculé exclusivement par le juge (engine/judge.js)

import { PROXY_URL, PROXY_SECRET } from '../config/env';
import { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } from '../core/prompts';
import { validateObservation } from '../core/schema';
import { extractAndParseJSON } from '../utils/jsonParser';

const API_URL = PROXY_URL || 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 35000;
const MAX_RETRIES = 2;

// Schéma JSON strict V1.6 pour response_format OpenAI Structured Outputs
// V1.6 : enrichissement champs structure (forme, texture, strates, suspension, position, qualite)
const OBSERVATION_JSON_SCHEMA = {
  name: 'observation_v16',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['etape_1_declencheur', 'etape_2_individu', 'Q1_thorax', 'Q2_abdomen', 'Q3_morphologie', 'incompatibilites_cible', 'structure'],
    properties: {
      etape_1_declencheur: {
        type: 'object',
        additionalProperties: false,
        required: ['insecte_exploitable', 'structure_visible', 'justification'],
        properties: {
          insecte_exploitable: { type: 'boolean' },
          structure_visible: { type: 'boolean' },
          justification: { type: 'string' },
        },
      },
      etape_2_individu: {
        type: 'object',
        additionalProperties: false,
        required: ['individu_analyse_identifiable', 'vue_dorsale', 'sur_le_dos'],
        properties: {
          individu_analyse_identifiable: { type: 'boolean' },
          vue_dorsale: { type: 'boolean' },
          sur_le_dos: { type: 'boolean' },
        },
      },
      Q1_thorax: {
        type: 'object',
        additionalProperties: false,
        required: ['reponse', 'confidence', 'description_visible', 'lisibilite'],
        properties: {
          reponse: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          confidence: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          description_visible: { type: 'string' },
          lisibilite: { type: 'string', enum: ['haute', 'moyenne', 'non_lisible'] },
        },
      },
      Q2_abdomen: {
        type: 'object',
        additionalProperties: false,
        required: ['reponse', 'confidence', 'fond_dominant', 'zone_terminale_orangee', 'description_visible', 'lisibilite'],
        properties: {
          reponse: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          confidence: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          fond_dominant: { type: 'string', enum: ['sombre', 'jaune_clair', 'jaune_vif', 'orange', 'mixte', 'jaune_noir_alterne', 'non_lisible'] },
          zone_terminale_orangee: { type: 'boolean' },
          description_visible: { type: 'string' },
          lisibilite: { type: 'string', enum: ['haute', 'moyenne', 'non_lisible'] },
        },
      },
      Q3_morphologie: {
        type: 'object',
        additionalProperties: false,
        required: ['reponse', 'confidence', 'elements_visibles', 'incompatibilites_visibles', 'description_visible', 'lisibilite'],
        properties: {
          reponse: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          confidence: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          elements_visibles: {
            type: 'array',
            items: { type: 'string', enum: ['thorax_massif', 'jonction_thorax_abdomen_large', 'abdomen_epais_non_elance', 'proportions_compactes_robustes'] },
          },
          incompatibilites_visibles: {
            type: 'array',
            items: { type: 'string', enum: ['abdomen_filiforme', 'silhouette_tres_fine', 'jonction_thorax_abdomen_etroite', 'proportions_greles_non_robustes', 'morphologie_velue_compacte', 'silhouette_fine_allongee'] },
          },
          description_visible: { type: 'string' },
          lisibilite: { type: 'string', enum: ['haute', 'moyenne', 'non_lisible'] },
        },
      },
      incompatibilites_cible: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['type', 'categorie'],
          properties: {
            type: { type: 'string', enum: ['thorax_roux', 'abdomen_jaune_dominant', 'rayures_jaune_noir_vif', 'abdomen_segmente_jaune_noir_alterne', 'tete_rousse_orangee', 'morphologie_filiforme', 'silhouette_tres_fine', 'morphologie_velue_compacte', 'jonction_etroite', 'proportions_greles_non_robustes', 'silhouette_fine_allongee'] },
            categorie: { type: 'string', enum: ['chromatique', 'morphologique'] },
          },
        },
      },
      structure: {
        type: 'object',
        additionalProperties: false,
        required: ['evaluee', 'forme_globale', 'texture_papier_carton', 'strates_repetitives', 'suspension_visible', 'position', 'qualite_structure', 'marqueurs_forts', 'marqueurs_faibles', 'indices_artificiels', 'pieges_vegetaux_possibles'],
        properties: {
          evaluee: { type: 'boolean' },
          forme_globale: { type: 'string', enum: ['ovoide', 'spherique', 'irreguliere', 'aplatie', 'non_lisible'] },
          texture_papier_carton: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          strates_repetitives: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          suspension_visible: { type: 'string', enum: ['OUI', 'NON', 'NON_LISIBLE'] },
          position: { type: 'string', enum: ['arbre', 'toiture', 'haie', 'sol', 'cavite', 'support_artificiel', 'non_lisible'] },
          qualite_structure: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          marqueurs_forts: {
            type: 'array',
            items: { type: 'string', enum: ['stratification_lamellaire', 'enveloppe_cartonnee_continue', 'entree_identifiable'] },
          },
          marqueurs_faibles: {
            type: 'array',
            items: { type: 'string', enum: ['jonction_nette_structure_support', 'repetition_couches_construites'] },
          },
          indices_artificiels: {
            type: 'array',
            items: { type: 'string', enum: ['geometrie_industrielle', 'symetrie_artificielle', 'armature_metallique_plastique', 'materiau_translucide_synthetique', 'texture_uniforme_manufacturee', 'elements_mecaniques_visibles'] },
          },
          pieges_vegetaux_possibles: {
            type: 'array',
            items: { type: 'string', enum: ['galle_vegetale', 'fruit_sec_ou_deforme', 'excroissance_vegetale', 'cocon_vegetal', 'amas_naturel_vegetal', 'gui', 'boule_vegetale'] },
          },
        },
      },
    },
  },
};

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('Délai dépassé — vérifiez votre connexion réseau');
    }
    throw e;
  }
}

async function callVisionAPI(base64Image, retryCount = 0) {
  if (!PROXY_URL) {
    throw new Error('Proxy non configuré');
  }

  let response;
  try {
    response = await fetchWithTimeout(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Secret': PROXY_SECRET,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: OBSERVATION_JSON_SCHEMA,
        },
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: VISION_USER_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      }),
    }, TIMEOUT_MS);
  } catch (e) {
    if (retryCount < MAX_RETRIES && !e.message.includes('Clé API')) {
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return callVisionAPI(base64Image, retryCount + 1);
    }
    throw e;
  }

  if (response.status === 429) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callVisionAPI(base64Image, retryCount + 1);
    }
    throw new Error('Trop de requêtes — réessayez dans quelques secondes');
  }

  if (response.status === 401) {
    throw new Error('Accès proxy refusé');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Erreur serveur ${response.status}`;
    throw new Error(`OpenAI: ${errMsg}`);
  }

  const data = await response.json();

  // Vérifier refus model (content_filter ou autre)
  const finishReason = data?.choices?.[0]?.finish_reason;
  if (finishReason === 'content_filter') {
    throw new Error("Image refusée par le filtre de contenu");
  }

  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error("Réponse IA vide — aucun contenu reçu");
  }

  return rawText;
}

function parseObservationResponse(rawText) {
  // Avec response_format json_schema, le texte EST le JSON — parse direct
  try {
    return JSON.parse(rawText);
  } catch {
    // Fallback : extraction regex si le modèle a ajouté du texte parasite
    if (__DEV__) {
      console.warn('[VisionAPI] JSON.parse direct échoué, fallback extractAndParseJSON');
    }
    return extractAndParseJSON(rawText);
  }
}

// Point d'entrée principal
// Retourne l'observation validée (JSON V1.5) prête pour le juge
export async function getVisionObservation(base64Image) {
  const rawText = await callVisionAPI(base64Image);

  if (__DEV__) {
    console.log('[VisionAPI V1.5] Réponse brute:', rawText.slice(0, 200));
  }

  const observation = parseObservationResponse(rawText);
  validateObservation(observation);

  if (__DEV__) {
    const q1conf = observation.Q1_thorax?.confidence;
    const q2conf = observation.Q2_abdomen?.confidence;
    const q3conf = observation.Q3_morphologie?.confidence;
    console.log(`[VisionAPI V1.5] Q1=${observation.Q1_thorax?.reponse}(${q1conf}) Q2=${observation.Q2_abdomen?.reponse}(${q2conf}) Q3=${observation.Q3_morphologie?.reponse}(${q3conf})`);
  }

  return observation;
}
