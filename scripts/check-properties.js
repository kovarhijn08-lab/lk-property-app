
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

// 1. Read .env.local manually
let serviceAccount;
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT='(.*)'/);
    if (!match) throw new Error('FIREBASE_SERVICE_ACCOUNT not found');
    serviceAccount = JSON.parse(match[1]);
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
} catch (e) {
    console.error('Failed to read credentials:', e.message);
    process.exit(1);
}

// 2. Initialize Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function check() {
    console.log('--- DIAGNOSING PROPERTIES ---');

    // Check admintest user
    const usersSnap = await db.collection('users').where('email', '==', 'admintest@admin.ru').get();
    if (usersSnap.empty) {
        console.log('User admintest@admin.ru not found in users collection.');
    } else {
        const userDoc = usersSnap.docs[0];
        console.log(`User ID: ${userDoc.id}`);
        console.log(`User Data:`, userDoc.data());

        const targetUid = userDoc.id;

        // Check properties for this user
        console.log(`\nChecking properties for userId: ${targetUid}...`);
        const propsSnap = await db.collection('properties').where('userId', '==', targetUid).get();

        if (propsSnap.empty) {
            console.log('No properties found for this userId.');
        } else {
            console.log(`Found ${propsSnap.size} properties:`);
            propsSnap.forEach(doc => {
                const data = doc.data();
                console.log(`- ID: ${doc.id}`);
                console.log(`  Name: ${data.name}`);
                console.log(`  userId field: ${data.userId}`);
                console.log(`  updatedAt type: ${typeof data.updatedAt} (${data.updatedAt?.constructor?.name})`);
                console.log(`  updatedAt value:`, data.updatedAt);
            });
        }
    }

    // Also check ALL properties just in case
    console.log('\n--- ALL PROPERTIES (Top 5) ---');
    const allProps = await db.collection('properties').limit(5).get();
    allProps.forEach(doc => {
        console.log(`- ID: ${doc.id}, Name: ${doc.data().name}, userId: ${doc.data().userId}`);
    });

    process.exit(0);
}

check();
