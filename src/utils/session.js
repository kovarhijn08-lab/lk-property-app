export const getSessionId = () => {
    const key = 'pocketLedger_session_id';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
        sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
};
