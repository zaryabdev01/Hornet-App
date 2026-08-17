import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from './src/constants/colors';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useOfflineSync } from './src/hooks/useOfflineSync';
import { loadHistory, saveToHistory, updateHistoryEntry } from './src/storage/historyStorage';
import { uploadReport } from './src/services/reportingService';

import Navigation from './src/components/Navigation';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import InfoScreen from './src/screens/InfoScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LegalScreen from './src/screens/LegalScreen';

const ONBOARDING_KEY = '@apisave_onboarding_done';
const LEGAL_KEY = '@apisave_legal_accepted';

export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

function App() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('HOME');
  const [history, setHistory] = useState([]);
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    async function init() {
      try {
        const [onboardingDone, legalAccepted] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(LEGAL_KEY),
        ]);

        if (!onboardingDone) {
          setShowOnboarding(true);
        } else if (!legalAccepted) {
          setShowLegal(true);
        } else {
          setAppReady(true);
        }
      } catch {
        setShowOnboarding(true);
      }

      loadHistory().then(h => {
        if (h && h.length > 0) setHistory(h);
      }).catch(() => {});
    }
    init();
  }, []);

  const handleOnboardingDone = useCallback(async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, '1');
      const legalAccepted = await AsyncStorage.getItem(LEGAL_KEY);
      if (!legalAccepted) setShowLegal(true);
      else setAppReady(true);
    } catch {
      setShowLegal(true);
    }
  }, []);

  const handleLegalAccept = useCallback(async () => {
    setShowLegal(false);
    setAppReady(true);
    try {
      await AsyncStorage.setItem(LEGAL_KEY, '1');
    } catch {}
  }, []);

  const handleLegalRefuse = useCallback(() => {
    Alert.alert(
      'Application fermée',
      'Vous devez accepter les conditions pour utiliser ApiSave.',
      [{ text: 'OK', onPress: () => BackHandler.exitApp() }]
    );
  }, []);

  const handleSave = useCallback(async (entry, base64 = null) => {
    const updated = await saveToHistory(entry);
    if (updated) {
      setHistory(updated);
    } else {
      setHistory(prev => [entry, ...prev].slice(0, 100));
    }

    if (base64 && !entry.offline && entry.verdict_code !== 'PENDING' && entry.location) {
      uploadReport(entry, base64).then(supabaseId => {
        if (supabaseId) updateHistoryEntry(entry.id, { supabase_id: supabaseId });
      }).catch(() => {});
    }
  }, []);

  const handleSyncComplete = useCallback(async (id, verdict) => {
    await updateHistoryEntry(id, {
      verdict_code: verdict.verdict_code,
      confiance: verdict.confiance,
      reason_code: verdict.reason_code,
      action_recommandee: verdict.action_recommandee,
      motif_principal: verdict.motif_principal,
      synchronized: true,
      offline: false,
    });
    setHistory(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, ...verdict, synchronized: true, offline: false }
          : e
      )
    );
  }, []);

  useOfflineSync(isOnline, handleSyncComplete);

  const offlineCount = history.filter(e => e.offline || e.verdict_code === 'PENDING').length;

  // ── First-launch flows ─────────────────────────────────────────
  if (showOnboarding) {
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  if (showLegal) {
    return <LegalScreen onAccept={handleLegalAccept} onRefuse={handleLegalRefuse} />;
  }

  if (!appReady) {
    return (
      <View style={s.splash}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  // ── Main app ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <View style={[s.screen, activeTab === 'HOME' ? s.visible : s.hidden]}>
        <HomeScreen onSave={handleSave} isOnline={isOnline} />
      </View>
      <View style={[s.screen, activeTab === 'MAP' ? s.visible : s.hidden]}>
        <MapScreen history={history} />
      </View>
      <View style={[s.screen, activeTab === 'HISTORY' ? s.visible : s.hidden]}>
        <HistoryScreen history={history} />
      </View>
      <View style={[s.screen, activeTab === 'INFO' ? s.visible : s.hidden]}>
        <InfoScreen />
      </View>

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        offlineCount={offlineCount}
      />

      {insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: COLORS.surface }} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: { flex: 1 },
  visible: { display: 'flex' },
  hidden: { display: 'none' },
});
