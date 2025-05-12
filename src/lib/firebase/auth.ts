
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User,
    type Auth
  } from 'firebase/auth';
  import { app, auth as initializedAuth } from './config'; // Import initialized auth instance

  // Export the initialized auth instance directly
  export const auth: Auth | null = initializedAuth;

  // You can keep specific functions here if needed, but ensure they use the imported 'auth'

  export const googleProvider = new GoogleAuthProvider();

  export const handleRedirectResult = async () => {
    if (!auth) {
        console.error("Auth not initialized");
        return null;
    }
    try {
      const result = await getRedirectResult(auth);
      return result?.user || null;
    } catch (error) {
      console.error('Error processing redirect result:', error);
      return null;
    }
  };

  export const signInWithGooglePopup = async () => {
    if (!auth) {
        console.error("Auth not initialized");
        throw new Error("Authentication service is unavailable.");
    }
    return signInWithPopup(auth, googleProvider);
  };

  export const signInWithGoogleRedirect = async () => {
      if (!auth) {
          console.error("Auth not initialized");
          throw new Error("Authentication service is unavailable.");
      }
      return signInWithRedirect(auth, googleProvider);
  };

  export const handleEmailPasswordSignIn = async (email: string, password: string) => {
    if (!auth) {
        console.error("Auth not initialized");
        throw new Error("Authentication service is unavailable.");
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  export const handleEmailPasswordSignUp = async (email: string, password: string) => {
      if (!auth) {
          console.error("Auth not initialized");
          throw new Error("Authentication service is unavailable.");
      }
      return createUserWithEmailAndPassword(auth, email, password);
  };

  export const signOut = async () => {
    if (!auth) {
        console.error("Auth not initialized");
        return false; // Indicate failure
    }
    try {
      await firebaseSignOut(auth);
      return true; // Indicate success
    } catch (error) {
      console.error("Sign out error:", error);
      return false; // Indicate failure
    }
  };

  // You might not need useAuthState and useSignOut here if they are used in AuthContext
  // Exporting types if needed elsewhere
  export type { User };

    