import React from 'react';

/**
 * Global Error Boundary (Resilience Layer)
 * Prevents the "White Screen of Death" by catching render errors.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to Skynet Hub (if external logger is provided or just console)
        console.error("[ErrorBoundary] Caught a crash:", error, errorInfo);
        if (this.props.onCrash) {
            this.props.onCrash(error, errorInfo);
        }
    }

    handleReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0F172A',
                    color: 'white',
                    padding: '24px',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '40px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        borderRadius: '24px',
                        textAlign: 'center',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚡</div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#F43F5E' }}>Application Crash Detected</h1>
                        <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
                            Something went wrong while rendering this page. Skynet has recorded the crash details.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '16px',
                                    background: 'var(--accent-primary, #3B82F6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Try Refreshing
                            </button>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '16px',
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    color: '#F43F5E',
                                    border: '1px solid #F43F5E',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Hard Reset (Clear Cache)
                            </button>
                        </div>

                        <div style={{ marginTop: '24px', fontSize: '0.7rem', color: '#475569', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error Details:</div>
                            {this.state.error?.toString()}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
