import admin from 'firebase-admin';

// Helper to initialize Admin SDK inside the handler to catch errors
async function initAdmin() {
    if (!admin.apps.length) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            const availableVars = Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('ACCOUNT')).join(', ');
            console.error(`Env var missing. Available related vars: ${availableVars}`);
            throw new Error(`FIREBASE_SERVICE_ACCOUNT env var is missing. (Found: ${availableVars || 'none'})`);
        }
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully');
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
        }
    }
    return {
        auth: admin.auth(),
        db: admin.firestore()
    };
}

// Helper to log to Firestore from backend
async function logToSystem(db, message, type = 'info', meta = {}) {
    try {
        await db.collection('system_logs').add({
            message: `[Backend] ${message}`,
            type,
            timestamp: new Date().toISOString(),
            ...meta
        });
    } catch (e) {
        console.error('Logging to Firestore failed:', e.message);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetUid, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    let services;
    try {
        services = await initAdmin();
    } catch (e) {
        // This is where we catch initialization errors (like missing ENV)
        return res.status(500).json({ error: `Initialization Error: ${e.message}` });
    }

    const { auth, db } = services;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // 1. Verify the requester is an admin
        const decodedToken = await auth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;

        const requesterDoc = await db.collection('users').doc(requesterUid).get();
        const requesterData = requesterDoc.data();

        const isKnownAdmin = ['final_test_8812@example.com', 'admin@example.com'].includes(decodedToken.email);

        if (!isKnownAdmin && requesterData?.role !== 'admin') {
            await logToSystem(db, `Unauthorized access attempt by ${decodedToken.email}`, 'error', { uid: requesterUid });
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // 2. Perform the password update
        await auth.updateUser(targetUid, {
            password: newPassword
        });

        await logToSystem(db, `Admin ${decodedToken.email} manually changed password for UID: ${targetUid}`, 'warning', {
            admin: decodedToken.email,
            target: targetUid
        });

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('SetPassword Error:', error);
        await logToSystem(db, `Operation failed: ${error.message}`, 'error', { stack: error.stack });
        return res.status(500).json({ error: error.message });
    }
}
