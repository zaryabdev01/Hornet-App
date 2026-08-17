import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const STEPS = [
  { label: "Préparation de l'image", duration: 400 },
  { label: 'Envoi au modèle vision', duration: 800 },
  { label: 'Analyse des observations', duration: 6000 },
  { label: 'Vérification du protocole', duration: 1200 },
  { label: 'Calcul du verdict', duration: 600 },
  { label: 'Finalisation', duration: 400 },
];

export default function AnalysisProgress({ visible }) {
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepTimers = useRef([]);

  useEffect(() => {
    if (!visible) {
      stepTimers.current.forEach(clearTimeout);
      stepTimers.current = [];
      setCurrentStep(0);
      progressAnim.setValue(0);
      return;
    }

    let delay = 0;
    STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i);
        Animated.timing(progressAnim, {
          toValue: (i + 1) / STEPS.length,
          duration: step.duration * 0.8,
          useNativeDriver: false,
        }).start();
      }, delay);
      stepTimers.current.push(timer);
      delay += step.duration;
    });

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => {
      stepTimers.current.forEach(clearTimeout);
      pulse.stop();
    };
  }, [visible]);

  if (!visible) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.container}>
      <Animated.View style={[s.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={s.icon}>🔬</Text>
      </Animated.View>

      <Text style={s.title}>Analyse en cours…</Text>
      <Text style={s.protocol}>Protocole BEEALERT CORE V13.5</Text>

      <View style={s.progressBar}>
        <Animated.View style={[s.progressFill, { width: progressWidth }]} />
      </View>

      <View style={s.steps}>
        {STEPS.map((step, i) => (
          <View key={i} style={s.stepRow}>
            <View style={[
              s.stepDot,
              i < currentStep && s.stepDotDone,
              i === currentStep && s.stepDotActive,
            ]} />
            <Text style={[
              s.stepLabel,
              i < currentStep && s.stepLabelDone,
              i === currentStep && s.stepLabelActive,
            ]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: { marginBottom: 14 },
  icon: { fontSize: 38 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  protocol: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  steps: { width: '100%', gap: 7 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 10,
    height: 10,
  },
  stepDotDone: {
    backgroundColor: COLORS.vert,
  },
  stepLabel: {
    color: COLORS.textDisabled,
    fontSize: 12,
  },
  stepLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  stepLabelDone: {
    color: COLORS.textMuted,
  },
});
