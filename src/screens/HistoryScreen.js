import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import SignalementDetailModal from '../components/SignalementDetailModal';

function getVerdictColor(verdictCode) {
  if (verdictCode === 'ROUGE') return COLORS.rouge;
  if (verdictCode?.startsWith('ORANGE')) return COLORS.orange;
  if (verdictCode === 'PENDING') return COLORS.textDisabled;
  return COLORS.vert;
}

function getVerdictShortLabel(verdictCode) {
  switch (verdictCode) {
    case 'ROUGE': return 'Suspect confirmé';
    case 'ORANGE_PLAFOND': return 'Nid — incertain';
    case 'ORANGE_PROBABLE_NON_CIBLE': return 'Espèce voisine probable';
    case 'ORANGE_INSUFFISANCE': return 'Données insuffisantes';
    case 'VERT': return 'Aucun risque';
    case 'PENDING': return 'En attente d\'analyse';
    default: return verdictCode || '—';
  }
}

function getActivityLevel(verdictCode) {
  if (verdictCode === 'ROUGE') return { label: 'Forte activité', color: COLORS.rouge };
  if (verdictCode?.startsWith('ORANGE')) return { label: 'Activité modérée', color: COLORS.orange };
  return { label: 'Calme', color: COLORS.vert };
}

const FILTER_OPTIONS = [
  { key: 'ALL',     label: 'Tout', icon: 'list' },
  { key: 'ROUGE',   label: 'Suspects', icon: 'alert-octagon' },
  { key: 'ORANGE',  label: 'Incertains', icon: 'alert-triangle' },
  { key: 'OFFLINE', label: 'Hors-ligne', icon: 'wifi-off' },
];

export default function HistoryScreen({ history }) {
  const [filter, setFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = history.filter(item => {
    if (filter === 'ROUGE') return item.verdict_code === 'ROUGE';
    if (filter === 'ORANGE') return item.verdict_code?.startsWith('ORANGE');
    if (filter === 'OFFLINE') return item.offline || item.verdict_code === 'PENDING';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.id - a.id).slice(0, 50);

  if (history.length === 0) {
    return (
      <View style={s.empty}>
        <Feather name="bell-off" size={48} color={COLORS.textDisabled} />
        <Text style={s.emptyTitle}>Aucune alerte</Text>
        <Text style={s.emptyHint}>
          Prenez une photo depuis l'onglet Accueil pour commencer.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Historique</Text>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeText}>{history.length}</Text>
          </View>
        </View>
        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.filterPill, filter === opt.key && s.filterPillActive]}
              onPress={() => setFilter(opt.key)}
              activeOpacity={0.75}
            >
              <Feather
                name={opt.icon}
                size={12}
                color={filter === opt.key ? COLORS.primaryDark : COLORS.textMuted}
              />
              <Text style={[s.filterText, filter === opt.key && s.filterTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 && (
          <View style={s.filterEmpty}>
            <Text style={s.filterEmptyText}>Aucune alerte pour ce filtre.</Text>
          </View>
        )}

        {sorted.map(item => {
          const color = getVerdictColor(item.verdict_code);
          const label = getVerdictShortLabel(item.verdict_code);
          const activity = getActivityLevel(item.verdict_code);
          const isRecent = (Date.now() - item.id) < 24 * 60 * 60 * 1000;
          const isNew = (Date.now() - item.id) < 2 * 60 * 60 * 1000;

          return (
            <TouchableOpacity
              key={item.id}
              style={s.alertCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.8}
            >
              {/* Map thumbnail background */}
              <View style={[s.cardBg, { backgroundColor: color + '14' }]}>
                {/* Badges */}
                <View style={s.cardBadges}>
                  {isRecent && (
                    <View style={[s.pill, { backgroundColor: COLORS.rouge }]}>
                      <Text style={s.pillText}>RÉCENT</Text>
                    </View>
                  )}
                  {isNew && (
                    <View style={[s.pill, { backgroundColor: COLORS.rouge }]}>
                      <Text style={s.pillText}>NOUVEAU</Text>
                    </View>
                  )}
                  {item.offline && (
                    <View style={[s.pill, { backgroundColor: COLORS.textMuted }]}>
                      <Text style={s.pillText}>HORS-LIGNE</Text>
                    </View>
                  )}
                </View>

                <Text style={s.cardCity} numberOfLines={1}>
                  {item.city || 'Lieu inconnu'}
                </Text>
                <Text style={s.cardLabel} numberOfLines={1}>{label}</Text>
                <Text style={[s.cardActivity, { color: activity.color }]}>
                  {activity.label}
                </Text>
              </View>

              {/* Tap hint */}
              <View style={s.tapHint}>
                <Text style={s.tapHintText}>{item.date?.split(' ')[0] || '—'}</Text>
                <Feather name="chevron-right" size={14} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SignalementDetailModal
        visible={!!selectedItem}
        signalement={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 17, fontWeight: '600' },
  emptyHint: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerBadge: {
    backgroundColor: COLORS.primary + '25',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  filterText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: COLORS.primaryDark, fontWeight: '700' },

  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },

  filterEmpty: { alignItems: 'center', paddingVertical: 48 },
  filterEmptyText: { color: COLORS.textMuted, fontSize: 14 },

  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBg: {
    padding: 16,
    minHeight: 100,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  pill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardCity: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  cardActivity: {
    fontSize: 12,
    fontWeight: '600',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tapHintText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
