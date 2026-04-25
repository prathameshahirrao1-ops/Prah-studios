/**
 * Auth state provider — single source of truth for "who's logged in".
 *
 * Wraps the app and exposes:
 *   - user: the Firebase User (or null when signed out)
 *   - profile: the Firestore profile doc (or null if not yet created)
 *   - status: 'loading' | 'signed-out' | 'needs-profile' | 'ready'
 *
 * Path A (self-serve) and Path B (concierge) both flow through here.
 * Concierge accounts are pre-seeded in Firestore so on first login
 * status jumps straight to 'ready'. Self-serve accounts hit
 * 'needs-profile' and the navigator routes them to ProfileSetup.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuthClient, getDb, isFirebaseConfigured } from '../firebase/config';

export type StudentProfile = {
  uid: string;
  childName: string;
  age: number;
  parentName: string;
  parentEmail: string;
  createdAt?: any;
};

type AuthStatus = 'loading' | 'signed-out' | 'needs-profile' | 'ready';

type AuthContextShape = {
  user: User | null;
  profile: StudentProfile | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveProfile: (data: Omit<StudentProfile, 'uid' | 'parentEmail' | 'createdAt'>) => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // If Firebase isn't configured (dev preview, no env), stay signed-out.
    // The DEV_SKIP_ONBOARDING flag in RootNavigator still works.
    if (!isFirebaseConfigured()) {
      setStatus('signed-out');
      return;
    }

    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (!fbUser) {
        setProfile(null);
        setStatus('signed-out');
        return;
      }
      // Check Firestore for profile doc.
      try {
        const snap = await getDoc(doc(getDb(), 'students', fbUser.uid));
        if (snap.exists()) {
          setProfile({ uid: fbUser.uid, ...(snap.data() as Omit<StudentProfile, 'uid'>) });
          setStatus('ready');
        } else {
          setProfile(null);
          setStatus('needs-profile');
        }
      } catch (err) {
        console.warn('[auth] failed to load profile', err);
        setProfile(null);
        setStatus('needs-profile');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getAuthClient(), email.trim(), password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(getAuthClient(), email.trim(), password);
  };

  const signOut = async () => {
    await fbSignOut(getAuthClient());
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(getAuthClient(), email.trim());
  };

  const saveProfile: AuthContextShape['saveProfile'] = async (data) => {
    if (!user) throw new Error('not-signed-in');
    const payload: StudentProfile = {
      uid: user.uid,
      parentEmail: user.email ?? '',
      ...data,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(getDb(), 'students', user.uid), payload, { merge: true });
    setProfile(payload);
    setStatus('ready');
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, status, signIn, signUp, signOut, resetPassword, saveProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextShape {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
