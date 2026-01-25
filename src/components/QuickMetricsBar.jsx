import React, { useEffect, useState } from 'react';
import { TrendUpIcon, TrendDownIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';

const QuickMetricsBar = ({ cashFlow = 0, cashFlowChange = 0, equity = 0, equityChange = 0, occupancyRate = 0, occupancyChange = 0 }) => {
    const { t } = useLanguage();
    const [animatedCashFlow, setAnimatedCashFlow] = useState(0);
    const [animatedEquity, setAnimatedEquity] = useState(0);
    const [animatedOccupancy, setAnimatedOccupancy] = useState(0);

    // Animated counter effect
    useEffect(() => {
        const duration = 1000;
        const steps = 30;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;

            setAnimatedCashFlow(Math.round(cashFlow * progress));
            setAnimatedEquity(Math.round(equity * progress));
            setAnimatedOccupancy(Math.round(occupancyRate * progress));

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, [cashFlow, equity, occupancyRate]);

    const formatChange = (value) => {
        if (value === 0) return '0%';
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const getChangeColor = (value) => {
        if (value > 0) return 'var(--accent-success)';
        if (value < 0) return 'var(--accent-danger)';
        return 'var(--text-secondary)';
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0',
            marginBottom: '24px'
        }}>
            {/* Metric 1: Cash Flow */}
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                    fontSize: '0.95rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                }}>
                    <span style={{ fontSize: '1.3rem' }}>💰</span>
                    <span>{t('dashboard.cashFlow')}</span>
                </div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: animatedCashFlow >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-display)'
                }}>
                    {animatedCashFlow < 0 ? '-' : ''}${Math.abs(animatedCashFlow).toLocaleString()}
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: getChangeColor(cashFlowChange),
                    fontWeight: 700
                }}>
                    {cashFlowChange >= 0 ? '↑' : '↓'} {Math.abs(cashFlowChange).toFixed(0)}%
                </div>
            </div>

            {/* Metric 2: Equity (with dividers) */}
            <div style={{
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                <div style={{
                    fontSize: '0.95rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                }}>
                    <span style={{ fontSize: '1.3rem' }}>🏦</span>
                    <span>{t('property.equity')}</span>
                </div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    fontFamily: 'var(--font-display)'
                }}>
                    ${animatedEquity.toLocaleString()}
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: getChangeColor(equityChange),
                    fontWeight: 700
                }}>
                    {equityChange >= 0 ? '↑' : '↓'} {Math.abs(equityChange).toFixed(0)}%
                </div>
            </div>

            {/* Metric 3: Occupancy */}
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                    fontSize: '0.95rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                }}>
                    <span style={{ fontSize: '1.3rem' }}>🏠</span>
                    <span>{t('dashboard.occupancy')}</span>
                </div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    fontFamily: 'var(--font-display)'
                }}>
                    {animatedOccupancy}%
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: getChangeColor(occupancyChange),
                    fontWeight: 700
                }}>
                    {occupancyChange >= 0 ? '↑' : '↓'} {Math.abs(occupancyChange).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default QuickMetricsBar;
