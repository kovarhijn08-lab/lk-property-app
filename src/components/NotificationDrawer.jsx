import React, { useState, useRef } from 'react';
import Toast from './Toast';
import { useLanguage } from '../context/LanguageContext';
import { CloseIcon } from './Icons';

const NotificationDrawer = ({ isOpen, onClose, properties, onAction, snoozedTasks = {}, warningPeriod = 30 }) => {
    const { t } = useLanguage();
    const [toast, setToast] = useState(null);
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);

    const notifications = [];
    const today = new Date();
    const currentDay = today.getDate();

    const isSnoozed = (id) => {
        if (!snoozedTasks[id]) return false;
        return new Date(snoozedTasks[id]) > today;
    };

    // Check each property for alerts (same logic as NotificationPanel)
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
                                    onClose();
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
                                    onClose();
                                },
                                primary: true
                            },
                            {
                                label: t('notifications.details'),
                                handler: () => {
                                    setToast({ message: `📂 ${t('notifications.openingProperty')}`, type: 'info' });
                                    onAction('viewProperty', prop.id);
                                    onClose();
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
                                    onClose();
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
                                    onClose();
                                },
                                primary: true
                            },
                            {
                                label: t('notifications.details'),
                                handler: () => {
                                    setToast({ message: `ℹ️ ${t('notifications.openingProperty')}`, type: 'info' });
                                    setTimeout(() => onAction('viewProperty', prop.id), 500);
                                    onClose();
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

    const getTypeColor = (type) => {
        switch (type) {
            case 'danger': return '#F43F5E';
            case 'warning': return '#F59E0B';
            case 'info': return 'var(--accent-primary)';
            default: return 'var(--text-secondary)';
        }
    };

    // Swipe to close handler (swipe right)
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchCurrentX.current - touchStartX.current;
        if (diff > 50) { // Swipe right threshold
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1999,
                        backdropFilter: 'blur(4px)',
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* Drawer */}
            <aside
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 'min(400px, 90vw)',
                    background: 'var(--bg-secondary)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 2000,
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isOpen ? '-20px 0 50px rgba(0,0,0,0.5)' : 'none',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--accent-danger)',
                                boxShadow: '0 0 8px var(--accent-danger)'
                            }}></span>
                            <h2 style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: 'var(--text-secondary)',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px'
                            }}>
                                Важные Напоминания
                            </h2>
                        </div>
                        {notifications.length > 0 && (
                            <div style={{
                                fontSize: '1.4rem',
                                fontWeight: 900,
                                color: 'white',
                                fontFamily: 'var(--font-display)'
                            }}>
                                {notifications.length} {notifications.length === 1 ? 'задача' : 'задачи'}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <CloseIcon size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Notifications List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px'
                }}>
                    {notifications.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            padding: '40px 20px'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>🎉</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Всё отлично!</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Нет важных напоминаний</div>
                        </div>
                    ) : (
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
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                    )}
                </div>
            </aside>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default NotificationDrawer;
