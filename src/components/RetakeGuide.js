import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';

const GUIDES = {
  RETAKE_INSECT: {
    title: 'Nid suspect — seconde photo recommandée',
    icon: '🪹',
    color: COLORS.orange,
    steps: [
      'Reculez à une distance sécurisée (minimum 5 mètres)',
      'Option 1 — insecte : attendez qu\'un individu se pose et photographiez thorax + abdomen',
      'Option 2 — texture : photographiez de près la surface extérieure du nid',
      'Option 3 — contexte : photo large montrant le nid et son support (branche, toiture…)',
      'Zoom optique recommandé — ne jamais approcher pour photographier',
    ],
    warning: '⚠️ Ne jamais toucher, secouer ni perturber le nid. Restez à distance sécurisée.',
  },
  RETAKE_THORAX: {
    title: 'Thorax non lisible — repositionner',
    icon: '🔍',
    color: COLORS.orange,
    steps: [
      'Photographiez l\'insecte vu de dessus (vue dorsale)',
      'Le thorax est la partie centrale entre tête et abdomen',
      'Assurez-vous que le thorax est entièrement dans le cadre',
      'Évitez les reflets et surexpositions',
      'Lumière naturelle directe recommandée',
    ],
    warning: '⚠️ Ne jamais s\'approcher d\'un nid pour prendre la photo.',
  },
  RETAKE_ABDOMEN: {
    title: 'Abdomen non lisible — repositionner',
    icon: '🔍',
    color: COLORS.orange,
    steps: [
      'Photographiez l\'abdomen (partie arrière de l\'insecte) clairement',
      'Vue dorsale : les couleurs du dos de l\'abdomen sont discriminantes',
      'L\'abdomen doit être entier dans le cadre, pas tronqué',
      'Évitez les vues de face ou du dessous',
      'Attendez que l\'insecte soit posé et immobile',
    ],
    warning: '⚠️ Stabilisez votre appareil pour éviter le flou.',
  },
  RETAKE_MORPHOLOGY: {
    title: 'Insecte trop petit — se rapprocher',
    icon: '📐',
    color: COLORS.orange,
    steps: [
      'L\'insecte doit occuper au moins 1/4 de la hauteur de l\'image',
      'Utilisez le zoom pour cadrer l\'insecte de plus près',
      'Si possible, attendez que l\'insecte se pose sur une surface proche',
      'Cadrez uniquement l\'insecte, pas l\'environnement',
      'Photo nette et stable obligatoire',
    ],
    warning: '⚠️ Zoom numérique acceptable mais préférez le zoom optique.',
  },
  RETAKE_DORSAL_VIEW: {
    title: 'Vue ventrale — attendre le repositionnement',
    icon: '🔄',
    color: COLORS.orange,
    steps: [
      'L\'insecte est actuellement vu de dessous (ventre visible)',
      'Attendez qu\'il se retourne ou se déplace sur une surface',
      'Photographiez quand le dos de l\'insecte est visible',
      'Vue de dessus ou de profil = vue dorsale exploitable',
      'Patience — l\'insecte va se repositionner',
    ],
    warning: '⚠️ Les couleurs ventrales ne sont pas discriminantes pour l\'identification.',
  },
  RETAKE_PROFILE: {
    title: 'Vue de profil recommandée',
    icon: '📷',
    color: COLORS.orange,
    steps: [
      'Repositionnez-vous latéralement par rapport à l\'insecte',
      'Vue de profil ou de dessus permettent de voir thorax et abdomen',
      'Cadrez l\'insecte entier — tête, thorax, abdomen visibles',
      'Stabilisez l\'appareil avant de déclencher',
      'Lumière naturelle directe pour les couleurs exactes',
    ],
    warning: '⚠️ Restez à distance sécurisée. Ne pas effrayer l\'insecte.',
  },
  RETAKE_SHARPER: {
    title: 'Image floue — refaire la photo',
    icon: '🎯',
    color: COLORS.orange,
    steps: [
      'Stabilisez votre appareil — posez les coudes ou utilisez un support',
      'Attendez que l\'insecte soit posé et immobile',
      'Vérifiez la mise au point avant de déclencher',
      'Appuyez doucement sur le déclencheur, sans secouer',
      'Prenez plusieurs photos et gardez la plus nette',
    ],
    warning: '⚠️ Un insecte en vol ne peut pas être analysé correctement.',
  },
  RETAKE_LIGHTING_ANGLE: {
    title: 'Lumière difficile — changer d\'angle',
    icon: '☀️',
    color: COLORS.orange,
    steps: [
      'Cherchez une lumière naturelle directe sans contre-jour',
      'Déplacez-vous pour éviter les ombres sur l\'insecte',
      'Évitez les éclairages artificiels chauds ou froids',
      'Photographiez depuis un angle différent',
      'Tôt le matin ou en fin d\'après-midi = meilleure lumière',
    ],
    warning: '⚠️ Une lumière incorrecte peut fausser les couleurs et invalider l\'analyse.',
  },
  // V1.15 (post-M2, Item 2 v2) — remplace RETAKE_SHARPER/RETAKE_LIGHTING_ANGLE dans les cas où la
  // photo est correcte mais où les marqueurs relevés restent partagés entre la cible et une espèce
  // voisine (ex: frelon européen, guêpe) : le message ne doit pas laisser croire à un problème de
  // netteté ou de lumière quand ce n'est pas le cas.
  RETAKE_SPECIES_AMBIGUOUS: {
    title: 'Espèce incertaine — seconde photo utile',
    icon: '🔎',
    color: COLORS.orange,
    steps: [
      'La photo est exploitable, mais certains critères restent partagés avec une espèce voisine (frelon européen, guêpe)',
      'Une vue dorsale nette du thorax ET de l\'abdomen sur le même individu aide à trancher',
      'Rapprochez-vous si possible sans déranger l\'insecte',
      'Attendez qu\'il soit posé et immobile pour la seconde photo',
      'Une photo depuis un angle légèrement différent peut suffire',
    ],
    warning: '⚠️ Ceci ne signifie pas que la photo est floue ou mal éclairée — l\'espèce reste à confirmer.',
  },
};

export default function RetakeGuide({ visible, reasonCode, onRetake, onSkip }) {
  const guide = GUIDES[reasonCode] || GUIDES.RETAKE_SHARPER;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onSkip}
    >
      <View style={s.container}>
        <View style={s.handle} />

        <View style={[s.header, { borderBottomColor: guide.color + '44' }]}>
          <Text style={s.icon}>{guide.icon}</Text>
          <Text style={[s.title, { color: guide.color }]}>{guide.title}</Text>
          <Text style={s.subtitle}>Consigne pour la seconde photo</Text>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.stepsTitle}>Étapes :</Text>
          {guide.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={[s.stepNum, { backgroundColor: guide.color + '33', borderColor: guide.color }]}>
                <Text style={[s.stepNumText, { color: guide.color }]}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}

          <View style={[s.warningBox, { borderColor: guide.color + '88' }]}>
            <Text style={[s.warningText, { color: guide.color }]}>{guide.warning}</Text>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btnPrimary, { backgroundColor: guide.color }]}
            onPress={onRetake}
          >
            <Text style={s.btnPrimaryText}>📷  Prendre la seconde photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={onSkip}>
            <Text style={s.btnSecondaryText}>Conserver l'analyse actuelle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  icon: { fontSize: 36, marginBottom: 8 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepsTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 4,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: COLORS.orange + '12',
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    gap: 10,
  },
  btnPrimary: {
    padding: 18,
    borderRadius: 34,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSecondary: {
    padding: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
