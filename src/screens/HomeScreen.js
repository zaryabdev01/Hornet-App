import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, TextInput, ActivityIndicator, Animated,
  Dimensions, BackHandler,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { BRAND } from '../constants/branding';
import { getVisionObservation } from '../services/geminiApi';
import { juger } from '../engine/judge';
import { getCurrentLocation, getCityFromCoords, getCoordsFromCity } from '../services/geolocation';
import { addToQueue } from '../services/offlineQueue';
import { haptic, HapticStyle } from '../utils/haptics';
import { prepareImageForAnalysis } from '../utils/imagePrep';
import AnalysisProgress from '../components/AnalysisProgress';
import VerdictCard from '../components/VerdictCard';
import RetakeGuide from '../components/RetakeGuide';

const { width: W, height: H } = Dimensions.get('window');
const VIEWFINDER_SIZE = W * 0.72;

// Zoom levels : 1x 2x 3x 4x 5x
const ZOOM_LEVELS = [1, 2, 3, 4, 5];

export default function HomeScreen({ onSave, isOnline }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [zoom, setZoom] = useState(0);           // expo-camera zoom 0..1
  const [zoomIdx, setZoomIdx] = useState(0);     // index in ZOOM_LEVELS
  const [capturedUri, setCapturedUri] = useState(null);
  const [capturedBase64, setCapturedBase64] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [overlayMode, setOverlayMode] = useState('frelon');
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryDate, setGalleryDate] = useState('');
  const [galleryCity, setGalleryCity] = useState('');
  const [savedOk, setSavedOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRetakeGuide, setShowRetakeGuide] = useState(false);
  const [fromCamera, setFromCamera] = useState(true);
  const [shutterAnim] = useState(new Animated.Value(1));
  const [showHero, setShowHero] = useState(true);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const cameraRef = useRef(null);
  const isHeroMode = !capturedUri && !loading && !error;

  // Hero entrance animation
  useEffect(() => {
    if (showHero) {
      heroAnim.setValue(0);
      logoScale.setValue(0.85);
      Animated.parallel([
        Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [showHero]);

  // Animation panneau info
  useEffect(() => {
    if (showInfoOverlay) {
      overlayAnim.setValue(0);
      Animated.spring(overlayAnim, {
        toValue: 1,
        tension: 120,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [showInfoOverlay]);

  // Android back: camera → hero
  useEffect(() => {
    if (!showHero && isHeroMode) {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setShowHero(true);
        return true;
      });
      return () => sub.remove();
    }
  }, [showHero, isHeroMode]);

  const reset = useCallback(() => {
    setCapturedUri(null);
    setCapturedBase64(null);
    setVerdict(null);
    setError(null);
    setShowGalleryForm(false);
    setGalleryDate('');
    setGalleryCity('');
    setSavedOk(false);
    setSaving(false);
    setShowRetakeGuide(false);
    setFromCamera(true);
    setZoom(0);
    setZoomIdx(0);
    setCameraReady(false);
    setShowHero(true);
  }, []);

  // ── Zoom ──────────────────────────────────────────────────────
  const applyZoom = (idx) => {
    const level = ZOOM_LEVELS[idx];
    // Linéaire : 1x→0, 5x→0.8 sur expo-camera range
    const expoZoom = (level - 1) / (ZOOM_LEVELS[ZOOM_LEVELS.length - 1] - 1) * 0.8;
    setZoomIdx(idx);
    setZoom(expoZoom);
  };

  // ── Take photo with live camera ────────────────────────────────
  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;
    Animated.sequence([
      Animated.timing(shutterAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(shutterAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.85 });
      await haptic(HapticStyle.MEDIUM);
      // Downscale before it ever reaches the analysis payload (Item 2 — latency).
      const prepared = await prepareImageForAnalysis(photo.uri, photo.width, photo.height);
      setCapturedUri((prepared || photo).uri);
      setCapturedBase64((prepared || photo).base64);
      setFromCamera(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  // ── Gallery fallback ──────────────────────────────────────────
  const openGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', "L'accès à la galerie est requis.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.85 });
    if (!result.canceled) {
      const asset = result.assets[0];
      const prepared = await prepareImageForAnalysis(asset.uri, asset.width, asset.height);
      setCapturedUri((prepared || asset).uri);
      setCapturedBase64((prepared || asset).base64);
      setFromCamera(false);
      setVerdict(null);
      setError(null);
      setSavedOk(false);
    }
  };

  // ── Request permission if needed ──────────────────────────────
  const handleRequestPermission = async () => {
    const res = await requestPermission();
    if (!res.granted) {
      Alert.alert(
        'Permission caméra requise',
        'Autorisez l\'accès à la caméra dans les réglages pour utiliser ApiSave.',
      );
    }
  };

  // ── Analysis (unchanged logic) ─────────────────────────────────
  const runAnalysis = async (b64Override = null) => {
    const b64 = b64Override || capturedBase64;
    if (!b64) return;

    setLoading(true);
    setError(null);
    setVerdict(null);
    setShowGalleryForm(false);
    setSavedOk(false);

    if (!isOnline) {
      const offlineEntry = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        image: capturedUri,
        base64: b64,
        synchronized: false,
        offline: true,
        verdict_code: 'PENDING',
        confiance: 0,
        fromCamera,
      };
      if (fromCamera) {
        const loc = await getCurrentLocation().catch(() => null);
        if (loc) {
          offlineEntry.location = loc.blurred;
          offlineEntry.locationExact = loc.exact;
          offlineEntry.city = await getCityFromCoords(loc.exact.latitude, loc.exact.longitude);
        }
      }
      await addToQueue(offlineEntry);
      await onSave(offlineEntry);
      setLoading(false);
      Alert.alert(
        'Mode hors-ligne',
        'Signalement enregistré. Il sera analysé automatiquement à la reconnexion.',
        [{ text: 'OK', onPress: reset }]
      );
      return;
    }

    try {
      const observation = await getVisionObservation(b64);
      const result = juger(observation);
      setVerdict(result);

      const isSignificant =
        result.verdict_code === 'ROUGE' ||
        result.verdict_code === 'ORANGE_PLAFOND' ||
        result.verdict_code === 'ORANGE_INSUFFISANCE' ||
        result.verdict_code === 'ORANGE_PROBABLE_NON_CIBLE';

      if (result.verdict_code === 'ROUGE') await haptic(HapticStyle.ERROR);

      if (fromCamera && isSignificant) {
        const loc = await getCurrentLocation().catch(() => null);
        const city = loc
          ? await getCityFromCoords(loc.exact.latitude, loc.exact.longitude)
          : 'Position inconnue';
        const entry = {
          id: Date.now(),
          date: new Date().toLocaleString('fr-FR'),
          image: capturedUri,
          verdict_code: result.verdict_code,
          confiance: result.confiance,
          reason_code: result.reason_code,
          action_recommandee: result.action_recommandee,
          motif_principal: result.motif_principal,
          location: loc?.blurred || null,
          locationExact: loc?.exact || null,
          city,
          synchronized: true,
          offline: false,
          fromCamera: true,
        };
        await onSave(entry, b64);
        setSavedOk(true);
      } else if (!fromCamera && isSignificant) {
        setGalleryDate(new Date().toLocaleDateString('fr-FR'));
        setShowGalleryForm(true);
      }
    } catch (e) {
      setError(e.message || 'Erreur inconnue');
      await haptic(HapticStyle.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const saveGalleryEntry = async () => {
    if (!verdict || saving) return;
    setSaving(true);
    const city = galleryCity.trim() || 'Lieu non renseigné';
    let location = null;
    if (galleryCity.trim()) location = await getCoordsFromCity(galleryCity.trim());
    const entry = {
      id: Date.now(),
      date: galleryDate || new Date().toLocaleString('fr-FR'),
      image: capturedUri,
      verdict_code: verdict.verdict_code,
      confiance: verdict.confiance,
      reason_code: verdict.reason_code,
      action_recommandee: verdict.action_recommandee,
      motif_principal: verdict.motif_principal,
      location,
      locationExact: null,
      city,
      synchronized: true,
      offline: false,
      fromCamera: false,
    };
    await onSave(entry, capturedBase64);
    setSaving(false);
    setSavedOk(true);
    setShowGalleryForm(false);
  };

  const handleSecondPhoto = () => setShowRetakeGuide(true);
  const handleRetake = async () => {
    setShowRetakeGuide(false);
    setVerdict(null);
    setCapturedUri(null);
    setCapturedBase64(null);
  };
  const handleContinueWithAnalysis = async () => {
    if (!verdict) return;
    if (verdict.verdict_code !== 'VERT' && !savedOk && !fromCamera) setShowGalleryForm(true);
    else setSavedOk(true);
  };

  // ── HERO SCREEN ───────────────────────────────────────────────
  if (showHero && isHeroMode) {
    return (
      <View style={s.heroContainer}>
        <Animated.View style={[s.heroContent, { opacity: heroAnim, transform: [{ scale: logoScale }] }]}>
          <Image
            source={require('../../assets/logo-icon.jpg')}
            style={s.heroLogo}
            resizeMode="contain"
          />
          <Text style={s.heroTitle}>API<Text style={s.heroAccent}>SAVE</Text></Text>
          <Text style={s.heroTagline}>{BRAND.tagline}</Text>

          {!isOnline && (
            <View style={s.heroBanner}>
              <Feather name="wifi-off" size={13} color={COLORS.orange} />
              <Text style={s.heroBannerText}>
                Hors-ligne — signalements synchronisés à la reconnexion
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[s.heroCTA, { opacity: heroAnim }]}>
          <TouchableOpacity
            style={s.heroBtn}
            onPress={() => setShowHero(false)}
            activeOpacity={0.88}
          >
            <Feather name="camera" size={22} color="#111" />
            <Text style={s.heroBtnText}>Signaler</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── CAMERA VIEWFINDER ─────────────────────────────────────────
  if (isHeroMode) {
    const hasPermission = permission?.granted;
    const permPending = !permission;

    return (
      <View style={s.cameraContainer}>
        {/* Camera fills entire background */}
        {hasPermission ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="back"
            zoom={zoom}
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, s.noCameraFill]} />
        )}
        <View style={s.vignette} pointerEvents="none" />

        {/* ── TOP BAR ────────────────────────────── */}
        <View style={s.topBar}>
          {!isOnline && (
            <View style={s.offlinePill}>
              <Feather name="wifi-off" size={11} color="#fff" />
              <Text style={s.offlinePillText}>Hors-ligne</Text>
            </View>
          )}
          <View style={s.safetyTag}>
            <Text style={s.safetyTagText}>
              Observe à distance — cadre clairement le frelon ou le nid
            </Text>
          </View>
          <TouchableOpacity style={s.infoBtn} onPress={() => { setShowInfoOverlay(true); setOverlayMode('frelon'); }} activeOpacity={0.8}>
            <Feather name="info" size={18} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* ── VIEWFINDER AREA (flex:1, centered) ── */}
        <View style={s.viewfinderArea}>
          <View style={s.viewfinderFrame} pointerEvents="box-none">
            {/* Corner brackets */}
            <View style={[s.corner, s.cornerTL]} pointerEvents="none" />
            <View style={[s.corner, s.cornerTR]} pointerEvents="none" />
            <View style={[s.corner, s.cornerBL]} pointerEvents="none" />
            <View style={[s.corner, s.cornerBR]} pointerEvents="none" />
            <View style={s.centerDot} pointerEvents="none" />

            {/* ── INFO OVERLAY (inside frame) ─────── */}
            {showInfoOverlay && (
              <Animated.View style={[s.infoOverlay, {
                opacity: overlayAnim,
                transform: [{
                  translateY: overlayAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              }]}>
                <Image
                  source={require('../../assets/velutina_small.jpg')}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={s.overlayDismiss}
                  onPress={() => setShowInfoOverlay(false)}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={15} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {/* ── ZOOM ROW — below viewfinder, in normal flow ── */}
        <View style={s.zoomRow}>
          {ZOOM_LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={level}
              style={[s.zoomPill, zoomIdx === idx && s.zoomPillActive]}
              onPress={() => applyZoom(idx)}
              activeOpacity={0.8}
            >
              <Text style={[s.zoomText, zoomIdx === idx && s.zoomTextActive]}>
                {level % 1 === 0 ? `${level}x` : `${level}x`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── BOTTOM CONTROLS ────────────────────── */}
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.galleryBtn} onPress={openGallery} activeOpacity={0.8}>
            <Feather name="image" size={22} color="rgba(255,255,255,0.85)" />
            <Text style={s.galleryBtnText}>Galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={hasPermission ? takePhoto : handleRequestPermission}
            activeOpacity={0.9}
          >
            <Animated.View style={[s.shutterOuter, { transform: [{ scale: shutterAnim }] }]}>
              <View style={s.shutterInner} />
            </Animated.View>
          </TouchableOpacity>

          <View style={s.galleryBtn} />
        </View>

        {/* Permission overlay */}
        {!hasPermission && !permPending && (
          <View style={s.permOverlay}>
            <Feather name="camera-off" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={s.permText}>Accès caméra requis</Text>
            <TouchableOpacity style={s.permBtn} onPress={handleRequestPermission} activeOpacity={0.85}>
              <Text style={s.permBtnText}>Autoriser</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── ANALYSIS MODE ─────────────────────────────────────────────
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Compact header */}
      <View style={s.compactHeader}>
        <Image source={require('../../assets/logo.jpg')} style={s.compactLogo} />
        <Text style={s.compactTitle}>{BRAND.name}</Text>
        {!isOnline && (
          <View style={s.offlinePillLight}>
            <Text style={s.offlinePillLightText}>Hors-ligne</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {(capturedUri || verdict || error) && (
          <TouchableOpacity onPress={reset} style={s.newBtn} activeOpacity={0.7}>
            <Feather name="rotate-ccw" size={13} color={COLORS.textSecondary} />
            <Text style={s.newBtnText}>Nouvelle photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo preview */}
      {capturedUri && (
        <View style={s.previewWrap}>
          <Image source={{ uri: capturedUri }} style={s.preview} resizeMode="cover" />
        </View>
      )}

      {/* Analyse button */}
      {capturedUri && !verdict && !loading && (
        <TouchableOpacity style={s.analyseBtn} onPress={() => runAnalysis()} activeOpacity={0.88}>
          <Feather name="search" size={18} color="#111" />
          <Text style={s.analyseBtnText}>Analyser cette photo</Text>
        </TouchableOpacity>
      )}

      <AnalysisProgress visible={loading} />

      {/* Error */}
      {error && !loading && (
        <View style={s.errorCard}>
          <Feather name="alert-circle" size={20} color={COLORS.rouge} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.errorTitle}>Erreur d'analyse</Text>
            <Text style={s.errorText}>{error}</Text>
          </View>
          <TouchableOpacity onPress={() => runAnalysis()} style={s.retryBtn} activeOpacity={0.7}>
            <Text style={s.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Verdict */}
      {verdict && !loading && (
        <>
          <VerdictCard
            verdict={verdict}
            onNewAnalysis={reset}
            onSecondPhoto={handleSecondPhoto}
            onContinue={handleContinueWithAnalysis}
          />

          {showGalleryForm && !savedOk && (
            <View style={s.galleryForm}>
              <Text style={s.galleryFormTitle}>Compléter le signalement</Text>
              <Text style={s.galleryLabel}>Date de l'observation</Text>
              <TextInput
                style={s.galleryInput}
                value={galleryDate}
                onChangeText={setGalleryDate}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor={COLORS.textDisabled}
              />
              <Text style={[s.galleryLabel, { marginTop: 12 }]}>Lieu de l'observation</Text>
              <TextInput
                style={s.galleryInput}
                value={galleryCity}
                onChangeText={setGalleryCity}
                placeholder="Ex : Lyon, Bordeaux, 69001…"
                placeholderTextColor={COLORS.textDisabled}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[s.saveBtn, { opacity: saving ? 0.6 : 1 }]}
                onPress={saveGalleryEntry}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#111" size="small" />
                  : <Text style={s.saveBtnText}>Enregistrer le signalement</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {savedOk && (
            <View style={s.savedBanner}>
              <Feather name="check-circle" size={18} color={COLORS.vert} />
              <Text style={s.savedText}>Signalement enregistré</Text>
            </View>
          )}
        </>
      )}

      {verdict && (
        <RetakeGuide
          visible={showRetakeGuide}
          reasonCode={verdict.reason_code}
          onRetake={handleRetake}
          onSkip={() => setShowRetakeGuide(false)}
        />
      )}
    </ScrollView>
  );
}

const CORNER = 26;
const CORNER_W = 3;

const s = StyleSheet.create({
  // ── CAMERA MODE ───────────────────────────────────────────────
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    flexDirection: 'column',
  },
  noCameraFill: { backgroundColor: '#111' },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  offlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.orange,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  offlinePillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  safetyTag: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  safetyTagText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },

  // Viewfinder area (flex:1, centers the frame)
  viewfinderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderFrame: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W,
    borderColor: COLORS.primary,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_W, borderRightWidth: CORNER_W,
    borderColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  centerDot: {
    position: 'absolute',
    top: '50%', left: '50%',
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: -3, marginLeft: -3,
    opacity: 0.7,
  },

  // Info overlay (inside viewfinder frame) — image plein cadre + animation
  infoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  overlayDismiss: {
    position: 'absolute',
    top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },

  // Permission overlay
  permOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  permText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  permBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24, paddingHorizontal: 28, paddingVertical: 14,
  },
  permBtnText: { color: '#111', fontWeight: '700', fontSize: 15 },

  // Zoom — below viewfinder in normal flow
  zoomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  zoomPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  zoomPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  zoomText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  zoomTextActive: { color: '#111', fontWeight: '800' },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 8,
  },
  galleryBtn: {
    width: 56,
    alignItems: 'center',
    gap: 4,
  },
  galleryBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500' },
  shutterOuter: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
  },

  // ── ANALYSIS MODE ─────────────────────────────────────────────
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 100 },

  compactHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, gap: 8,
  },
  compactLogo: { width: 32, height: 32, borderRadius: 8 },
  compactTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  offlinePillLight: {
    backgroundColor: COLORS.orange + '22',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.orange + '55',
  },
  offlinePillLightText: { color: COLORS.orange, fontSize: 11, fontWeight: '600' },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surface, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  newBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },

  previewWrap: { marginBottom: 16 },
  preview: { width: '100%', height: 260, borderRadius: 20 },

  analyseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 17, borderRadius: 32, gap: 10, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  analyseBtnText: { color: '#111', fontWeight: '700', fontSize: 16 },

  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.errorBackground,
    borderRadius: 16, padding: 16, marginTop: 14,
    borderWidth: 1, borderColor: COLORS.rouge + '44',
  },
  errorTitle: { color: COLORS.rouge, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  errorText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  retryBtn: { marginTop: 8 },
  retryText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  galleryForm: {
    backgroundColor: COLORS.surface, borderRadius: 18,
    padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  galleryFormTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 14 },
  galleryLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6, fontWeight: '500' },
  galleryInput: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 12,
    padding: 13, color: COLORS.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 28,
    padding: 16, alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#111', fontWeight: '700', fontSize: 15 },

  savedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 14, padding: 12,
    backgroundColor: COLORS.vert + '14',
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.vert + '44',
  },
  savedText: { color: COLORS.vert, fontWeight: '700', fontSize: 14 },

  // ── HERO ────────────────────────────────────────────────────────
  heroContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroLogo: {
    width: H * 0.22,
    height: H * 0.22,
    borderRadius: 28,
    marginBottom: 28,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  heroAccent: { color: COLORS.primary },
  heroTagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.recoBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.recoBorder,
    marginTop: 8,
  },
  heroBannerText: {
    color: COLORS.orange,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  heroCTA: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    gap: 14,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBtnText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
