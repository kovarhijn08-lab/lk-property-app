import React, { useState, useEffect } from 'react';

const SellPropertyModal = ({ property, onClose, onSell }) => {
    const [salePrice, setSalePrice] = useState(property.marketValue || 0);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [closingCosts, setClosingCosts] = useState(0);
    const [exitStrategy, setExitStrategy] = useState('Flip'); // Flip, Long Term Hold, BRRRR

    // Calculated Metrics
    const [netProceeds, setNetProceeds] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [roi, setRoi] = useState(0);

    // Calculate metrics whenever inputs change
    useEffect(() => {
        const price = parseFloat(salePrice) || 0;
        const costs = parseFloat(closingCosts) || 0;
        const purchasePrice = property.purchasePrice || 0;

        // Calculate total cash flow from transactions
        const totalCashFlow = (property.transactions || []).reduce((acc, t) => {
            return t.category === 'Rent' ? acc + t.amount : acc - t.amount;
        }, 0);

        // Net Proceeds = Sale Price - Closing Costs - Remaining Loan (simplified as Purchase Price for now if no loan tracking)
        // Usually: Sale Price - Closing Costs - Mortgage Balance
        // For MVP, assuming "Paid Cash" or "Mortgage Balance = Purchase Price" is too simple.
        // Let's assume Equity = Market Value - Loan. If we don't track loan, we use Purchase Price as cost basis.

        const proceeds = price - costs - purchasePrice; // Simple Capital Gains

        const profit = proceeds + totalCashFlow;

        // ROI = (Total Profit / Total Invested) * 100
        // Total Invested = Purchase Price + Renovation Costs (from transactions)
        // Simplified: Purchase Price
        const calculatedRoi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

        setNetProceeds(proceeds);
        setTotalProfit(profit);
        setRoi(calculatedRoi);
    }, [salePrice, closingCosts, property]);

    const handleSubmit = () => {
        onSell({
            ...property,
            status: 'sold',
            soldAt: new Date(saleDate).toISOString(),
            soldPrice: parseFloat(salePrice),
            closingCosts: parseFloat(closingCosts),
            finalROI: parseFloat(roi.toFixed(2)),
            exitStrategy,
            netProceeds,
            totalProfit: parseFloat(totalProfit.toFixed(2))
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>💰 Close Deal & Exit</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{property.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Review financial exit details.</p>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sale Price ($)</label>
                        <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date Sold</label>
                        <input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Closing Costs ($)</label>
                        <input
                            type="number"
                            value={closingCosts}
                            onChange={(e) => setClosingCosts(e.target.value)}
                            placeholder="Agent fees, taxes"
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Strategy</label>
                        <select
                            value={exitStrategy}
                            onChange={(e) => setExitStrategy(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                        >
                            <option value="Flip">Flip</option>
                            <option value="Long Term Hold">Long Term Hold</option>
                            <option value="BRRRR">BRRRR</option>
                            <option value="Wholesale">Wholesale</option>
                        </select>
                    </div>
                </div>

                {/* Exit Summary Card */}
                <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Net Proceeds</span>
                        <span style={{ fontWeight: 600, color: '#10B981' }}>${netProceeds.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lifetime Profit</span>
                        <span style={{ fontWeight: 600 }}>${totalProfit.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: '0.9rem' }}>Final ROI</span>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10B981' }}>{roi.toFixed(1)}%</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={handleSubmit} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#10B981', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>Confirm Sale</button>
                </div>
            </div>
        </div>
    );
};

export default SellPropertyModal;
