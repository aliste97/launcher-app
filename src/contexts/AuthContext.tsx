"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useEffect, useState, useContext } // Added useContext
  from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  // signOut as firebaseSignOut // No longer needed if using useSignOut hook
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
// Import useAuthState from react-firebase-hooks
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { app } from '@/lib/firebaseConfig'; // Firebase config

interface AuthContextType {
  user: User | null | undefined; // User can be undefined during initial load
  email: string;
  password: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  isLoginMode: boolean,
  setIsLoginMode: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  error: Error | undefined; // Error from useAuthState
  handleAuthentication: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<boolean>; // Returns true on success
  loadingSignIn: boolean; // Specific loading state for sign-in process
  loadingSignOut: boolean; // From useSignOut
  errorSignOut: Error | undefined; // From useSignOut
}

// Initialize Firebase Auth - ensure 'app' is correctly initialized
// This can throw if 'app' is null/undefined (e.g., env vars missing for firebaseConfig)
let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.error("Failed to initialize Firebase Auth. 'app' might be null or Firebase config is missing/invalid.", e);
  // Handle this case gracefully, perhaps by setting a global error state or disabling auth features
}

const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use useAuthState to manage user, loading, and error states
  // Pass authInstance only if it's defined
  const [user, loadingAuthState, errorAuthState] = useAuthState(authInstance);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signOut, loadingSignOut, errorSignOut] = useSignOut(authInstance);
  const router = useRouter();

  const [loadingSignIn, setLoadingSignIn] = useState(false); // For Google Sign-In process
  const [signInError, setSignInError] = useState<string | null>(null); // For Google Sign-In errors
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Effect to handle redirect result for Google Sign-In
  useEffect(() => {
    if (!authInstance) return; // Don't proceed if auth is not initialized

    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(authInstance);
        if (result && result.user) {
          console.log('Google Sign-In (Redirect) successful:', result.user);
          // user state will be updated by useAuthState, no need to setUser here
          router.push('/'); // Redirect to home page on success
        }
        // If no redirect result, useAuthState will handle the current user state
      } catch (error: any) {
        console.error('Error processing redirect result:', error);
        setSignInError(error.message);
      }
    };

    processRedirectResult();
  }, [router]); // Removed authInstance from deps as it should be stable or handled by outer try-catch

  const handleAuthentication = async () => {
    try {
      setSignInError(null); // Clear previous errors

      console.log ("isLoginMode", isLoginMode)
      let result;
      if (isLoginMode) {
        result = await signInWithEmailAndPassword(authInstance, email, password);
      } else {
        result = await createUserWithEmailAndPassword(authInstance, email, password);
      }

      console.log('handleAuthentication successful:', result.user);
      router.push('/'); // Redirect to home page on success
    } catch (err: any) {
      console.log ("err", err)
      setSignInError(err.message);
    }
  };

  const signInWithGoogle = async () => {
    if (!authInstance) {
      console.error("Firebase Auth is not initialized. Cannot sign in.");
      setSignInError("Authentication service is unavailable.");
      return;
    }
    setLoadingSignIn(true);
    setSignInError(null);
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      console.log('Google Sign-In (Popup) successful:', result.user);
      // user state will be updated by useAuthState
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked or cancelled, trying redirect...');
        await signInWithRedirect(authInstance, googleProvider);
        // Redirect happens, so no further client-side action here until page reloads
      } else {
        console.error('Google Sign-In error:', err);
        setSignInError(err.message);
      }
    } finally {
      setLoadingSignIn(false);
    }
  };

  const signOutUser = async (): Promise<boolean> => {
    if (!authInstance) {
      console.error("Firebase Auth is not initialized. Cannot sign out.");
      return false;
    }
    try {
      const success = await signOut(); // Call the signOut function from useSignOut hook
      if (success) {
        console.log('User signed out successfully.');
        router.push('/login'); // Redirect to login after sign out
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error during sign out:", e);
      return false;
    }
  };

  // The main `loading` state is now `loadingAuthState` from `useAuthState`
  // It will be true initially and then false once the auth state is determined.
  const value: AuthContextType = {
    user: user ?? null, // Ensure user is null if undefined
    email,
    password,
    setEmail,
    setPassword,
    isLoginMode,
    setIsLoginMode,
    loading: loadingAuthState, // This is the primary loading indicator
    error: errorAuthState,
    handleAuthentication,
    signInWithGoogle,
    signOutUser,
    loadingSignIn,
    loadingSignOut, // From useSignOut
    errorSignOut,   // From useSignOut
  };

  // Optional: Early return or error display if authInstance is not available
  if (!authInstance) {
    return (
      <div>
        <p>Authentication service is currently unavailable. Please check Firebase configuration.</p>
        {/* You might want to render children if parts of app can work without auth */}
        {/* {children} */}
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};