// Parsing sécurisé du JSON retourné par le modèle vision
// Gère : markdown code fences, texte parasite, JSON malformé

export function extractAndParseJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Réponse IA vide ou invalide');
  }

  // Supprimer les fences markdown (```json ... ```)
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  // Extraire le premier bloc JSON valide
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('JSON introuvable dans la réponse IA');
  }

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    // Tentative de nettoyage des erreurs courantes
    const repaired = match[0]
      .replace(/,\s*([}\]])/g, '$1')      // trailing commas
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":'); // unquoted keys

    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error(`JSON malformé impossible à corriger : ${e.message}`);
    }
  }
}
