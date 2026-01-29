import React, { useState } from 'react';

const DocumentVault = ({ contracts, onDeleteContract }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Lease', 'Act', 'Invoice', 'Receipt', 'Tax', 'Insurance', 'Utility', 'Other'];

    const filteredDocuments = (contracts || []).filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || (
            c.tenantName?.toLowerCase().includes(query) ||
            c.title?.toLowerCase().includes(query) ||
            c.fileName?.toLowerCase().includes(query) ||
            c.documentNumber?.toLowerCase().includes(query) ||
            c.propertyName?.toLowerCase().includes(query)
        );

        const category = c.category || 'Lease';
        const matchesCategory = selectedCategory === 'All' || category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'signed': return '✅';
            case 'draft': return '📝';
            case 'expired': return '❌';
            case 'stored': return '📥';
            default: return '📄';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Lease': return '📜';
            case 'Act': return '📑';
            case 'Invoice': return '🧾';
            case 'Receipt': return '🧾';
            case 'Tax': return '🏦';
            case 'Insurance': return '🛡️';
            case 'Utility': return '⚡';
            default: return '📁';
        }
    };

    const formatCurrency = (value, currency = 'USD') => {
        const amount = Number(value || 0);
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
        } catch (e) {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

    const downloadContract = (contract) => {
        const currency = contract.currency || 'USD';
        const content = `
Contract ID: ${contract.id}
Property: ${contract.propertyName || 'N/A'}
Title: ${contract.title || contract.tenantName || 'Document'}
Type: ${contract.category || 'Lease'}
Document #: ${contract.documentNumber || 'N/A'}
Tenant: ${contract.tenantName || 'N/A'}
Start Date: ${contract.moveInDate || contract.startDate || 'N/A'}
End Date: ${contract.endDate || 'N/A'}
Monthly Rent: ${formatCurrency(contract.monthlyRent, currency)}
File: ${contract.fileName || 'N/A'}
Status: ${contract.status || 'Active'}
Signature: ${contract.signature ? 'Signed' : 'Unsigned'}
Uploaded: ${contract.uploadedAt || 'N/A'}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract_${contract.tenantName}_${contract.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search & Categories */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.9rem'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '12px', opacity: 0.5 }}>🔍</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--glass-border)',
                                background: selectedCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            {filteredDocuments.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>📂</div>
                    <div style={{ fontWeight: 600 }}>No documents found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try a different search or category</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {filteredDocuments.map(doc => (
                        <div
                            key={doc.id}
                            className="glass-panel"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s',
                                border: '1px solid var(--glass-border)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    {getCategoryIcon(doc.category || 'Lease')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                                        {doc.title || doc.tenantName || doc.name || 'Document'} {getStatusIcon(doc.status)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {(doc.propertyName || 'Property')} • {doc.category || 'Lease'} {doc.documentNumber ? `• #${doc.documentNumber}` : ''} {doc.date || doc.endDate || doc.uploadedAt ? `• ${(doc.date || doc.endDate || doc.uploadedAt || '').toString().slice(0, 10)}` : ''}
                                    </div>
                                    {doc.fileName && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            📎 {doc.fileName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => downloadContract(doc)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    📥
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Delete document?`)) {
                                            onDeleteContract(doc.id);
                                        }
                                    }}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        color: 'var(--accent-danger)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="glass-panel" style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed var(--glass-border)',
                borderRadius: '16px',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer'
            }}>
                + Upload New Document
            </button>
        </div>
    );
};

export default DocumentVault;
