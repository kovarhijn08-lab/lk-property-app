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
import FilterBar from './FilterBar'; // [NEW]
import { getUniqueTags, getTagColor, matchTags } from '../utils/tagUtils'; // [NEW]

const GlobalDashboard = ({ properties, onPropertyClick, onViewReports, onUpdateProperty, onAddProperty, onOpenDrawer, onOpenAssistant, onOpenCalendar, onOpenLegalHub, onOpenPropertyTab, onOpenBookingFlow, onOpenChats, user }) => {
    const { t } = useLanguage();
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [toast, setToast] = useState(null);

    // [NEW] Filter States
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Aggregated Calculations
    // Aggregated Calculations
    const safeProperties = Array.isArray(properties) ? properties : [];

    // [NEW] Filtering Logic
    const filteredProperties = safeProperties.filter(p => {
        const matchesType = selectedType === 'all' || p.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || p.occupancyStatus === selectedStatus;
        const matchesTags = matchTags(p, selectedTags);
        return matchesType && matchesStatus && matchesTags;
    });

    const activeProperties = filteredProperties.filter(p => p.status !== 'sold');
    const soldProperties = filteredProperties.filter(p => p.status === 'sold');

    const allAvailableTags = getUniqueTags(safeProperties);
    const availableTypes = Array.from(new Set(safeProperties.map(p => p.type)));
    const availableStatuses = Array.from(new Set(safeProperties.map(p => p.occupancyStatus).filter(Boolean)));

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

    const contractCount = activeProperties.reduce((acc, p) => acc + ((p.contracts || []).length), 0);
    const hasProperty = activeProperties.length > 0;
    const hasDocs = contractCount >= 2;
    const hasBookings = activeProperties.some(p => (p.bookings || []).length > 0);
    const assistantStepsDone = [hasProperty, hasDocs, hasBookings].filter(Boolean).length;
    const assistantProgress = Math.round((assistantStepsDone / 3) * 100);
    const assistantState = (() => {
        if (!hasProperty) {
            return {
                title: t('dashboard.assistantStepProperty'),
                description: t('dashboard.assistantDescProperty'),
                cta: t('dashboard.assistantCtaAddProperty'),
                onAction: () => onAddProperty()
            };
        }
        if (!hasDocs) {
            return {
                title: t('dashboard.assistantStepDocs'),
                description: t('dashboard.assistantDescDocs'),
                cta: t('dashboard.assistantCtaOpenProperty'),
                onAction: () => onPropertyClick(activeProperties[0]?.id)
            };
        }
        if (!hasBookings) {
            return {
                title: t('dashboard.assistantStepBooking'),
                description: t('dashboard.assistantDescBooking'),
                cta: t('dashboard.assistantCtaOpenProperty'),
                onAction: () => onPropertyClick(activeProperties[0]?.id)
            };
        }
        return {
            title: t('dashboard.assistantStepReady'),
            description: t('dashboard.assistantDescReady'),
            cta: t('dashboard.assistantCtaViewPortfolio'),
            onAction: () => onPropertyClick(activeProperties[0]?.id)
        };
    })();
    const showQuickStart = (user?.role === 'owner' || user?.role === 'pmc') && (!hasProperty || !hasDocs);

    const uniqueCurrencies = Array.from(new Set(activeProperties.map(p => p.currency || 'USD')));
    const hasMultiCurrency = uniqueCurrencies.length > 1;

    const formatCurrency = (value, currency = 'USD') => {
        const amount = Number(value || 0);
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
        } catch (e) {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

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
            {/* Mobile Header for Profile Access */}
            <div className="mobile-only" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'white' }}>ARAYA HOME</div>
                </div>
                <button
                    onClick={onOpenDrawer}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                </button>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                }
            `}</style>

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

            {/* Quick Start */}
            {showQuickStart && (
                <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(99, 102, 241, 0.35)', background: 'rgba(99, 102, 241, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 800 }}>{t('dashboard.quickStartTitle')}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '6px' }}>{t('dashboard.quickStartHeadline')}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('dashboard.quickStartSub')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!hasProperty && (
                                <button onClick={() => onAddProperty()} className="btn-primary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                                    + {t('dashboard.quickStartAddProperty')}
                                </button>
                            )}
                            {hasProperty && !hasDocs && (
                                <button onClick={() => onPropertyClick(activeProperties[0]?.id)} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                                    {t('dashboard.quickStartOpenProperty')}
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: hasProperty ? 'var(--accent-success)' : 'white' }}>
                                {hasProperty ? '✅' : '⬜'} {t('dashboard.quickStartProperty')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('dashboard.quickStartPropertyDesc')}</div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: hasDocs ? 'var(--accent-success)' : 'white' }}>
                                {hasDocs ? '✅' : '⬜'} {t('dashboard.quickStartDocs')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('dashboard.quickStartDocsDesc')}</div>
                        </div>
                    </div>
                </section>
            )}

            {/* Assistant */}
            <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 800 }}>{t('dashboard.assistantTitle')}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '6px' }}>{assistantState.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{assistantState.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={assistantState.onAction} className="btn-primary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                            {assistantState.cta}
                        </button>
                        {onOpenAssistant && (
                            <button onClick={onOpenAssistant} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                                {t('assistant.openChat')}
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        <span>{t('dashboard.assistantProgress')}</span>
                        <span>{assistantProgress}%</span>
                    </div>
                    <div style={{ marginTop: '6px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${assistantProgress}%`, background: 'var(--gradient-primary)' }} />
                    </div>
                </div>
            </section>

            {/* PMC Quick Actions */}
            {user?.role === 'pmc' && (
                <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 800 }}>
                                {t('dashboard.pmcQuickTitle')}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '6px' }}>{t('dashboard.pmcQuickSub')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={() => onOpenCalendar && onOpenCalendar()} className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                {t('dashboard.pmcQuickCalendar')}
                            </button>
                            <button onClick={() => (onOpenBookingFlow ? onOpenBookingFlow() : onOpenPropertyTab && onOpenPropertyTab('tenant'))} className="btn-primary" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                {t('dashboard.pmcQuickBooking')}
                            </button>
                            <button onClick={() => onOpenLegalHub && onOpenLegalHub()} className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                {t('dashboard.pmcQuickDocs')}
                            </button>
                            {onOpenChats && (
                                <button onClick={() => onOpenChats()} className="btn-secondary" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                    {t('dashboard.pmcQuickChats')}
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

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
                            {hasMultiCurrency && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                    {t('dashboard.multiCurrencyNote')}
                                </div>
                            )}
                            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 800 }}>
                                    {totalLifetimeProfit > 0 ? `+${totalLifetimeProfit.toLocaleString()} realizing` : ''}
                                </div>
                                {hasMultiCurrency && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {t('dashboard.multiCurrencyBadge')}
                                    </div>
                                )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('common.allProperties')}</h2>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}></div>
                </div>

                {/* [NEW] Filter Bar Integration */}
                <FilterBar
                    availableTags={allAvailableTags}
                    selectedTags={selectedTags}
                    onTagToggle={(tag) => {
                        setSelectedTags(prev =>
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                    }}
                    types={availableTypes}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    statuses={availableStatuses}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                    {filteredProperties.map(p => (
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

                                    {/* [NEW] Tags Display */}
                                    {p.tags && p.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                            {p.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    style={{
                                                        background: getTagColor(tag),
                                                        fontSize: '0.6rem',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: '4px' }}>{formatCurrency(p.marketValue, p.currency)}</div>
                                {p.monthlyIncome && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                                        {formatCurrency(p.monthlyIncome, p.currency)}/мес
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
