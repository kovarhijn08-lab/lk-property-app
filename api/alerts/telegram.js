import admin from 'firebase-admin';

async function initAdmin() {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        return null;
    }

    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    return admin.auth();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        return res.status(500).json({ error: 'Telegram config missing' });
    }

    const { msg, meta } = req.body || {};
    if (!msg) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const auth = await initAdmin();
        const authHeader = req.headers.authorization;

        if (auth) {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const idToken = authHeader.split('Bearer ')[1];
            const decoded = await auth.verifyIdToken(idToken);
            const isKnownAdmin = ['final_test_8812@example.com', 'admin@example.com'].includes(decoded.email);
            if (!isKnownAdmin) {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const text = `🚨 *SKYNET CRITICAL ALERT*\n\n*Message:* ${msg}\n*User:* ${meta?.userId || 'Guest'}\n*Type:* ${meta?.type || 'Unknown'}\n*Time:* ${new Date().toLocaleString()}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(502).json({ error });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
