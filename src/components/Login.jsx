import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToSignup, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isResetMode) {
                const result = await onForgotPassword(email);
                if (result.success) {
                    setSuccessMsg('We sent a password reset link to your email.');
                } else {
                    setError(result.error);
                }
            } else {
                const result = await onLogin(email, password);
                if (!result.success) {
                    setError(result.error);
                }
            }
        } catch (err) {
            console.error('Login/Reset error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '40px 32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '1.8rem',
                        margin: 0,
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Smart Pocket Ledger</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isResetMode ? 'Reset your password' : 'Sign in to manage your properties'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            fontSize: '0.85rem'
                        }}>
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10B981',
                            fontSize: '0.85rem'
                        }}>
                            {successMsg}
                        </div>
                    )}

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    {!isResetMode && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetMode(true);
                                        setError('');
                                        setSuccessMsg('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Forgot?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: loading ? 'var(--glass-border)' : 'var(--accent-primary)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing...' : (isResetMode ? 'Send Reset Link' : 'Sign In')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {isResetMode ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsResetMode(false);
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Login
                            </button>
                        ) : (
                            <div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Don't have an account?{' '}
                                </span>
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
