import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TelegramRelay } from './TelegramRelay';

/**
 * SkynetLogger
 * Centralized utility for reporting events to the global system hubs.
 */
export const skynet = {
    normalizeMeta: (type, meta = {}) => {
        const severityMap = {
            info: 'info',
            success: 'info',
            warning: 'warn',
            error: 'error',
            crash: 'error',
            alert: 'critical',
            latency: 'info'
        };

        const actorId = meta.actorId || meta.userId || meta.adminId || meta.targetUserId;
        let entityId = meta.entityId;
        let entityType = meta.entityType;

        if (!entityId) {
            if (meta.propertyId) {
                entityId = meta.propertyId;
                entityType = entityType || 'property';
            } else if (meta.contractId) {
                entityId = meta.contractId;
                entityType = entityType || 'contract';
            } else if (meta.requestId) {
                entityId = meta.requestId;
                entityType = entityType || 'maintenance_request';
            } else if (meta.docId) {
                entityId = meta.docId;
                entityType = entityType || meta.collection || 'document';
            }
        }

        return {
            actorId: actorId || 'system',
            entityId: entityId || null,
            entityType: entityType || null,
            severity: meta.severity || severityMap[type] || 'info',
            source: meta.source || 'client',
            env: meta.env || import.meta.env.MODE
        };
    },
    /**
     * Log a system event or user action
     * @param {string} msg - The message to log
     * @param {string} type - 'info', 'success', 'warning', 'error', 'activity'
     * @param {object} meta - Additional metadata { userId, propertyId, etc }
     */
    /**
     * Log a system event or user action
     * @param {string} msg - The message to log
     * @param {string} type - 'info', 'success', 'warning', 'error', 'activity', 'crash', 'latency'
     * @param {object} meta - Additional metadata { userId, propertyId, latency, etc }
     */
    log: async (msg, type = 'info', meta = {}) => {
        // Sanitize meta to prevent circular reference errors in Firestore
        const cleanMeta = JSON.parse(JSON.stringify(meta, (key, value) =>
            typeof value === 'object' && value !== null ?
                (Object.keys(value).includes('currentUser') || Object.keys(value).includes('auth') ? '[Filtered Object]' : value)
                : value
        ));

        const normalized = skynet.normalizeMeta(type, cleanMeta);

        const logEntry = {
            msg,
            type,
            timestamp: new Date().toISOString(),
            ...normalized,
            ...cleanMeta
        };

        console.log(`[Skynet] ${type.toUpperCase()}: ${msg}`, cleanMeta);

        try {
            await addDoc(collection(db, 'system_logs'), logEntry);

            // Auto-trigger alerts for critical events
            if (type === 'crash' || cleanMeta.isCritical || type === 'error') {
                skynet.criticalAlert(msg, cleanMeta);
            }
        } catch (e) {
            console.error('Skynet failed to sync log:', e);
        }
    },

    /**
     * Shorthand methods for cleaner code
     */
    info: (msg, meta) => skynet.log(msg, 'info', meta),
    success: (msg, meta) => skynet.log(msg, 'success', meta),
    warn: (msg, meta) => skynet.log(msg, 'warning', meta),
    error: (msg, meta) => skynet.log(msg, 'error', meta),
    crash: (msg, meta) => skynet.log(msg, 'crash', { ...meta, isCritical: true }),

    /**
     * Send instant notification to admins (Telegram/Email infrastructure)
     */
    criticalAlert: async (msg, meta = {}) => {
        console.warn('🚨 CRITICAL ALERT:', msg, meta);

        // Instant broadcast to Telegram if configured
        TelegramRelay.sendAlert(msg, meta);

        // For now, we'll mark it specially in the logs
        const alertEntry = {
            msg: `[ALERT] ${msg}`,
            type: 'alert',
            timestamp: new Date().toISOString(),
            ...meta,
            isAlert: true
        };

        try {
            await addDoc(collection(db, 'system_logs'), alertEntry);
        } catch (e) {
            console.error('Failed to send critical alert:', e);
        }
    }
};
