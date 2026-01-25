import React, { useState } from 'react';

const UnitManager = ({ units = [], onUpdate }) => {
    const [editingUnit, setEditingUnit] = useState(null);

    const handleUpdate = (unitId, updates) => {
        const updatedUnits = units.map(u => u.id === unitId ? { ...u, ...updates } : u);
        onUpdate(updatedUnits);
        setEditingUnit(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'occupied': return 'var(--accent-success)';
            case 'vacant': return 'var(--accent-danger)';
            case 'maintenance': return 'var(--accent-warning)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleDelete = (unitId) => {
        if (window.confirm('Delete this unit?')) {
            onUpdate(units.filter(u => u.id !== unitId));
        }
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>🏢 Unit Management</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {units.map(unit => (
                    <div key={unit.id} className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 600 }}>{unit.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => handleDelete(unit.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6 }}
                                >
                                    🗑️
                                </button>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: getStatusColor(unit.status)
                                }} />
                            </div>
                        </div>

                        {editingUnit === unit.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    defaultValue={unit.tenant}
                                    placeholder="Tenant Name"
                                    onBlur={(e) => handleUpdate(unit.id, { tenant: e.target.value })}
                                    style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }}
                                />
                                <select
                                    defaultValue={unit.status}
                                    onChange={(e) => handleUpdate(unit.id, { status: e.target.value })}
                                    style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }}
                                >
                                    <option value="occupied">Occupied</option>
                                    <option value="vacant">Vacant</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                        ) : (
                            <div onClick={() => setEditingUnit(unit.id)} style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: '0.85rem', color: unit.tenant ? 'white' : 'var(--text-secondary)' }}>
                                    {unit.tenant || 'No Tenant'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'capitalize' }}>
                                    {unit.status}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UnitManager;
