import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ACTIONS, REASON_LABELS } from '../constants/verdicts';

function getVerdictColor(verdictCode) {
  if (verdictCode === 'ROUGE') return COLORS.rouge;
  if (verdictCode?.startsWith('ORANGE')) return COLORS.orange;
  return COLORS.vert;
}

function getVerdictLabel(verdictCode) {
  switch (verdictCode) {
    case 'ROUGE': return 'Frelon asiatique très probable';
    case 'ORANGE_PLAFOND': return 'Nid probable — intervention requise';
    case 'ORANGE_PROBABLE_NON_CIBLE': return 'Insecte non cible probable';
    case 'ORANGE_INSUFFISANCE': return 'Données insuffisantes';
    case 'VERT': return 'Aucun élément suspect';
    default: return verdictCode;
  }
}

function getVerdictIcon(verdictCode) {
  if (verdictCode === 'ROUGE') return 'alert-octagon';
  if (verdictCode?.startsWith('ORANGE')) return 'alert-triangle';
  return 'check-circle';
}

export default function VerdictCard({ verdict, onNewAnalysis, onSecondPhoto, onContinue }) {
  if (!verdict) return null;

  const {
    verdict_code, confiance, motif_principal, reason_code,
    action_recommandee, avis,
  } = verdict;

  const color = getVerdictColor(verdict_code);
  const label = getVerdictLabel(verdict_code);
  const icon = getVerdictIcon(verdict_code);
  const isOrange = verdict_code?.startsWith('ORANGE');
  const isRouge = verdict_code === 'ROUGE';
  const isVert = verdict_code === 'VERT';
  const isProbableNonCible = verdict_code === 'ORANGE_PROBABLE_NON_CIBLE';
  const needsSecondPhoto = verdict_code === 'ORANGE_PLAFOND' || verdict_code === 'ORANGE_INSUFFISANCE';

  return (
    <View style={s.card}>
      {/* Verdict header */}
      <View style={[s.verdictHeader, { backgroundColor: color + '14', borderLeftColor: color }]}>
        <Feather name={icon} size={22} color={color} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.verdictLabel, { color }]}>{label}</Text>
          <Text style={s.confianceText}>Confiance moteur : {confiance} %</Text>
        </View>
      </View>

      {/* Motif */}
      <View style={s.motifBox}>
        <Text style={s.motifText}>{motif_principal}</Text>
      </View>

      {/* Indication */}
      {reason_code && reason_code !== 'NONE' && (
        <View style={s.reasonRow}>
          <Feather name="info" size={13} color={COLORS.textMuted} />
          <Text style={s.reasonText}>{REASON_LABELS[reason_code] || reason_code}</Text>
        </View>
      )}

      {/* Message non-cible */}
      {isProbableNonCible && (
        <View style={s.pedagogicBox}>
          <Text style={s.pedagogicTitle}>Probablement pas un frelon asiatique</Text>
          <Text style={s.pedagogicText}>
            Cet individu ressemble fortement à un frelon européen, espèce utile et protégée.
          </Text>
          <View style={s.safetyRow}>
            <Feather name="alert-triangle" size={13} color={COLORS.orange} />
            <Text style={s.safetyText}>
              Si vous voyez un nid à proximité, ne vous en approchez pas.
            </Text>
          </View>
        </View>
      )}

      {/* Action recommandée */}
      {action_recommandee && !isProbableNonCible && (
        <View style={s.actionRow}>
          <Feather name="arrow-right-circle" size={15} color={COLORS.primaryDark} />
          <Text style={s.actionText}>{action_recommandee}</Text>
        </View>
      )}

      {/* Avis */}
      <Text style={s.avis}>{avis}</Text>

      {/* CTA ROUGE */}
      {isRouge && (
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: COLORS.rouge }]}
          onPress={() => Linking.openURL('https://www.google.com/maps/search/désinsectisation+frelon+asiatique')}
          activeOpacity={0.85}
        >
          <Feather name="phone" size={16} color="#fff" />
          <Text style={s.ctaBtnText}>Contacter un professionnel</Text>
        </TouchableOpacity>
      )}

      {/* CTA ORANGE seconde photo */}
      {needsSecondPhoto && (
        <View style={s.secondPhotoBlock}>
          <Text style={s.secondPhotoHint}>Une seconde photo peut améliorer l'analyse</Text>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: COLORS.orange }]}
            onPress={onSecondPhoto}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={16} color="#fff" />
            <Text style={s.ctaBtnText}>Prendre une seconde photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={onContinue} activeOpacity={0.7}>
            <Text style={s.skipText}>Continuer avec cette analyse</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CTA non-cible */}
      {isProbableNonCible && (
        <View style={s.secondPhotoBlock}>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: COLORS.orange }]}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={s.ctaBtnText}>J'ai compris</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={onSecondPhoto} activeOpacity={0.7}>
            <Text style={s.skipText}>Reprendre une photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nouvelle analyse */}
      <TouchableOpacity onPress={onNewAnalysis} style={s.newBtn} activeOpacity={0.7}>
        <Feather name="rotate-ccw" size={13} color={COLORS.textMuted} />
        <Text style={s.newBtnText}>Nouvelle analyse</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
  },
  verdictLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  confianceText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  motifBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  motifText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  reasonText: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
    marginTop: 1,
  },
  pedagogicBox: {
    backgroundColor: COLORS.vert + '0F',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.vert + '33',
  },
  pedagogicTitle: {
    color: COLORS.vert,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  pedagogicText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 8,
    backgroundColor: COLORS.orange + '14',
    borderRadius: 10,
    padding: 10,
  },
  safetyText: {
    color: COLORS.orange,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    backgroundColor: COLORS.recoBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.recoBorder,
  },
  actionText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
    marginTop: 1,
  },
  avis: {
    color: COLORS.textDisabled,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 28,
    marginBottom: 8,
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondPhotoBlock: {
    marginBottom: 8,
  },
  secondPhotoHint: {
    color: COLORS.orange,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  skipBtn: {
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    padding: 10,
  },
  newBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
