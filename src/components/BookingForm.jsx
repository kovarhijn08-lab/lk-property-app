import React, { useState } from 'react';
import BookingCalendar from './BookingCalendar';

const BookingForm = ({ property, onAdd, onClose, initialData }) => {
    const [showCalendar, setShowCalendar] = useState(!initialData); // Start with calendar only if new
    const [checkIn, setCheckIn] = useState(initialData?.checkIn || '');
    const [checkOut, setCheckOut] = useState(initialData?.checkOut || '');
    const [bookingType, setBookingType] = useState(initialData?.type || 'guest'); // 'guest' or 'maintenance'
    const [guestName, setGuestName] = useState(initialData?.guestName || '');
    const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || '');
    const [securityDeposit, setSecurityDeposit] = useState(initialData?.securityDeposit || '');
    const [maintenanceExpense, setMaintenanceExpense] = useState(initialData?.maintenanceExpense || '');
    const [autoCleaning, setAutoCleaning] = useState(initialData?.autoCleaning ?? true);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const currency = property?.currency || 'USD';

    const existingBookings = property?.bookings || [];
    const isGuestBooking = bookingType === 'guest';
    const isFormReady = !!checkIn && !!checkOut && (!isGuestBooking || guestName.trim().length > 0);

    const handleDateSelect = (inDate, outDate) => {
        setCheckIn(inDate);
        setCheckOut(outDate);
        setShowCalendar(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!checkIn || !checkOut || (bookingType === 'guest' && !guestName)) {
            alert('Please fill in all required fields');
            return;
        }

        // Final overlap validation
        const newStart = new Date(checkIn);
        const newEnd = new Date(checkOut);

        const hasOverlap = existingBookings.filter(b => b.id !== initialData?.id).some(b => {
            const existingStart = new Date(b.checkIn);
            const existingEnd = new Date(b.checkOut);
            return newStart < existingEnd && newEnd > existingStart;
        });

        if (hasOverlap) {
            alert('Error: These dates overlap with an existing booking!');
            return;
        }

        onAdd({
            id: initialData?.id || Date.now().toString(),
            type: bookingType,
            checkIn,
            checkOut,
            guestName: bookingType === 'maintenance' ? (initialData?.id ? guestName : '🔧 Maintenance') : guestName,
            totalPrice: bookingType === 'maintenance' ? 0 : (parseFloat(totalPrice) || 0),
            maintenanceExpense: bookingType === 'maintenance' ? (parseFloat(maintenanceExpense) || 0) : 0,
            securityDeposit: bookingType === 'maintenance' ? 0 : (parseFloat(securityDeposit) || 0),
            depositStatus: bookingType === 'guest' && securityDeposit > 0 ? 'collected' : 'none',
            autoCleaning: bookingType === 'guest' ? autoCleaning : false,
            notes,
            createdAt: new Date().toISOString()
        });
    };

    // Calculate nights
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diff = new Date(checkOut) - new Date(checkIn);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();

    const formStyles = `
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
    `;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)'
        }}>
            <style>{formStyles}</style>
            {showCalendar ? (
                <BookingCalendar
                    existingBookings={existingBookings}
                    propertyName={property?.name}
                    onSelectRange={handleDateSelect}
                    onCancel={onClose}
                />
            ) : (
                <div className="animate-slide-up" style={{
                    background: '#1E293B',
                    borderRadius: '16px',
                    width: '400px',
                    maxWidth: '95vw',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    {/* Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
                            {initialData ? '✏️ Edit Entry' : '🏨 New Booking'}
                        </h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{property?.name}</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                        {/* Selected Dates (Clickable to reopen calendar) */}
                        <div
                            onClick={() => setShowCalendar(true)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check-In</div>
                                <div style={{ fontWeight: 600, color: 'white', marginTop: '4px' }}>{checkIn}</div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3B82F6'
                            }}>
                                <span style={{ fontSize: '0.75rem' }}>{nights} nights</span>
                                <span>→</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check-Out</div>
                                <div style={{ fontWeight: 600, color: 'white', marginTop: '4px' }}>{checkOut}</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-12px', marginBottom: '16px' }}>
                            Click to change dates
                        </p>

                        {/* Booking Type Toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            <button
                                type="button"
                                onClick={() => setBookingType('guest')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: bookingType === 'guest' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                👤 Guest
                            </button>
                            <button
                                type="button"
                                onClick={() => setBookingType('maintenance')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: bookingType === 'maintenance' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                🔧 Repair / Maint
                            </button>
                        </div>

                        {/* Guest Name - Only for Guests */}
                        {bookingType === 'guest' ? (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Guest Name *
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#F59E0B', fontWeight: 500 }}>
                                    🛠️ Maintenance Block
                                </p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    These dates will be blocked for guests.
                                </p>
                            </div>
                        )}

                        {/* Total Price & Deposit (Guest) OR Expense (Maintenance) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            {bookingType === 'guest' ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                            Total Price ({currency})
                                        </label>
                                        <input
                                            type="number"
                                            value={totalPrice}
                                            onChange={(e) => setTotalPrice(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                            Deposit ({currency})
                                        </label>
                                        <input
                                            type="number"
                                            value={securityDeposit}
                                            onChange={(e) => setSecurityDeposit(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#F59E0B', marginBottom: '6px' }}>
                                        Estimated Repair Expense ({currency})
                                    </label>
                                    <input
                                        type="number"
                                        value={maintenanceExpense}
                                        onChange={(e) => setMaintenanceExpense(e.target.value)}
                                        placeholder="Enter cost of repair"
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            background: 'rgba(245, 158, 11, 0.05)',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Automation Toggle - Only for Guests */}
                        {bookingType === 'guest' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                <input
                                    type="checkbox"
                                    id="autoCleaning"
                                    checked={autoCleaning}
                                    onChange={(e) => setAutoCleaning(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="autoCleaning" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    ✨ Auto-schedule cleaning for checkout
                                </label>
                            </div>
                        )}

                        {/* Notes */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special requests..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        {/* Summary */}
                        <div style={{
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.03)',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Summary</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>Dates</span>
                                <span style={{ color: 'white' }}>{checkIn} → {checkOut} • {nights} nights</span>
                            </div>
                            {isGuestBooking ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'white' }}>{currency} {Number(totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
                                        <span>Deposit</span>
                                        <span style={{ color: 'white' }}>{currency} {Number(securityDeposit || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                        {autoCleaning ? '✅ Auto‑cleaning enabled' : 'Auto‑cleaning off'}
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
                                    <span>Repair expense</span>
                                    <span style={{ color: 'white' }}>{currency} {Number(maintenanceExpense || 0).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        {!isFormReady && (
                            <div style={{ marginBottom: '12px', fontSize: '0.8rem', color: '#F59E0B' }}>
                                Please fill required fields to continue.
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isFormReady}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isFormReady ? '#10B981' : 'rgba(255,255,255,0.08)',
                                    color: isFormReady ? 'white' : 'var(--text-secondary)',
                                    cursor: isFormReady ? 'pointer' : 'not-allowed',
                                    fontWeight: 600
                                }}
                            >
                                ✓ {initialData ? 'Update Entry' : 'Save Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BookingForm;
