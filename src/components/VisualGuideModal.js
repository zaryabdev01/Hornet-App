import React, { useState } from 'react';
import {
  Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const TABS = [
  { key: 'frelon', label: 'Frelon asiatique' },
  { key: 'nid',   label: 'Nid' },
];

const FRELON_FEATURES = [
  { icon: 'droplet',   label: 'Abdomen', desc: 'Jaune-orangé avec anneau jaune net à l\'extrémité' },
  { icon: 'square',    label: 'Thorax',  desc: 'Entièrement brun-noir velours, sans jaune' },
  { icon: 'circle',    label: 'Tête',    desc: 'Face antérieure jaune-orangé, visible de face' },
  { icon: 'maximize',  label: 'Taille',  desc: 'Ouvrière 25–30 mm, reine jusqu\'à 35 mm' },
];

const NID_FEATURES = [
  { icon: 'globe',    label: 'Forme',     desc: 'Sphérique ou piriforme, orifice latéral' },
  { icon: 'layers',  label: 'Matière',   desc: 'Papier gris brun, alvéoles bruns à l\'intérieur' },
  { icon: 'map-pin', label: 'Emplacement', desc: 'Hauteur : arbres, toitures, haies — jamais au sol' },
  { icon: 'alert-triangle', label: 'Danger', desc: 'Ne jamais approcher, ne jamais toucher' },
];

export default function VisualGuideModal({ visible, onClose }) {
  const [tab, setTab] = useState('frelon');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={s.container}>
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Guide de reconnaissance</Text>
            <Text style={s.headerSub}>Quoi cadrer sur la photo ?</Text>
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Feather name="x" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, tab === t.key && s.tabActive]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
          {tab === 'frelon' ? (
            <>
              {/* Photo */}
              <View style={s.photoCard}>
                <Image
                  source={require('../../assets/velutina_small.jpg')}
                  style={s.photo}
                  resizeMode="cover"
                />
                <View style={s.photoBadge}>
                  <Text style={s.photoBadgeText}>Vespa velutina — Frelon asiatique</Text>
                </View>
              </View>

              {/* Framing tip */}
              <View style={s.tipBanner}>
                <Feather name="crosshair" size={14} color={COLORS.primary} />
                <Text style={s.tipText}>
                  Photographiez le dos de l'insecte. Thorax + abdomen doivent être nets et entiers dans le cadre.
                </Text>
              </View>

              {/* Features */}
              <Text style={s.sectionTitle}>Critères distinctifs</Text>
              {FRELON_FEATURES.map(f => (
                <View key={f.label} style={s.featureRow}>
                  <View style={s.featureIcon}>
                    <Feather name={f.icon} size={15} color={COLORS.primary} />
                  </View>
                  <View style={s.featureContent}>
                    <Text style={s.featureLabel}>{f.label}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}

              {/* Comparison note */}
              <View style={s.compareBox}>
                <Image
                  source={require('../../assets/crabro_small.jpg')}
                  style={s.comparePhoto}
                  resizeMode="cover"
                />
                <View style={s.compareText}>
                  <Text style={s.compareTitle}>À ne pas confondre</Text>
                  <Text style={s.compareDesc}>
                    Frelon européen (Vespa crabro) : thorax roux-jaune, taille similaire mais corps plus coloré.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Nest photo */}
              <View style={s.photoCard}>
                <Image
                  source={require('../../assets/media_small.jpg')}
                  style={s.photo}
                  resizeMode="cover"
                />
                <View style={s.photoBadge}>
                  <Text style={s.photoBadgeText}>Nid de Vespa velutina</Text>
                </View>
              </View>

              {/* Framing tip */}
              <View style={s.tipBanner}>
                <Feather name="crosshair" size={14} color={COLORS.primary} />
                <Text style={s.tipText}>
                  Photographiez la surface du nid de loin. Utilisez le zoom optique. Ne vous approchez jamais.
                </Text>
              </View>

              {/* Features */}
              <Text style={s.sectionTitle}>Caractéristiques du nid</Text>
              {NID_FEATURES.map(f => (
                <View key={f.label} style={s.featureRow}>
                  <View style={s.featureIcon}>
                    <Feather name={f.icon} size={15} color={f.label === 'Danger' ? COLORS.rouge : COLORS.primary} />
                  </View>
                  <View style={s.featureContent}>
                    <Text style={s.featureLabel}>{f.label}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}

              <View style={[s.tipBanner, { backgroundColor: COLORS.rouge + '12', borderColor: COLORS.rouge + '33' }]}>
                <Feather name="alert-triangle" size={14} color={COLORS.rouge} />
                <Text style={[s.tipText, { color: COLORS.rouge }]}>
                  Distance minimale de sécurité : 5 mètres. En cas de doute, contactez les pompiers.
                </Text>
              </View>
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingTop: 12 },
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
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  headerSub: { fontSize: 13, color: COLORS.textMuted },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 9,
    alignItems: 'center', borderRadius: 10,
  },
  tabActive: { backgroundColor: COLORS.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.textPrimary, fontWeight: '700' },

  scroll: { flex: 1, paddingHorizontal: 16 },

  photoCard: {
    borderRadius: 18, overflow: 'hidden',
    marginBottom: 14, position: 'relative',
  },
  photo: { width: '100%', height: 200 },
  photoBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 10, paddingHorizontal: 14,
  },
  photoBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tipBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.primary + '14',
    borderRadius: 12, padding: 12,
    marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.primary + '33',
  },
  tipText: { flex: 1, fontSize: 13, color: COLORS.primaryDark, lineHeight: 19 },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10,
  },

  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 12, padding: 12,
    marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  featureIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureContent: { flex: 1 },
  featureLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },

  compareBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.orange + '10',
    borderRadius: 14, overflow: 'hidden',
    marginTop: 8, marginBottom: 4,
    borderWidth: 1, borderColor: COLORS.orange + '33',
  },
  comparePhoto: { width: 80, height: 80 },
  compareText: { flex: 1, padding: 12 },
  compareTitle: { fontSize: 13, fontWeight: '700', color: COLORS.orange, marginBottom: 4 },
  compareDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
});
