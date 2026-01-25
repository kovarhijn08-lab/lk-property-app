import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BellIcon, DollarIcon, FileTextIcon, InfoIcon, TrendUpIcon } from './Icons';
import Toast from './Toast';

const MobileSmartTasks = ({ properties, manualTasks = [], onAction, snoozedTasks = {}, warningPeriod = 30, history = [] }) => {
    const { t } = useLanguage();
    const [toast, setToast] = useState(null);

    // Generate tasks based on properties data
    const generateTasks = () => {
        const tasks = [];
        const today = new Date();
        const currentDay = today.getDate();

        const isSnoozed = (id) => {
            if (!snoozedTasks[id]) return false;
            return new Date(snoozedTasks[id]) > today;
        };

        properties.forEach(prop => {
            // 1. Rent Collection (Early month)
            if ((prop.type === 'rental' || prop.type === 'commercial') && currentDay >= 1 && currentDay <= 7) {
                const taskId = `rent-${prop.id}`;
                if (!isSnoozed(taskId)) {
                    tasks.push({
                        id: taskId,
                        type: 'finance',
                        title: 'Сбор аренды',
                        message: `Пора зафиксировать оплату аренды для ${prop.name}`,
                        propertyId: prop.id,
                        urgency: 'high',
                        actionLabel: 'Записать доход',
                        actionType: 'addTransaction',
                        actionData: { propertyId: prop.id, category: 'Rent', amount: prop.monthlyRent || 0 }
                    });
                }
            }

            // 2. Construction Payments (Due soon)
            if (prop.type === 'construction' && prop.installments) {
                const dueInstallment = prop.installments.find(i => i.status === 'due');
                if (dueInstallment) {
                    const taskId = `payment-${prop.id}-${dueInstallment.stage}`;
                    if (!isSnoozed(taskId)) {
                        tasks.push({
                            id: taskId,
                            type: 'construction',
                            title: 'Оплата этапа',
                            message: `Этап "${dueInstallment.stage}" в ${prop.name} требует оплаты: $${dueInstallment.amount.toLocaleString()}`,
                            propertyId: prop.id,
                            urgency: 'critical',
                            actionLabel: 'Подтвердить оплату',
                            actionType: 'addTransaction',
                            actionData: { propertyId: prop.id, category: 'Construction', amount: dueInstallment.amount, description: dueInstallment.stage }
                        });
                    }
                }
            }

            // 3. Expiring Contracts (Within warning period)
            if (prop.contracts) {
                const warningDate = new Date();
                warningDate.setDate(today.getDate() + warningPeriod);

                prop.contracts.forEach(contract => {
                    const endDate = new Date(contract.endDate);
                    const taskId = `contract-expiry-${contract.id}`;
                    if (endDate > today && endDate <= warningDate && !isSnoozed(taskId)) {
                        tasks.push({
                            id: taskId,
                            type: 'legal',
                            title: 'Истекает контракт',
                            message: `Договор с ${contract.tenantName} (${prop.name}) истекает ${endDate.toLocaleDateString()}`,
                            propertyId: prop.id,
                            urgency: 'high',
                            actionLabel: 'Продлить / Закрыть',
                            actionType: 'viewProperty',
                            actionData: prop.id
                        });
                    }
                });
            }

            // 4. Vacancies
            if ((prop.type === 'rental' || prop.type === 'commercial') && prop.occupancy && prop.occupancy.occupied < prop.occupancy.total) {
                const taskId = `vacancy-${prop.id}`;
                if (!isSnoozed(taskId)) {
                    tasks.push({
                        id: taskId,
                        type: 'vacancy',
                        title: 'Есть вакансия',
                        message: `${prop.name} не полностью заселен (${prop.occupancy.occupied}/${prop.occupancy.total})`,
                        propertyId: prop.id,
                        urgency: 'standard',
                        actionLabel: 'Найти арендатора',
                        actionType: 'viewProperty',
                        actionData: prop.id
                    });
                }
            }
        });

        // Add manual tasks
        manualTasks.forEach(mt => {
            tasks.push({
                ...mt,
                type: mt.type || 'standard',
                urgency: mt.urgency || 'standard',
                actionLabel: 'Детали',
                actionType: 'viewProperty',
                actionData: mt.propertyId
            });
        });

        return tasks.sort((a, b) => {
            const priority = { critical: 0, high: 1, standard: 2 };
            return priority[a.urgency] - priority[b.urgency];
        });
    };

    const tasks = generateTasks();

    const getUrgencyStyles = (urgency) => {
        switch (urgency) {
            case 'critical': return { borderLeft: '4px solid var(--accent-danger)', iconColor: 'var(--accent-danger)' };
            case 'high': return { borderLeft: '4px solid var(--accent-warning)', iconColor: 'var(--accent-warning)' };
            default: return { borderLeft: '4px solid var(--accent-primary)', iconColor: 'var(--accent-primary)' };
        }
    };

    const getIcon = (type, color) => {
        switch (type) {
            case 'finance': return <DollarIcon size={20} color={color} />;
            case 'construction': return <TrendUpIcon size={20} color={color} />;
            case 'legal': return <FileTextIcon size={20} color={color} />;
            default: return <BellIcon size={20} color={color} />;
        }
    };

    return (
        <div className="mobile-smart-tasks" style={{ paddingBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 800 }}>Умные задачи</h2>

            {tasks.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>✨</div>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Всё под контролем!</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Новых критических задач на сегодня нет.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {tasks.map(task => {
                        const style = getUrgencyStyles(task.urgency);
                        return (
                            <div key={task.id} className="glass-panel" style={{
                                padding: '16px',
                                borderLeft: style.borderLeft,
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.05)'
                                    }}>
                                        {getIcon(task.type, style.iconColor)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{task.title}</div>
                                            {task.urgency === 'critical' && (
                                                <span className="tag" style={{ background: 'var(--accent-danger)', color: 'white', fontSize: '0.65rem', padding: '2px 6px' }}>СРОЧНО</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                                            {task.message}
                                        </div>
                                    </div>
                                </div>
                                {task.type !== 'vacancy' && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => {
                                                if (task.actionType === 'addTransaction') {
                                                    setToast({ message: `💵 ${t('notifications.rentCollection')}...`, type: 'info' });
                                                } else if (task.actionType === 'viewProperty') {
                                                    setToast({ message: `📂 ${t('notifications.openingProperty')}`, type: 'info' });
                                                }
                                                setTimeout(() => onAction(task.actionType, task.actionData, task.id), 500);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: 'var(--gradient-primary)',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {task.actionLabel}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setToast({ message: `💤 ${t('notifications.snoozedSuccess')}`, type: 'success' });
                                                setTimeout(() => onAction('snooze', task.id), 500);
                                            }}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--glass-border)',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('notifications.snooze')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {history.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h2 style={{ fontSize: '1rem', marginBottom: '16px', fontWeight: 800, color: 'var(--text-secondary)' }}>{t('notifications.history')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {history.map(item => (
                            <div key={item.id} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.action}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.propertyName}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>{t('notifications.taskCompleted')}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MobileSmartTasks;
