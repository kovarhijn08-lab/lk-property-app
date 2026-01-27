import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import MetricCard from './MetricCard';
import CashFlowChart from './CashFlowChart';
import TransactionList from './TransactionList';

const OwnerPortal = ({ properties = [] }) => {
    const { t } = useLanguage();

    const totalPortfolioValue = properties.reduce((acc, p) => acc + (p.marketValue || 0), 0);
    const totalEquity = properties.reduce((acc, p) => acc + ((p.marketValue || 0) - (p.purchasePrice || 0)), 0);

    // Aggregated transactions for all properties
    const allTransactions = properties.flatMap(p => p.transactions || []);
    const totalIncome = allTransactions.filter(tx => tx.category === 'Rent' || tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = allTransactions.filter(tx => tx.category !== 'Rent' && tx.type !== 'income').reduce((acc, tx) => acc + tx.amount, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
            <header>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Investor Portal</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back. Here is your portfolio performance overview.</p>
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <MetricCard
                    title="Portfolio Value"
                    value={totalPortfolioValue}
                    unit="$"
                    status="positive"
                    infoText="Total current market value of your assets."
                />
                <MetricCard
                    title="Net Equity"
                    value={totalEquity}
                    unit="$"
                    status="positive"
                    infoText="Market Value minus Purchase/Loan basis."
                />
                <MetricCard
                    title="Gross Income"
                    value={totalIncome}
                    unit="$"
                    status="positive"
                    infoText="Total rent collected across all properties."
                />
                <MetricCard
                    title="Net Cash Flow"
                    value={totalIncome - totalExpenses}
                    unit="$"
                    status={(totalIncome - totalExpenses) >= 0 ? 'positive' : 'negative'}
                    infoText="Total profit after all operational expenses."
                />
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>Property Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {properties.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.address}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--accent-success)' }}>{((p.occupancy?.occupied / p.occupancy?.total) * 100).toFixed(0)}% Occ.</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ROI: 8.4%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>Recent Activity</h3>
                    <TransactionList
                        transactions={allTransactions.slice(0, 5)}
                        readOnly={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default OwnerPortal;
