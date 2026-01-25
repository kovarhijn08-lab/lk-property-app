import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrashIcon, BuildingIcon, UserIcon, InfoIcon } from './Icons';
import EmptyState from './EmptyState';
import { validateForm } from '../utils/validators';


const VendorList = ({ vendors = [], onAdd, onDelete }) => {
    const { t } = useLanguage();
    const [showAdd, setShowAdd] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: '', category: 'General', phone: '', email: '' });
    const [touched, setTouched] = useState({});

    const categories = ['Plumbing', 'Electrical', 'Cleaning', 'HVAC', 'Landscaping', 'Legal', 'General'];

    const errors = validateForm('vendor', newVendor);
    const isFormValid = Object.keys(errors).length === 0;

    const renderFieldError = (fieldName) => {
        if (!touched[fieldName] || !errors[fieldName]) return null;
        return (
            <div style={{ marginTop: '4px', animation: 'fadeIn 0.2s' }}>
                <div style={{ color: '#F43F5E', fontSize: '0.65rem', fontWeight: 700 }}>⚠️ {t(errors[fieldName].message)}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', opacity: 0.7 }}>{t(errors[fieldName].example)}</div>
            </div>
        );
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        onAdd({ ...newVendor, id: Date.now().toString() });
        setNewVendor({ name: '', category: 'General', phone: '', email: '' });
        setTouched({});
        setShowAdd(false);
    };


    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BuildingIcon size={18} color="var(--text-secondary)" />
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', margin: 0 }}>{t('finance.vendor') || 'Service Vendors'}</h3>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{
                        background: showAdd ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {showAdd ? t('common.cancel') : `+ ${t('common.add')}`}
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleSubmit} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    border: '1px solid var(--glass-border)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vendor Name</label>
                            <input
                                placeholder="Company LLC"
                                value={newVendor.name}
                                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: touched.name && errors.name ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                            />
                            {renderFieldError('name')}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                            <select
                                value={newVendor.category}
                                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</label>
                            <input
                                placeholder="+1..."
                                value={newVendor.phone}
                                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: touched.phone && errors.phone ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                            />
                            {renderFieldError('phone')}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</label>
                            <input
                                placeholder="email@vendor.com"
                                value={newVendor.email}
                                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: touched.email && errors.email ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                            />
                            {renderFieldError('email')}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: isFormValid ? 'var(--accent-success)' : 'rgba(255,255,255,0.05)', color: isFormValid ? 'white' : 'var(--text-secondary)', border: 'none', fontWeight: 800, cursor: isFormValid ? 'pointer' : 'not-allowed', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: isFormValid ? '0 8px 16px rgba(16, 185, 129, 0.2)' : 'none' }}>
                        {isFormValid ? 'Confirm Vendor' : t('validation.fixErrors')}
                    </button>

                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {vendors.length === 0 ? (
                    <EmptyState
                        icon="👷‍♂️"
                        title="No service vendors"
                        description="Keep track of your reliable contractors, plumbers, and maintenance crew in one central hub."
                        actionLabel="Add First Vendor"
                        onAction={() => setShowAdd(true)}
                        variant="glass"
                    />
                ) : (
                    vendors.map(v => (
                        <div key={v.id} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <UserIcon size={20} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {v.name}
                                        <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase' }}>{v.category}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                                        {v.phone || v.email || 'Click to add info'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onDelete(v.id)}
                                style={{
                                    background: 'rgba(244, 63, 94, 0.05)',
                                    border: '1px solid rgba(244, 63, 94, 0.1)',
                                    color: 'var(--accent-danger)',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <TrashIcon size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VendorList;
