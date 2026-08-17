// constants/apisave-ui.js
// Constantes UI V3.5+ — issu des specs PDF Gemini V14
// Non intégré à la navigation actuelle — disponible pour évolutions futures

export const COLORS_UI = {
  fondPrincipal: '#111111',
  accentPrincipal: '#F5C400',
  textePrimaire: '#FFFFFF',
  texteSecondaire: '#AAAAAA',
  verdictROUGE: '#C0392B',
  verdictORANGE: '#E67E22',
  verdictVERT: '#27AE60',
  fondSecondaire: '#2A2A2A',
  texteGris: '#888888',
};

export const ACTIONS_UI_MAP = {
  CONTACT_PRO: { label: 'Contacter un professionnel', icon: 'phone' },
  SIGNAL: { label: 'Signaler maintenant', icon: 'map-pin' },
  RETAKE: { label: 'Reprendre une photo', icon: 'camera' },
  NO_ACTION: { label: 'Rien à signaler', icon: 'check' },
};

export const REASON_TO_UI = {
  RETAKE_ABDOMEN: "Zoomez sur l'abdomen de l'insecte",
  RETAKE_DORSAL_VIEW: 'Prenez une vue dorsale (de dessus)',
  RETAKE_SHARPER: 'Stabilisez votre téléphone pour éviter le flou',
  RETAKE_LIGHTING_ANGLE: 'Évitez le contre-jour — lumière naturelle directe',
  RETAKE_PROFILE: "Prenez une vue de profil de l'insecte",
  RETAKE_INSECT: "Cadrez uniquement l'insecte sur le nid",
  RETAKE_THORAX: 'Centrez sur le thorax (partie médiane)',
  RETAKE_MORPHOLOGY: 'Reculez légèrement pour voir la silhouette complète',
  STRUCTURE_STRONG_GLOBAL: 'Structure suspecte — photographiez avec un insecte si possible',
  STRUCTURE_MEDIUM_GLOBAL: 'Structure ambiguë — confirmation requise',
  INSECT_TOO_BLURRY: "Insecte flou — stabilisez et rapprochez-vous à 5m minimum",
  NO_CRITERIA_VISIBLE: 'Aucun critère lisible — reprenez en pleine lumière naturelle',
  CRABRO_LIKE_PROFILE: 'Profil frelon européen — espèce utile, ne pas détruire',
  NONE: null,
};

export const VERDICT_TITLES = {
  ROUGE: 'Frelon asiatique très probable',
  ORANGE_PLAFOND: 'Nid probable — intervention requise',
  ORANGE_INSUFFISANCE: 'Données insuffisantes',
  ORANGE_PROBABLE_NON_CIBLE: 'Insecte non cible probable',
  VERT: 'Aucun élément suspect',
};
