import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const UserProfile = ({ user, onLogout, onOpenSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { lang, toggleLanguage, t } = useLanguage();

    if (!user) return null;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'var(--gradient-primary)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
            >
                {getInitials(user.name)}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="glass-panel"
                    style={{
                        position: 'absolute',
                        top: '52px',
                        right: 0,
                        width: '260px',
                        padding: '20px',
                        zIndex: 1000,
                        boxShadow: 'var(--glass-shadow)',
                        animation: 'revealUp 0.3s ease-out'
                    }}
                >
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                            {getInitials(user.name)}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>{user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>

                    <div style={{ borderTop: 'var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={toggleLanguage}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>🌐 {t('common.profile')} Language</span>
                            <span style={{ color: 'var(--accent-success)', fontSize: '0.8rem' }}>{lang.toUpperCase()}</span>
                        </button>

                        <button
                            onClick={() => {
                                onOpenSettings();
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            ⚙️ {t('common.settings')}
                        </button>

                        <button
                            onClick={onLogout}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                borderRadius: '10px',
                                color: '#f43f5e',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '4px'
                            }}
                        >
                            {t('common.logout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
