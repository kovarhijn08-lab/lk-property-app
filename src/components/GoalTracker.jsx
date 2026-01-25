import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const GoalTracker = ({ currentCashFlow, goalAmount, onEditGoal, propertyName }) => {
    const { t } = useLanguage();

    // Safety checks
    const safeCashFlow = Number(currentCashFlow) || 0;
    const safeGoalAmount = Number(goalAmount) || 1;

    const progress = Math.max(0, Math.min((safeCashFlow / safeGoalAmount) * 100, 100));
    const remaining = Math.max(safeGoalAmount - safeCashFlow, 0);
    const cashFlowColor = safeCashFlow >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)';

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🎯 {t('goalTracker.title')}{propertyName && ` — ${propertyName}`}
                    </h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
                        <span style={{ color: cashFlowColor }}>${safeCashFlow.toLocaleString()}</span> <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ ${safeGoalAmount.toLocaleString()}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: safeCashFlow < 0 ? 'var(--accent-danger)' : (progress >= 100 ? 'var(--accent-success)' : 'white')
                    }}>
                        {progress.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {safeCashFlow < 0 ? t('goalTracker.belowZero') : t('goalTracker.reached')}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: safeCashFlow < 0 ? 'var(--accent-danger)' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                    boxShadow: safeCashFlow < 0 ? '0 0 10px rgba(244, 63, 94, 0.3)' : '0 0 10px rgba(99, 102, 241, 0.3)',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}></div>
            </div>

            {remaining > 0 ? (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🚀</span>
                    <span>{t('goalTracker.remaining')} <strong>${remaining.toLocaleString()}</strong></span>
                </div>
            ) : (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎉</span>
                    <span>{t('goalTracker.achieved')}</span>
                </div>
            )}

            {onEditGoal && (
                <button
                    onClick={onEditGoal}
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.08)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    ⚙️ {t('goalTracker.editGoal')}
                </button>
            )}
        </div>
    );
};

export default GoalTracker;
