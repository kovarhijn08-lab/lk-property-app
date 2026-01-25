import React from 'react';

const CommercialMetrics = ({ property, transactions }) => {
    const { income, totalSqFt, camCharge, leaseType } = property;

    // Calculations
    const rentPerSqFt = totalSqFt > 0 ? (income / totalSqFt).toFixed(2) : 0;

    // CAM is often paid by tenant in NNN, so it's extra revenue for owner (reimbursement)
    // or it's built into the gross rent.
    const monthlyCAM = (camCharge || 0) * (totalSqFt || 0);

    // For this simplified version, let's calculate Reimbursables from transactions
    // that are categorized as 'tax', 'insurance', or 'maintenance' IF it's a NNN lease
    const reimbursableExpenses = leaseType === 'nnn'
        ? transactions
            .filter(tx => tx.type === 'expense' && ['tax', 'insurance', 'maintenance'].includes(tx.category))
            .reduce((sum, tx) => sum + tx.amount, 0)
        : 0;

    // Percentage Rent (Retail)
    const { salesBreakpoint, percentageRentRate } = property;
    const totalSales = transactions
        .filter(tx => tx.category === 'Sales')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const overBreakpoint = Math.max(0, totalSales - (salesBreakpoint || 0));
    const percentageRent = overBreakpoint * ((percentageRentRate || 0) / 100);

    const totalPotentialRevenue = income + monthlyCAM + reimbursableExpenses + percentageRent;

    // NOI = Income - OpEx (Exclude CapEx)
    const opEx = transactions
        .filter(tx => tx.type === 'expense' && tx.expenseType !== 'capex') // Only count OpEx or unspecified
        .reduce((sum, tx) => sum + tx.amount, 0);

    const netOperatingIncome = (income + monthlyCAM + percentageRent + (leaseType === 'nnn' ? reimbursableExpenses : 0)) - opEx;

    const efficiencyRatio = totalPotentialRevenue > 0
        ? ((netOperatingIncome / totalPotentialRevenue) * 100).toFixed(1)
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Commercial Performance
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Rent / SqFt</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
                        ${rentPerSqFt} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Lease Structure</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: leaseType === 'nnn' ? '#10B981' : 'var(--accent-primary)' }}>
                        {leaseType === 'nnn' ? 'Triple Net (NNN)' : 'Gross Lease'}
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly CAM Revenue</span>
                    <span style={{ fontWeight: 600 }}>+${monthlyCAM.toLocaleString()}</span>
                </div>

                {leaseType === 'nnn' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reimbursable (NNN)</span>
                        <span style={{ fontWeight: 600, color: '#10B981' }}>+${reimbursableExpenses.toLocaleString()}</span>
                    </div>
                )}

                {percentageRent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Percentage Rent</span>
                        <span style={{ fontWeight: 600, color: '#10B981' }}>+${percentageRent.toLocaleString()}</span>
                    </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Efficiency Ratio</div>
                    <div style={{ fontWeight: 700, color: efficiencyRatio > 80 ? '#10B981' : 'white' }}>
                        {efficiencyRatio}%
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                * Rent/SqFt calculated on base rent of ${income?.toLocaleString()}
            </div>
        </div>
    );
};

export default CommercialMetrics;
