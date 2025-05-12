
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Interface for Firebase configuration to ensure type safety
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

// Retrieve Firebase config from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDNYT6dt3HKnICE0tHECJLUbc-o9xqzwbo",
  authDomain: "fir-zephyr.firebaseapp.com",
  projectId: "firebase-zephyr",
  storageBucket: "firebase-zephyr.firebasestorage.app",
  messagingSenderId: "590621293387",
  appId: "1:590621293387:web:c254e4cd025fc8722006ce"
};

// Check if all required environment variables are set
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`); // Convert camelCase to UPPER_SNAKE_CASE for error message

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let firebaseInitializationError: string | null = null;

if (missingVars.length > 0) {
    const errorMessage =
      `Firebase initialization error: Critical environment variables are missing or invalid: ${missingVars.join(', ')}. ` +
      `Cannot initialize Firebase. Please create or check your .env.local file and ensure all Firebase configuration values are correctly set. ` +
      `Refer to the .env.local.example file in the project root.`;

    firebaseInitializationError = errorMessage;
    console.error(errorMessage); // Log error on both server and client

    // Throw error only on the server-side to prevent build/start failures
    // Client-side will see the console error and can handle the state gracefully
    if (typeof window === 'undefined') {
        throw new Error(errorMessage);
    }
    // On the client, we assign a placeholder/dummy app to avoid breaking imports,
    // but auth and db will remain null. Components should check for these.
    // This requires careful handling in components using auth/db.
    // A better approach might be to have a global state indicating the error.
    app = {} as FirebaseApp; // Assign a dummy object to satisfy type temporarily

} else {
    // Initialize Firebase only if config is valid
    // Check if Firebase app already exists to avoid re-initialization
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig as any); // Type assertion needed because check ensures values are present
        auth = getAuth(app);
        db = getFirestore(app);
      } catch (e: any) {
          const errorMessage = `Firebase initialization failed: ${e.message}`;
          firebaseInitializationError = errorMessage;
          console.error(errorMessage, e);
           if (typeof window === 'undefined') {
              throw new Error(errorMessage);
          }
          app = {} as FirebaseApp; // Assign dummy object on error too
      }
    } else {
      app = getApp(); // Get the default app if already initialized
       // Check if auth and db are already initialized for this app instance
      try {
          auth = getAuth(app);
      } catch (e) {
         console.warn("Auth instance already exists or failed to get:", e);
         // If getAuth fails here, auth might already be initialized or there's another issue
         // We might need a more robust way to manage singleton instances if errors persist
      }
      try {
          db = getFirestore(app);
      } catch (e) {
           console.warn("Firestore instance already exists or failed to get:", e);
      }
    }
}


// Export the initialized app, auth, db, and the error status
export { app, auth, db, firebaseInitializationError };

    