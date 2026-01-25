import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const GoalEditModal = ({ isOpen, onClose, currentGoal, onSave, propertyName }) => {
    const { t } = useLanguage();
    const [goal, setGoal] = useState(currentGoal || 0);

    const handleSave = () => {
        const numGoal = Number(goal);
        if (numGoal >= 0) {
            onSave(numGoal);
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(4px)'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    padding: '32px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: '400px',
                    maxWidth: '90%',
                    animation: 'modalSlideIn 0.3s ease-out'
                }}
            >
                <h3 style={{
                    marginBottom: '8px',
                    fontSize: '1.2rem',
                    fontWeight: 800
                }}>
                    {t('goalEditModal.title')}
                </h3>

                {propertyName && (
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '24px',
                        fontSize: '0.9rem'
                    }}>
                        {propertyName}
                    </p>
                )}

                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600
                    }}>
                        {t('goalEditModal.targetMonthly')}
                    </label>
                    <input
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="1500"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent-primary)';
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                    />
                    <p style={{
                        marginTop: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        💡 {t('goalEditModal.tip')} {propertyName || t('goalEditModal.portfolio')}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--accent-primary-hover)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'var(--accent-primary)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        💾 {t('common.save')}
                    </button>
                </div>

                <style>{`
                    @keyframes modalSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default GoalEditModal;
