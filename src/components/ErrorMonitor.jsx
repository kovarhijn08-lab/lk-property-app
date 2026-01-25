import React, { useEffect } from 'react';
import { firestoreOperations } from '../hooks/useFirestore';
import { skynet } from '../utils/SkynetLogger';

/**
 * Global Error Monitor (Skynet Component)
 * Catches all runtime JavaScript errors and reports them to Firestore.
 */
const ErrorMonitor = ({ children, user }) => {

    useEffect(() => {
        const reportError = async (errorData) => {
            skynet.log(errorData.message || 'System Crash', 'crash', {
                ...errorData,
                userId: user?.id || 'anonymous',
                userEmail: user?.email || 'anonymous',
                userAgent: navigator.userAgent
            });
            console.warn('⚠️ Global Error Reported to Skynet Hub');
        };

        const handleError = (event) => {
            const errorData = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack || 'N/A'
            };
            reportError(errorData);
        };

        const handleRejection = (event) => {
            const errorData = {
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack || 'N/A',
                type: 'unhandled_rejection'
            };
            reportError(errorData);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, [user]);

    return children;
};

export default ErrorMonitor;
