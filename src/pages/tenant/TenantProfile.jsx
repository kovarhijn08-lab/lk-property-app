import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const defaultNotifications = {
    messages: true,
    maintenance: true,
    documents: true
};

const TenantProfile = () => {
    const { currentUser, updatePreferences } = useAuth();
    const [form, setForm] = useState({
        phone: '',
        communication: 'email',
        notifications: { ...defaultNotifications }
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const prefs = currentUser.preferences || {};
        setForm({
            phone: prefs.phone || '',
            communication: prefs.communication || 'email',
            notifications: { ...defaultNotifications, ...(prefs.notifications || {}) }
        });
    }, [currentUser]);

    const toggleNotification = (key) => {
        setForm(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus('');
        const res = await updatePreferences({
            phone: form.phone,
            communication: form.communication,
            notifications: form.notifications
        });
        setSaving(false);
        setStatus(res.success ? 'Saved' : (res.error || 'Save failed'));
    };

    if (!currentUser) {
        return (
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900 }}>Profile</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={currentUser.name || ''}
                            readOnly
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={currentUser.email || ''}
                            readOnly
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 555 123 4567"
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Preferred Communication
                        </label>
                        <select
                            value={form.communication}
                            onChange={(e) => setForm(prev => ({ ...prev, communication: e.target.value }))}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                        >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="chat">In-app Chat</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900 }}>Notifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { key: 'messages', label: 'Messages & Replies' },
                        { key: 'maintenance', label: 'Maintenance Updates' },
                        { key: 'documents', label: 'New Documents' }
                    ].map(item => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                            <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                            <input
                                type="checkbox"
                                checked={!!form.notifications[item.key]}
                                onChange={() => toggleNotification(item.key)}
                            />
                        </label>
                    ))}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                        style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '0.8rem' }}
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                    {status && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status}</span>}
                </div>
            </div>
        </div>
    );
};

export default TenantProfile;
