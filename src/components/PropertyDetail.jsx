import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ConstructionProgressBar from './ConstructionProgressBar';
import InstallmentTracker from './InstallmentTracker';
import UnitManager from './UnitManager';
import CommercialMetrics from './CommercialMetrics';
import STRMetrics from './STRMetrics';
import CleaningSchedule from './CleaningSchedule';
import ContractList from './ContractList';
import VendorList from './VendorList';
import BookingForm from './BookingForm';
import FinancialPlanner from './FinancialPlanner';
import SideDrawer from './SideDrawer';
import TenantPortal from '../pages/tenant/TenantPortal';
import { validateForm } from '../utils/validators';
import InviteManager from './InviteManager';
import TagInput from './TagInput'; // [NEW]
import { getTagColor } from '../utils/tagUtils'; // [NEW]
import { EditIcon, TrashIcon, InfoIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = ({ property, onUpdate, onDelete, onSell, onClose, vendors, onAddVendor, onDeleteVendor, initialTab = 'overview', autoOpenBookingForm = false }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showFinancialPlanner, setShowFinancialPlanner] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showPmcInviteModal, setShowPmcInviteModal] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const { currentUser } = useAuth();
    const canInvitePMC = currentUser?.role === 'owner' || currentUser?.role === 'admin';

    const formatCurrency = (value) => {
        const currency = property?.currency || 'USD';
        const amount = Number(value || 0);
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
        } catch (e) {
            return `${currency} ${amount.toLocaleString()}`;
        }
    };

    // Edit Form State
    const [editedProp, setEditedProp] = useState({ ...property });
    const [hasMultipleUnits, setHasMultipleUnits] = useState((property.units?.length || 0) > 1);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Keep editedProp in sync when property changes externally
    useEffect(() => {
        setEditedProp({ ...property });
    }, [property]);

    // Validate on edit
    useEffect(() => {
        if (isEditing) {
            const currentErrors = validateForm('property', {
                ...editedProp,
                marketValue: editedProp.marketValue, // Ensure we pass numbers if validators expect them
                purchasePrice: editedProp.purchasePrice
            });
            setErrors(currentErrors);
        }
    }, [editedProp, isEditing]);

    useEffect(() => {
        if (autoOpenBookingForm && property?.type === 'str') {
            setShowBookingForm(true);
        }
    }, [autoOpenBookingForm, property?.type]);

    const handleSave = async () => {
        if (Object.keys(errors).length > 0) return;
        setIsSaving(true);
        try {
            await onUpdate(property.id, editedProp);
            setIsEditing(false);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditedProp(prev => {
            const newState = {
                ...prev,
                [field]: field === 'purchasePrice' || field === 'marketValue' || field === 'income' || field === 'expenses' || field === 'mortgage' || field === 'commissionRate' || field === 'cleaningFee' || field === 'totalSqFt' || field === 'camCharge' || field === 'salesBreakpoint' || field === 'percentageRentRate'
                    ? parseFloat(value) || 0
                    : value
            };

            // If unit count changed, adjust the units array
            if (field === 'unitCount') {
                const count = parseInt(value) || 0;
                const currentUnits = prev.units || [];
                if (count > currentUnits.length) {
                    // Add units
                    const newUnits = Array.from({ length: count - currentUnits.length }, (_, i) => ({
                        id: `unit-${Date.now()}-${currentUnits.length + i}`,
                        name: `Unit ${currentUnits.length + i + 1}`,
                        status: 'vacant',
                        tenant: ''
                    }));
                    newState.units = [...currentUnits, ...newUnits];
                } else if (count < currentUnits.length) {
                    // Truncate (user should use UnitManager for specific deletion, but this is a bulk update)
                    newState.units = currentUnits.slice(0, count);
                }
            }
            return newState;
        });
    };

    const renderFieldError = (fieldName, value) => {
        if ((!touched[fieldName] && !value) || !errors[fieldName]) return null;
        return (
            <div style={{ marginTop: '4px' }}>
                <div style={{ color: '#F43F5E', fontSize: '0.7rem', fontWeight: 700 }}>⚠️ {t(errors[fieldName].message)}</div>
            </div>
        );
    };

    const isFormValid = Object.keys(errors).length === 0;

    return (
        <SideDrawer
            isOpen={true}
            onClose={onClose}
            title={isEditing ? t('property.edit') : property.name}
            subtitle={!isEditing ? property.type.toUpperCase() : t('property.configuringAsset')}
            width="600px"
        >
            <div style={{ paddingBottom: '40px' }}>
                {!isEditing && (
                    <>
                        {/* Tab Navigation */}
                        <div style={{
                            display: 'flex',
                            gap: '2px',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '4px',
                            borderRadius: '14px',
                            marginBottom: '24px',
                            border: '1px solid var(--glass-border)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {['overview', 'finance', 'legal', 'tenant'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 4px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeTab === tab ? 'var(--gradient-primary)' : 'transparent',
                                        color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        zIndex: 2,
                                        position: 'relative'
                                    }}
                                >
                                    {t(`property.tabs.${tab}`)}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    color: 'var(--accent-primary)',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <EditIcon size={14} strokeWidth={2.5} />
                                {t('common.edit')}
                            </button>
                        </div>
                    </>
                )}

                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.name')}</label>
                                <input
                                    type="text"
                                    value={editedProp.name}
                                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: touched.name && errors.name ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                                {renderFieldError('name', editedProp.name)}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.type')}</label>
                                <select
                                    value={editedProp.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                >
                                    <option value="rental">{t('common.ready')}</option>
                                    <option value="str">STR (Airbnb)</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                        </div>
                        {/* Construction Phase Toggle */}
                        <div style={{ padding: '12px', background: editedProp.isUnderConstruction ? 'rgba(217, 255, 0, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleChange('isUnderConstruction', !editedProp.isUnderConstruction)}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: editedProp.isUnderConstruction ? 'var(--accent-warning)' : 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {editedProp.isUnderConstruction ? t('property.underConstruction') : t('property.operational')}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('property.statusPhase')}</div>
                            </div>
                            <div style={{ width: '40px', height: '22px', background: editedProp.isUnderConstruction ? 'var(--accent-warning)' : 'rgba(255,255,255,0.1)', borderRadius: '11px', position: 'relative', transition: 'all 0.3s ease' }}>
                                <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: editedProp.isUnderConstruction ? '20px' : '2px', transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            </div>
                        </div>

                        {/* Unit Management bulk edit for Commercial only */}
                        {editedProp.type === 'commercial' && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: hasMultipleUnits ? '16px' : '0',
                                    cursor: 'pointer'
                                }} onClick={() => setHasMultipleUnits(!hasMultipleUnits)}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                        {t('validation.multiUnitToggle')}
                                    </div>
                                    <div style={{
                                        width: '34px',
                                        height: '20px',
                                        background: hasMultipleUnits ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '3px',
                                            left: hasMultipleUnits ? '17px' : '3px',
                                            transition: 'left 0.2s'
                                        }} />
                                    </div>
                                </div>

                                {hasMultipleUnits && (
                                    <div style={{ animation: 'fadeIn 0.3s' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.numUnits')}</label>
                                        <input
                                            type="number"
                                            value={editedProp.units?.length || 0}
                                            onChange={(e) => handleChange('unitCount', e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.purchasePrice')}</label>
                                <input
                                    type="number"
                                    value={editedProp.purchasePrice}
                                    onBlur={() => setTouched(prev => ({ ...prev, purchasePrice: true }))}
                                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: touched.purchasePrice && errors.purchasePrice ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.marketValue')}</label>
                                <input
                                    type="number"
                                    value={editedProp.marketValue}
                                    onBlur={() => setTouched(prev => ({ ...prev, marketValue: true }))}
                                    onChange={(e) => handleChange('marketValue', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: touched.marketValue && errors.marketValue ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.monthlyRent')}</label>
                                <input
                                    type="number"
                                    value={editedProp.income}
                                    onChange={(e) => handleChange('income', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.expenses')}</label>
                                <input
                                    type="number"
                                    value={editedProp.expenses}
                                    onChange={(e) => handleChange('expenses', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.addressLocation')}</label>
                            <input
                                type="text"
                                value={editedProp.address || ''}
                                onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                                onChange={(e) => handleChange('address', e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: touched.address && errors.address ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                            {renderFieldError('address', editedProp.address)}
                        </div>

                        {/* [NEW] Tags Section */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('common.tags')}</label>
                            <TagInput
                                tags={editedProp.tags || []}
                                onChange={(newTags) => setEditedProp(prev => ({ ...prev, tags: newTags }))}
                            />
                        </div>

                        {/* Commercial Specific Settings */}
                        {editedProp.type === 'commercial' && (
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '8px' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('property.commercialConfig')}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.leaseType')}</label>
                                        <select
                                            value={editedProp.leaseType || 'gross'}
                                            onChange={(e) => handleChange('leaseType', e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        >
                                            <option value="gross">Gross Lease</option>
                                            <option value="nnn">Triple Net (NNN)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.areaSqFt')}</label>
                                        <input
                                            type="number"
                                            value={editedProp.totalSqFt || ''}
                                            onChange={(e) => handleChange('totalSqFt', e.target.value)}
                                            placeholder="e.g. 2500"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.camCharge')}</label>
                                        <input
                                            type="number"
                                            value={editedProp.camCharge || ''}
                                            onChange={(e) => handleChange('camCharge', e.target.value)}
                                            placeholder="e.g. 0.25"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '4px' }}>
                                        <h5 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Retail / Percentage Rent (Optional)</h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.salesBreakpoint')}</label>
                                                <input
                                                    type="number"
                                                    value={editedProp.salesBreakpoint || ''}
                                                    onChange={(e) => handleChange('salesBreakpoint', e.target.value)}
                                                    placeholder="e.g. 50000"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.percentageRate')}</label>
                                                <input
                                                    type="number"
                                                    value={editedProp.percentageRentRate || ''}
                                                    onChange={(e) => handleChange('percentageRentRate', e.target.value)}
                                                    placeholder="e.g. 5"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {editedProp.type === 'str' && (
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>STR Configuration</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.platform')}</label>
                                        <select
                                            value={editedProp.platform || 'airbnb'}
                                            onChange={(e) => handleChange('platform', e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        >
                                            <option value="airbnb">Airbnb</option>
                                            <option value="booking">Booking.com</option>
                                            <option value="vrbo">Vrbo</option>
                                            <option value="direct">Direct</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.commission')}</label>
                                        <input
                                            type="number"
                                            value={editedProp.commissionRate || ''}
                                            onChange={(e) => handleChange('commissionRate', e.target.value)}
                                            placeholder="e.g. 3"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{t('property.cleaningFee')}</label>
                                        <input
                                            type="number"
                                            value={editedProp.cleaningFee || ''}
                                            onChange={(e) => handleChange('cleaningFee', e.target.value)}
                                            placeholder="Per stay cost"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: isSaving ? 0.5 : 1, textTransform: 'uppercase', fontSize: '0.8rem' }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !isFormValid}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                                    background: isFormValid ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                    color: isFormValid ? 'white' : 'var(--text-secondary)',
                                    fontWeight: 800, cursor: isFormValid ? 'pointer' : 'not-allowed',
                                    opacity: isSaving ? 0.5 : 1, textTransform: 'uppercase', fontSize: '0.8rem',
                                    boxShadow: isFormValid ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isSaving ? t('property.saving') : (isFormValid ? t('property.saveChanges') : t('validation.fixErrors'))}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {!showDeleteConfirm ? (
                            <>
                                <div key={activeTab} className="tab-content-anim" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* TAB: OVERVIEW */}
                                    {activeTab === 'overview' && (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('property.purchasePrice')}</div>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{formatCurrency(property.purchasePrice)}</div>
                                                </div>
                                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderTop: '2px solid var(--accent-success)' }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('property.marketValue')}</div>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--accent-success)' }}>{formatCurrency(property.marketValue)}</div>
                                                </div>
                                            </div>

                                            {/* [NEW] Quick Invite Action - only if no units */}
                                            {!property.units?.length && (
                                                <div className="glass-panel" style={{ padding: '20px', border: '1px dashed var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Invite Tenant</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grant access to this property</div>
                                                    </div>
                                                    <button
                                                        onClick={() => { setActiveTab('tenant'); setShowInviteModal(true); }}
                                                        className="btn-primary"
                                                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
                                                    >
                                                        + Invite
                                                    </button>
                                                </div>
                                            )}

                                            {canInvitePMC && (
                                                <div className="glass-panel" style={{ padding: '20px', border: '1px dashed var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Invite PMC</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign a property manager to this property</div>
                                                    </div>
                                                    <button
                                                        onClick={() => { setShowPmcInviteModal(!showPmcInviteModal); }}
                                                        className="btn-secondary"
                                                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
                                                    >
                                                        {showPmcInviteModal ? t('common.cancel') : '+ Invite'}
                                                    </button>
                                                </div>
                                            )}

                                            {showPmcInviteModal && canInvitePMC && (
                                                <div style={{ marginTop: '12px' }}>
                                                    <InviteManager
                                                        propertyId={property.id}
                                                        inviteRole="pmc"
                                                        onInviteSent={() => {
                                                            // Optional: refresh or close
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {property.address && (
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                                                    📍 {property.address}
                                                </div>
                                            )}

                                            {/* [NEW] Tags Display */}
                                            {property.tags && property.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {property.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            style={{
                                                                background: getTagColor(tag),
                                                                fontSize: '0.7rem',
                                                                padding: '4px 12px',
                                                                borderRadius: '8px',
                                                                color: 'white',
                                                                fontWeight: 800
                                                            }}
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {property.units?.length > 0 && (
                                                <UnitManager
                                                    units={property.units}
                                                    onUpdate={(updatedUnits) => {
                                                        const occupied = updatedUnits.filter(u => u.status === 'occupied').length;
                                                        onUpdate(property.id, {
                                                            ...property,
                                                            units: updatedUnits,
                                                            occupancy: { ...property.occupancy, occupied }
                                                        });
                                                    }}
                                                />
                                            )}

                                            {property.type === 'commercial' && (
                                                <div style={{ marginTop: '0px' }}>
                                                    <CommercialMetrics
                                                        property={property}
                                                        transactions={property.transactions || []}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* TAB: FINANCE */}
                                    {activeTab === 'finance' && (
                                        <>
                                            {(property.isUnderConstruction || property.installments?.length > 0 || property.financialStrategy) && (
                                                <div style={{
                                                    padding: '20px',
                                                    background: property.isUnderConstruction
                                                        ? 'linear-gradient(135deg, rgba(217, 255, 0, 0.1) 0%, rgba(217, 255, 0, 0.05) 100%)'
                                                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                                                    borderRadius: '20px',
                                                    border: property.isUnderConstruction
                                                        ? '1px solid rgba(217, 255, 0, 0.2)'
                                                        : '1px solid rgba(99, 102, 241, 0.2)',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{ fontSize: '1.4rem' }}>{property.isUnderConstruction ? '🏗️' : '🏦'}</span>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: property.isUnderConstruction ? 'var(--accent-warning)' : 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                                    {property.isUnderConstruction ? t('property.developmentPhase') : t('property.financialHub')}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                                    {property.financialStrategy?.mode ? `${t('property.strategy')}: ${property.financialStrategy.mode.toUpperCase()}` : (property.installments?.length > 0 ? t('property.activeSchedule') : t('property.notSet'))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowFinancialPlanner(true)}
                                                            style={{
                                                                padding: '8px 16px',
                                                                borderRadius: '10px',
                                                                background: property.isUnderConstruction ? 'var(--accent-warning)' : 'var(--accent-primary)',
                                                                color: property.isUnderConstruction ? 'black' : 'white',
                                                                border: 'none',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 900,
                                                                cursor: 'pointer',
                                                                textTransform: 'uppercase'
                                                            }}
                                                        >
                                                            {t('property.manageHub')}
                                                        </button>
                                                    </div>
                                                    {property.isUnderConstruction && (
                                                        <div style={{ marginTop: '16px' }}>
                                                            <ConstructionProgressBar progress={property.progress || 0} hideLabel />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                                <h4 style={{ margin: '0 0 20px 0', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t('property.monthlyCashFlow')}</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>{t('finance.income')}</div>
                                                        <div style={{ color: 'var(--accent-success)', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>+${property.income || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>{t('finance.expenses')}</div>
                                                        <div style={{ color: '#F43F5E', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>-${property.expenses || 0}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>{t('property.net') || 'NET'}</div>
                                                        <div style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                                                            ${(property.income || 0) - (property.expenses || 0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {property.installments?.length > 0 && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        {property.isUnderConstruction ? 'Construction Milestones' : 'Payment Schedule'}
                                                    </div>
                                                    <InstallmentTracker installments={property.installments} />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* TAB: LEGAL */}
                                    {activeTab === 'legal' && (
                                        <>
                                            <ContractList
                                                contracts={property.contracts || []}
                                                currency={property.currency}
                                                propertyName={property.name}
                                                onAdd={(newContract) => {
                                                    const updatedContracts = [...(property.contracts || []), newContract];
                                                    onUpdate(property.id, { ...property, contracts: updatedContracts });
                                                }}
                                                onDelete={(contractId) => {
                                                    const updatedContracts = (property.contracts || []).filter(c => c.id !== contractId);
                                                    onUpdate(property.id, { ...property, contracts: updatedContracts });
                                                }}
                                            />
                                            <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                                                <VendorList
                                                    vendors={vendors}
                                                    onAdd={onAddVendor}
                                                    onDelete={onDeleteVendor}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* TAB: TENANT / OPERATIONS */}
                                    {activeTab === 'tenant' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {property.type === 'str' ? (
                                                <>
                                                    <STRMetrics
                                                        bookings={property.bookings || []}
                                                        transactions={property.transactions || []}
                                                        daysInMonth={30}
                                                    />
                                                    <div style={{ marginTop: '20px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase' }}>{t('property.opsHub')}</h3>
                                                            <button
                                                                onClick={() => setShowBookingForm(true)}
                                                                className="btn-primary"
                                                                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
                                                            >
                                                                + {t('property.addBooking')}
                                                            </button>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            {(property.bookings || []).map(b => (
                                                                <div key={b.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{b.guestName}</div>
                                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{b.checkIn} → {b.checkOut}</div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button onClick={() => { setEditingBooking(b); setShowBookingForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                                                                        <button onClick={() => setBookingToDelete(b)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><TrashIcon size={14} /></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <CleaningSchedule
                                                            property={property}
                                                            onUpdateCleanings={(cleanings) => onUpdate(property.id, { ...property, cleanings })}
                                                            onAddExpense={(expense) => {
                                                                const updatedTransactions = [{ ...expense, id: Date.now() }, ...(property.transactions || [])];
                                                                onUpdate(property.id, { ...property, transactions: updatedTransactions });
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                                        <button
                                                            onClick={() => setShowInviteModal(!showInviteModal)}
                                                            className="btn-primary"
                                                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
                                                        >
                                                            {showInviteModal ? t('common.cancel') : '+ Invite Tenant'}
                                                        </button>
                                                    </div>

                                                    {showInviteModal && (
                                                        <div style={{ marginBottom: '24px' }}>
                                                            <InviteManager
                                                                propertyId={property.id}
                                                                unitId={selectedUnitId}
                                                                onInviteSent={() => {
                                                                    // Optional: refresh or close
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    <TenantPortal
                                                        property={property}
                                                        embedded
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* General Controls (Sell/Delete) */}
                                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                                    <button onClick={onSell} style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--accent-success)',
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        color: 'var(--accent-success)',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {t('property.sellExit')}
                                    </button>
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{
                                        width: '56px',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--accent-danger)',
                                        background: 'rgba(244, 63, 94, 0.05)',
                                        color: 'var(--accent-danger)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}><TrashIcon size={20} strokeWidth={2.5} /></button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}><InfoIcon size={48} color="var(--accent-danger)" /></div>
                                <h3 style={{ margin: '0 0 12px 0', color: 'white', fontWeight: 900 }}>{t('property.deleteProperty')}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.5 }}>{t('common.confirmDelete') || 'This action cannot be undone. All data will be lost.'}</p>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}>{t('common.cancel') || 'Cancel'}</button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you absolutely sure?')) {
                                                onDelete(property.id);
                                                onClose();
                                            }
                                        }}
                                        style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--accent-danger)', color: 'white', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}
                                    >
                                        {t('common.delete') || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {showBookingForm && (
                    <BookingForm
                        property={property}
                        initialData={editingBooking}
                        onClose={() => {
                            setShowBookingForm(false);
                            setEditingBooking(null);
                        }}
                        onAdd={(newBooking) => {
                            let updatedBookings;
                            if (editingBooking) {
                                updatedBookings = (property.bookings || []).map(b => b.id === newBooking.id ? newBooking : b);
                            } else {
                                updatedBookings = [...(property.bookings || []), newBooking];
                            }

                            let updatedProperty = { ...property, bookings: updatedBookings };

                            // Only add auto-cleaning for NEW guest bookings
                            if (!editingBooking && newBooking.autoCleaning) {
                                const newCleaning = {
                                    id: Date.now().toString(),
                                    guestName: newBooking.guestName,
                                    checkoutDate: newBooking.checkOut,
                                    status: 'pending',
                                    cost: property.cleaningFee || 0,
                                    bookingId: newBooking.id
                                };
                                updatedProperty.cleanings = [...(property.cleanings || []), newCleaning];
                            }

                            onUpdate(property.id, updatedProperty);
                            setShowBookingForm(false);
                            setEditingBooking(null);
                        }}
                    />
                )}

                {/* Booking Deletion Confirmation */}
                {bookingToDelete && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 300,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div className="glass-panel" style={{ maxWidth: '340px', padding: '32px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}><TrashIcon size={40} color="var(--accent-danger)" /></div>
                            <h4 style={{ margin: '0 0 10px 0', color: 'white', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{t('property.deleteEntry')}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: 500 }}>
                                {t('property.removeConfirm')} <b>{bookingToDelete.guestName}</b>?
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setBookingToDelete(null)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={() => {
                                        const updatedBookings = (property.bookings || []).filter(b => b.id !== bookingToDelete.id);
                                        onUpdate(property.id, { ...property, bookings: updatedBookings });
                                        setBookingToDelete(null);
                                    }}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--accent-danger)', color: 'white', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem' }}
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Financial Planner Modal */}
                {showFinancialPlanner && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 400,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <FinancialPlanner
                            property={property}
                            onUpdate={(updates) => {
                                onUpdate(property.id, { ...property, ...updates });
                                setShowFinancialPlanner(false);
                            }}
                            onClose={() => setShowFinancialPlanner(false)}
                        />
                    </div>
                )}
            </div>
            <style>{`
                .tab-content-anim {
                    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </SideDrawer >
    );
};

export default PropertyDetail;
