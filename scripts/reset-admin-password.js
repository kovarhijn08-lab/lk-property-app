
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
console.log('Initializing Firebase Admin...');
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e) {
    console.error('Failed to initialize admin:', e.message);
    process.exit(1);
}

// 3. Reset Password
const TARGET_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'admin123';

async function reset() {
    try {
        const user = await admin.auth().getUserByEmail(TARGET_EMAIL);
        console.log(`Found user ${TARGET_EMAIL} (UID: ${user.uid})`);

        await admin.auth().updateUser(user.uid, {
            password: NEW_PASSWORD
        });

        console.log('\n✅ SUCCESS!');
        console.log(`Password for ${TARGET_EMAIL} reset to: ${NEW_PASSWORD}`);

    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.error(`\n❌ Error: User ${TARGET_EMAIL} does not exist in Auth.`);
            console.log('You might need to create it manually in Firebase Console first.');
        } else {
            console.error('\n❌ Error:', e);
        }
    }
    process.exit(0);
}

reset();
