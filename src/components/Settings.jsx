import React, { useState } from 'react';
import TaxExport from './TaxExport';
import AchievementPanel from './AchievementPanel';

const Settings = ({ user, onClose, onLogout, vendors, onAddVendor, onDeleteVendor, properties = [], settings = { warningPeriod: 30 }, onUpdateSettings, onOpenAdmin }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('pref_currency') || 'USD');
    const [dateFormat, setDateFormat] = useState(localStorage.getItem('pref_date') || 'MM/DD/YYYY');
    const [activeTab, setActiveTab] = useState('account'); // 'account' or 'progress'

    const savePreferences = () => {
        localStorage.setItem('pref_currency', currency);
        localStorage.setItem('pref_date', dateFormat);
        // В будущем здесь можно синхронизировать настройки с Firestore
        onClose();
        location.reload(); // Для простоты обновляем страницу для применения настроек
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Личный кабинет</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={() => setActiveTab('account')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'account' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            padding: '8px 0',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'account' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        Аккаунт
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'progress' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            padding: '8px 0',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'progress' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        Прогресс
                    </button>
                </div>

                {activeTab === 'account' ? (
                    <>
                        {/* Profile Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.email}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status: Cloud Synced</div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Preferences</h3>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white' }}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Date Format</label>
                                <select
                                    value={dateFormat}
                                    onChange={(e) => setDateFormat(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white' }}
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Smart Tasks: Contract Warning (Days)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="range"
                                        min="7"
                                        max="90"
                                        value={settings.warningPeriod || 30}
                                        onChange={(e) => onUpdateSettings({ warningPeriod: parseInt(e.target.value) })}
                                        style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, width: '30px' }}>{settings.warningPeriod || 30}</span>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>How many days before contract expiry to show an alert.</p>
                            </div>
                        </div>

                        {/* Financial Reports */}
                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Financial Reports</h3>
                            <TaxExport properties={properties} />
                        </div>

                        {/* Account Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => {
                                    if (window.confirm('Clear all local data and reload?')) {
                                        localStorage.clear();
                                        location.reload();
                                    }
                                }}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                🗑️ Clear Local Cache
                            </button>
                            <button
                                onClick={savePreferences}
                                className="btn-primary"
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', fontWeight: 600 }}
                            >
                                Save & Apply
                            </button>
                            <button
                                onClick={onLogout}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Sign Out
                            </button>

                            {/* Admin Entry Point */}
                            {(user?.email === 'final_test_8812@example.com' || user?.email === 'admin@example.com' || user?.email === 'admintest@admin.ru') && (
                                <button
                                    onClick={() => {
                                        if (onOpenAdmin) onOpenAdmin();
                                    }}
                                    style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px dashed var(--text-secondary)',
                                        borderRadius: '8px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🛡️ Open Admin Panel
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <AchievementPanel properties={properties} />

                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: '8px', marginTop: 0 }}>💡 Совет</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                Заполняйте профиль и совершайте транзакции, чтобы открывать новые достижения и повышать ценность вашего портфеля.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
