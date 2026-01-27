/* eslint-disable no-console */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DEFAULT_COLLECTIONS = [
    'users',
    'properties',
    'vendors',
    'messages',
    'maintenance_requests',
    'system_logs'
];

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const loadServiceAccount = () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing.');
    }
    return JSON.parse(raw);
};

const initAdmin = () => {
    if (!admin.apps.length) {
        const serviceAccount = loadServiceAccount();
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    return admin.firestore();
};

const exportCollection = async (db, name) => {
    const snapshot = await db.collection(name).get();
    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
    return data;
};

const main = async () => {
    const outRoot = path.join(process.cwd(), '..', '..', '.tmp', 'exports');
    ensureDir(outRoot);

    const collections = process.argv.slice(2);
    const targets = collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

    const db = initAdmin();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outDir = path.join(outRoot, `firestore_${timestamp}`);
    ensureDir(outDir);

    console.log(`[export] Starting Firestore export -> ${outDir}`);
    for (const name of targets) {
        try {
            const data = await exportCollection(db, name);
            const filePath = path.join(outDir, `${name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`[export] ${name}: ${data.length} docs`);
        } catch (err) {
            console.error(`[export] ${name} failed: ${err.message}`);
        }
    }

    console.log('[export] Done.');
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
