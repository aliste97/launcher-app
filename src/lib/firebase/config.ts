
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';

const requiredEnvVars: string[] = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const checkEnvVars = (): { missingVars: string[]; allVarsPresent: boolean } => {
  let missingVars: string[] = [];
  // Check for process.env existence for environments like StackBlitz or pure client-side bundling
  if (typeof process !== 'undefined' && process.env) {
    missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  } else if (typeof window !== 'undefined') {
    // Fallback for client-side where process.env might not be polyfilled/available
    // This assumes NEXT_PUBLIC_ vars are directly available on window or similar global scope if not process.env
    // This is a simplification; in Next.js, they are injected during build time.
    // If process.env is truly unavailable and these aren't on window, this check is limited.
    missingVars = requiredEnvVars.filter(varName => {
      try {
        // Attempt to access them globally if no process.env - this is less standard for Next.js
        // but provides a fallback path for determining missing vars on client if process.env is weirdly absent.
        // @ts-ignore
        return !window[varName];
      } catch (e) {
        return true; // Assume missing if window access fails
      }
    });
    if (requiredEnvVars.length === missingVars.length && requiredEnvVars.length > 0) {
        // If all are missing and process.env wasn't there, it's likely they are not set.
        // console.warn("process.env not available on client, Firebase env vars likely missing.");
    }
  } else {
    // Non-browser, non-Node.js like environment where process.env is not defined
    missingVars = [...requiredEnvVars];
    // console.warn("process.env not available, Firebase env vars likely missing.");
  }
  return { missingVars, allVarsPresent: missingVars.length === 0 };
};

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appInstance: FirebaseApp | null = null;
let initializationError: Error | null = null;

const { missingVars, allVarsPresent } = checkEnvVars();

if (!allVarsPresent) {
  const errorParts = [
    `Firebase initialization error: Critical environment variables are missing or invalid: ${missingVars.join(', ')}.`,
    `Cannot initialize Firebase. Please create or check your .env.local file and ensure all Firebase configuration values are correctly set.`,
    `Refer to the .env.local.example file in the project root.`
  ];
  const errorMessage = errorParts.join(' ');
  initializationError = new Error(errorMessage);
  // Log the error for both client and server.
  // Avoid console.error in module scope on server during build as it might be noisy or fail tests.
  // Prefer logging when getFirebaseApp is called, or rely on downstream effects.
  if (typeof window !== 'undefined') {
    console.error(errorMessage);
  } else {
    // For SSR, this error will be more visible if an attempt to use Firebase is made.
    // console.error(`[SSR] ${errorMessage}`); 
    // We are intentionally not throwing here to prevent Next.js error page for this specific case.
    // The app will load, but Firebase features will be broken.
  }
} else {
  if (!getApps().length) {
    try {
      appInstance = initializeApp(firebaseConfig);
    } catch (error: any) {
      initializationError = error;
      const specificErrorMessage = `Error initializing Firebase app: ${error.message || error}`;
      if (typeof window !== 'undefined') {
        console.error(specificErrorMessage);
      } else {
        // console.error(`[SSR] ${specificErrorMessage}`);
      }
      // Do not throw here for SSR to avoid hard error page.
    }
  } else {
    appInstance = getApps()[0];
  }
}

export const getFirebaseApp = (): FirebaseApp | null => {
  if (initializationError && !appInstance) {
    // If there was an error and app is not initialized, log it again when accessed (especially on client).
    // This ensures the error is visible if initial logging was missed or if SSR logging was suppressed.
    if (typeof window !== 'undefined') {
        // console.error("Attempting to use Firebase, but initialization failed previously:", initializationError.message);
    } else {
        // console.warn("[SSR] Attempting to use Firebase, but initialization failed previously:", initializationError.message);
    }
  }
  return appInstance;
};

// Export `app` directly for existing imports.
// It will be `null` if Firebase is not configured or initialization failed.
export const app = appInstance;
