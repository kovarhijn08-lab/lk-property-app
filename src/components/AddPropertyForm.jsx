import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SideDrawer from './SideDrawer';
import { HomeIcon, HotelIcon, OfficeIcon, BuildingIcon } from './Icons';
import { validateForm } from '../utils/validators';
import TagInput from './TagInput'; // [NEW]

const AddPropertyForm = ({ onSubmit, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [type, setType] = useState('rental');
    const [units, setUnits] = useState('1');
    const [hasMultipleUnits, setHasMultipleUnits] = useState(false);
    const [address, setAddress] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [isUnderConstruction, setIsUnderConstruction] = useState(false);
    const [tags, setTags] = useState([]); // [NEW]

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate form on every change
    useEffect(() => {
        const currentErrors = validateForm('property', {
            name,
            type,
            units,
            address,
            marketValue: purchasePrice, // marketValue rule used for purchasePrice too
            purchasePrice
        });
        setErrors(currentErrors);
    }, [name, type, units, address, purchasePrice]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) return;

        onSubmit({
            id: `prop-${Date.now()}`,
            name,
            type,
            isUnderConstruction,
            address,
            purchasePrice: parseFloat(purchasePrice),
            marketValue: parseFloat(purchasePrice),
            transactions: [],
            units: Array.from({ length: parseInt(units) || 1 }, (_, i) => ({
                id: `unit-${Date.now()}-${i}`,
                name: parseInt(units) > 1 ? `Unit ${i + 1}` : 'Main Unit',
                status: 'vacant',
                tenant: ''
            })),
            occupancy: { occupied: 0, total: parseInt(units) },
            ...(isUnderConstruction && {
                progress: 0,
                statusMessage: 'Project initiated.',
                installments: []
            }),
            tags // [NEW]
        });
    };

    const renderFieldError = (fieldName, value) => {
        if ((!touched[fieldName] && !value) || !errors[fieldName]) return null;
        return (
            <div style={{ marginTop: '6px', animation: 'fadeIn 0.3s' }}>
                <div style={{ color: '#F43F5E', fontSize: '0.75rem', fontWeight: 700 }}>⚠️ {t(errors[fieldName].message)}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>{t(errors[fieldName].example)}</div>
            </div>
        );
    };

    const isFormValid = Object.keys(errors).length === 0;

    return (
        <SideDrawer
            isOpen={true}
            onClose={onClose}
            title={t('property.addNew')}
            subtitle={t('property.configuringAsset')}
            width="480px"
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '120px' }}>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {t('property.name')} *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., 'Skyline Towers'"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'rgba(0,0,0,0.2)',
                            border: touched.name && errors.name ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                    {renderFieldError('name', name)}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {t('property.targetUsage')} *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'rental', icon: <HomeIcon size={18} />, label: t('common.ready') },
                            { id: 'str', icon: <HotelIcon size={18} />, label: 'STR' },
                            { id: 'commercial', icon: <OfficeIcon size={18} />, label: t('dashboard.commercial') }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setType(opt.id)}
                                style={{
                                    flex: '1',
                                    padding: '14px 8px',
                                    borderRadius: '12px',
                                    border: type === opt.id ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
                                    background: type === opt.id ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)' : 'rgba(255,255,255,0.03)',
                                    color: type === opt.id ? 'white' : 'var(--text-secondary)',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                <span style={{ opacity: type === opt.id ? 1 : 0.5 }}>{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: isUnderConstruction ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '16px',
                    border: `1px solid ${isUnderConstruction ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s'
                }} onClick={() => setIsUnderConstruction(!isUnderConstruction)}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: isUnderConstruction ? 'var(--accent-primary)' : 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isUnderConstruction ? <BuildingIcon size={16} strokeWidth={2.5} /> : null}
                            {isUnderConstruction ? t('property.developmentPhase') : t('property.operational')}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.8 }}>{t('property.togglePhase')}</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '22px',
                        background: isUnderConstruction ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '11px',
                        position: 'relative',
                        transition: 'background 0.3s'
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '3px',
                            left: isUnderConstruction ? '21px' : '3px',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }} />
                    </div>
                </div>

                {type === 'commercial' && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: hasMultipleUnits ? '16px' : '0'
                        }} onClick={() => setHasMultipleUnits(!hasMultipleUnits)}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                {t('validation.multiUnitToggle')}
                            </div>
                            <div style={{
                                width: '34px',
                                height: '20px',
                                background: hasMultipleUnits ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                position: 'relative',
                                cursor: 'pointer'
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
                            <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    {t('property.units')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {t('property.address')}
                    </label>
                    <input
                        type="text"
                        value={address}
                        onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Dubai Marina, UAE"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'rgba(0,0,0,0.2)',
                            border: touched.address && errors.address ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    {renderFieldError('address', address)}
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {t('property.purchasePrice')} *
                    </label>
                    <input
                        type="number"
                        value={purchasePrice}
                        onBlur={() => setTouched(prev => ({ ...prev, marketValue: true }))}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="500000"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'rgba(0,0,0,0.2)',
                            border: touched.marketValue && errors.marketValue ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-display)',
                            outline: 'none',
                            color: errors.marketValue ? 'var(--accent-danger)' : 'var(--accent-success)'
                        }}
                    />
                    {renderFieldError('marketValue', purchasePrice)}
                </div>

                {/* [NEW] Tags Section */}
                <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {t('common.tags')}
                    </label>
                    <TagInput tags={tags} onChange={setTags} />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {t('common.cancel')}
                    </button>
                    <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {!isFormValid && (
                            <div style={{
                                animation: 'fadeIn 0.3s',
                                background: 'rgba(244, 63, 94, 0.1)',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                marginBottom: '4px'
                            }}>
                                {Object.values(errors).map((err, i) => (
                                    <div key={i} style={{ color: '#F43F5E', fontSize: '0.65rem', fontWeight: 800 }}>• {t(err.message)}</div>
                                ))}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: '16px',
                                border: 'none',
                                background: isFormValid ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                color: isFormValid ? 'white' : 'var(--text-secondary)',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                cursor: isFormValid ? 'pointer' : 'not-allowed',
                                boxShadow: isFormValid ? '0 15px 30px -10px rgba(99, 102, 241, 0.5)' : 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isFormValid ? t('property.addBtn') : t('validation.fixErrors')}
                        </button>
                    </div>
                </div>
            </form>
        </SideDrawer>
    );
};

export default AddPropertyForm;
