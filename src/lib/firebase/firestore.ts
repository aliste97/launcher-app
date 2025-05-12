
import { getFirestore, type Firestore } from "firebase/firestore";
import { app, db as initializedDb } from './config'; // Import initialized db instance

// Export the initialized Firestore instance directly
export const db: Firestore | null = initializedDb;

// Add any specific Firestore helper functions or exports here if needed
// Example:
// export const getCollectionRef = (collectionPath: string) => {
//   if (!db) {
//     console.error("Firestore not initialized");
//     throw new Error("Firestore service is unavailable.");
//   }
//   return collection(db, collectionPath);
// };

    