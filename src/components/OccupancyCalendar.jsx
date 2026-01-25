import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const OccupancyCalendar = ({ bookings = [], onDateClick }) => {
    const { t, language } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthNames = language === 'ru' ? monthNamesRu : monthNamesEn;

    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayNames = language === 'ru' ? dayNamesRu : dayNamesEn;

    const getDateInfo = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);

        let startBlock = null;
        let endBlock = null;
        let middleBlock = null;

        bookings.forEach(b => {
            const bStart = new Date(b.checkIn || b.startDate);
            const bEnd = new Date(b.checkOut || b.endDate);
            bStart.setHours(0, 0, 0, 0);
            bEnd.setHours(0, 0, 0, 0);

            if (checkDate.getTime() === bStart.getTime()) {
                startBlock = b;
            } else if (checkDate.getTime() === bEnd.getTime()) {
                endBlock = b;
            } else if (checkDate > bStart && checkDate < bEnd) {
                middleBlock = b;
            }
        });

        if (middleBlock) return { status: 'fully-booked', type: middleBlock.type, details: middleBlock };
        if (startBlock && endBlock) return { status: 'turnaround', startBlock, endBlock };
        if (startBlock) return { status: 'check-in', type: startBlock.type, details: startBlock };
        if (endBlock) return { status: 'check-out', type: endBlock.type, details: endBlock };

        return { status: 'vacant' };
    };

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} style={{ padding: isMobile ? '4px' : '8px' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const info = getDateInfo(day);
        const { status, type, details, startBlock, endBlock } = info;

        const getColor = (t) => t === 'maintenance' ? '#F59E0B' : 'var(--accent-success)';
        const vacantColor = 'rgba(255,255,255,0.05)';

        let bgColor = vacantColor;
        let currentDetails = details;

        if (status === 'fully-booked') {
            bgColor = getColor(type);
        } else if (status === 'turnaround') {
            bgColor = `linear-gradient(135deg, ${getColor(endBlock.type)} 49%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, ${getColor(startBlock.type)} 51%)`;
            currentDetails = startBlock;
        } else if (status === 'check-in') {
            bgColor = `linear-gradient(135deg, ${vacantColor} 50%, ${getColor(type)} 50%)`;
        } else if (status === 'check-out') {
            bgColor = `linear-gradient(135deg, ${getColor(type)} 50%, ${vacantColor} 50%)`;
        }

        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        const isSelected = selectedDate?.day === day;

        days.push(
            <div
                key={day}
                onClick={() => {
                    setSelectedDate({ day, status, details: currentDetails, info });
                    if (onDateClick) onDateClick(day, month, year);
                }}
                style={{
                    padding: isMobile ? '10px 4px' : '14px 8px',
                    textAlign: 'center',
                    background: bgColor,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                    fontWeight: status !== 'vacant' ? 800 : 600,
                    color: status !== 'vacant' ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    position: 'relative',
                    border: isToday ? '2px solid var(--accent-primary)' : isSelected ? '2px solid white' : '1px solid transparent',
                    boxShadow: isSelected ? '0 0 10px rgba(255,255,255,0.2)' : 'none'
                }}
            >
                {day}
                {status !== 'vacant' && !isMobile && !isSelected && (
                    <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'white', opacity: 0.5 }}></div>
                )}
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: isMobile ? '16px' : '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{monthNames[month]} {year}</h3>
                <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '10px' }}>
                {dayNames.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 900, textTransform: 'uppercase' }}>{d}</div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {days}
            </div>

            {selectedDate && selectedDate.status !== 'vacant' && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {selectedDate.status === 'turnaround' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-danger)', fontWeight: 800, textTransform: 'uppercase' }}>Check-out</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{selectedDate.info.endBlock.guestName}</div>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 800, textTransform: 'uppercase' }}>Check-in</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{selectedDate.info.startBlock.guestName}</div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '0.65rem', color: selectedDate.details?.type === 'maintenance' ? '#F59E0B' : 'var(--accent-success)', fontWeight: 800, textTransform: 'uppercase' }}>
                                {selectedDate.details?.type === 'maintenance' ? (language === 'ru' ? 'Ремонт' : 'Maintenance') : (language === 'ru' ? 'Бронирование' : 'Booking')}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', marginTop: '2px' }}>
                                {selectedDate.details?.guestName || 'Occupied'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                                {selectedDate.details?.checkIn} — {selectedDate.details?.checkOut}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center', fontSize: '0.65rem', flexWrap: 'wrap', opacity: 0.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Гость' : 'Guest'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Ремонт' : 'Repair'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Свободно' : 'Vacant'}</span>
                </div>
            </div>
        </div>
    );
};

export default OccupancyCalendar;
