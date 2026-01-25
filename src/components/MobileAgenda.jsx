import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CalendarIcon, MapIcon, UserIcon } from './Icons';

const MobileAgenda = ({ properties }) => {
    const { t } = useLanguage();

    // Extract all bookings and events from properties
    const events = properties.flatMap(prop => {
        const propEvents = [];

        // 1. STR Bookings
        if (prop.bookings) {
            prop.bookings.forEach(booking => {
                // Check-in event
                propEvents.push({
                    id: `checkin-${booking.id}`,
                    date: new Date(booking.checkIn),
                    type: 'check-in',
                    propertyName: prop.name,
                    guestName: booking.guestName,
                    status: booking.status
                });
                // Check-out event
                propEvents.push({
                    id: `checkout-${booking.id}`,
                    date: new Date(booking.checkOut),
                    type: 'check-out',
                    propertyName: prop.name,
                    guestName: booking.guestName,
                    status: booking.status
                });
            });
        }

        // 2. Construction Installments (as milestones)
        if (prop.installments) {
            prop.installments.forEach((inst, idx) => {
                propEvents.push({
                    id: `inst-${prop.id}-${idx}`,
                    date: new Date(inst.date),
                    type: 'payment',
                    propertyName: prop.name,
                    label: inst.stage,
                    amount: inst.amount,
                    status: inst.status
                });
            });
        }

        // 3. Contract End Dates
        if (prop.contracts) {
            prop.contracts.forEach(contract => {
                propEvents.push({
                    id: `contract-${contract.id}`,
                    date: new Date(contract.endDate),
                    type: 'contract-end',
                    propertyName: prop.name,
                    tenantName: contract.tenantName
                });
            });
        }

        return propEvents;
    });

    // Sort by date and filter future/recent
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedEvents = events
        .filter(e => e.date >= today) // Only future or today
        .sort((a, b) => a.date - b.date);

    const formatDate = (date) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const isToday = (date) => {
        const d = new Date(date);
        return d.toDateString() === new Date().toDateString();
    };

    const isTomorrow = (date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return new Date(date).toDateString() === tomorrow.toDateString();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'check-in': return <div style={{ color: 'var(--accent-success)' }}>📥</div>;
            case 'check-out': return <div style={{ color: 'var(--accent-danger)' }}>📤</div>;
            case 'payment': return <div style={{ color: 'var(--accent-warning)' }}>💰</div>;
            case 'contract-end': return <div style={{ color: 'var(--accent-primary)' }}>📄</div>;
            default: return '📅';
        }
    };

    return (
        <div className="mobile-agenda" style={{ paddingBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 800 }}>График событий</h2>

            {sortedEvents.length === 0 ? (
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Нет ближайших событий
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {sortedEvents.map((event, index) => {
                        const showDateHeader = index === 0 ||
                            event.date.toDateString() !== sortedEvents[index - 1].date.toDateString();

                        return (
                            <div key={event.id}>
                                {showDateHeader && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {isToday(event.date) ? 'Сегодня' : (isTomorrow(event.date) ? 'Завтра' : formatDate(event.date))}
                                        {isToday(event.date) && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 8px var(--accent-success)' }}></div>}
                                    </div>
                                )}
                                <div className="glass-panel" style={{
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    borderLeft: `4px solid ${event.type === 'check-in' ? 'var(--accent-success)' :
                                            event.type === 'check-out' ? 'var(--accent-danger)' :
                                                event.type === 'payment' ? 'var(--accent-warning)' : 'var(--accent-primary)'
                                        }`
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>
                                        {getIcon(event.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                            {event.type === 'check-in' ? `Заезд: ${event.guestName}` :
                                                event.type === 'check-out' ? `Выезд: ${event.guestName}` :
                                                    event.type === 'payment' ? `Платеж: ${event.label}` :
                                                        `Окончание аренды: ${event.tenantName}`}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapIcon size={12} /> {event.propertyName}
                                        </div>
                                    </div>
                                    {event.amount && (
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                                            ${event.amount.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MobileAgenda;
