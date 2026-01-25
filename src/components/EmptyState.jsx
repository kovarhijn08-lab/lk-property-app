import React from 'react';

const EmptyState = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'glass'
}) => {
    return (
        <div style={{
            padding: '40px 24px',
            textAlign: 'center',
            background: variant === 'glass' ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderRadius: '24px',
            border: variant === 'glass' ? '1px dashed var(--glass-border)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
        }}>
            <div style={{
                fontSize: '3rem',
                marginBottom: '8px',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.8
            }}>
                {icon}
            </div>
            <h3 style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 900,
                color: 'white',
                fontFamily: 'var(--font-display)'
            }}>
                {title}
            </h3>
            <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                maxWidth: '280px',
                fontWeight: 500
            }}>
                {description}
            </p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    style={{
                        marginTop: '12px',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
