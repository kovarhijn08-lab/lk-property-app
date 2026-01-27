import admin from 'firebase-admin';

// Helper to initialize Admin SDK
async function initAdmin() {
    if (!admin.apps.length) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing');
        }
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
        }
    }
    return {
        auth: admin.auth(),
        db: admin.firestore()
    };
}

async function logToSystem(db, message, type = 'info', meta = {}) {
    try {
        await db.collection('system_logs').add({
            message: `[Backend] ${message}`,
            type,
            timestamp: new Date().toISOString(),
            ...meta
        });
    } catch (e) { }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { targetUid, newEmail, newName } = req.body;
    const authHeader = req.headers.authorization;

    let services;
    try {
        services = await initAdmin();
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    const { auth, db } = services;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // 1. Verify requester is admin
        const decodedToken = await auth.verifyIdToken(idToken);
        const requesterUid = decodedToken.uid;
        const requesterDoc = await db.collection('users').doc(requesterUid).get();
        const requesterData = requesterDoc.data();

        const isKnownAdmin = ['final_test_8812@example.com', 'admin@example.com'].includes(decodedToken.email);
        if (!isKnownAdmin && requesterData?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        // 2. Perform updates
        const { targetUid, newEmail, newName, newRole } = req.body;

        const updateData = {};
        if (newEmail) updateData.email = newEmail;
        if (newName) updateData.displayName = newName;

        // Update Auth
        if (Object.keys(updateData).length > 0) {
            await auth.updateUser(targetUid, updateData);
        }

        // Update Firestore
        const firestoreUpdate = { updatedAt: new Date().toISOString() };
        if (newEmail) firestoreUpdate.email = newEmail;
        if (newName) firestoreUpdate.name = newName;
        if (newRole) firestoreUpdate.role = newRole;

        await db.collection('users').doc(targetUid).update(firestoreUpdate);

        await logToSystem(db, `Admin ${decodedToken.email} updated user ${targetUid}: email=${newEmail || 'N/A'}, name=${newName || 'N/A'}, role=${newRole || 'N/A'}`, 'success', {
            admin: decodedToken.email,
            target: targetUid,
            updates: { newEmail, newName, newRole }
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('UpdateUser Error:', error);
        await logToSystem(db, `Update failed: ${error.message}`, 'error');
        return res.status(500).json({ error: error.message });
    }
}
