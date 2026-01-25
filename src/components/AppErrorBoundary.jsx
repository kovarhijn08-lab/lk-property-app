import React from 'react';
import * as Sentry from "@sentry/react";

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to Sentry
        Sentry.captureException(error, { extra: errorInfo });
        console.error("Project Healer caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        // Clear local storage or specific keys that might be causing corruption
        // localStorage.clear(); // Aggressive
        sessionStorage.clear();

        // Reset state and attempt to re-render
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Premium Fallback UI
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-main)',
                    color: 'white',
                    fontFamily: 'var(--font-main)',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div className="glass-panel" style={{
                        maxWidth: '500px',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        boxShadow: '0 0 40px rgba(244, 63, 94, 0.1)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '24px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            animation: 'pulse 2s infinite'
                        }}>
                            🛡️
                        </div>

                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>
                                Система восстановления активирована
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Произошёл неожиданный сбой в работе интерфейса. Не волнуйтесь, мы уже отправили отчёт разработчикам (Sentry).
                            </p>
                        </div>

                        <div style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            color: 'var(--accent-danger)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            Ошибка: {this.state.error?.message || "Неизвестная ошибка"}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Исправить и перезапустить
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '14px 20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                На главную
                            </button>
                        </div>

                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
                            Project Healer v1.0 • Код ошибки: {Math.random().toString(36).substring(7).toUpperCase()}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
