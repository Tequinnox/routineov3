import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "",
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "",
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "",
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "",
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "",
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "",
};
console.log("Full Firebase Config (with values):", firebaseConfig);
// Log the presence of each config key (even if they are empty or undefined) to verify that the environment variables are loaded (shortened output).
console.log("Firebase Config (presence):", { hasApiKey: !!firebaseConfig.apiKey, hasAuthDomain: !!firebaseConfig.authDomain, hasProjectId: !!firebaseConfig.projectId, hasStorageBucket: !!firebaseConfig.storageBucket, hasMessagingSenderId: !!firebaseConfig.messagingSenderId, hasAppId: !!firebaseConfig.appId });

// Initialize Firebase only if it hasn't been initialized already
const app = initializeApp(firebaseConfig);
console.log('Firebase Apps:', getApps().length);
const auth = initializeAuth(app, { persistence: browserLocalPersistence });

const db = getFirestore(app);

console.log('Firebase initialized:', !!app, !!auth, !!db);

export { app, auth, db }; 