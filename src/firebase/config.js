import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// These values come from environment variables (VITE_ prefix for Vite)
// Helper to safely trim and clean env variables
const getEnv = (key) => {
    const value = import.meta.env[key];
    return value ? value.trim() : undefined;
};

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Debug: Check if config is loaded
console.log('Firebase Config Status:', {
    apiKey: firebaseConfig.apiKey ? 'Loaded' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Loaded' : 'Missing',
    projectId: firebaseConfig.projectId ? 'Loaded' : 'Missing',
    storageBucket: firebaseConfig.storageBucket ? 'Loaded' : 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'Loaded' : 'Missing',
    appId: firebaseConfig.appId ? 'Loaded' : 'Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Optional local emulator support
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
if (useEmulators) {
    const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
    const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
    const authPort = Number(import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099);
    const storagePort = Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199);

    connectFirestoreEmulator(db, emulatorHost, firestorePort);
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`);
    connectStorageEmulator(storage, emulatorHost, storagePort);
    console.log('Firebase emulators enabled', { emulatorHost, firestorePort, authPort, storagePort });
}

export default app;
