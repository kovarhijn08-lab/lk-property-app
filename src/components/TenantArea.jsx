import React from 'react';
import TenantPortal from './TenantPortal';
import { useLanguage } from '../context/LanguageContext';

const TenantArea = ({ properties = [] }) => {
    const { t } = useLanguage();

    // If tenant is assigned to multiple properties, show a list, otherwise show the portal directly
    if (properties.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Active Lease Found</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Please contact your property management company for access.</p>
            </div>
        );
    }

    if (properties.length === 1) {
        return (
            <div style={{ padding: '20px' }}>
                <header style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>My Home</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{properties[0].name} — {properties[0].address}</p>
                </header>
                <TenantPortal property={properties[0]} />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>My Properties</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a property to manage your lease and payments.</p>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {properties.map(p => (
                    <div
                        key={p.id}
                        className="glass-panel"
                        style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => {/* In a real app, navigate or set active local property */ }}
                    >
                        <h3 style={{ margin: '0 0 8px 0' }}>{p.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{p.address}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TenantArea;
