import React, { useState } from 'react';
import { useMobile } from '../hooks/useMobile';

const PropertySwitcher = ({ properties, selectedId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedProperty = properties.find(p => p.id === selectedId);
    const displayName = selectedId === 'all' ? 'All Properties' : selectedProperty?.name || 'Select';

    const getTypeIcon = (type) => {
        switch (type) {
            case 'rental': return '🏠';
            case 'str': return '🏨';
            case 'construction': return '🏗️';
            case 'commercial': return '🏢';
            default: return '📍';
        }
    };

    const isMobile = useMobile();

    if (isMobile) return null; // Hide on mobile for now as per design (Portfolio tab will handle this)

    return (
        <div style={{ position: 'relative', marginBottom: '16px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: 'var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                <span>
                    {selectedId !== 'all' && <span style={{ marginRight: '8px' }}>{getTypeIcon(selectedProperty?.type)}</span>}
                    {displayName}
                </span>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0, right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-secondary)',
                    border: 'var(--glass-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    zIndex: 100,
                    boxShadow: 'var(--glass-shadow)',
                    padding: '8px 0'
                }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    {/* All Properties Option */}
                    <button
                        onClick={() => { onSelect('all'); setIsOpen(false); }}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: selectedId === 'all' ? 'var(--accent-primary)' : 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: selectedId === 'all' ? 600 : 400
                        }}
                    >
                        📊 All Properties (Global Dashboard)
                    </button>

                    {/* Active Properties */}
                    <div style={{ padding: '8px 16px 4px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Active Portfolio
                    </div>
                    {filteredProperties.filter(p => p.status !== 'sold').length === 0 && (
                        <div style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No matches found</div>
                    )}
                    {filteredProperties.filter(p => p.status !== 'sold').map(p => (
                        <button
                            key={p.id}
                            onClick={() => { onSelect(p.id); setIsOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: selectedId === p.id ? 'var(--accent-primary)' : 'transparent',
                                border: 'none',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: selectedId === p.id ? 600 : 400
                            }}
                        >
                            <span style={{ marginRight: '8px' }}>{getTypeIcon(p.type)}</span>
                            {p.name}
                            <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {p.type}
                            </span>
                        </button>
                    ))}

                    {/* Sold Properties */}
                    {filteredProperties.some(p => p.status === 'sold') && (
                        <>
                            <div style={{ padding: '12px 16px 4px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, borderTop: '1px solid var(--glass-border)' }}>
                                Archive / Sold
                            </div>
                            {filteredProperties.filter(p => p.status === 'sold').map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { onSelect(p.id); setIsOpen(false); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: selectedId === p.id ? 'rgba(255,255,255,0.1)' : 'transparent', // Different style for sold
                                        border: 'none',
                                        color: 'var(--text-secondary)', // Dimmed color
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    <span style={{ marginRight: '8px' }}>💰</span>
                                    {p.name}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PropertySwitcher;
