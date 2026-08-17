import { useEffect, useRef, useCallback } from 'react';
import { loadQueue, removeFromQueue } from '../services/offlineQueue';
import { getVisionObservation } from '../services/geminiApi';
import { juger } from '../engine/judge';

// Délai entre chaque tentative pour ne pas surcharger l'API
const RETRY_DELAY_MS = 2000;

export function useOfflineSync(isOnline, onSyncComplete) {
  const syncInProgress = useRef(false);
  const prevOnline = useRef(isOnline);

  const syncQueue = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;

    try {
      const queue = await loadQueue();
      if (queue.length === 0) {
        return;
      }

      for (const item of queue) {
        if (!item.base64) {
          // Entrée sans données d'image — on retire de la queue
          await removeFromQueue(item.id);
          continue;
        }

        try {
          const observation = await getVisionObservation(item.base64);
          const verdict = juger(observation);

          // Notifier App.js pour mettre à jour history + storage
          if (onSyncComplete) {
            await onSyncComplete(item.id, verdict);
          }

          await removeFromQueue(item.id);

          // Pause entre chaque appel pour éviter le rate limiting
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        } catch (e) {
          // Garder dans la queue pour la prochaine tentative
          // Ne pas planter toute la sync pour un seul échec
          console.warn(`[OfflineSync] Échec item ${item.id}:`, e.message);
        }
      }
    } catch (e) {
      console.warn('[OfflineSync] Erreur générale:', e.message);
    } finally {
      syncInProgress.current = false;
    }
  }, [onSyncComplete]);

  useEffect(() => {
    const wasOffline = !prevOnline.current;
    const isNowOnline = isOnline;
    prevOnline.current = isOnline;

    if (isNowOnline && wasOffline) {
      // On vient de retrouver la connexion : sync immédiate
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  // Sync au montage si on est déjà online (items restants de sessions précédentes)
  useEffect(() => {
    if (isOnline) {
      // Petit délai pour laisser l'app se charger complètement
      const timer = setTimeout(() => syncQueue(), 3000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { syncQueue };
}
