import { auth } from '../firebase/config';

/**
 * TelegramRelay
 * Dispatches critical alerts to a Telegram bot via webhook.
 */
export const TelegramRelay = {
    /**
     * Send a message to Telegram
     * @param {string} msg - Message text
     * @param {object} meta - Context metadata
     */
    sendAlert: async (msg, meta = {}) => {
        try {
            const token = await auth.currentUser?.getIdToken?.();
            const response = await fetch('/api/alerts/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    msg,
                    meta
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[TelegramRelay] Error response:', error);
            } else {
                console.log('[TelegramRelay] Alert sent successfully.');
            }
        } catch (e) {
            console.error('[TelegramRelay] Network error:', e);
        }
    }
};
