/**
 * Firebase app + Firestore initialisation.
 *
 * Config comes from env vars prefixed with EXPO_PUBLIC_ so Expo exposes
 * them to the client bundle. Set them in `.env.local` (not committed):
 *
 *   EXPO_PUBLIC_FIREBASE_API_KEY=...
 *   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
 *   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
 *   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
 *   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *   EXPO_PUBLIC_FIREBASE_APP_ID=...
 *
 * Until the config is present we still export the app/db handles — they
 * just fail to connect. Callers can guard with `isFirebaseConfigured()`
 * so the app keeps running on mocks when env is missing (dev convenience).
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(firebaseConfig as any);
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

let _auth: Auth | null = null;

/**
 * Firebase Auth handle. On web, persistence to localStorage is automatic,
 * so users stay logged in across reloads. For native (later) we'll need to
 * swap to `initializeAuth` + AsyncStorage persistence.
 */
export function getAuthClient(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

/**
 * The single student we're working with in Pass 1 (pre-auth).
 * Every read/write path passes through this constant. When auth lands,
 * replace this with the logged-in uid and the storage layer stays the same.
 */
export const CURRENT_STUDENT_ID = 'stu_001';
