
import {
  getAuth as firebaseGetAuth,
  signInWithPopup as firebaseSignInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import { getFirebaseApp } from './config'; // Use the getter

let authInternal: Auth | null = null;
const app = getFirebaseApp(); // This might be null

let googleProviderInstance: GoogleAuthProvider | null = null;

if (app) {
  try {
    authInternal = firebaseGetAuth(app);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (error) {
    console.error("Error initializing Firebase Auth components:", error);
    // authInternal and googleProviderInstance will remain null
  }
} else {
  const message = "Firebase app instance is not available. Firebase Auth features will be disabled.";
  if (typeof window !== 'undefined') {
    console.warn(message);
  } else {
    // console.warn(`[SSR] ${message}`); // SSR logging can be noisy; primary warning from config.ts
  }
}

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!authInternal || !googleProviderInstance) {
    console.error('Firebase Auth or Google Provider is not initialized. Cannot sign in.');
    return null;
  }
  try {
    const result = await firebaseSignInWithPopup(authInternal, googleProviderInstance);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!authInternal) {
    console.error('Firebase Auth is not initialized. Cannot sign out.');
    return;
  }
  try {
    await firebaseSignOut(authInternal);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthUserStateChanged = (callback: (user: User | null) => void): (() => void) => {
  if (!authInternal) {
    // console.warn('Firebase Auth is not initialized. Cannot subscribe to auth state changes.');
    // Immediately call callback with null and return a no-op unsubscribe function
    // This ensures loading state in AuthContext resolves.
    Promise.resolve().then(() => callback(null));
    return () => {};
  }
  try {
    return firebaseOnAuthStateChanged(authInternal, callback);
  } catch (error) {
    console.error('Error subscribing to auth state changes:', error);
    Promise.resolve().then(() => callback(null));
    return () => {};
  }
};

export type { User };
