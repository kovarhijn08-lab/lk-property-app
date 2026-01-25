import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SideDrawer from './SideDrawer';
import { TrendUpIcon, TrendDownIcon, InfoIcon, DollarIcon, ChevronDownIcon } from './Icons';

const ScenarioPlanner = ({ property, onClose }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('rent');

    // State Variables
    const [proposedRent, setProposedRent] = useState(property.income || 2000);
    const [proposedRate, setProposedRate] = useState(property.mortgageRate || 4.5);
    const [proposedTerm, setProposedTerm] = useState(30);
    const [proposedExpenses, setProposedExpenses] = useState(property.expenses || 500);
    const [vacancyRate, setVacancyRate] = useState(5);

    // Constants for calculations
    const purchasePrice = property.purchasePrice || 250000;
    const marketValue = property.marketValue || 300000;
    const downPayment = purchasePrice * 0.2; // Assuming 20% down
    const closingCosts = purchasePrice * 0.03; // Assuming 3% closing costs
    const totalInvested = downPayment + closingCosts;

    // Baseline Metrics (Current)
    const baselineResults = useMemo(() => {
        const income = property.income || 2000;
        const expenses = property.expenses || 500;
        const mortgage = property.mortgage || 1000;
        const vac = 0; // Baseline assumed 0% for simple comparison if not provided

        const monthlyNOI = (income * (1 - vac / 100)) - expenses;
        const annualNOI = monthlyNOI * 12;
        const monthlyCashFlow = monthlyNOI - mortgage;
        const annualCashFlow = monthlyCashFlow * 12;

        const capRate = (annualNOI / marketValue) * 100;
        const coc = (annualCashFlow / totalInvested) * 100;
        const roi = (annualCashFlow / totalInvested) * 100; // Simplified ROI = CoC for this model

        return { income, expenses, mortgage, monthlyCashFlow, capRate, coc, roi };
    }, [property, marketValue, totalInvested]);

    // Simulated Metrics
    const simulatedResults = useMemo(() => {
        // Refi Mortgage Calculation
        const loanAmount = purchasePrice * 0.8;
        const monthlyRate = proposedRate / 100 / 12;
        const numPayments = proposedTerm * 12;
        const newMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

        // Simulated results across tabs
        const income = proposedRent;
        const expenses = proposedExpenses;
        const mortgage = activeTab === 'refi' ? newMortgage : (property.mortgage || 1000);

        const monthlyNOI = (income * (1 - vacancyRate / 100)) - expenses;
        const annualNOI = monthlyNOI * 12;
        const monthlyCashFlow = monthlyNOI - mortgage;
        const annualCashFlow = monthlyCashFlow * 12;

        const capRate = (annualNOI / marketValue) * 100;
        const coc = (annualCashFlow / totalInvested) * 100;

        return {
            income,
            expenses,
            mortgage: mortgage.toFixed(2),
            monthlyCashFlow: monthlyCashFlow.toFixed(2),
            capRate: capRate.toFixed(2),
            coc: coc.toFixed(2)
        };
    }, [proposedRent, proposedRate, proposedTerm, proposedExpenses, vacancyRate, activeTab, property, purchasePrice, marketValue, totalInvested]);

    const delta = (sim, cur) => {
        const d = Number(sim) - Number(cur);
        if (Math.abs(d) < 0.01) return null;
        const color = d >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
        return (
            <span style={{ color, fontSize: '0.75rem', marginLeft: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                {d > 0 ? <TrendUpIcon size={10} color={color} /> : <TrendDownIcon size={10} color={color} />}
                {parseFloat(Math.abs(d)).toFixed(2)}
            </span>
        );
    };

    const applyPreset = (type) => {
        if (type === 'conservative') {
            setVacancyRate(10);
            setProposedExpenses(property.expenses * 1.2 || 600);
            setProposedRent(property.income * 0.95 || 1900);
        } else if (type === 'aggressive') {
            setVacancyRate(3);
            setProposedExpenses(property.expenses * 0.9 || 450);
            setProposedRent(property.income * 1.1 || 2200);
        } else {
            setVacancyRate(5);
            setProposedExpenses(property.expenses || 500);
            setProposedRent(property.income || 2000);
        }
    };

    return (
        <SideDrawer
            isOpen={true}
            onClose={onClose}
            title={t('scenarios.planner')}
            subtitle={property.address}
            width="650px"
        >
            <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '16px' }}>
                {['rent', 'expenses', 'refi'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            background: activeTab === tab ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '12px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: activeTab === tab ? '0 8px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                    >
                        {tab === 'rent' ? t('scenarios.rentSimulator') : tab === 'expenses' ? t('scenarios.expenseModeler') : t('scenarios.refiCalc')}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeTab === 'rent' && (
                        <>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.monthlyRent')}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 800 }}>$</span>
                                        <input
                                            type="number"
                                            value={proposedRent}
                                            onChange={(e) => setProposedRent(Number(e.target.value))}
                                            style={{ width: '90px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '6px 10px', textAlign: 'right', fontWeight: 700, outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range" min={property.income * 0.5} max={property.income * 2} step="50"
                                    value={proposedRent} onChange={(e) => setProposedRent(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{t('scenarios.vacancyRate')}</label>
                                    <input
                                        type="number"
                                        value={vacancyRate}
                                        onChange={(e) => setVacancyRate(Number(e.target.value))}
                                        style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '6px 10px', textAlign: 'right', fontWeight: 700, outline: 'none' }}
                                    />
                                </div>
                                <input
                                    type="range" min="0" max="25" step="1"
                                    value={vacancyRate} onChange={(e) => setVacancyRate(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => applyPreset('conservative')} style={{ flex: 1, fontSize: '0.7rem', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>{t('scenarios.conservative')}</button>
                                <button onClick={() => applyPreset('balanced')} style={{ flex: 1, fontSize: '0.7rem', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>{t('scenarios.balanced')}</button>
                                <button onClick={() => applyPreset('aggressive')} style={{ flex: 1, fontSize: '0.7rem', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>{t('scenarios.aggressive')}</button>
                            </div>
                        </>
                    )}

                    {activeTab === 'expenses' && (
                        <>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.monthlyExpenses')}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 800 }}>$</span>
                                        <input
                                            type="number"
                                            value={proposedExpenses}
                                            onChange={(e) => setProposedExpenses(Number(e.target.value))}
                                            style={{ width: '90px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '6px 10px', textAlign: 'right', fontWeight: 700, outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range" min="0" max={property.expenses * 3 || 1500} step="25"
                                    value={proposedExpenses} onChange={(e) => setProposedExpenses(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                />
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 700, fontStyle: 'italic', background: 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: '10px', borderLeft: '3px solid var(--accent-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <InfoIcon size={14} /> {t('scenarios.maintenanceTip')}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'refi' && (
                        <>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.interestRate')}</label>
                                    <input
                                        type="number"
                                        value={proposedRate}
                                        onChange={(e) => setProposedRate(Number(e.target.value))}
                                        style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', padding: '6px 10px', textAlign: 'right', fontWeight: 700, outline: 'none' }}
                                    />
                                </div>
                                <input
                                    type="range" min="1" max="10" step="0.1"
                                    value={proposedRate} onChange={(e) => setProposedRate(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{t('scenarios.amortization')}</label>
                                <select
                                    value={proposedTerm}
                                    onChange={(e) => setProposedTerm(Number(e.target.value))}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none', fontWeight: 600 }}
                                >
                                    <option value="15">15 {t('finance.years')}</option>
                                    <option value="20">20 {t('finance.years')}</option>
                                    <option value="30">30 {t('finance.years')}</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 800 }}>{t('scenarios.simulatedMonthly')}</div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{t('property.cashFlow')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>${simulatedResults.monthlyCashFlow} {delta(simulatedResults.monthlyCashFlow, baselineResults.monthlyCashFlow)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{t('finance.bankMortgage')}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: activeTab === 'refi' ? 'var(--accent-primary)' : 'white' }}>${simulatedResults.mortgage} {delta(baselineResults.mortgage, simulatedResults.mortgage)}</div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 800 }}>{t('scenarios.annualPerformance')}</div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{t('finance.capRate')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{simulatedResults.capRate}% {delta(simulatedResults.capRate, baselineResults.capRate)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{t('finance.coc')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-success)' }}>{simulatedResults.coc}% {delta(simulatedResults.coc, baselineResults.coc)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', lineHeight: 1.5 }}>
                    <InfoIcon size={20} color="var(--accent-primary)" strokeWidth={2.5} />
                    <span>
                        {activeTab === 'rent' && t('scenarios.rentTip')}
                        {activeTab === 'expenses' && t('scenarios.expenseTip')}
                        {activeTab === 'refi' && t('scenarios.refiTip')}
                    </span>
                </div>
            </div>
        </SideDrawer>
    );
};

export default ScenarioPlanner;
