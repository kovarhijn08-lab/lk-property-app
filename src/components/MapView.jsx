import React, { useState } from 'react';
import { HomeIcon, BuildingIcon, OfficeIcon, HotelIcon, ChevronRightIcon } from './Icons';

const MapView = ({ properties, onPropertyClick }) => {
    const [selectedPin, setSelectedPin] = useState(null);

    const getStatusColor = (p) => {
        if (p.type === 'construction') return '#F59E0B'; // Orange
        if (p.occupancyStatus === 'vacant') return '#EF4444'; // Red (Vacant)
        return '#10B981'; // Green
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>🌍 Geographic Portfolio View</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Active</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> Construction</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Vacant</span>
                </div>
            </div>

            <div
                style={{ flex: 1, position: 'relative', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}
                onClick={() => setSelectedPin(null)}
            >
                {/* Simulated World Map / Grid */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, var(--text-secondary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {properties.map((p) => {
                    const x = ((p.id.charCodeAt(0) * 13) % 80) + 10;
                    const y = ((p.id.charCodeAt(1) * 7) % 70) + 15;
                    const isSelected = selectedPin?.id === p.id;

                    return (
                        <div
                            key={p.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPin(p);
                            }}
                            style={{
                                position: 'absolute',
                                left: `${x}%`,
                                top: `${y}%`,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                zIndex: isSelected ? 100 : 10,
                                transform: isSelected ? 'scale(1.5)' : 'scale(1)'
                            }}
                            className="map-pin"
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                background: getStatusColor(p),
                                borderRadius: '50%',
                                border: '2px solid white',
                                boxShadow: isSelected ? `0 0 15px ${getStatusColor(p)}` : '0 0 10px rgba(0,0,0,0.5)',
                                animation: isSelected ? 'pulse 2s infinite' : 'none'
                            }} />

                            {!isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.6rem',
                                    pointerEvents: 'none',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    fontWeight: 700
                                }} className="pin-label">
                                    {p.name}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Detailed Preview Card */}
                {selectedPin && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            right: '16px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            animation: 'slideUpMap 0.3s ease-out',
                            zIndex: 200
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: selectedPin.thumbnailUrl ? `url(${selectedPin.thumbnailUrl}) center/cover` : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {!selectedPin.thumbnailUrl && (
                                <>
                                    {selectedPin.type === 'rental' && <HomeIcon size={24} color="var(--accent-success)" />}
                                    {selectedPin.type === 'construction' && <BuildingIcon size={24} color="var(--accent-warning)" />}
                                    {selectedPin.type === 'commercial' && <OfficeIcon size={24} color="var(--accent-primary)" />}
                                    {selectedPin.type === 'str' && <HotelIcon size={24} color="#F43F5E" />}
                                </>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px' }}>{selectedPin.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{selectedPin.address}</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>${selectedPin.marketValue?.toLocaleString()}</span>
                                <span style={{ height: '3px', width: '3px', borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 800 }}>
                                    ${selectedPin.monthlyIncome?.toLocaleString()}/mo
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => onPropertyClick(selectedPin.id)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '12px',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <ChevronRightIcon size={20} />
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .map-pin:hover { transform: scale(1.3); }
                .map-pin:hover .pin-label { opacity: 1; }
                @keyframes slideUpMap {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
};

export default MapView;
