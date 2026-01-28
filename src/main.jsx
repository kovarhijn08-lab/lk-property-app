import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import { skynet } from './utils/SkynetLogger';

// Sentry disabled for now to fix build errors

const attachGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return;
  if (window.__skynetErrorsAttached) return;
  window.__skynetErrorsAttached = true;

  window.addEventListener('error', (event) => {
    try {
      const error = event?.error;
      const message = error?.message || event?.message || 'Unknown window error';
      skynet.error(`Global Error: ${message}`, {
        action: 'global.error',
        source: event?.filename,
        line: event?.lineno,
        column: event?.colno,
        stack: error?.stack
      });
    } catch (e) {
      console.error('Global error handler failed:', e);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event?.reason;
      const message = reason?.message || String(reason) || 'Unhandled Promise rejection';
      skynet.error(`Unhandled Rejection: ${message}`, {
        action: 'global.unhandledrejection',
        stack: reason?.stack
      });
    } catch (e) {
      console.error('Unhandled rejection handler failed:', e);
    }
  });
};

attachGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
)
