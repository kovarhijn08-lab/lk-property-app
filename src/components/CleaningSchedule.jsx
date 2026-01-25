import React, { useState } from 'react';

const CleaningSchedule = ({ property, onUpdateCleanings, onAddExpense }) => {
    const cleanings = property.cleanings || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--accent-success)';
            case 'scheduled': return 'var(--accent-warning)';
            case 'missed': return 'var(--accent-danger)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleStatusChange = (id, newStatus) => {
        const updated = cleanings.map(c =>
            c.id === id ? { ...c, status: newStatus } : c
        );
        onUpdateCleanings(updated);
    };

    const handleDelete = (id) => {
        const updated = cleanings.filter(c => c.id !== id);
        onUpdateCleanings(updated);
    };

    return (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>🧹 Cleaning Tasks</h3>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>{cleanings.length} scheduled</span>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                {cleanings.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No cleanings scheduled</p>
                )}
                {cleanings.map(cleaning => (
                    <div key={cleaning.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getStatusColor(cleaning.status)}`
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Checkout: {cleaning.checkoutDate}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Guest: {cleaning.guestName}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '4px' }}>
                                {cleaning.vendor || 'No vendor'} • ${cleaning.cost || property.cleaningFee || 0}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={cleaning.status}
                                    onChange={(e) => handleStatusChange(cleaning.id, e.target.value)}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        background: '#0F172A',
                                        border: '1px solid var(--glass-border)',
                                        color: getStatusColor(cleaning.status),
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="missed">Missed</option>
                                </select>
                                <button
                                    onClick={() => handleDelete(cleaning.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    ×
                                </button>
                            </div>

                            {cleaning.status === 'completed' && (
                                <button
                                    onClick={() => {
                                        if (onAddExpense) {
                                            onAddExpense({
                                                amount: cleaning.cost || property.cleaningFee || 0,
                                                category: 'Cleaning',
                                                description: `Cleaning for ${cleaning.guestName}`,
                                                date: cleaning.checkoutDate
                                            });
                                        }
                                    }}
                                    style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid #10B981',
                                        color: '#10B981',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Log Expense
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '12px', textAlign: 'center' }}>
                Note: Cleaning tasks are created automatically on new booking checkout.
            </p>
        </div>
    );
};

export default CleaningSchedule;
