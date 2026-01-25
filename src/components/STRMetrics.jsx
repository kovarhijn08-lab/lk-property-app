import React from 'react';
import MetricCard from './MetricCard';

const STRMetrics = ({ bookings = [], transactions = [], daysInMonth = 30 }) => {
    // 1. Revenue from Transactions (Actual Cash Flow)
    const revenue = transactions
        .filter(t => t.category === 'Rent')
        .reduce((sum, t) => sum + t.amount, 0);

    // 2. Platform Commissions
    const commissions = transactions
        .filter(t => t.description?.toLowerCase().includes('commission'))
        .reduce((sum, t) => sum + t.amount, 0);

    // 3. Cleaning Fees
    const cleaningParams = ['cleaning', 'cleaner', 'maid'];
    const cleaningFees = transactions
        .filter(t =>
            t.category === 'Cleaning' ||
            cleaningParams.some(term => t.description?.toLowerCase().includes(term))
        )
        .reduce((sum, t) => sum + t.amount, 0);

    // 4. Maintenance/Repair Expenses (from Bookings)
    const maintenanceExpenses = bookings
        .filter(b => b.type === 'maintenance')
        .reduce((sum, b) => sum + (parseFloat(b.maintenanceExpense) || 0), 0);

    // 5. Occupancy Rate Calculation
    const totalBookedDays = bookings.reduce((acc, b) => {
        const start = new Date(b.checkIn || b.startDate);
        const end = new Date(b.checkOut || b.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return acc + Math.max(0, diff);
    }, 0);
    const occupancyRate = ((totalBookedDays / daysInMonth) * 100).toFixed(0);

    // 6. Net STR Profit
    const netProfit = revenue - commissions - cleaningFees - maintenanceExpenses;

    // 7. Profit Margin
    const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

    return (
        <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>STR Performance & Profitability</h4>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '8px'
            }}>
                <MetricCard
                    title="Occupancy"
                    value={occupancyRate}
                    unit="%"
                    status={occupancyRate > 70 ? 'positive' : 'neutral'}
                    infoText={`${totalBookedDays} days booked out of ${daysInMonth}`}
                    compact={true}
                />
                <MetricCard
                    title="Revenue"
                    value={revenue}
                    unit="$"
                    status="neutral"
                    infoText="Total Rent Income recorded."
                    compact={true}
                />
                <MetricCard
                    title="Fees"
                    value={commissions}
                    unit="$"
                    status="neutral"
                    infoText="Total Platform Fees paid."
                    compact={true}
                />
                <MetricCard
                    title="Cleaning"
                    value={cleaningFees}
                    unit="$"
                    status="neutral"
                    infoText="Total Cleaning Expenses."
                    compact={true}
                />
                <MetricCard
                    title="Repairs"
                    value={maintenanceExpenses}
                    unit="$"
                    status="neutral"
                    infoText="Costs from maintenance/repair blocks."
                    compact={true}
                />
                <MetricCard
                    title="Net Profit"
                    value={netProfit}
                    unit="$"
                    status={netProfit > 0 ? 'positive' : 'negative'}
                    infoText="Revenue - Commissions - Cleaning."
                    compact={true}
                />
            </div>
            <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Profit Margin: <span style={{ color: margin > 20 ? 'var(--accent-success)' : 'var(--text-primary)', fontWeight: 600 }}>{margin}%</span>
            </div>
        </div>
    );
};

export default STRMetrics;
