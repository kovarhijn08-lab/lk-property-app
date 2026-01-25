import React, { useState, useMemo } from 'react';
import DocumentVault from './DocumentVault';
import ContractList from './ContractList';
import { useLanguage } from '../context/LanguageContext';

const LegalHub = ({ properties, onAddContract, onDeleteContract, onSignContract, onScanRequest }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('summary');

    // Aggregate all contracts from all properties
    const allContracts = useMemo(() => {
        return properties.flatMap(p =>
            (p.contracts || []).map(c => ({ ...c, propertyName: p.name, propertyId: p.id }))
        );
    }, [properties]);

    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysOut = new Date();
        thirtyDaysOut.setDate(now.getDate() + 30);

        return {
            total: allContracts.length,
            active: allContracts.filter(c => c.status === 'signed' || c.status === 'active').length,
            expiringSoon: allContracts.filter(c => {
                const end = new Date(c.endDate);
                return end > now && end <= thirtyDaysOut;
            }).length,
            pendingSignature: allContracts.filter(c => c.status !== 'signed' && !c.signature).length
        };
    }, [allContracts]);

    const renderSummary = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.active}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Contracts</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: stats.expiringSoon > 0 ? '2px solid var(--accent-warning)' : 'none' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.expiringSoon > 0 ? 'var(--accent-warning)' : 'white' }}>{stats.expiringSoon}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expiring &lt; 30d</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>📝 Recent Activity</h3>
                {allContracts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No documents found in your portfolio.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {allContracts.slice(0, 5).map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{c.tenantName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.propertyName}</div>
                                </div>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    fontSize: '0.7rem'
                                }}>
                                    {c.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => setActiveTab('contracts')}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800 }}
            >
                View All Contracts
            </button>
        </div>
    );

    return (
        <div style={{ padding: '0 20px 100px 20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0' }}>Legal Hub</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Centralized document & compliance management</p>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                background: 'rgba(255,255,255,0.03)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                {['summary', 'contracts', 'vault'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'contracts' && (
                <ContractList
                    contracts={allContracts}
                    onAdd={(c) => onAddContract('all', c)} // This needs handling in App.jsx
                    onDelete={onDeleteContract}
                    onScanRequest={onScanRequest}
                    onSignContract={onSignContract}
                />
            )}
            {activeTab === 'vault' && (
                <DocumentVault
                    contracts={allContracts}
                    onDeleteContract={onDeleteContract}
                />
            )}
        </div>
    );
};

export default LegalHub;
