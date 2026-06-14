import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigFromJson from '../../firebase-applet-config.json';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFromJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFromJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFromJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFromJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFromJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFromJson.appId,
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigFromJson.firestoreDatabaseId;

if (!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.PROD) {
  console.warn('Firebase environment variables are missing. Falling back to local config. If this is Vercel, please add them to Project Settings for security.');
}

const app = initializeApp(config);

// Initialize services
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

// Validation check as per skill requirements
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'status', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is offline. Initial load might be delayed.");
    }
    // Silent catch for initial connection test
  }
}

testConnection();

export default app;
