import React, { useState } from 'react';
import { TrendUpIcon, TrendDownIcon, InfoIcon } from './Icons';

const MetricCard = ({ title, value, unit = '', trend = null, status = 'neutral', infoText = "No explanation available.", chart = null, compact = false }) => {
    const [showInfo, setShowInfo] = useState(false);

    const getStatusColor = (s) => {
        switch (s) {
            case 'positive': return 'var(--accent-success)';
            case 'negative': return 'var(--accent-danger)';
            case 'warning': return 'var(--accent-warning)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div
            className="glass-panel animate-slide-up"
            style={{
                padding: compact ? '16px' : '20px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: `2px solid ${status === 'positive' ? 'var(--accent-success)' : status === 'warning' ? 'var(--accent-warning)' : status === 'negative' ? 'var(--accent-danger)' : 'rgba(255,255,255,0.1)'}`,
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        width: '28px',
                        height: '28px',
                        color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <InfoIcon size={14} strokeWidth={2.5} />
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
                {unit && <span style={{ fontSize: compact ? '0.9rem' : '1.2rem', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>{unit}</span>}
                <div style={{
                    fontSize: compact ? '1.3rem' : '2.1rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-1px'
                }}>
                    {value}
                </div>
            </div>

            {trend && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: getStatusColor(status), display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {status === 'positive' ? <TrendUpIcon size={14} /> : status === 'negative' ? <TrendDownIcon size={14} /> : null}
                    {trend}
                </div>
            )}

            {/* Render Chart if provided */}
            {chart && (
                <div style={{ flex: 1, minHeight: '80px', marginTop: '12px' }}>
                    {chart}
                </div>
            )}

            {showInfo && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.95)',
                    padding: '24px',
                    borderRadius: '20px',
                    zIndex: 20,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setShowInfo(false)}>
                    <strong style={{ color: 'white', marginBottom: '8px' }}>{title}</strong>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{infoText}</p>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
