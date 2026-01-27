
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

// 1. Read .env.local manually
console.log(`Reading credentials from ${envPath}...`);
let serviceAccount;
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT='(.*)'/);
    if (!match) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT not found or format incorrect in .env.local');
    }
    serviceAccount = JSON.parse(match[1]);
} catch (e) {
    console.error('Failed to read credentials:', e.message);
    process.exit(1);
}

// 2. Initialize Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error('Failed to initialize admin:', e.message);
        process.exit(1);
    }
}

const db = admin.firestore();
const TARGET_EMAIL = 'kovarhijn08@gmail.com';

async function makeAdmin() {
    try {
        // 1. Find user by email in Auth to get UID
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(TARGET_EMAIL);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.error(`User ${TARGET_EMAIL} not found in Authentication system.`);
                console.log('Please ask the user to Sign Up first, then run this script again.');
                process.exit(1);
            }
            throw e;
        }

        const uid = userRecord.uid;
        console.log(`Found User: ${TARGET_EMAIL} (UID: ${uid})`);

        // 2. Update Firestore Document
        const userRef = db.collection('users').doc(uid);
        const docSnap = await userRef.get();

        if (!docSnap.exists) {
            console.log('Firestore document does not exist. Creating one...');
            await userRef.set({
                email: TARGET_EMAIL,
                role: 'admin',
                createdAt: new Date().toISOString(),
                preferences: { isDemoMode: false }
            });
        } else {
            console.log(`Updating existing document. Current role: ${docSnap.data().role}`);
            await userRef.update({
                role: 'admin',
                updatedAt: new Date().toISOString()
            });
        }

        console.log('\n✅ SUCCESS!');
        console.log(`User ${TARGET_EMAIL} is now an ADMIN.`);
        console.log('They may need to refresh their page/re-login to see changes.');

    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

makeAdmin();
