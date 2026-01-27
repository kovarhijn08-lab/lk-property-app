import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const UtilityChargeback = ({ properties = [], onComplete, onClose }) => {
    const { t } = useLanguage();
    const [isScanning, setIsScanning] = useState(false);
    const [billData, setBillData] = useState(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedTenants, setSelectedTenants] = useState([]);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate AI Bill Analysis
        setTimeout(() => {
            setBillData({
                type: 'Water/Sewer',
                amount: 345.50,
                date: new Date().toISOString().split('T')[0],
                provider: 'City Utilities'
            });
            setIsScanning(false);
        }, 2000);
    };

    const handleConfirm = () => {
        if (!selectedPropertyId) return alert('Select a property');

        // Logical result: Create transactions for selected property/tenants
        onComplete({
            ...billData,
            propertyId: selectedPropertyId,
            tenants: selectedTenants
        });
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>⚡ Utility Chargeback</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {!billData && !isScanning && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧾</div>
                        <p style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Upload a utility bill to re-invoice tenants</p>
                        <button onClick={handleScan} className="btn-primary" style={{ width: '100%' }}>Scan Bill</button>
                    </div>
                )}

                {isScanning && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                        <p>AI analyzing consumption data...</p>
                    </div>
                )}

                {billData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Bill Type</span>
                                <span style={{ fontWeight: 700 }}>{billData.type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                                <span style={{ fontWeight: 800, color: '#10B981' }}>${billData.amount}</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Target Property</label>
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            >
                                <option value="">Select Property...</option>
                                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <button onClick={handleConfirm} className="btn-primary" style={{ width: '100%', padding: '14px' }}>Charge Tenants</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UtilityChargeback;
