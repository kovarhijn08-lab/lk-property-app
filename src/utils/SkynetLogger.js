import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TelegramRelay } from './TelegramRelay';

/**
 * SkynetLogger
 * Centralized utility for reporting events to the global system hubs.
 */
export const skynet = {
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
        const logEntry = {
            msg,
            type,
            timestamp: new Date().toISOString(),
            ...meta
        };

        console.log(`[Skynet] ${msg}`, type, meta);

        try {
            await addDoc(collection(db, 'system_logs'), logEntry);

            // Auto-trigger alerts for critical events
            if (type === 'crash' || meta.isCritical) {
                skynet.criticalAlert(msg, meta);
            }
        } catch (e) {
            console.error('Skynet failed to sync log:', e);
        }
    },

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

