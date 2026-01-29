import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import MetricCard from './MetricCard';
import TransactionList from './TransactionList';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUpIcon, FileTextIcon, ActivityIcon, PieChartIcon } from './Icons';

const OwnerPortal = ({ properties = [], onAddProperty, onOpenProperty, onOpenLegal, onOpenAssistant }) => {
    const { t } = useLanguage();
    const hasProperties = properties.length > 0;

    const totalPortfolioValue = properties.reduce((acc, p) => acc + (p.marketValue || 0), 0);
    const totalBasis = properties.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);
    const totalEquity = totalPortfolioValue - totalBasis;

    // Aggregated transactions for all properties
    const allTransactions = properties.flatMap(p => p.transactions || []);
    const totalIncome = allTransactions.filter(tx => tx.category === 'Rent' || tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = allTransactions.filter(tx => tx.category !== 'Rent' && tx.type !== 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;

    const portfolioROI = totalBasis > 0 ? ((netCashFlow * 12) / totalBasis) * 100 : 0;
    const portfolioCapRate = totalPortfolioValue > 0 ? ((netCashFlow * 12) / totalPortfolioValue) * 100 : 0;

    // Chart Data (Mocking monthly history for now)
    const chartData = [
        { name: 'Sep', amount: netCashFlow * 0.8 },
        { name: 'Oct', amount: netCashFlow * 0.9 },
        { name: 'Nov', amount: netCashFlow * 1.1 },
        { name: 'Dec', amount: netCashFlow * 0.95 },
        { name: 'Jan', amount: netCashFlow }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
            <header>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Investor Portal</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back. Here is your portfolio performance overview.</p>
            </header>

            {!hasProperties && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Start your first property</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Add a property to unlock metrics and booking tools.</div>
                    </div>
                    <button
                        onClick={() => onAddProperty && onAddProperty()}
                        className="btn-primary"
                        style={{ padding: '10px 16px', borderRadius: '10px' }}
                    >
                        + Add property
                    </button>
                </div>
            )}

            {hasProperties && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent-primary)', fontWeight: 800 }}>Quick actions</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>Manage portfolio in 1–2 clicks</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => onAddProperty && onAddProperty()}
                            className="btn-secondary"
                            style={{ padding: '10px 14px', borderRadius: '10px' }}
                        >
                            + Property
                        </button>
                        <button
                            onClick={() => onOpenProperty && onOpenProperty(properties[0]?.id)}
                            className="btn-primary"
                            style={{ padding: '10px 14px', borderRadius: '10px' }}
                        >
                            Open first property
                        </button>
                        <button
                            onClick={() => onOpenLegal && onOpenLegal()}
                            className="btn-secondary"
                            style={{ padding: '10px 14px', borderRadius: '10px' }}
                        >
                            Legal Hub
                        </button>
                        {onOpenAssistant && (
                            <button
                                onClick={() => onOpenAssistant()}
                                className="btn-secondary"
                                style={{ padding: '10px 14px', borderRadius: '10px' }}
                            >
                                {t('assistant.openChat')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
                />
                <MetricCard
                    title="Gross Yield (Cap)"
                    value={portfolioCapRate}
                    unit="%"
                    status="positive"
                />
                <MetricCard
                    title="Projected ROI"
                    value={portfolioROI}
                    unit="%"
                    status="positive"
                />
            </section>

            <div className="glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUpIcon size={18} color="var(--accent-primary)" />
                        Portfolio Cash Flow (Trend)
                    </h3>
                    <div style={{ color: 'var(--accent-success)', fontWeight: 800, fontSize: '0.9rem' }}>
                        Current Month: +${netCashFlow.toLocaleString()}
                    </div>
                </div>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChartIcon size={18} color="var(--accent-success)" />
                        Asset Performance
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {properties.map(p => {
                            const pOcc = p.occupancy ? (p.occupancy.occupied / p.occupancy.total) * 100 : 0;
                            return (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.address}</div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: pOcc >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: pOcc >= 90 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                                {pOcc.toFixed(0)}% Occupied
                                            </span>
                                            {p.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ fontWeight: 900, color: 'white', fontSize: '1.1rem' }}>${(p.marketValue / 1000).toFixed(0)}k</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 700 }}>↑ 4.2% YoY</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileTextIcon size={18} color="var(--accent-primary)" />
                            Documents & Tax Reports
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['2025 Annual Statement.pdf', 'Q4 Tax Summary.pdf', 'Insurance_Policy.pdf'].map(doc => (
                                <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', cursor: 'pointer' }}>
                                    <div style={{ fontSize: '1.2rem' }}>📄</div>
                                    <div style={{ flex: 1, fontSize: '0.85rem' }}>{doc}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>Download</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ActivityIcon size={18} color="var(--accent-warning)" />
                            Recent Activity
                        </h3>
                        <TransactionList
                            transactions={allTransactions.slice(0, 5)}
                            readOnly={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPortal;
