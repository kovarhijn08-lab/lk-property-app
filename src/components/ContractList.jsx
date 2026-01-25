import React, { useState } from 'react';
import LeaseTemplates from './LeaseTemplates';
import SignatureCanvas from './SignatureCanvas';
import EmptyState from './EmptyState';

const ContractList = ({ contracts = [], onAdd, onDelete, onScanRequest, onSignContract }) => {
    const [showForm, setShowForm] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSignature, setShowSignature] = useState(false);
    const [contractToSign, setContractToSign] = useState(null);
    const [newContract, setNewContract] = useState({
        tenantName: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        depositAmount: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newContract.tenantName || !newContract.endDate) return;

        onAdd({
            id: Date.now().toString(),
            ...newContract,
            monthlyRent: parseFloat(newContract.monthlyRent) || 0,
            depositAmount: parseFloat(newContract.depositAmount) || 0,
            status: 'active'
        });

        setNewContract({ tenantName: '', startDate: '', endDate: '', monthlyRent: '', depositAmount: '' });
        setShowForm(false);
    };

    const getExpiryStatus = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return { text: 'Expired', color: 'var(--accent-danger)' };
        if (daysUntilExpiry <= 30) return { text: `${daysUntilExpiry}d left`, color: 'var(--accent-warning)' };
        if (daysUntilExpiry <= 90) return { text: `${daysUntilExpiry}d left`, color: 'var(--accent-primary)' };
        return { text: `${daysUntilExpiry}d left`, color: 'var(--accent-success)' };
    };

    return (
        <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>📄 Contracts & Leases</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowTemplates(true)}
                        style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        📄 Templates
                    </button>
                    <button
                        onClick={onScanRequest}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        🤖 Scan
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* Add Contract Form */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <input
                            type="text"
                            placeholder="Tenant Name"
                            value={newContract.tenantName}
                            onChange={(e) => setNewContract({ ...newContract, tenantName: e.target.value })}
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <input
                            type="date"
                            placeholder="Start Date"
                            value={newContract.startDate}
                            onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                            style={{ padding: '10px', background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                        />
                        <input
                            type="date"
                            placeholder="End Date"
                            value={newContract.endDate}
                            onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                            style={{ padding: '10px', background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <input
                            type="number"
                            placeholder="Monthly Rent"
                            value={newContract.monthlyRent}
                            onChange={(e) => setNewContract({ ...newContract, monthlyRent: e.target.value })}
                            style={{ padding: '10px', background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                        />
                        <input
                            type="number"
                            placeholder="Deposit"
                            value={newContract.depositAmount}
                            onChange={(e) => setNewContract({ ...newContract, depositAmount: e.target.value })}
                            style={{ padding: '10px', background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--accent-success)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        Save Contract
                    </button>
                </form>
            )}

            {/* Contract List */}
            {contracts.length === 0 ? (
                <EmptyState
                    icon="📄"
                    title="No active contracts"
                    description="Upload your lease agreements or use our templates to generate a professional contract."
                    actionLabel="Generate Lease"
                    onAction={() => setShowTemplates(true)}
                    variant="glass"
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {contracts.map(contract => {
                        const expiry = getExpiryStatus(contract.endDate);
                        return (
                            <div key={contract.id} className="glass-panel" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        background: expiry.color,
                                        boxShadow: `0 0 10px ${expiry.color}40`
                                    }}></div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{contract.tenantName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            {contract.propertyName || 'Property'} • {contract.startDate} — {contract.endDate}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right', marginRight: '8px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>${contract.monthlyRent?.toLocaleString()}</div>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '8px',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            background: `${expiry.color}15`,
                                            color: expiry.color,
                                            textTransform: 'uppercase'
                                        }}>
                                            {expiry.text}
                                        </span>
                                    </div>
                                    {contract.status !== 'signed' && (
                                        <button
                                            onClick={() => {
                                                setContractToSign(contract);
                                                setShowSignature(true);
                                            }}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                color: 'var(--accent-primary)',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                            title="Sign Contract"
                                        >
                                            ✍️
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(contract.id)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.1)',
                                            color: 'var(--accent-danger)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lease Templates Modal */}
            {showTemplates && (
                <LeaseTemplates
                    onSelectTemplate={(template) => {
                        // Pre-fill form with template data
                        setNewContract({
                            ...newContract,
                            templateContent: template.content,
                            templateName: template.name
                        });
                        setShowForm(true);
                    }}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {/* Signature Canvas Modal */}
            {showSignature && contractToSign && (
                <SignatureCanvas
                    onSave={(signatureData) => {
                        if (onSignContract) {
                            onSignContract(contractToSign.id, signatureData);
                        }
                        setShowSignature(false);
                        setContractToSign(null);
                    }}
                    onCancel={() => {
                        setShowSignature(false);
                        setContractToSign(null);
                    }}
                />
            )}
        </div>
    );
};

export default ContractList;
