/**
 * Bridges the in-memory streaks store with Firestore.
 *
 * Same pattern as SkillsBridge:
 *   1. On user login: pull StreakData from Firestore → setStreaksData (local store).
 *      If no Firestore doc exists yet, write the current local state once.
 *   2. On every local-store change: debounce-write to Firestore.
 *
 * Mounted inside <AuthProvider>; renders nothing.
 */
import { useEffect, useRef } from 'react';
import {
  getStreaksData,
  setStreaksData,
  useStreaksData,
} from '../data/mockStreaks';
import { loadStreaksData, saveStreaksData } from '../firebase/streaksRepo';
import { useAuth } from './AuthContext';

const WRITE_DEBOUNCE_MS = 500;

export function StreaksBridge() {
  const { user, status } = useAuth();
  const streaks = useStreaksData();
  const hydratedForUid = useRef<string | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextWrite = useRef(false);

  // 1. Hydrate from Firestore on login (or on uid change).
  useEffect(() => {
    if (!user || status !== 'ready') return;
    if (hydratedForUid.current === user.uid) return;
    hydratedForUid.current = user.uid;

    (async () => {
      try {
        const remote = await loadStreaksData(user.uid);
        if (remote) {
          // Don't echo the hydration back to Firestore.
          skipNextWrite.current = true;
          setStreaksData(remote);
        } else {
          // First-time user: persist the current local state once.
          await saveStreaksData(user.uid, getStreaksData());
        }
      } catch (err) {
        console.warn('[streaks] hydrate failed', err);
      }
    })();
  }, [user, status]);

  // 2. Push local changes to Firestore (debounced).
  useEffect(() => {
    if (!user || status !== 'ready') return;
    if (hydratedForUid.current !== user.uid) return; // wait until hydrated
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      saveStreaksData(user.uid, streaks).catch((err) =>
        console.warn('[streaks] save failed', err),
      );
    }, WRITE_DEBOUNCE_MS);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [streaks, user, status]);

  // Reset hydration marker on sign-out so the next user re-hydrates.
  useEffect(() => {
    if (status === 'signed-out') {
      hydratedForUid.current = null;
    }
  }, [status]);

  return null;
}
