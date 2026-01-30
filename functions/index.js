const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Skynet Active Audit Sentinel
 * Monitors system logs and automatically blocks suspicious activity.
 */
exports.skynetSentinel = functions.firestore
    .document('system_logs/{logId}')
    .onCreate(async (snapshot, context) => {
        const logData = snapshot.data();
        const { type, actorId, action, metadata } = logData;

        // 1. Фильтруем только критические ошибки и предупреждения авторизации
        const isSecurityIncident =
            (type === 'error' || type === 'warning') &&
            (action && (action.startsWith('auth.') || action.includes('login') || action.includes('signup')));

        if (!isSecurityIncident || !actorId || actorId === 'unknown' || actorId === 'system') {
            return null;
        }

        console.log(`[Skynet] Analyzing security incident for actor: ${actorId}`);
        const isCritical = logData.priority === 'P0';

        try {
            // 2. Считаем количество инцидентов для этого пользователя за последние 10 минут
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

            const recentIncidents = await admin.firestore()
                .collection('system_logs')
                .where('actorId', '==', actorId)
                .where('createdAt', '>', tenMinutesAgo)
                .limit(10)
                .get();

            const incidentCount = recentIncidents.size;

            // 3. Если порог (например, 5 инцидентов) превышен — БЛОКИРУЕМ
            if (incidentCount >= 5) {
                console.warn(`[Skynet] Threshold exceeded for ${actorId} (${incidentCount} incidents). Blocking user...`);

                // Блокировка в Firebase Auth
                await admin.auth().updateUser(actorId, { disabled: true });

                const blockMsg = `🚨 *Skynet Security Alert*\n\nUser ${actorId} automatically BLOCKED.\nReason: Excessive security incidents (${incidentCount} in 10m).`;

                // Запись события блокировки («карательная» мера Skynet)
                await admin.firestore().collection('system_logs').add({
                    type: 'error',
                    priority: 'P0',
                    action: 'skynet.auto_block',
                    actorId: 'skynet_sentinel',
                    message: `User ${actorId} automatically blocked due to excessive security incidents (${incidentCount}).`,
                    targetId: actorId,
                    metadata: {
                        reason: 'threshold_exceeded',
                        incidentsDetected: incidentCount,
                        timeWindow: '10m'
                    },
                    createdAt: new Date().toISOString(),
                    version: '3.0.0-sentinel'
                });

                // Отправка в Telegram
                await sendTelegramAlert(blockMsg);

                console.log(`[Skynet] User ${actorId} has been neutralized.`);
            } else if (isCritical) {
                // Если лог просто критический (P0), но порог блока еще не достигнут — просто алертим
                const alertMsg = `⚠️ *Skynet P0 Alert*\n\n*Action*: ${action}\n*Actor*: ${actorId}\n*Message*: ${logData.message || 'No details'}`;
                await sendTelegramAlert(alertMsg);
            }

            return null;
        } catch (error) {
            console.error('[Skynet] Sentinel Error:', error);
            return null;
        }
    });

/**
 * Helper to send Telegram alerts using config or process.env
 */
async function sendTelegramAlert(text) {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // Пытаемся взять из переменных окружения (Firebase Functions Secrets или Config)
    const token = process.env.TELEGRAM_BOT_TOKEN || functions.config().telegram?.token;
    const chatId = process.env.TELEGRAM_CHAT_ID || functions.config().telegram?.chat_id;

    if (!token || !chatId) {
        console.warn('[Skynet] Telegram notification skipped: missing token or chatId');
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('[Skynet] Telegram API error:', data);
        }
    } catch (e) {
        console.error('[Skynet] Telegram relay network error:', e);
    }
}

/**
 * [Optional] Cleanup old logs to keep Firestore lean
 * Runs every 24 hours
 */
exports.skynetCleanup = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const oldLogs = await admin.firestore()
        .collection('system_logs')
        .where('createdAt', '<', thirtyDaysAgo)
        .limit(500)
        .get();

    const batch = admin.firestore().batch();
    oldLogs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    console.log(`[Skynet] Cleanup completed. Removed ${oldLogs.size} old logs.`);
});

async function runFirestoreExport() {
    const { FirestoreAdminClient } = require('@google-cloud/firestore').v1;
    const client = new FirestoreAdminClient();
    const projectId = process.env.GCLOUD_PROJECT || admin.app().options.projectId;
    const bucket = 'lk-property-backups-2026';

    if (!projectId) {
        throw new Error('Missing project id');
    }

    const databaseName = client.databasePath(projectId, '(default)');
    const outputUriPrefix = `gs://${bucket}/exports/${new Date().toISOString()}`;

    const [operation] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix
    });
    const [response] = await operation.promise();
    console.log('[Backup] Export finished', response);
    return { outputUriPrefix, name: response?.name || null };
}

/**
 * Firestore export backup (HTTP trigger for legacy Scheduler)
 */
exports.firestoreWeeklyBackup = functions
    .region('asia-southeast1')
    .https.onRequest(async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        try {
            const result = await runFirestoreExport();
            res.status(200).json({ ok: true, ...result });
        } catch (error) {
            console.error('[Backup] Export failed', error);
            res.status(500).json({ ok: false, error: error.message || String(error) });
        }
    });

/**
 * Firestore export backup (Pub/Sub trigger for Cloud Scheduler)
 */
const { onMessagePublished } = require('firebase-functions/v2/pubsub');
exports.firestoreWeeklyBackupPubsub = onMessagePublished(
    {
        topic: 'firestore-weekly-backup',
        region: 'asia-southeast1',
        serviceAccount: 'smart-pocket-ledger@appspot.gserviceaccount.com'
    },
    async () => {
        await runFirestoreExport();
    }
);
