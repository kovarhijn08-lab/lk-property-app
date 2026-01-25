import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import AppErrorBoundary from './components/AppErrorBoundary.jsx';

// Sentry disabled for now to fix build errors

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
