import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../hooks/useMessaging';
import { useMaintenance } from '../../hooks/useMaintenance';

const TenantDashboard = ({ property, onNavigate }) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    // In a real implementation, we might need a way to pass which unit the tenant is in.
    // Assuming properties[0] has units and we find the one where tenant email/uid matches.
    const tenantUnit = property.units?.find(u => u.tenant === currentUser?.email || u.tenantUid === currentUser?.uid) || property.units?.[0];

    const { messages } = useMessaging(property.id, tenantUnit?.id, currentUser?.id);
    const { requests } = useMaintenance(property.id, currentUser?.id);

    const hasUnread = messages.some(m => !m.read && m.userId !== currentUser?.id);
    const openRequests = requests.filter(r => r.status !== 'Completed');
    const nextActionTarget = hasUnread ? 'messages' : openRequests.length > 0 ? 'maintenance' : null;
    const nextActionLabel = hasUnread ? 'Open Messages' : openRequests.length > 0 ? 'View Request' : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Next Action Card */}
            <div className="glass-panel" style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}>
                        ⚡
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                            {t('property.tenantPortal.nextAction') || 'Next Action'}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900 }}>
                            {hasUnread ? 'New messages await' : openRequests.length > 0 ? 'Maintenance in progress' : 'All systems clear'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {hasUnread
                                ? 'There are unread messages from your property manager.'
                                : openRequests.length > 0
                                    ? `Your request "${openRequests[0].title}" is being handled.`
                                    : 'No immediate actions required. Enjoy your stay!'}
                        </p>
                    </div>
                </div>
                {nextActionTarget && (
                    <button
                        onClick={() => onNavigate && onNavigate(nextActionTarget)}
                        style={{
                            marginTop: '16px',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        {nextActionLabel}
                    </button>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                    className="glass-panel hover-scale"
                    style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                    onClick={() => onNavigate && onNavigate('messages')}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact Manager</div>
                </div>
                <div
                    className="glass-panel hover-scale"
                    style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                    onClick={() => onNavigate && onNavigate('maintenance')}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛠️</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>Request Fix</div>
                </div>
                <div
                    className="glass-panel hover-scale"
                    style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                    onClick={() => onNavigate && onNavigate('docs')}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📄</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>View Documents</div>
                </div>
            </div>

            {/* Property Snapshot */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                    My Residence
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>{property.name}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{property.address}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--accent-success)', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '20px', width: 'fit-content' }}>
                            <span>🔑</span> Unit {tenantUnit?.name || 'Main'}
                        </div>
                    </div>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {/* Placeholder for QR or Property Image */}
                        <div style={{ fontSize: '2.5rem' }}>🏠</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboard;
