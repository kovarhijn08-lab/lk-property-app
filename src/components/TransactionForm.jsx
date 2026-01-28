import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { validateForm } from '../utils/validators';
import TagInput from './TagInput'; // [NEW]

const TransactionForm = ({ onSubmit, onClose, initialData, vendors = [] }) => {
    const { t } = useLanguage();
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [category, setCategory] = useState(initialData?.category || 'Rent');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [vendorId, setVendorId] = useState(initialData?.vendorId || '');
    const [expenseType, setExpenseType] = useState(initialData?.expenseType || 'opex');
    const [tags, setTags] = useState(initialData?.tags || []); // [NEW]

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate on change
    useEffect(() => {
        const currentErrors = validateForm('transaction', {
            amount,
            category,
            description,
            date,
            vendorId,
            expenseType
        });
        setErrors(currentErrors);
    }, [amount, category, description, date]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) return;

        onSubmit({
            id: Date.now(),
            amount: parseFloat(amount),
            category,
            expenseType: category === 'Rent' ? null : expenseType,
            description,
            vendorId: category === 'Rent' ? null : vendorId,
            date: date || new Date().toISOString(),
            tags // [NEW]
        });
        setAmount('');
        setDescription('');
    };

    const renderFieldError = (fieldName, value) => {
        if ((!touched[fieldName] && !value) || !errors[fieldName]) return null;
        return (
            <div style={{ marginTop: '6px' }}>
                <div style={{ color: '#F43F5E', fontSize: '0.75rem', fontWeight: 700 }}>⚠️ {t(errors[fieldName].message)}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>{t(errors[fieldName].example)}</div>
            </div>
        );
    };

    const isFormValid = Object.keys(errors).length === 0;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'end', justifyContent: 'center',
            zIndex: 100
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '480px',
                padding: '24px',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                animation: 'slideUp 0.3s ease'
            }}>
                <h3 style={{ marginTop: 0 }}>{t('finance.logTransaction')}</h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.amount')} ($) *</label>
                        <input
                            type="number"
                            value={amount}
                            onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                            style={{
                                width: '100%', padding: '14px', fontSize: '1.2rem', fontWeight: 900,
                                background: 'rgba(255,255,255,0.05)', border: touched.amount && errors.amount ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--glass-border)', borderRadius: '12px', color: errors.amount ? 'var(--accent-danger)' : 'var(--accent-success)', outline: 'none'
                            }}
                        />
                        {renderFieldError('amount', amount)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.category')}</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', outline: 'none'
                                }}
                            >
                                <option value="Rent">{t('finance.rentIncome')}</option>
                                <option value="Repair">{t('finance.repairCost')}</option>
                                <option value="Mortgage">{t('finance.mortgage')}</option>
                                <option value="Expense">{t('finance.otherExpense')}</option>
                            </select>
                        </div>
                        {category !== 'Rent' && (
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.expenseType')}</label>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setExpenseType('opex')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: expenseType === 'opex' ? 'var(--accent-primary)' : 'transparent',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        OpEx
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExpenseType('capex')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: expenseType === 'capex' ? 'var(--accent-warning)' : 'transparent',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        CapEx
                                    </button>
                                </div>
                            </div>
                        )}
                        <div style={{ gridColumn: category === 'Rent' ? 'span 1' : 'span 2' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.date')}</label>
                            <input
                                type="date"
                                value={date}
                                onBlur={() => setTouched(prev => ({ ...prev, date: true }))}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: touched.date && errors.date ? '1px solid rgba(244, 63, 94, 0.5)' : 'none', borderRadius: '8px', color: 'white', outline: 'none'
                                }}
                            />
                            {renderFieldError('date', date)}
                        </div>
                    </div>

                    {category !== 'Rent' && vendors.length > 0 && (
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.vendor')}</label>
                            <select
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', outline: 'none'
                                }}
                            >
                                <option value="">{t('finance.noVendor')}</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.category})</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('finance.description')} ({t('common.optional') || 'Опционально'})</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Например: Оплата ЖКХ за январь"
                            style={{
                                width: '100%', padding: '14px', fontSize: '1rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none'
                            }}
                        />
                    </div>

                    {/* [NEW] Tags Section */}
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('common.tags')}</label>
                        <TagInput tags={tags} onChange={setTags} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            style={{
                                flex: 1.5, padding: '16px',
                                background: isFormValid ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                border: 'none', color: isFormValid ? 'white' : 'var(--text-secondary)', borderRadius: '12px',
                                fontWeight: 800, cursor: isFormValid ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isFormValid ? t('common.save') : t('validation.fixErrors')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default TransactionForm;
