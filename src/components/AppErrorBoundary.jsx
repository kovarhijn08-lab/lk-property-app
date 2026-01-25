import React from 'react';
import { auth } from '../firebase/config';
import { skynet } from '../utils/SkynetLogger';

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
        console.error("Project Healer caught an error:", error, errorInfo);
        this.setState({ errorInfo });

        // Report to global logs
        skynet.log(`App Crash: ${error.message}`, 'crash', {
            stack: error.stack,
            componentStack: errorInfo?.componentStack,
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email
        });
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
            // Check if current user is admin
            const adminEmails = ['final_test_8812@example.com', 'admin@example.com', 'admintest@admin.ru', 'admintest@admin.com'];
            const isAdmin = auth.currentUser && adminEmails.includes(auth.currentUser.email);

            if (!isAdmin) {
                // Simple View for Regular Users
                return (
                    <div style={{
                        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-main)', color: 'white', fontFamily: 'var(--font-main)', padding: '20px', textAlign: 'center'
                    }}>
                        <div className="glass-panel" style={{ maxWidth: '400px', padding: '40px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
                                Ошибка, мы уже работаем над ней!
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Пожалуйста, попробуйте обновить страницу позже.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    marginTop: '24px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)', color: 'white', borderRadius: '10px', cursor: 'pointer'
                                }}
                            >
                                Обновить страницу
                            </button>
                        </div>
                    </div>
                );
            }

            // Premium "Healer" UI for Admins
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
                                Project Healer: Анализ сбоя
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Зафиксирована критическая ошибка. Техническая информация сохранена для анализа.
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
                            {this.state.error?.message}
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
                                Сбросить и исправить
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
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
