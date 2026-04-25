/**
 * Skills repository — reads/writes the per-student SkillState to Firestore.
 *
 * Path: students/{uid}/skillState/current  (single doc; we overwrite it on every change)
 *
 * Why a single doc and not a sub-collection of entries?
 *  - SkillState is small (≤ a few KB even after years of points history).
 *  - Reads are O(1). Writes are debounced from the bridge.
 *  - History entries live inside the doc as an array — same as the in-memory shape.
 *  - If history grows past 1MB we move entries to a sub-collection (months away).
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from './config';
import type { SkillState } from '../data/mockSkills';

const SUB_DOC_ID = 'current';
const SUB_COLLECTION = 'skillState';

function skillStateRef(uid: string) {
  return doc(getDb(), 'students', uid, SUB_COLLECTION, SUB_DOC_ID);
}

export async function loadSkillsState(uid: string): Promise<SkillState | null> {
  const snap = await getDoc(skillStateRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as SkillState;
}

export async function saveSkillsState(uid: string, state: SkillState): Promise<void> {
  await setDoc(skillStateRef(uid), state);
}
