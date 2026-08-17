import React from 'react';
import {
  Modal, View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

function getVerdictColor(verdictCode) {
  if (verdictCode === 'ROUGE') return COLORS.rouge;
  if (verdictCode?.startsWith('ORANGE')) return COLORS.orange;
  if (verdictCode === 'PENDING') return COLORS.textDisabled;
  return COLORS.vert;
}

function getVerdictLabel(verdictCode) {
  switch (verdictCode) {
    case 'ROUGE': return 'Frelon asiatique très probable';
    case 'ORANGE_PLAFOND': return 'Nid probable — intervention requise';
    case 'ORANGE_PROBABLE_NON_CIBLE': return 'Insecte non cible probable';
    case 'ORANGE_INSUFFISANCE': return 'Données insuffisantes';
    case 'VERT': return 'Aucun élément suspect';
    case 'PENDING': return "En attente d'analyse";
    default: return verdictCode || '—';
  }
}

function InfoCard({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <View style={s.infoCard}>
      <Feather name={icon} size={13} color={COLORS.textMuted} />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <Text style={s.infoCardLabel}>{label}</Text>
        <Text style={s.infoCardValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function SignalementDetailModal({ visible, signalement, onClose }) {
  if (!signalement) return null;

  const color = getVerdictColor(signalement.verdict_code);
  const label = getVerdictLabel(signalement.verdict_code);

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
          <Text style={s.headerTitle}>Détails du signalement</Text>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Feather name="x" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Photo */}
          {signalement.image ? (
            <View style={s.photoWrap}>
              <Image source={{ uri: signalement.image }} style={s.photo} resizeMode="cover" />
              {/* Verdict overlay badge */}
              <View style={[s.photoBadge, { backgroundColor: color }]}>
                <Text style={s.photoBadgeText}>
                  {label}
                  {signalement.confiance > 0 ? `  ·  ${signalement.confiance} % confirmé` : ''}
                </Text>
              </View>
            </View>
          ) : (
            <View style={s.photoPlaceholder}>
              <Feather name="image" size={32} color={COLORS.textDisabled} />
              <Text style={s.photoPlaceholderText}>Aucune photo disponible</Text>
            </View>
          )}

          {/* Validation row */}
          <View style={s.validationRow}>
            <View style={[s.validationBtn, s.validationBtnGreen]}>
              <Feather name="check" size={18} color={COLORS.vert} />
              <View style={s.validationBadge}>
                <Text style={s.validationBadgeText}>0</Text>
              </View>
            </View>
            <View style={s.validationCenter}>
              <Text style={s.validationTitle}>Validation du signalement</Text>
              <Text style={s.validationSub}>Valider le résultat</Text>
            </View>
            <View style={[s.validationBtn, s.validationBtnRed]}>
              <Feather name="x" size={18} color={COLORS.rouge} />
              <View style={[s.validationBadge, { backgroundColor: COLORS.rouge }]}>
                <Text style={s.validationBadgeText}>0</Text>
              </View>
            </View>
          </View>

          {/* Info cards grid */}
          <View style={s.infoGrid}>
            <InfoCard
              icon="calendar"
              label="Date"
              value={signalement.date}
            />
            <InfoCard
              icon="shield"
              label="Vérification"
              value={signalement.synchronized ? 'Vérifié' : 'En attente'}
            />
          </View>

          {/* Details */}
          {signalement.motif_principal && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Analyse</Text>
              <Text style={s.sectionText}>{signalement.motif_principal}</Text>
              {signalement.action_recommandee && (
                <View style={s.actionRow}>
                  <Feather name="arrow-right-circle" size={13} color={COLORS.primaryDark} />
                  <Text style={s.actionText}>{signalement.action_recommandee}</Text>
                </View>
              )}
            </View>
          )}

          {/* Location */}
          {(signalement.city || signalement.location) && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Localisation</Text>
              {signalement.city && (
                <Text style={s.sectionText}>{signalement.city}</Text>
              )}
              {signalement.location && (
                <Text style={s.coordText}>
                  {signalement.location.latitude.toFixed(3)}, {signalement.location.longitude.toFixed(3)} (approx.)
                </Text>
              )}
            </View>
          )}

          {/* Status */}
          <View style={s.statusRow}>
            <View style={[s.statusPill,
              signalement.synchronized ? s.statusGreen : s.statusOrange
            ]}>
              <Feather
                name={signalement.synchronized ? 'check-circle' : 'clock'}
                size={12}
                color={signalement.synchronized ? COLORS.vert : COLORS.orange}
              />
              <Text style={[s.statusText,
                { color: signalement.synchronized ? COLORS.vert : COLORS.orange }
              ]}>
                {signalement.synchronized ? 'Synchronisé' : 'Non synchronisé'}
              </Text>
            </View>
            {signalement.offline && (
              <View style={[s.statusPill, s.statusOrange]}>
                <Feather name="wifi-off" size={12} color={COLORS.orange} />
                <Text style={[s.statusText, { color: COLORS.orange }]}>Hors-ligne</Text>
              </View>
            )}
          </View>

          <Text style={s.disclaimer}>
            Analyse indicative — confirmation professionnelle recommandée en cas de doute.
          </Text>
        </ScrollView>
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
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  scroll: { padding: 16, paddingBottom: 48 },

  // Photo
  photoWrap: { marginBottom: 14, position: 'relative' },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  photoBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  photoBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoPlaceholderText: { color: COLORS.textMuted, fontSize: 13 },

  // Validation
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  validationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  validationBtnGreen: {
    borderWidth: 2,
    borderColor: COLORS.vert,
  },
  validationBtnRed: {
    borderWidth: 2,
    borderColor: COLORS.rouge,
  },
  validationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.vert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  validationCenter: { flex: 1, alignItems: 'center' },
  validationTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  validationSub: { fontSize: 12, color: COLORS.textMuted },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  infoCardValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },

  // Sections
  section: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  coordText: { color: COLORS.textDisabled, fontSize: 11, marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  actionText: { color: COLORS.primaryDark, fontSize: 12, flex: 1, lineHeight: 17 },

  // Status
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusGreen: { borderColor: COLORS.vert + '55', backgroundColor: COLORS.vert + '0F' },
  statusOrange: { borderColor: COLORS.orange + '55', backgroundColor: COLORS.orange + '0F' },
  statusText: { fontSize: 12, fontWeight: '500' },

  disclaimer: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
});
