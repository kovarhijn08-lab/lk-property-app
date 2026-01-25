import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const BookingCalendar = ({ existingBookings = [], onSelectRange, onCancel, propertyName }) => {
    const { t, lang } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCheckIn, setSelectedCheckIn] = useState(null);
    const [selectedCheckOut, setSelectedCheckOut] = useState(null);
    const [error, setError] = useState(null);

    // Helper: Get today's date string
    const getTodayStr = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };
    const todayStr = getTodayStr();

    // Helper: Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysCount = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        for (let d = 1; d <= daysCount; d++) {
            const dayStr = String(d).padStart(2, '0');
            const monthStr = String(month + 1).padStart(2, '0');
            days.push({
                dateStr: `${year}-${monthStr}-${dayStr}`,
                dayNum: d,
                dateObj: new Date(year, month, d)
            });
        }
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    // Check if a date is blocked
    const getBookingStatus = (dateStr) => {
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);

        let isStart = false;
        let isEnd = false;
        let isMiddle = false;
        let blockType = 'guest';

        existingBookings.forEach(b => {
            const start = new Date(b.checkIn);
            const end = new Date(b.checkOut);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            if (checkDate.getTime() === start.getTime()) {
                isStart = true;
                if (b.type === 'maintenance') blockType = 'maintenance';
            }
            else if (checkDate.getTime() === end.getTime()) {
                isEnd = true;
                if (b.type === 'maintenance') blockType = 'maintenance';
            }
            else if (checkDate > start && checkDate < end) {
                isMiddle = true;
                if (b.type === 'maintenance') blockType = 'maintenance';
            }
        });

        return { isStart, isEnd, isMiddle, blockType, isFullyBlocked: isMiddle || (isStart && isEnd) };
    };

    // Check if a date is in the past
    const isPast = (dateStr) => {
        return dateStr < todayStr;
    };

    // Check if date is within selected range
    const isInSelectedRange = (dateStr) => {
        if (!selectedCheckIn || !selectedCheckOut) return false;
        return dateStr >= selectedCheckIn && dateStr <= selectedCheckOut;
    };

    // Handle date click
    const handleDateClick = (dateStr) => {
        const status = getBookingStatus(dateStr);
        if (isPast(dateStr)) return;

        setError(null);

        if (!selectedCheckIn) {
            // First click - set check-in
            if (status.isStart || status.isMiddle) return;
            setSelectedCheckIn(dateStr);
            setSelectedCheckOut(null);
        } else if (!selectedCheckOut) {
            // Second click - set check-out
            if (dateStr <= selectedCheckIn) {
                if (status.isStart || status.isMiddle) return;
                setSelectedCheckIn(dateStr);
                return;
            }

            if (status.isEnd || status.isMiddle) return;

            // Check if any FULLY blocked date is within the range
            const hasBlockedInRange = days.some(d => {
                if (d.dateStr <= selectedCheckIn || d.dateStr >= dateStr) return false;
                const dStatus = getBookingStatus(d.dateStr);
                return dStatus.isFullyBlocked || dStatus.isStart;
            });

            if (hasBlockedInRange) {
                setError(t('property.errorDoubleBooking'));
                return;
            }

            setSelectedCheckOut(dateStr);
        } else {
            // Third click - reset and start over
            if (status.isStart || status.isMiddle) return;
            setSelectedCheckIn(dateStr);
            setSelectedCheckOut(null);
        }
    };

    const handleConfirm = () => {
        if (selectedCheckIn && selectedCheckOut) {
            onSelectRange(selectedCheckIn, selectedCheckOut);
        }
    };

    const calendarStyles = `
        @keyframes glow-pulse {
            0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.6); }
            100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.4); }
        }
        .day-cell {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .day-cell:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: scale(1.05);
            z-index: 10;
        }
    `;

    const weekDays = lang === 'ru' ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(20px)'
        }}>
            <style>{calendarStyles}</style>
            <div className="glass-panel" style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '24px',
                width: '420px',
                maxWidth: '95vw',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>📅 {t('property.selectDates')}</h3>
                    {propertyName && <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{propertyName}</p>}
                </div>

                {/* Month Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.02)' }}>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >◀</button>
                    <span style={{ fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                        {currentDate.toLocaleString(lang === 'ru' ? 'ru' : 'default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >▶</button>
                </div>

                {/* Weekday Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', padding: '12px 24px', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {weekDays.map(wd => <span key={wd}>{wd}</span>)}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', padding: '12px 24px 24px' }}>
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ height: '44px' }}></div>
                    ))}

                    {days.map(d => {
                        const status = getBookingStatus(d.dateStr);
                        const past = isPast(d.dateStr);
                        const isCheckIn = d.dateStr === selectedCheckIn;
                        const isCheckOut = d.dateStr === selectedCheckOut;
                        const inRange = isInSelectedRange(d.dateStr);
                        const isToday = d.dateStr === todayStr;

                        let bgColor = 'rgba(255,255,255,0.03)';
                        let textColor = 'white';
                        let cursor = 'pointer';
                        let borderStyle = '1px solid transparent';
                        let className = 'day-cell';

                        const isFullyBooked = status.isFullyBlocked || status.isMiddle;
                        const isStart = status.isStart;
                        const isEnd = status.isEnd;
                        const isMaint = status.blockType === 'maintenance';

                        if (isFullyBooked) {
                            bgColor = 'rgba(244, 63, 94, 0.15)';
                            textColor = 'rgba(255,255,255,0.3)';
                            cursor = 'not-allowed';
                            className += ' disabled';
                        } else if (isStart) {
                            bgColor = 'rgba(244, 63, 94, 0.1)';
                            cursor = 'not-allowed';
                            className += ' disabled';
                        } else if (past) {
                            bgColor = 'transparent';
                            textColor = 'rgba(255,255,255,0.15)';
                            cursor = 'not-allowed';
                            className += ' disabled';
                        }

                        if (isCheckIn || isCheckOut) {
                            bgColor = 'var(--accent-primary)';
                            textColor = 'white';
                        } else if (inRange) {
                            bgColor = 'rgba(99, 102, 241, 0.2)';
                        }

                        if (isToday) {
                            borderStyle = '1px solid var(--accent-danger)';
                        }

                        return (
                            <div
                                key={d.dateStr}
                                onClick={() => cursor !== 'not-allowed' && handleDateClick(d.dateStr)}
                                className={className}
                                style={{
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    background: bgColor,
                                    color: textColor,
                                    cursor: cursor,
                                    fontSize: '0.9rem',
                                    fontWeight: (isCheckIn || isCheckOut) ? 800 : 500,
                                    border: borderStyle,
                                    position: 'relative',
                                    boxShadow: (isCheckIn || isCheckOut) ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
                                }}
                            >
                                <span style={{ position: 'relative', zIndex: 1 }}>{d.dayNum}</span>
                                {isFullyBooked && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: '50%',
                                        height: '1px',
                                        width: '50%',
                                        background: 'rgba(244, 63, 94, 0.5)',
                                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                                        zIndex: 2
                                    }}></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ padding: '0 24px 24px', display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(244, 63, 94, 0.3)' }}></span> {t('property.occupied')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--accent-primary)' }}></span> {t('property.selected')}
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="animate-pulse" style={{ padding: '12px 24px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-danger)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}>
                        {error}
                    </div>
                )}

                {/* Selection Summary */}
                {(selectedCheckIn || selectedCheckOut) && (
                    <div style={{ padding: '16px 24px', background: 'rgba(99, 102, 241, 0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', color: 'white', fontSize: '0.9rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{t('property.checkIn')}</div>
                                <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{selectedCheckIn || '—'}</div>
                            </div>
                            <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '1.2rem' }}>→</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{t('property.checkOut')}</div>
                                <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{selectedCheckOut || '—'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ padding: '24px', display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={onCancel}
                        style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem' }}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedCheckIn || !selectedCheckOut}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            border: 'none',
                            background: (selectedCheckIn && selectedCheckOut) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: (selectedCheckIn && selectedCheckOut) ? 'pointer' : 'not-allowed',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            boxShadow: (selectedCheckIn && selectedCheckOut) ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        {t('property.confirmDates')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
