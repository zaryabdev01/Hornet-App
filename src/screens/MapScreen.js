import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import SignalementDetailModal from '../components/SignalementDetailModal';
import { fetchCommunityReports } from '../services/reportingService';
import { getCurrentLocation } from '../services/geolocation';

const FILTER_OPTIONS = [
  { key: 'ALL',    label: 'Tous' },
  { key: 'ROUGE',  label: 'Suspects' },
  { key: 'ORANGE', label: 'Incertains' },
];

function getMarkerColor(verdictCode) {
  if (verdictCode === 'ROUGE') return COLORS.rouge;
  return COLORS.orange;
}

function getVerdictLabel(verdictCode) {
  switch (verdictCode) {
    case 'ROUGE': return 'SUSPECT';
    case 'ORANGE_PLAFOND': return 'NIDIFICATION';
    case 'ORANGE_PROBABLE_NON_CIBLE': return 'ESPÈCE VOISINE';
    case 'ORANGE_INSUFFISANCE': return 'INCERTAIN';
    default: return 'SIGNALEMENT';
  }
}

function toCommunityMarker(r) {
  return {
    id: r.id,
    date: new Date(r.created_at).toLocaleString('fr-FR'),
    image: r.image_url,
    verdict_code: r.verdict_code,
    confiance: r.confiance,
    motif_principal: r.motif_principal,
    city: r.address,
    location: { latitude: r.lat_blurred, longitude: r.lon_blurred },
    isCommunity: true,
  };
}

export default function MapScreen({ history }) {
  const [filter, setFilter] = useState('ALL');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [communityData, setCommunityData] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [isCommunityMode, setIsCommunityMode] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const previewAnim = useRef(new Animated.Value(0)).current;

  const loadCommunity = useCallback(async () => {
    setCommunityLoading(true);
    const reports = await fetchCommunityReports(500);
    if (reports) setCommunityData(reports.map(toCommunityMarker));
    setCommunityLoading(false);
  }, []);

  useEffect(() => { loadCommunity(); }, [loadCommunity]);

  const handleLocateMe = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      if (loc?.exact && mapRef.current) {
        setUserLocation(loc.exact);
        mapRef.current.animateToRegion({
          latitude: loc.exact.latitude,
          longitude: loc.exact.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 800);
      }
    } catch {}
  }, []);

  const activeSource = (isCommunityMode && communityData.length > 0) ? communityData : history;

  const markers = useMemo(() => {
    return activeSource.filter(h => {
      if (!h.location) return false;
      if (h.verdict_code === 'VERT' || h.verdict_code === 'PENDING') return false;
      if (filter === 'ROUGE') return h.verdict_code === 'ROUGE';
      if (filter === 'ORANGE') return h.verdict_code?.startsWith('ORANGE');
      return true;
    });
  }, [activeSource, filter]);

  const handleMarkerPress = (item) => {
    setSelectedMarker(item);
    Animated.spring(previewAnim, {
      toValue: 1, useNativeDriver: true, tension: 60, friction: 10,
    }).start();
  };

  const handleMapPress = () => {
    if (!selectedMarker) return;
    Animated.timing(previewAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSelectedMarker(null));
  };

  const previewTranslate = previewAnim.interpolate({
    inputRange: [0, 1], outputRange: [220, 0],
  });

  const color = selectedMarker ? getMarkerColor(selectedMarker.verdict_code) : COLORS.rouge;

  return (
    <View style={s.container}>
      {/* Filter bar */}
      <View style={s.filterBar}>
        <View style={s.filterGroup}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.filterPill, filter === opt.key && s.filterPillActive]}
              onPress={() => setFilter(opt.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterText, filter === opt.key && s.filterTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.sourceBtn, !isCommunityMode && s.sourceBtnPersonal]}
          onPress={() => setIsCommunityMode(v => !v)}
          activeOpacity={0.75}
        >
          <Feather
            name={isCommunityMode ? 'globe' : 'user'}
            size={14}
            color={isCommunityMode ? COLORS.primary : COLORS.textMuted}
          />
          {communityLoading && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={s.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 46.5,
          longitude: 2.5,
          latitudeDelta: 8,
          longitudeDelta: 8,
        }}
      >
        {markers.map(item => (
          <Marker
            key={item.id}
            coordinate={item.location}
            pinColor={item.verdict_code === 'ROUGE' ? '#E53935' : '#F57C00'}
            onPress={() => handleMarkerPress(item)}
          />
        ))}
      </MapView>

      {/* FAB buttons */}
      <View style={s.fabGroup}>
        <TouchableOpacity style={s.fab} onPress={handleLocateMe} activeOpacity={0.8}>
          <Feather name="crosshair" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Marker count badge */}
      {markers.length > 0 && (
        <View style={s.countBadge}>
          <Text style={s.countBadgeText}>
            {markers.length} signalement{markers.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Preview card */}
      {selectedMarker && (
        <Animated.View
          style={[s.preview, { transform: [{ translateY: previewTranslate }] }]}
        >
          {/* Drag handle */}
          <View style={s.handle} />

          <View style={s.previewHeader}>
            <Text style={s.previewTitle}>Détails du signalement</Text>
            <TouchableOpacity
              style={s.previewClose}
              onPress={handleMapPress}
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Photo with verdict badge overlay */}
          <View style={s.photoWrap}>
            {selectedMarker.image ? (
              <Image source={{ uri: selectedMarker.image }} style={s.previewPhoto} resizeMode="cover" />
            ) : (
              <View style={[s.previewPhoto, s.previewPhotoEmpty]}>
                <Feather name="image" size={32} color={COLORS.textDisabled} />
              </View>
            )}
            <View style={[s.verdictBadge, { backgroundColor: color }]}>
              <Text style={s.verdictBadgeText}>
                {getVerdictLabel(selectedMarker.verdict_code)}
                {selectedMarker.confiance > 0 ? ` · ${selectedMarker.confiance} %` : ''}
              </Text>
            </View>
          </View>

          {/* Info row */}
          <View style={s.infoRow}>
            <View style={s.infoCard}>
              <Feather name="calendar" size={13} color={COLORS.textMuted} />
              <View style={{ marginLeft: 6 }}>
                <Text style={s.infoCardLabel}>Date</Text>
                <Text style={s.infoCardValue}>{selectedMarker.date}</Text>
              </View>
            </View>
            <View style={s.infoCard}>
              <Feather name="shield" size={13} color={COLORS.textMuted} />
              <View style={{ marginLeft: 6 }}>
                <Text style={s.infoCardLabel}>Vérification</Text>
                <Text style={s.infoCardValue}>
                  {selectedMarker.synchronized ? 'Synchronisé' : 'Local'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={s.detailBtn}
            onPress={() => setDetailOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={s.detailBtnText}>Voir le détail complet</Text>
            <Feather name="chevron-right" size={16} color="#111" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Empty state */}
      {markers.length === 0 && !communityLoading && (
        <View style={s.emptyOverlay} pointerEvents="none">
          <View style={s.emptyCard}>
            <Feather name="map-pin" size={28} color={COLORS.textDisabled} />
            <Text style={s.emptyText}>
              {isCommunityMode
                ? 'Aucun signalement communautaire'
                : 'Aucun signalement localisé'}
            </Text>
          </View>
        </View>
      )}

      <SignalementDetailModal
        visible={detailOpen}
        signalement={selectedMarker}
        onClose={() => setDetailOpen(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
    zIndex: 10,
  },
  filterGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  filterText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: COLORS.primaryDark, fontWeight: '700' },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sourceBtnPersonal: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },

  // FAB
  fabGroup: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    gap: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Count badge
  countBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countBadgeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Preview card
  preview: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  previewTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWrap: {
    marginBottom: 10,
    position: 'relative',
  },
  previewPhoto: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  previewPhotoEmpty: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verdictBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verdictBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  infoCardValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 14,
    gap: 6,
  },
  detailBtnText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },

  // Empty
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
    top: 60,
    pointerEvents: 'none',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
