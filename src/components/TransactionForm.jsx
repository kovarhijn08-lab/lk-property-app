import React, { useState } from 'react';

const TransactionForm = ({ onSubmit, onClose, initialData, vendors = [] }) => {
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [category, setCategory] = useState(initialData?.category || 'Rent');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [vendorId, setVendorId] = useState(initialData?.vendorId || '');
    const [expenseType, setExpenseType] = useState(initialData?.expenseType || 'opex');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        onSubmit({
            id: Date.now(),
            amount: parseFloat(amount),
            category,
            expenseType: category === 'Rent' ? null : expenseType,
            description,
            vendorId: category === 'Rent' ? null : vendorId,
            date: date || new Date().toISOString()
        });
        setAmount('');
        setDescription('');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'end', justifyContent: 'center',
            zIndex: 100
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '480px',
                padding: '24px',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                animation: 'slideUp 0.3s ease'
            }}>
                <h3 style={{ marginTop: 0 }}>Log Transaction</h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Amount ($)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                            style={{
                                width: '100%', padding: '12px', fontSize: '1.2rem',
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white'
                                }}
                            >
                                <option value="Rent">Rent Income</option>
                                <option value="Repair">Repair Cost</option>
                                <option value="Mortgage">Mortgage</option>
                                <option value="Expense">Other Expense</option>
                            </select>
                        </div>
                        {category !== 'Rent' && (
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Expense Type</label>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setExpenseType('opex')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: expenseType === 'opex' ? 'var(--accent-primary)' : 'transparent',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        OpEx
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExpenseType('capex')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: expenseType === 'capex' ? 'var(--accent-warning)' : 'transparent',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        CapEx
                                    </button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {category !== 'Rent' && vendors.length > 0 && (
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Assign Vendor (Optional)</label>
                            <select
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white'
                                }}
                            >
                                <option value="">No Vendor</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.category})</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Home Depot Receipt"
                            style={{
                                width: '100%', padding: '12px', fontSize: '1rem',
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '12px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 1, padding: '16px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 600 }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default TransactionForm;
