// Spec:
//   - docs/spec/schema/streak.md
//

/**
 * Streaks repository — reads/writes the per-student StreakData to Firestore.
 *
 * Path: students/{uid}/streaks/current  (single doc; we overwrite it on every change)
 *
 * Same shape as skillsRepo: small doc, O(1) reads, debounced writes from the
 * bridge. Badges array lives inside the doc for now.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from './config';
import type { StreakData } from '../data/mockStreaks';

const SUB_DOC_ID = 'current';
const SUB_COLLECTION = 'streaks';

function streaksRef(uid: string) {
  return doc(getDb(), 'students', uid, SUB_COLLECTION, SUB_DOC_ID);
}

export async function loadStreaksData(uid: string): Promise<StreakData | null> {
  const snap = await getDoc(streaksRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as StreakData;
}

export async function saveStreaksData(uid: string, data: StreakData): Promise<void> {
  await setDoc(streaksRef(uid), data);
}
