// Spec:
//   - docs/spec/schema/skill.md
//   - docs/spec/rules/loop-5-level-up.md
//

/**
 * Bridges the in-memory skills store with Firestore.
 *
 * Flow:
 *   1. On user login: pull SkillState from Firestore → setSkillsState (local store).
 *      If no Firestore doc exists yet, write the current local state once so the
 *      doc exists and rules can target it.
 *   2. On every local-store change: debounce-write to Firestore.
 *
 * Mounted inside <AuthProvider>; renders nothing.
 *
 * No screen code changes — `useSkillsState()` keeps working.
 */
import { useEffect, useRef } from 'react';
import {
  getSkillsState,
  setSkillsState,
  useSkillsState,
} from '../data/mockSkills';
import { loadSkillsState, saveSkillsState } from '../firebase/skillsRepo';
import { useAuth } from './AuthContext';

const WRITE_DEBOUNCE_MS = 500;

export function SkillsBridge() {
  const { user, status } = useAuth();
  const skills = useSkillsState();
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
        const remote = await loadSkillsState(user.uid);
        if (remote) {
          // Don't echo the hydration back to Firestore.
          skipNextWrite.current = true;
          setSkillsState(remote);
        } else {
          // First-time user: persist the current local state once.
          await saveSkillsState(user.uid, getSkillsState());
        }
      } catch (err) {
        console.warn('[skills] hydrate failed', err);
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
      saveSkillsState(user.uid, skills).catch((err) =>
        console.warn('[skills] save failed', err),
      );
    }, WRITE_DEBOUNCE_MS);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [skills, user, status]);

  // Reset hydration marker on sign-out so the next user re-hydrates.
  useEffect(() => {
    if (status === 'signed-out') {
      hydratedForUid.current = null;
    }
  }, [status]);

  return null;
}
