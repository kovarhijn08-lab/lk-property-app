import React, { useState } from 'react';
import MetricCard from './MetricCard';
import GlobalCashFlowChart from './GlobalCashFlowChart';
import AssetAllocationChart from './AssetAllocationChart';
import QuickMetricsBar from './QuickMetricsBar';
import GoalTracker from './GoalTracker';
import GoalEditModal from './GoalEditModal';
import Toast from './Toast';
import { useLanguage } from '../context/LanguageContext';
import { initialProperties } from '../data/properties';
import { TrendUpIcon, TrendDownIcon, HomeIcon, BuildingIcon, OfficeIcon, HotelIcon, PlusIcon, ExportIcon } from './Icons';

const GlobalDashboard = ({ properties, onPropertyClick, onViewReports, onUpdateProperty, onAddProperty }) => {
    const { t } = useLanguage();
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [toast, setToast] = useState(null);

    // Aggregated Calculations
    // Aggregated Calculations
    const safeProperties = Array.isArray(properties) ? properties : [];
    const activeProperties = safeProperties.filter(p => p.status !== 'sold');
    const soldProperties = safeProperties.filter(p => p.status === 'sold');

    const totalValue = activeProperties.reduce((acc, p) => acc + (Number(p.marketValue) || 0), 0);
    const totalInvested = activeProperties.reduce((acc, p) => acc + (Number(p.purchasePrice) || 0), 0);
    const totalEquity = totalValue - totalInvested;

    const totalLifetimeProfit = soldProperties.reduce((acc, p) => acc + (p.totalProfit || 0), 0);

    const totalCashFlow = activeProperties
        .filter(p => p.type !== 'construction')
        .reduce((acc, p) => {
            if (!p.transactions || !Array.isArray(p.transactions)) return acc;
            const income = p.transactions.filter(t => t.category === 'Rent').reduce((a, t) => a + t.amount, 0);
            const expenses = p.transactions.filter(t => t.category !== 'Rent').reduce((a, t) => a + t.amount, 0);
            return acc + (income - expenses);
        }, 0);

    const netOperatingIncome = activeProperties
        .filter(p => p.type !== 'construction')
        .reduce((acc, p) => {
            if (!p.transactions || !Array.isArray(p.transactions)) return acc;
            const income = p.transactions.filter(t => t.category === 'Rent').reduce((a, t) => a + t.amount, 0);
            const opEx = p.transactions.filter(t => t.category !== 'Rent' && t.expenseType !== 'capex').reduce((a, t) => a + t.amount, 0);
            return acc + (income - opEx);
        }, 0);

    const rentalCount = activeProperties.filter(p => p.type === 'rental').length;
    const constructionCount = activeProperties.filter(p => p.type === 'construction').length;
    const commercialCount = activeProperties.filter(p => p.type === 'commercial').length;

    // Calculate occupancy rate
    const totalUnits = activeProperties.reduce((acc, p) => acc + (p.occupancy?.total || 1), 0);
    const occupiedUnits = activeProperties.reduce((acc, p) => acc + (p.occupancy?.occupied || 0), 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Mock trend calculations (in real app, compare with previous period from Firestore)
    const cashFlowTrend = Math.random() * 20 - 5; // -5% to +15%
    const equityTrend = Math.random() * 15 + 2; // +2% to +17%
    const occupancyTrend = Math.random() * 10 - 3; // -3% to +7%

    // --- CHART DATA AGGREGATION ---
    const assetData = [
        { name: t('dashboard.ready'), value: activeProperties.filter(p => p.type === 'rental').reduce((a, p) => a + (p.marketValue || 0), 0) },
        { name: t('dashboard.construction'), value: activeProperties.filter(p => p.type === 'construction').reduce((a, p) => a + (p.marketValue || 0), 0) },
        { name: t('dashboard.commercial'), value: activeProperties.filter(p => p.type === 'commercial').reduce((a, p) => a + (p.marketValue || 0), 0) },
        { name: t('dashboard.realizedProfit'), value: totalLifetimeProfit }
    ].filter(i => i.value > 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const cashFlowChartData = monthNames.map(month => {
        const randomVar = Math.random() * 0.2 + 0.9;
        const mIncome = activeProperties.reduce((acc, p) => (acc + (p.income || 0) * randomVar), 0);
        const mExpenses = activeProperties.reduce((acc, p) => (acc + (p.expenses || 0) * randomVar), 0);
        return {
            name: month,
            income: Math.round(mIncome),
            expenses: Math.round(mExpenses),
            cashFlow: Math.round(mIncome - mExpenses)
        };
    });

    // Calculate total goal from all properties
    const totalGoal = activeProperties.reduce((acc, p) => acc + (p.cashFlowGoal || 0), 0);

    const handleSaveGoal = async (newGoal) => {
        // For global goal, distribute equally across all active properties
        if (activeProperties.length === 0) return;

        const perPropertyGoal = Math.floor(newGoal / activeProperties.length);

        try {
            // Update each property with its portion of the goal
            for (const property of activeProperties) {
                await onUpdateProperty(property.id, {
                    ...property,
                    cashFlowGoal: perPropertyGoal
                });
            }
            setToast({ message: `✅ ${t('common.saveGoal')}`, type: 'success' });
            setShowGoalModal(false);
        } catch (error) {
            setToast({ message: '❌ Error saving goal', type: 'error' });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GoalTracker
                currentCashFlow={totalCashFlow}
                goalAmount={totalGoal || 10000}
                onEditGoal={() => setShowGoalModal(true)}
            />

            <GoalEditModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                currentGoal={totalGoal || 10000}
                onSave={handleSaveGoal}
                propertyName="Весь Портфель"
            />

            {/* Header / Portfolio Summary */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '24px', position: 'relative', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-success)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                {t('dashboard.title')}
                            </h2>
                            <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-1px', color: 'white' }}>
                                ${totalValue.toLocaleString()}
                            </div>
                            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 800 }}>
                                    {totalLifetimeProfit > 0 ? `+${totalLifetimeProfit.toLocaleString()} realizing` : ''}
                                </div>
                            </div>
                        </div>
                        <BuildingIcon size={40} color="var(--accent-success)" strokeWidth={2} style={{ opacity: 0.2 }} />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{t('dashboard.activeProperties')}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{activeProperties.length}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div title="Ready" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HomeIcon size={14} color="var(--accent-success)" />
                            </div>
                            <div title="Construction" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BuildingIcon size={14} color="var(--accent-warning)" />
                            </div>
                            <div title="Commercial" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <OfficeIcon size={14} color="var(--accent-primary)" />
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <AssetAllocationChart data={assetData} size={48} />
                    </div>
                </div>
            </section>

            {/* Quick Metrics Bar */}
            <QuickMetricsBar
                cashFlow={totalCashFlow}
                cashFlowChange={cashFlowTrend}
                equity={totalEquity}
                equityChange={equityTrend}
                occupancyRate={occupancyRate}
                occupancyChange={occupancyTrend}
            />

            {/* Main Analytics Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', margin: 0 }}>
                            {t('dashboard.cashFlowPerformance')}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }}></div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{t('dashboard.income')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-danger)' }}></div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{t('dashboard.expenses')}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: '240px' }}>
                        <GlobalCashFlowChart data={cashFlowChartData} />
                    </div>
                </section>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '20px', minHeight: '300px' }}>
                    </div>
                </section>
            </div>

            {/* Metrics Bar */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <MetricCard
                    title={t('dashboard.cashFlow')}
                    value={totalCashFlow.toLocaleString()}
                    unit="$"
                    status={totalCashFlow > 0 ? 'positive' : 'negative'}
                    infoText={t('dashboard.cashFlowInfo')}
                />
                <MetricCard
                    title={t('property.equity')}
                    value={`${(totalEquity / 1000).toFixed(0)}k`}
                    unit="$"
                    status="neutral"
                    infoText={t('dashboard.equityInfo')}
                />
                <MetricCard
                    title={t('dashboard.noi')}
                    value={netOperatingIncome.toLocaleString()}
                    unit="$"
                    status={netOperatingIncome > 0 ? 'positive' : 'negative'}
                    infoText={t('dashboard.noiInfo')}
                />
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        onClick={() => {
                            window.print();
                            setToast({ message: `⏳ ${t('notifications.exportingPdf')}`, type: 'info' });
                        }}
                        className="no-print"
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: 'white',
                            border: '1px solid var(--glass-border)',
                            padding: '12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textTransform: 'uppercase'
                        }}
                    >
                        <ExportIcon size={14} /> {t('common.exportPdf')}
                    </button>
                    <button
                        onClick={() => {
                            setToast({ message: `📂 ${t('notifications.openingReports')}`, type: 'info' });
                            setTimeout(onViewReports, 800);
                        }}
                        className="no-print"
                        style={{
                            width: '100%',
                            marginTop: '8px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textTransform: 'uppercase'
                        }}
                    >
                        🧾 {t('common.taxDocs')}
                    </button>
                </div>
            </section>

            {/* Asset Inventory */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.allProperties')}</h2>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                    {properties.map(p => (
                        <div
                            key={p.id}
                            onClick={() => onPropertyClick(p.id)}
                            className="glass-panel"
                            style={{
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderLeft: `3px solid ${p.type === 'rental' ? 'var(--accent-success)' : p.type === 'construction' ? 'var(--accent-warning)' : 'var(--accent-primary)'}`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'var(--bg-card)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: p.thumbnailUrl ? `url(${p.thumbnailUrl}) center/cover` : 'rgba(0,0,0,0.2)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {!p.thumbnailUrl && (
                                        <>
                                            {p.type === 'rental' && <HomeIcon size={20} color="var(--accent-success)" />}
                                            {p.type === 'construction' && <BuildingIcon size={20} color="var(--accent-warning)" />}
                                            {p.type === 'commercial' && <OfficeIcon size={20} color="var(--accent-primary)" />}
                                            {p.type === 'str' && <HotelIcon size={20} color="#F43F5E" />}
                                        </>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>{p.name}</span>
                                        {/* Status Badge */}
                                        {p.occupancyStatus && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                background: p.occupancyStatus === 'occupied' ? 'rgba(16, 185, 129, 0.1)' : p.occupancyStatus === 'vacant' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: p.occupancyStatus === 'occupied' ? 'var(--accent-success)' : p.occupancyStatus === 'vacant' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                                                border: `1px solid ${p.occupancyStatus === 'occupied' ? 'rgba(16, 185, 129, 0.2)' : p.occupancyStatus === 'vacant' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                            }}>
                                                {p.occupancyStatus === 'occupied' ? '🟢 Занято' : p.occupancyStatus === 'vacant' ? '🔴 Свободно' : '🟡 Обслуживание'}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{p.address}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: '4px' }}>${p.marketValue?.toLocaleString()}</div>
                                {p.monthlyIncome && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                                        ${p.monthlyIncome.toLocaleString()}/мес
                                    </div>
                                )}
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>{p.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Empty State / Seed Data */}
            {properties.length === 0 && (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>{t('portfolio.emptyTitle') || 'Your Portfolio is Empty'}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                        {t('portfolio.emptyDesc') || 'Start by adding your first property or load our standard demo dataset to explore the features.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button
                            onClick={() => onAddProperty()}
                            className="btn-primary"
                            style={{ padding: '14px 28px' }}
                        >
                            + {t('property.addBtn')}
                        </button>
                        <button
                            onClick={async () => {
                                for (const prop of initialProperties) {
                                    await onAddProperty(prop);
                                }
                            }}
                            style={{
                                padding: '14px 28px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {t('portfolio.loadDemo') || 'Load Demo Data'}
                        </button>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default GlobalDashboard;
