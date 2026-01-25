import React from 'react';

const ConstructionProgressBar = ({ progress, statusMessage }) => {
    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Construction Progress</h3>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {progress}%
                </span>
            </div>

            <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '12px'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                    transition: 'width 1s ease'
                }} />
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                Status: <span style={{ color: 'var(--text-primary)' }}>{statusMessage}</span>
            </p>
        </div>
    );
};

export default ConstructionProgressBar;
