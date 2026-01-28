import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { skynet } from '../../utils/SkynetLogger';

const TenantDocuments = ({ property }) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    // Filter contracts to only show those relevant to the tenant
    // Assuming property.contracts exists and we filter by tenantUID or email
    const myDocuments = (property.contracts || []).filter(doc =>
        doc.tenantUid === currentUser?.uid ||
        doc.tenantEmail === currentUser?.email ||
        doc.tenantName?.includes(currentUser?.displayName)
    );

    const downloadDoc = (doc) => {
        skynet.log(`Tenant document accessed: ${doc.name || doc.category || 'document'}`, 'info', {
            actorId: currentUser?.uid,
            action: 'tenant.document.view',
            entityType: 'document',
            entityId: doc.id || doc.name || doc.category,
            metadata: {
                propertyId: property.id,
                docType: doc.type || doc.category || 'unknown'
            }
        });

        if (doc.url || doc.fileUrl) {
            window.open(doc.url || doc.fileUrl, '_blank');
        } else {
            alert(`Downloading ${doc.name || 'document'}...`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>My Documents</h3>

            <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '2.5rem' }}>📜</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>Lease Agreement</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Active • Signed on {property.createdAt?.split('T')[0] || '2026-01-01'}
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                        onClick={() => downloadDoc({ id: 'lease-agreement', name: 'Lease Agreement', type: 'lease' })}
                    >
                        View
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Files</h4>

                {myDocuments.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📂</div>
                        <div style={{ fontSize: '0.85rem' }}>No additional documents shared yet.</div>
                    </div>
                ) : (
                    myDocuments.map(doc => (
                        <div key={doc.id} className="glass-panel hover-scale" style={{
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }} onClick={() => downloadDoc(doc)}>
                            <div style={{ fontSize: '1.5rem' }}>📄</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doc.name || doc.category || 'Document'}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{doc.date || 'Jan 28, 2026'} • PDF</div>
                            </div>
                            <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800 }}>DOWNLOAD</div>
                        </div>
                    ))
                )}

                {/* Always show House Rules and Emergency as defaults */}
                <div
                    className="glass-panel hover-scale"
                    style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                    onClick={() => downloadDoc({ id: 'house-rules', name: 'House Rules & Policies', type: 'policy' })}
                >
                    <div style={{ fontSize: '1.5rem' }}>🏠</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>House Rules & Policies</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Standard Guidelines • PDF</div>
                    </div>
                </div>
                <div
                    className="glass-panel hover-scale"
                    style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                    onClick={() => downloadDoc({ id: 'emergency-contacts', name: 'Emergency Contacts', type: 'contacts' })}
                >
                    <div style={{ fontSize: '1.5rem' }}>🚑</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Emergency Contacts</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Immediate Support • PDF</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDocuments;
