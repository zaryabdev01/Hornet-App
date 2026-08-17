// APISAVE BEEALERT CORE V13.5+ MES-1
// V3.5+ : nouveaux reason codes, CONFIANCE recalibré terrain

export const VERDICT_CODES = {
  ROUGE: 'ROUGE',
  ORANGE_PLAFOND: 'ORANGE_PLAFOND',
  ORANGE_PROBABLE_NON_CIBLE: 'ORANGE_PROBABLE_NON_CIBLE',
  ORANGE_INSUFFISANCE: 'ORANGE_INSUFFISANCE',
  VERT: 'VERT',
};

export const REASON_CODES = {
  NONE: 'NONE',
  RETAKE_THORAX: 'RETAKE_THORAX',
  RETAKE_ABDOMEN: 'RETAKE_ABDOMEN',
  RETAKE_MORPHOLOGY: 'RETAKE_MORPHOLOGY',
  RETAKE_DORSAL_VIEW: 'RETAKE_DORSAL_VIEW',
  RETAKE_PROFILE: 'RETAKE_PROFILE',
  RETAKE_SHARPER: 'RETAKE_SHARPER',
  RETAKE_INSECT: 'RETAKE_INSECT',
  RETAKE_LIGHTING_ANGLE: 'RETAKE_LIGHTING_ANGLE',
  // V3.5+ additions
  STRUCTURE_STRONG_GLOBAL: 'STRUCTURE_STRONG_GLOBAL',
  STRUCTURE_MEDIUM_GLOBAL: 'STRUCTURE_MEDIUM_GLOBAL',
  INSECT_TOO_BLURRY: 'INSECT_TOO_BLURRY',
  NO_CRITERIA_VISIBLE: 'NO_CRITERIA_VISIBLE',
  OBJECT_NON_BIOLOGICAL_STRUCTURE: 'OBJECT_NON_BIOLOGICAL_STRUCTURE',
  INSECT_HAIRY_BODY_INCOMPATIBLE: 'INSECT_HAIRY_BODY_INCOMPATIBLE',
  INSECT_BEETLE_FEATURES_VISIBLE: 'INSECT_BEETLE_FEATURES_VISIBLE',
  CRABRO_LIKE_PROFILE: 'CRABRO_LIKE_PROFILE',
  NON_TARGET_HYMENOPTERA: 'NON_TARGET_HYMENOPTERA', // M2 — guêpe/Polistes, partage la route ORANGE_PROBABLE_NON_CIBLE
};

// V3.5+ : recalibration terrain (ORANGE_INSUFFISANCE 42→55, ORANGE_PLAFOND 78→72, ROUGE 90→92)
export const CONFIANCE = {
  ROUGE: 92,
  ORANGE_PLAFOND: 72,
  ORANGE_PROBABLE_NON_CIBLE: 65,
  ORANGE_INSUFFISANCE: 55,
  VERT: 85,
};

export const ACTIONS = {
  ROUGE: "Suspicion forte de frelon asiatique (Vespa velutina). Ne pas approcher. Signaler immédiatement. Une vérification professionnelle confirmera l'espèce.",
  ORANGE_PLAFOND: "Structure compatible avec un nid social construit. Une seconde photo peut améliorer l'analyse.",
  ORANGE_PROBABLE_NON_CIBLE: "Cet individu correspond probablement à une espèce non ciblée. Espèce utile à l'écosystème : ne pas détruire.",
  ORANGE_INSUFFISANCE: "Analyse incomplète ou données morphologiques insuffisantes. Une seconde photo peut améliorer la précision.",
  VERT: "Aucun élément compatible suffisant détecté sur cette image.",
};

export const REASON_LABELS = {
  NONE: 'Verdict direct',
  RETAKE_THORAX: "Thorax non évaluable — photographier le thorax (dos de l'insecte)",
  RETAKE_ABDOMEN: 'Abdomen non évaluable — photographier l\'abdomen en vue dorsale',
  RETAKE_MORPHOLOGY: 'Insecte trop petit — se rapprocher et recentrer',
  RETAKE_DORSAL_VIEW: "Vue ventrale — attendre que l'insecte se retourne ou repositionner",
  RETAKE_PROFILE: 'Profil insuffisant — photographier de profil ou en vue dorsale',
  RETAKE_SHARPER: 'Image floue — stabiliser et refaire au même endroit',
  RETAKE_INSECT: 'Nid détecté sans insecte — attendre un insecte posé sur le nid',
  RETAKE_LIGHTING_ANGLE: 'Conflit chromatique — photographier sous lumière naturelle directe',
  STRUCTURE_STRONG_GLOBAL: 'Structure fortement compatible avec un nid construit',
  STRUCTURE_MEDIUM_GLOBAL: 'Structure partiellement compatible — confirmation requise',
  INSECT_TOO_BLURRY: 'Insecte trop flou pour une évaluation fiable — stabiliser et recentrer',
  NO_CRITERIA_VISIBLE: 'Aucun critère lisible — reprendre en conditions optimales',
  OBJECT_NON_BIOLOGICAL_STRUCTURE: 'Objet artificiel identifié — non biologique',
  INSECT_HAIRY_BODY_INCOMPATIBLE: 'Corps velu incompatible avec un frelon',
  INSECT_BEETLE_FEATURES_VISIBLE: 'Caractéristiques de coléoptère visibles',
  CRABRO_LIKE_PROFILE: 'Profil chromatique type frelon européen (Vespa crabro)',
  NON_TARGET_HYMENOPTERA: 'Hyménoptère non cible identifié (guêpe / Polistes)',
};

export const NEEDS_SECOND_PHOTO = new Set([
  'ORANGE_PLAFOND',
  'ORANGE_INSUFFISANCE',
]);
