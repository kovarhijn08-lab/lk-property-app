import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const MasterCalendar = ({ properties, onClose }) => {
    const { t, lang } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filters, setFilters] = useState({
        bookings: true,
        cleaning: true,
        leases: true,
        payments: true
    });

    const scrollContainerRef = useRef(null);

    // Get today's date string in local format
    const getTodayStr = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    const todayStr = getTodayStr();

    // Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysCount = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let d = 1; d <= daysCount; d++) {
            const dDate = new Date(year, month, d);
            const dayStr = String(d).padStart(2, '0');
            const monthStr = String(month + 1).padStart(2, '0');
            const weekDay = dDate.toLocaleDateString(lang === 'ru' ? 'ru' : 'en-US', { weekday: 'short' });

            days.push({
                dateStr: `${year}-${monthStr}-${dayStr}`,
                dayNum: d,
                weekDay: weekDay,
                isWeekend: dDate.getDay() === 0 || dDate.getDay() === 6,
                isToday: `${year}-${monthStr}-${dayStr}` === todayStr
            });
        }
        return days;
    };

    const days = getDaysInMonth(currentDate);

    const sortedProperties = [...properties].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

    // Event Aggregation Helper
    const getEventsForProperty = (property) => {
        const propEvents = [];

        // 1. STR Bookings
        if (property.type === 'str' && property.bookings && filters.bookings) {
            property.bookings.forEach(b => {
                const start = new Date(b.checkIn);
                const end = new Date(b.checkOut);

                const startStr = `${start.getMonth() + 1}/${start.getDate()}`;
                const endStr = `${end.getMonth() + 1}/${end.getDate()}`;

                let loop = new Date(start);
                loop.setHours(0, 0, 0, 0);
                while (loop <= end) {
                    const lYear = loop.getFullYear();
                    const lMonth = String(loop.getMonth() + 1).padStart(2, '0');
                    const lDay = String(loop.getDate()).padStart(2, '0');

                    propEvents.push({
                        date: `${lYear}-${lMonth}-${lDay}`,
                        type: 'booking',
                        color: 'var(--accent-primary)',
                        label: `${b.guestName}`,
                        rangeLabel: `${startStr} - ${endStr}`,
                        details: { guest: b.guestName, dates: `${startStr} - ${endStr}`, price: b.totalPrice },
                        isStart: loop.getTime() === start.getTime()
                    });
                    loop.setDate(loop.getDate() + 1);
                }
            });

            // 2. Cleaning
            if (filters.cleaning && property.bookings) {
                property.bookings.forEach(b => {
                    const end = new Date(b.checkOut);
                    const cleanDate = new Date(end);

                    const cYear = cleanDate.getFullYear();
                    const cMonth = String(cleanDate.getMonth() + 1).padStart(2, '0');
                    const cDay = String(cleanDate.getDate()).padStart(2, '0');

                    propEvents.push({
                        date: `${cYear}-${cMonth}-${cDay}`,
                        type: 'cleaning',
                        color: 'var(--accent-warning)',
                        label: '🧹',
                        isIcon: true
                    });
                });
            }
        }

        // 3. Leases
        if ((property.type === 'rental' || property.type === 'commercial') && property.contracts && filters.leases) {
            property.contracts.forEach(c => {
                if (c.startDate && c.endDate) {
                    const start = new Date(c.startDate);
                    const end = new Date(c.endDate);

                    let loop = new Date(start);
                    loop.setHours(0, 0, 0, 0);

                    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    if (loop < monthStart) loop = new Date(monthStart);

                    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                    while (loop <= end && loop <= monthEnd) {
                        const lYear = loop.getFullYear();
                        const lMonth = String(loop.getMonth() + 1).padStart(2, '0');
                        const lDay = String(loop.getDate()).padStart(2, '0');

                        const isVisualStart = loop.getTime() === start.getTime() || loop.getDate() === 1;

                        propEvents.push({
                            date: `${lYear}-${lMonth}-${lDay}`,
                            type: 'lease',
                            color: 'rgba(239, 68, 68, 0.4)',
                            borderColor: 'var(--accent-danger)',
                            label: c.tenantName || 'Tenant',
                            details: { tenant: c.tenantName, rent: c.monthlyRent, start: c.startDate, end: c.endDate },
                            isStart: isVisualStart,
                            isFill: true
                        });
                        loop.setDate(loop.getDate() + 1);
                    }
                }

                if (c.endDate) {
                    propEvents.push({
                        date: c.endDate,
                        type: 'lease-end',
                        color: 'var(--accent-danger)',
                        label: '🔴',
                        details: { tenant: c.tenantName, end: c.endDate },
                        isIcon: true
                    });
                }
            });
        }

        // 4. Payments
        if (property.type === 'construction' && property.installments && filters.payments) {
            property.installments.filter(i => i.status === 'pending').forEach(i => {
                if (i.dueDate) {
                    propEvents.push({
                        date: i.dueDate,
                        type: 'payment',
                        color: 'var(--accent-success)',
                        label: `$${Math.round(i.amount / 1000)}k`,
                        details: { amount: i.amount, due: i.dueDate },
                        isIcon: true
                    });
                }
            });
        }

        return propEvents;
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                        📅 {t('property.timeline')}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >◀</button>
                        <span style={{ fontWeight: 800, minWidth: '160px', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            {currentDate.toLocaleString(lang === 'ru' ? 'ru' : 'default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >▶</button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {[
                            { key: 'bookings', color: 'var(--accent-primary)', label: t('property.bookings') },
                            { key: 'cleaning', color: 'var(--accent-warning)', label: t('property.cleaning') },
                            { key: 'leases', color: 'var(--accent-danger)', label: t('property.leases') },
                            { key: 'payments', color: 'var(--accent-success)', label: t('property.payments') }
                        ].map(f => (
                            <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: filters[f.key] ? 1 : 0.4, transition: 'opacity 0.2s' }}>
                                <input
                                    type="checkbox"
                                    checked={filters[f.key]}
                                    onChange={e => setFilters({ ...filters, [f.key]: e.target.checked })}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: f.color }}></div>
                                <span style={{ color: 'white' }}>{f.label}</span>
                            </label>
                        ))}
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>{t('common.cancel')}</button>
                </div>
            </div>

            {/* Timeline Container */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

                {/* 1. Sidebar */}
                <div style={{
                    width: '240px',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    zIndex: 20,
                    flexShrink: 0
                }}>
                    <div style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 24px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                        {t('property.details')}
                    </div>
                    <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        {sortedProperties.map(p => (
                            <div key={p.id} style={{
                                height: '60px',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                padding: '0 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem', color: 'white' }}>{p.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>{p.type}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Timeline Grid */}
                <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }} ref={scrollContainerRef}>
                    <div style={{ minWidth: 'fit-content' }}>
                        {/* Days Header */}
                        <div style={{ display: 'flex', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                            {days.map(d => (
                                <div key={d.dateStr} style={{
                                    width: '60px',
                                    minWidth: '60px',
                                    borderRight: '1px solid rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: d.isToday ? 'rgba(99, 102, 241, 0.1)' : d.isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
                                    color: d.isToday ? 'var(--accent-primary)' : d.isWeekend ? 'var(--text-secondary)' : 'white',
                                    borderBottom: d.isToday ? '3px solid var(--accent-primary)' : 'none'
                                }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{d.weekDay}</span>
                                    <span style={{ fontWeight: 900, fontSize: '1.1rem', marginTop: '2px' }}>{d.dayNum}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Rows */}
                        {sortedProperties.map(p => {
                            const propEvents = getEventsForProperty(p);

                            return (
                                <div key={p.id} style={{ display: 'flex', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    {days.map(d => {
                                        const event = propEvents.find(e => e.date === d.dateStr);

                                        let cellContent = null;
                                        let cellBg = d.isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent';
                                        let cellCursor = 'default';
                                        let cellOnClick = null;

                                        if (event) {
                                            if (event.isStart) {
                                                // Start of a strip - show label
                                                cellBg = event.color;
                                                cellContent = (
                                                    <div
                                                        onClick={() => setSelectedEvent(event)}
                                                        style={{
                                                            position: 'absolute',
                                                            left: '4px',
                                                            top: '10px',
                                                            bottom: '10px',
                                                            zIndex: 5,
                                                            whiteSpace: 'nowrap',
                                                            background: event.borderColor || event.color,
                                                            borderRadius: '8px',
                                                            padding: '0 12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            fontSize: '0.75rem',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            fontWeight: 700,
                                                            border: event.borderColor ? `1px solid ${event.borderColor}` : 'none'
                                                        }} title={`${event.label} ${event.rangeLabel || ''}`}>
                                                        {event.label}
                                                    </div>
                                                );
                                            } else if (event.type === 'booking' || event.isFill) {
                                                // Continuation
                                                cellBg = event.color;
                                                cellCursor = 'pointer';
                                                cellOnClick = () => setSelectedEvent(event);
                                            } else if (event.isIcon) {
                                                cellContent = (
                                                    <span
                                                        style={{ fontSize: '1.1rem', cursor: 'pointer', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}
                                                        title={event.label}
                                                        onClick={() => setSelectedEvent(event)}
                                                    >
                                                        {event.type === 'cleaning' ? '🧹' : event.type === 'lease-end' ? '🔴' : '💰'}
                                                    </span>
                                                );
                                            }
                                        }

                                        return (
                                            <div
                                                key={d.dateStr}
                                                style={{
                                                    width: '60px',
                                                    minWidth: '60px',
                                                    borderRight: '1px solid rgba(255,255,255,0.03)',
                                                    background: cellBg,
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: cellCursor,
                                                    borderLeft: d.isToday ? '2px solid rgba(99, 102, 241, 0.3)' : 'none'
                                                }}
                                                onClick={cellOnClick}
                                            >
                                                {cellContent}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{
                padding: '12px 32px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(15, 23, 42, 0.98)',
                display: 'flex',
                gap: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                <span>📅 {t('property.timeline')}</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div> {t('property.bookings')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-warning)' }}></div> {t('property.cleaning')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-danger)' }}></div> {t('property.leases')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-success)' }}></div> {t('property.payments')}</div>
                </div>
                <span style={{ marginLeft: 'auto' }}>{t('property.clickDetails')}</span>
            </div>

            {/* Quick View Modal */}
            {selectedEvent && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(2, 6, 23, 0.8)',
                    backdropFilter: 'blur(20px)'
                }} onClick={() => setSelectedEvent(null)}>
                    <div className="glass-panel animate-slide-up" style={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '360px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                                <span style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: selectedEvent.type === 'booking' ? 'var(--accent-primary)' : selectedEvent.type === 'lease' || selectedEvent.type === 'lease-end' ? 'var(--accent-danger)' : 'var(--accent-success)',
                                    boxShadow: `0 0 10px ${selectedEvent.color}66`
                                }}></span>
                                {selectedEvent.label}
                            </h3>
                            <button onClick={() => setSelectedEvent(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {selectedEvent.rangeLabel && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>📅 {t('property.milestones')}</span>
                                    <span style={{ color: 'white', fontWeight: 800 }}>{selectedEvent.rangeLabel}</span>
                                </div>
                            )}
                            {selectedEvent.details?.rent && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>💵 {t('property.income')}</span>
                                    <span style={{ color: 'var(--accent-success)', fontWeight: 900 }}>${selectedEvent.details.rent?.toLocaleString()}/mo</span>
                                </div>
                            )}
                            {selectedEvent.details?.tenant && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>👤 {t('property.tenant')}</span>
                                    <span style={{ color: 'white', fontWeight: 800 }}>{selectedEvent.details.tenant}</span>
                                </div>
                            )}
                            {selectedEvent.details?.guest && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>👤 {t('property.guest')}</span>
                                    <span style={{ color: 'white', fontWeight: 800 }}>{selectedEvent.details.guest}</span>
                                </div>
                            )}
                            {selectedEvent.details?.price && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>💰 {t('property.purchasePrice')}</span>
                                    <span style={{ color: 'var(--accent-success)', fontWeight: 900 }}>${selectedEvent.details.price?.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>✨ {t('dashboard.metrics')}</span>
                                <span style={{ textTransform: 'uppercase', color: 'white', fontWeight: 800, fontSize: '0.8rem', opacity: 0.8 }}>{selectedEvent.type}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            style={{
                                width: '100%',
                                marginTop: '32px',
                                padding: '16px',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterCalendar;
