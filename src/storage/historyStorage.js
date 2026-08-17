import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@apisave_history_v1';
const MAX_HISTORY = 100;

export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveToHistory(entry) {
  try {
    const current = await loadHistory();
    const updated = [entry, ...current].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export async function updateHistoryEntry(id, patch) {
  try {
    const current = await loadHistory();
    const updated = current.map(e => e.id === id ? { ...e, ...patch } : e);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
