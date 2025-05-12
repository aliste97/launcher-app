
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useEffect, useState, useContext } from 'react'; // Added React import
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth, firebaseInitializationError } from '@/lib/firebase/config'; // Import auth and error status

// Interface for Auth Context Type
interface AuthContextType {
  user: User | null | undefined;
  email: string;
  password: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  isLoginMode: boolean;
  setIsLoginMode: Dispatch<SetStateAction<boolean>>;
  loading: boolean; // Combined loading state
  error: Error | undefined | string | null; // Combined error state (can be string for init error)
  signInError: string | null;
  handleAuthentication: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<boolean>;
  loadingSignIn: boolean;
  loadingSignOut: boolean;
  errorSignOut: Error | undefined;
  isFirebaseInitialized: boolean; // Flag to indicate successful initialization
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Create Auth Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isFirebaseInitialized = !firebaseInitializationError && !!auth; // Check if Firebase initialized correctly

  // Use useAuthState hook - pass auth only if initialized
  const [user, loadingAuthState, errorAuthState] = useAuthState(isFirebaseInitialized ? auth : undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Use useSignOut hook - pass auth only if initialized
  const [signOut, loadingSignOut, errorSignOut] = useSignOut(isFirebaseInitialized ? auth : undefined);
  const router = useRouter();

  const [loadingSignIn, setLoadingSignIn] = useState(false); // For explicit sign-in actions
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Effect to handle redirect result for Google Sign-In
  useEffect(() => {
    if (!isFirebaseInitialized || !auth) return; // Don't proceed if auth is not initialized

    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth); // Use the imported auth instance
        if (result?.user) {
          // user state will be updated by useAuthState
          router.push('/'); // Redirect on success
        }
      } catch (error: any) {
        console.error('Error processing redirect result:', error);
        setSignInError(`Redirect sign-in failed: ${error.message}`);
      }
    };
    processRedirectResult();
  }, [isFirebaseInitialized, router, auth]); // Added auth to dependency array

  // Handle Email/Password Sign In or Sign Up
  const handleAuthentication = async () => {
    if (!isFirebaseInitialized || !auth) {
      setSignInError("Authentication service is not available.");
      return;
    }
    setSignInError(null);
    setLoadingSignIn(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/'); // Redirect on success
    } catch (err: any) {
      console.error("Authentication error:", err);
      setSignInError(err.message || 'Failed to authenticate');
    } finally {
      setLoadingSignIn(false);
    }
  };

  // Handle Google Sign In
  const signInWithGoogle = async () => {
    if (!isFirebaseInitialized || !auth) {
      setSignInError("Authentication service is not available.");
      return;
    }
    setLoadingSignIn(true);
    setSignInError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // user state will be updated by useAuthState
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked or cancelled, trying redirect...');
        try {
          await signInWithRedirect(auth, googleProvider);
          // Redirect happens, page will reload
        } catch (redirectError: any) {
           console.error('Google Sign-In redirect error:', redirectError);
           setSignInError(`Sign-in failed: ${redirectError.message}`);
           setLoadingSignIn(false); // Ensure loading stops on redirect error
        }
      } else {
        console.error('Google Sign-In error:', err);
        setSignInError(err.message || 'Google Sign-In failed');
        setLoadingSignIn(false); // Ensure loading stops on popup error
      }
    }
    // setLoadingSignIn(false); // Removed from here as redirect might happen
  };

  // Handle Sign Out
  const signOutUser = async (): Promise<boolean> => {
    if (!isFirebaseInitialized || !auth) {
      console.error("Authentication service is not available. Cannot sign out.");
      return false;
    }
    try {
      const success = await signOut();
      if (success) {
        router.push('/login'); // Redirect to login after sign out
        return true;
      }
      return false;
    } catch (e: any) {
      console.error("Error during sign out:", e);
      return false;
    }
  };

  // Combine loading states
  const loading = loadingAuthState || loadingSignIn || loadingSignOut;
  // Combine error states
  const error = firebaseInitializationError || errorAuthState || errorSignOut || signInError;


  const value: AuthContextType = {
    user: isFirebaseInitialized ? user ?? null : null, // Provide user only if initialized
    email,
    password,
    setEmail,
    setPassword,
    isLoginMode,
    setIsLoginMode,
    loading,
    error: error ?? undefined, // Ensure error is undefined if null/empty string
    signInError,
    handleAuthentication,
    signInWithGoogle,
    signOutUser,
    loadingSignIn, // Keep separate if needed for specific UI elements
    loadingSignOut, // Keep separate if needed
    errorSignOut,
    isFirebaseInitialized
  };

  // Render children within the provider
  // Optionally display a global error message if Firebase failed to initialize
  return (
      <AuthContext.Provider value={value}>
        {firebaseInitializationError && (
           <div style={{ background: 'red', color: 'white', padding: '10px', textAlign: 'center', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
                Firebase Initialization Failed: {firebaseInitializationError} Please check console and environment variables.
           </div>
         )}
        {children}
      </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    