import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'watch',
    type: 'image',
    image: require('../../assets/velutina_small.jpg'),
    tint: 'rgba(0,0,0,0.30)',
    title: 'Chaque signalement\ncompte.',
    text: 'Le frelon asiatique est une espèce invasive qui menace nos abeilles. Ensemble, cartographions sa progression pour mieux le combattre.',
    btnLabel: 'Continuer',
  },
  {
    key: 'scan',
    type: 'camera',
    tint: 'rgba(0,0,0,0)',
    title: 'Identifiez en\nquelques secondes',
    text: 'Photographiez l\'insecte ou le nid. Notre IA analyse la morphologie et retourne un verdict immédiat avec un indice de confiance.',
    btnLabel: 'Suivant',
  },
  {
    key: 'map',
    type: 'map',
    mapRegion: { latitude: 44.8, longitude: 0.6, latitudeDelta: 3.5, longitudeDelta: 3.5 },
    tint: 'rgba(255,255,255,0.12)',
    title: 'Surveillez\nvotre environnement',
    text: 'Chaque observation est géolocalisée et partagée. Suivez l\'activité des frelons autour de vous et recevez des alertes de votre zone.',
    btnLabel: 'Compris',
  },
  {
    key: 'community',
    type: 'abstract',
    tint: 'rgba(0,0,0,0)',
    title: 'Agissez pour\nla biodiversité',
    text: 'Vos signalements aident les apiculteurs, les chercheurs et les autorités à intervenir. Un geste simple, un impact environnemental réel.',
    btnLabel: 'Commencer',
  },
];

// ── Scan animation slide ─────────────────────────────────────────
function CameraSlide() {
  const lineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const lineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(lineAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 900, useNativeDriver: true }),
      ])
    );
    lineLoop.start();
    pulseLoop.start();
    return () => { lineLoop.stop(); pulseLoop.stop(); };
  }, []);

  const FRAME = W * 0.62;
  const C = 24;
  const lineTranslate = lineAnim.interpolate({ inputRange: [0, 1], outputRange: [-FRAME / 2 + 16, FRAME / 2 - 16] });

  return (
    <View style={[cs.container, { backgroundColor: '#0d1117' }]}>
      {/* Grid lines */}
      <View style={cs.grid} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[cs.gridLine, { top: `${(i + 1) * 14}%` }]} />
        ))}
      </View>

      <Animated.View style={[cs.frame, { width: FRAME, height: FRAME, transform: [{ scale: pulseAnim }] }]}>
        {/* Corners */}
        <View style={[cs.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }]} />
        <View style={[cs.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }]} />
        <View style={[cs.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }]} />
        <View style={[cs.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }]} />

        {/* Insect inside frame */}
        <Image
          source={require('../../assets/velutina_small.jpg')}
          style={{ width: '100%', height: '100%', opacity: 0.85 }}
          resizeMode="cover"
        />

        {/* Scan line */}
        <Animated.View style={[cs.scanLine, { transform: [{ translateY: lineTranslate }] }]} />

        {/* Center crosshair */}
        <View style={cs.crossH} />
        <View style={cs.crossV} />
      </Animated.View>

      {/* Result badge */}
      <View style={cs.resultBadge}>
        <View style={[cs.badgeDot, { backgroundColor: COLORS.vert }]} />
        <Text style={cs.badgeText}>BEEALERT · Analyse terminée</Text>
      </View>
    </View>
  );
}

// ── Abstract community slide ──────────────────────────────────────
function AbstractSlide() {
  const fadeAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    fadeAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 1200 + i * 200, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 1200 + i * 200, useNativeDriver: true }),
          ])
        ).start();
      }, i * 300);
    });
  }, []);

  const pins = [
    { top: '15%', left: '20%', size: 48, color: COLORS.rouge },
    { top: '22%', left: '62%', size: 36, color: COLORS.orange },
    { top: '38%', left: '10%', size: 30, color: COLORS.rouge },
    { top: '32%', left: '74%', size: 42, color: COLORS.orange },
    { top: '50%', left: '44%', size: 34, color: COLORS.vert },
  ];

  return (
    <View style={[as.container, { backgroundColor: '#10261c' }]}>
      {/* Soft radial glow */}
      <View style={as.glow} />

      {/* Animated pins */}
      {pins.map((pin, i) => (
        <Animated.View
          key={i}
          style={[as.pin, {
            top: pin.top, left: pin.left,
            width: pin.size, height: pin.size, borderRadius: pin.size / 2,
            backgroundColor: pin.color + '28',
            borderColor: pin.color + '70',
            opacity: fadeAnims[i],
          }]}
        >
          <Feather name="map-pin" size={pin.size * 0.42} color={pin.color} />
        </Animated.View>
      ))}

      {/* Central shield */}
      <View style={as.shield}>
        <Image source={require('../../assets/logo-icon.jpg')} style={as.shieldLogo} resizeMode="cover" />
        <View style={as.shieldCount}>
          <Text style={as.countNum}>+18 000</Text>
          <Text style={as.countLabel}>signalements</Text>
        </View>
      </View>
    </View>
  );
}

// ── Progress dots ─────────────────────────────────────────────────
function Dots({ total, current }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === current && s.dotActive]} />
      ))}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[step];

  const goNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      if (step < SLIDES.length - 1) setStep(step + 1);
      else onDone();
    }, 150);
  };

  return (
    <View style={s.container}>
      {/* ── ILLUSTRATION AREA — flex:1, clipped ── */}
      <Animated.View style={[s.illustrationArea, { opacity: fadeAnim }]}>
        {slide.type === 'image' && (
          <Image source={slide.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        )}
        {slide.type === 'camera' && <CameraSlide />}
        {slide.type === 'map' && (
          <>
            <MapView
              style={StyleSheet.absoluteFillObject}
              region={slide.mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              pointerEvents="none"
            />
            <View style={s.mapPins} pointerEvents="none">
              {[
                { lat: 44.84, lng: 0.57 }, { lat: 45.20, lng: -0.90 },
                { lat: 43.60, lng: 1.44 }, { lat: 44.50, lng: 2.20 },
              ].map((p, i) => (
                <View key={i} style={[s.mapPin, { backgroundColor: i === 0 ? COLORS.rouge : COLORS.orange }]}>
                  <Feather name="map-pin" size={10} color="#fff" />
                </View>
              ))}
            </View>
          </>
        )}
        {slide.type === 'abstract' && <AbstractSlide />}

        {/* Tint overlay */}
        {slide.tint !== 'rgba(0,0,0,0)' && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: slide.tint }]} />
        )}
      </Animated.View>

      {/* ── BOTTOM CARD — flow normal, zéro shadow band ── */}
      <Animated.View style={[s.card, { opacity: fadeAnim }]}>
        <Dots total={SLIDES.length} current={step} />
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.text}>{slide.text}</Text>

        <TouchableOpacity style={s.btn} onPress={goNext} activeOpacity={0.85}>
          <Text style={s.btnText}>{slide.btnLabel}</Text>
          <Feather name="arrow-right" size={16} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDone} style={s.skipBtn} activeOpacity={0.7}>
          <Text style={s.skipText}>Passer</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  illustrationArea: { flex: 1, overflow: 'hidden' },

  mapPins: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  mapPin: {
    position: 'absolute',
    top: '30%', left: '40%',
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 44,
    elevation: 0,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 28, borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  title: {
    fontSize: 28, fontWeight: '800', color: '#1a1a1a',
    lineHeight: 35, marginBottom: 10,
  },
  text: {
    fontSize: 14, lineHeight: 22, color: COLORS.textSecondary,
    marginBottom: 28,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary,
    borderRadius: 28, paddingVertical: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: '#111', fontSize: 16, fontWeight: '700' },

  skipBtn: { paddingVertical: 8, alignItems: 'center' },
  skipText: { color: COLORS.textMuted, fontSize: 14 },
});

// Camera slide styles
const FRAME_SIZE = W * 0.62;
const cs = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { ...StyleSheet.absoluteFillObject },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  frame: {
    overflow: 'hidden',
    borderRadius: 4,
    position: 'relative',
    backgroundColor: '#1a1a2e',
  },
  corner: {
    position: 'absolute', width: 24, height: 24,
    borderColor: COLORS.primary,
  },
  scanLine: {
    position: 'absolute', left: 16, right: 16, height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    top: '50%',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  crossH: {
    position: 'absolute', top: '50%', left: '50%',
    width: 16, height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: -8, marginTop: -1,
  },
  crossV: {
    position: 'absolute', top: '50%', left: '50%',
    width: 2, height: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: -8, marginLeft: -1,
  },
  resultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginTop: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
});

// Abstract slide styles
const as = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: W * 0.8, height: W * 0.8,
    borderRadius: W * 0.4,
    backgroundColor: COLORS.primary + '18',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  shield: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  shieldLogo: {
    width: 64, height: 64, borderRadius: 16, marginBottom: 12,
  },
  shieldCount: { alignItems: 'center' },
  countNum: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
  countLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },
});
