import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

const AchievementPanel = ({ properties }) => {
    const [badges, setBadges] = useState([]);
    const [prevBadgeCount, setPrevBadgeCount] = useState(0);

    // Calculate profile completion
    const completionSteps = [
        { label: 'Add first property', done: properties.length > 0 },
        { label: 'Log first transaction', done: properties.some(p => p.transactions?.length > 0) },
        { label: 'Add 3 properties', done: properties.length >= 3 },
        { label: 'Track $10k+ revenue', done: properties.reduce((acc, p) => acc + (p.transactions?.filter(t => t.category === 'Rent').reduce((a, t) => a + t.amount, 0) || 0), 0) >= 10000 },
    ];
    const completedCount = completionSteps.filter(s => s.done).length;
    const completionPercent = Math.round((completedCount / completionSteps.length) * 100);

    // Determine earned badges
    useEffect(() => {
        const newBadges = [];
        if (properties.length > 0) newBadges.push({ id: 'first_property', icon: '🏡', label: 'First Property' });
        if (properties.some(p => p.transactions?.length > 0)) newBadges.push({ id: 'first_tx', icon: '💰', label: 'First Transaction' });

        const totalCashFlow = properties.reduce((acc, p) => {
            if (!p.transactions) return acc;
            const income = p.transactions.filter(t => t.category === 'Rent').reduce((a, t) => a + t.amount, 0);
            const expenses = p.transactions.filter(t => t.category !== 'Rent').reduce((a, t) => a + t.amount, 0);
            return acc + (income - expenses);
        }, 0);
        if (totalCashFlow > 0) newBadges.push({ id: 'positive_cf', icon: '📈', label: 'Cash Flow Positive' });
        if (properties.length >= 3) newBadges.push({ id: 'portfolio_3', icon: '🏅', label: 'Growing Portfolio' });

        // Fire confetti when a new badge is earned
        if (newBadges.length > prevBadgeCount) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setPrevBadgeCount(newBadges.length);
        setBadges(newBadges);
    }, [properties]);

    return (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Profile Completion</h3>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {completedCount} of {completionSteps.length} steps completed ({completionPercent}%)
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Achievements</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {badges.map(b => (
                            <div key={b.id} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '4px 10px', background: 'rgba(255,255,255,0.1)',
                                borderRadius: '20px', fontSize: '0.85rem'
                            }}>
                                <span>{b.icon}</span>
                                <span>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AchievementPanel;
