import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
export const analytics = getAnalytics(app);

export default app;
