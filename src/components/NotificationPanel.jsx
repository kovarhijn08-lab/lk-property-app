import React, { useState } from 'react';
import Toast from './Toast';
import { useLanguage } from '../context/LanguageContext';

const NotificationPanel = ({ properties, onAction, snoozedTasks = {}, warningPeriod = 30 }) => {
    const { t } = useLanguage();
    const [toast, setToast] = useState(null);
    const notifications = [];
    const today = new Date();
    const currentDay = today.getDate();

    const isSnoozed = (id) => {
        if (!snoozedTasks[id]) return false;
        return new Date(snoozedTasks[id]) > today;
    };

    // Check each property for alerts
    properties.forEach(prop => {
        // RENTAL: Check if rent is due
        if (prop.type === 'rental' || prop.type === 'commercial') {
            if (currentDay >= 1 && currentDay <= 7) {
                const taskId = `rent-${prop.id}`;
                if (!isSnoozed(taskId)) {
                    notifications.push({
                        id: taskId,
                        type: 'warning',
                        icon: '💵',
                        title: t('notifications.rentCollection'),
                        message: `${t('notifications.rentDue')} ${prop.name}`,
                        property: prop.name,
                        actions: [
                            {
                                label: t('notifications.collectRent'),
                                handler: () => {
                                    setToast({ message: `💵 ${t('notifications.rentCollection')}...`, type: 'info' });
                                    onAction('addTransaction', { propertyId: prop.id, category: 'Rent' }, taskId);
                                },
                                primary: true
                            },
                            {
                                label: t('notifications.snooze'),
                                handler: () => onAction('snooze', taskId)
                            }
                        ]
                    });
                }
            }
        }

        // CONSTRUCTION: Check for upcoming payments
        if (prop.type === 'construction' && prop.installments) {
            const upcomingPayment = prop.installments.find(i => i.status === 'due');
            if (upcomingPayment) {
                const taskId = `payment-${prop.id}`;
                if (!isSnoozed(taskId)) {
                    notifications.push({
                        id: taskId,
                        type: 'danger',
                        icon: '🚨',
                        title: t('notifications.urgentPayment'),
                        message: `${upcomingPayment.stage} - $${upcomingPayment.amount.toLocaleString()}`,
                        property: prop.name,
                        actions: [
                            {
                                label: t('notifications.pay'),
                                handler: () => {
                                    setToast({ message: `🚨 ${t('notifications.preparingPayment')}`, type: 'info' });
                                    onAction('addTransaction', { propertyId: prop.id, amount: upcomingPayment.amount }, taskId);
                                },
                                primary: true
                            },
                            {
                                label: t('notifications.details'),
                                handler: () => {
                                    setToast({ message: `📂 ${t('notifications.openingProperty')}`, type: 'info' });
                                    onAction('viewProperty', prop.id);
                                }
                            },
                            {
                                label: t('notifications.snooze'),
                                handler: () => onAction('snooze', taskId)
                            }
                        ]
                    });
                }
            }
        }

        // Check for occupancy issues
        if ((prop.type === 'rental' || prop.type === 'commercial') && prop.occupancy) {
            if (prop.occupancy.occupied < prop.occupancy.total) {
                const taskId = `vacancy-${prop.id}`;
                if (!isSnoozed(taskId)) {
                    notifications.push({
                        id: taskId,
                        type: 'info',
                        icon: '🏚️',
                        title: t('notifications.propertyVacant'),
                        message: `${prop.name}: ${t('notifications.vacantUnits')} — ${prop.occupancy.total - prop.occupancy.occupied}`,
                        property: prop.name,
                        actions: [
                            {
                                label: t('notifications.details'),
                                handler: () => {
                                    setToast({ message: `ℹ️ ${t('notifications.openingProperty')}`, type: 'info' });
                                    setTimeout(() => onAction('viewProperty', prop.id), 500);
                                }
                            },
                            {
                                label: t('notifications.snooze'),
                                handler: () => onAction('snooze', taskId)
                            }
                        ]
                    });
                }
            }
        }

        // LEGAL: Check for expiring contracts
        if (prop.contracts) {
            prop.contracts.forEach(contract => {
                const end = new Date(contract.endDate);
                const warningDate = new Date();
                warningDate.setDate(today.getDate() + warningPeriod);

                const taskId = `contract-expiry-${contract.id}`;
                if (end > today && end <= warningDate && !isSnoozed(taskId)) {
                    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                    notifications.push({
                        id: taskId,
                        type: daysLeft <= 14 ? 'danger' : 'warning',
                        icon: '📜',
                        title: t('notifications.contractExpiry'),
                        message: `${contract.tenantName}: ${daysLeft} ${t('notifications.daysLeft')}`,
                        property: prop.name,
                        actions: [
                            {
                                label: t('notifications.renew'),
                                handler: () => {
                                    setToast({ message: `✅ ${t('notifications.openingLegal')}`, type: 'info' });
                                    setTimeout(() => onAction('viewLegal'), 500);
                                },
                                primary: true
                            },
                            {
                                label: t('notifications.details'),
                                handler: () => {
                                    setToast({ message: `ℹ️ ${t('notifications.openingProperty')}`, type: 'info' });
                                    setTimeout(() => onAction('viewProperty', prop.id), 500);
                                }
                            },
                            {
                                label: t('notifications.snooze'),
                                handler: () => onAction('snooze', taskId)
                            }
                        ]
                    });
                }
            });
        }
    });

    if (notifications.length === 0) return null;

    const getTypeColor = (type) => {
        switch (type) {
            case 'danger': return '#F43F5E';
            case 'warning': return '#F59E0B';
            case 'info': return 'var(--accent-primary)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <>
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-danger)', boxShadow: '0 0 8px var(--accent-danger)' }}></span>
                    {t('notifications.smartTasks')} ({notifications.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map(n => (
                        <div key={n.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            borderLeft: `4px solid ${getTypeColor(n.type)}`,
                            border: '1px solid rgba(255,255,255,0.05)',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: `${getTypeColor(n.type)}10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>
                                    {n.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{n.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                                </div>
                            </div>

                            {n.actions && n.actions.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {n.actions.map((btn, idx) => (
                                        <button
                                            key={idx}
                                            onClick={btn.handler}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                background: btn.primary ? 'white' : 'transparent',
                                                color: btn.primary ? 'black' : 'white'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (btn.primary) e.currentTarget.style.transform = 'translateY(-2px)';
                                                else e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (btn.primary) e.currentTarget.style.transform = 'translateY(0)';
                                                else e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default NotificationPanel;
