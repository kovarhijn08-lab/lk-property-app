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
        // These can be configured in .env.local
        const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.log('[TelegramRelay] Alert ignored - Telegram BOT_TOKEN or CHAT_ID not configured.');
            return;
        }

        const text = `🚨 *SKYNET CRITICAL ALERT*\n\n*Message:* ${msg}\n*User:* ${meta.userId || 'Guest'}\n*Type:* ${meta.type || 'Unknown'}\n*Time:* ${new Date().toLocaleString()}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: text,
                    parse_mode: 'Markdown'
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
