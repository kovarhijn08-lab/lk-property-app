import React, { useState, useMemo } from 'react';

const TaxReport = ({ properties }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedPropertyId, setSelectedPropertyId] = useState('all');

    const years = [2024, 2025, 2026];

    // IRS-like categories for rental property
    const taxCategories = {
        'Rent': 'Rental Income',
        'Repair': 'Repairs',
        'Tax': 'Taxes',
        'Insurance': 'Insurance',
        'Mortgage': 'Mortgage Interest',
        'Utility': 'Utilities',
        'Management': 'Management Fees',
        'Commission': 'Commissions',
        'Other': 'Other Expenses'
    };

    const reportData = useMemo(() => {
        const filteredProps = selectedPropertyId === 'all'
            ? properties
            : properties.filter(p => p.id === selectedPropertyId);

        const totals = {};
        Object.values(taxCategories).forEach(cat => totals[cat] = 0);

        filteredProps.forEach(prop => {
            (prop.transactions || []).forEach(tx => {
                const txYear = new Date(tx.date).getFullYear();
                if (txYear === selectedYear) {
                    const category = taxCategories[tx.category] || taxCategories['Other'];
                    totals[category] += tx.amount;
                }
            });
        });

        return totals;
    }, [properties, selectedYear, selectedPropertyId]);

    const income = reportData['Rental Income'];
    const expenses = Object.entries(reportData)
        .filter(([cat]) => cat !== 'Rental Income')
        .reduce((sum, [_, val]) => sum + val, 0);
    const net = income - expenses;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🧾 Tax Preparation Report</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Income</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-success)' }}>${income.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Expenses</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-danger)' }}>${expenses.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Net (Schedule E)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>${net.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(reportData).map(([category, amount]) => (
                    <div key={category} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{category}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: category === 'Rental Income' ? 'var(--accent-success)' : 'white' }}>
                            ${amount.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', gap: '8px' }}>
                    <span>ℹ️</span>
                    These figures are aggregated based on your recorded transactions and mapped to standard Schedule E categories.
                </p>
            </div>

            <button
                onClick={() => window.print()}
                style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer'
                }}
            >
                🖨️ Export as PDF / Print
            </button>
        </div>
    );
};

export default TaxReport;
