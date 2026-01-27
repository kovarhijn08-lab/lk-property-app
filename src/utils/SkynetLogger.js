import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TelegramRelay } from './TelegramRelay';
import { getSessionId } from './session';

/**
 * SkynetLogger
 * Centralized utility for reporting events to the global system hubs.
 * Follows P1.1 Audit Standard.
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

        const severity = meta.severity || severityMap[type] || 'info';

        // P1.2 Incident Classification
        let priority = 'P2';
        let retentionDays = 30;

        if (severity === 'critical' || type === 'crash') {
            priority = 'P0'; // Telegram + 90 days
            retentionDays = 90;
        } else if (severity === 'error') {
            priority = 'P1'; // Daily check + 30 days
            retentionDays = 30;
        }

        // Determine Actor
        const actorId = meta.actorId || meta.userId || meta.adminId || meta.targetUserId || 'system';

        // Determine Action & Entity (Audit Trail)
        let action = meta.action || type;
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

        const now = new Date();
        const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

        return {
            actorId,
            action,
            entityId: entityId || null,
            entityType: entityType || null,
            severity,
            priority,
            retentionDays,
            expiresAt,
            source: meta.source || 'client',
            env: meta.env || (import.meta.env?.MODE || 'development'),
            sessionId: getSessionId()
        };
    },

    /**
     * Log a system event or user action
     * @param {string} msg - The message to log
     * @param {string} type - 'info', 'success', 'warning', 'error', 'activity', 'crash', 'latency'
     * @param {object} meta - Additional metadata { userId, propertyId, action, entityType... }
     */
    log: async (msg, type = 'info', meta = {}) => {
        // Sanitize meta to prevent circular reference errors in Firestore
        const cleanMeta = JSON.parse(JSON.stringify(meta, (key, value) =>
            typeof value === 'object' && value !== null ?
                (Object.keys(value).includes('currentUser') || Object.keys(value).includes('auth') ? '[Filtered Object]' : value)
                : value
        ));

        const audited = skynet.normalizeMeta(type, cleanMeta);

        const logEntry = {
            msg: msg || cleanMeta.message || 'No message provided',
            type,
            timestamp: new Date().toISOString(),
            createdAt: serverTimestamp(), // Database authoritative time
            ...audited,
            metadata: cleanMeta // Move extra meta to structured metadata field
        };

        // Console for local debugging
        console.log(`[Skynet] ${type.toUpperCase()} | ${audited.action} | ${logEntry.msg}`, {
            actor: audited.actorId,
            entity: `${audited.entityType}:${audited.entityId}`
        });

        try {
            await addDoc(collection(db, 'system_logs'), logEntry);

            // Auto-trigger alerts for critical events
            if (type === 'crash' || cleanMeta.isCritical || logEntry.severity === 'critical') {
                skynet.criticalAlert(msg, logEntry);
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

        // For now, we'll mark it specially in the logs (standardized)
        const alertEntry = {
            msg: `[ALERT] ${msg}`,
            type: 'alert',
            severity: 'critical',
            timestamp: new Date().toISOString(),
            createdAt: serverTimestamp(),
            ...skynet.normalizeMeta('alert', meta),
            metadata: meta,
            isAlert: true
        };

        try {
            await addDoc(collection(db, 'system_logs'), alertEntry);
        } catch (e) {
            console.error('Failed to send critical alert:', e);
        }
    }
};

