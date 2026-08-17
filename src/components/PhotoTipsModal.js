import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const TIPS = [
  {
    icon: 'zoom-in',
    title: 'Zoomez, ne vous approchez pas',
    desc: 'Utilisez le zoom optique ou numérique. Ne vous approchez jamais à moins d\'un mètre d\'un nid.',
  },
  {
    icon: 'crosshair',
    title: 'Visez thorax + abdomen',
    desc: 'Cadrez le dos de l\'insecte. Le thorax (milieu) et l\'abdomen (arrière) sont les zones discriminantes.',
  },
  {
    icon: 'sun',
    title: 'Lumière naturelle directe',
    desc: 'Évitez les contre-jours et ombres. Une lumière uniforme naturelle donne les meilleures couleurs.',
  },
  {
    icon: 'camera',
    title: 'Stabilisez — évitez le flou',
    desc: 'Attendez que l\'insecte soit posé ou immobile. Appuyez doucement sur le déclencheur.',
  },
  {
    icon: 'eye',
    title: 'Vue dorsale de préférence',
    desc: 'Photographiez l\'insecte vu de dessus ou de profil. Évitez les vues du dessous (ventre).',
  },
  {
    icon: 'shield-off',
    title: 'Ne touchez jamais le nid',
    desc: 'Même si vous pensez qu\'il est abandonné. Restez à distance de sécurité.',
  },
];

export default function PhotoTipsModal({ visible, onClose, onContinue }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={s.container}>
        <View style={s.handle} />

        <View style={s.header}>
          <View>
            <Text style={s.title}>Conseils photo</Text>
            <Text style={s.subtitle}>Pour une analyse précise et sûre</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {TIPS.map((tip, i) => (
            <View key={i} style={s.tipCard}>
              <View style={s.tipIconWrap}>
                <Feather name={tip.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={s.tipContent}>
                <Text style={s.tipTitle}>{tip.title}</Text>
                <Text style={s.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}

          <View style={s.safetyBanner}>
            <Feather name="alert-triangle" size={14} color={COLORS.orange} />
            <Text style={s.safetyText}>
              En cas de doute ou d'allergie aux piqûres, contactez directement les pompiers ou un apiculteur professionnel.
            </Text>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.btnPrimary} onPress={onContinue} activeOpacity={0.88}>
            <Feather name="camera" size={18} color="#111" />
            <Text style={s.btnPrimaryText}>Ouvrir la caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.btnSecondaryText}>Annuler</Text>
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipContent: { flex: 1 },
  tipTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  tipDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.orange + '14',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.orange + '33',
  },
  safetyText: {
    color: COLORS.orange,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    gap: 10,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    padding: 17,
    borderRadius: 32,
  },
  btnPrimaryText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    padding: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
