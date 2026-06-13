import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

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
