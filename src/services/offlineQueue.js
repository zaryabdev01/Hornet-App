// File d'attente hors-ligne
// Stocke les signalements en attente de traitement réseau

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@apisave_offline_queue_v1';

export async function loadQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToQueue(item) {
  try {
    const queue = await loadQueue();
    const updated = [...queue, { ...item, queued_at: new Date().toISOString() }];
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export async function removeFromQueue(id) {
  try {
    const queue = await loadQueue();
    const updated = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export async function clearQueue() {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return true;
  } catch {
    return false;
  }
}
