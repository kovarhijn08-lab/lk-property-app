import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DollarIcon, CalendarIcon, BuildingIcon, CloseIcon, ChevronDownIcon } from './Icons';

const FinancialPlanner = ({ property, onUpdate, onClose }) => {
    const { t } = useLanguage();
    const [mode, setMode] = useState(property.financialStrategy?.mode || 'milestone');
    const [totalPrice, setTotalPrice] = useState(property.purchasePrice || 0);

    // Common States
    const [interestRate, setInterestRate] = useState(property.financialStrategy?.interestRate || 5.5);
    const [termYears, setTermYears] = useState(property.financialStrategy?.termYears || 20);
    const [installmentMonths, setInstallmentMonths] = useState(property.financialStrategy?.installmentMonths || 12);
    const [downPaymentPct, setDownPaymentPct] = useState(property.financialStrategy?.downPaymentPct || 20);
    const [gracePeriodMonths, setGracePeriodMonths] = useState(property.financialStrategy?.gracePeriodMonths || 0);

    // Milestones State
    const [milestones, setMilestones] = useState(property.installments || [
        { id: 'm1', stage: t('finance.initialPayment'), amount: Math.round(totalPrice * 0.2), pct: 20, date: new Date().toISOString().split('T')[0], status: 'paid', usePct: true },
        { id: 'm2', stage: t('finance.constructionStage'), amount: Math.round(totalPrice * 0.3), pct: 30, date: '', status: 'pending', usePct: true },
        { id: 'm3', stage: t('finance.finalBalance'), amount: Math.round(totalPrice * 0.5), pct: 50, date: '', status: 'pending', usePct: true }
    ]);

    const addMilestone = () => {
        setMilestones([...milestones, { id: `m-${Date.now()}`, stage: t('finance.newMilestone'), amount: 0, pct: 0, date: '', status: 'pending', usePct: true }]);
    };

    const updateMilestone = (id, field, value) => {
        setMilestones(milestones.map(m => {
            if (m.id !== id) return m;

            let updated = { ...m, [field]: value };
            if (field === 'amount') {
                updated.pct = (parseFloat(value) / totalPrice * 100).toFixed(1);
            } else if (field === 'pct') {
                updated.amount = Math.round(parseFloat(value) / 100 * totalPrice);
            }
            return updated;
        }));
    };

    const removeMilestone = (id) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter(m => m.id !== id));
        }
    };

    const handleSave = () => {
        let finalInstallments = [];
        const now = new Date();

        if (mode === 'milestone') {
            finalInstallments = milestones.map(m => ({
                ...m,
                amount: parseFloat(m.amount) || 0,
                date: m.date || now.toISOString().split('T')[0]
            }));
        } else if (mode === 'installment') {
            const downPayment = (totalPrice * downPaymentPct) / 100;
            const remaining = totalPrice - downPayment;
            const monthlyPayment = remaining / (installmentMonths - 1);

            finalInstallments.push({
                id: `dp-${Date.now()}`,
                stage: t('finance.dpLabel'),
                amount: Math.round(downPayment),
                date: now.toISOString().split('T')[0],
                status: 'paid'
            });

            for (let i = 1; i < installmentMonths; i++) {
                const payDate = new Date(now);
                payDate.setMonth(now.getMonth() + i);
                finalInstallments.push({
                    id: `phpp-${Date.now()}-${i}`,
                    stage: `Installment ${i}/${installmentMonths - 1}`,
                    amount: Math.round(monthlyPayment),
                    date: payDate.toISOString().split('T')[0],
                    status: 'pending'
                });
            }
        } else {
            // Credit Mode
            finalInstallments.push({
                id: `mortgage-${Date.now()}`,
                stage: t('finance.bankMortgage'),
                amount: totalPrice,
                date: now.toISOString().split('T')[0],
                status: 'paid',
                isLoan: true,
                interestRate,
                termYears
            });
        }

        onUpdate({
            financialStrategy: {
                mode,
                interestRate,
                termYears,
                installmentMonths,
                downPaymentPct
            },
            installments: finalInstallments,
            purchasePrice: totalPrice
        });
        onClose();
    };

    const totalAllocated = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
    const balanceRemaining = totalPrice - totalAllocated;

    const convertGapToMortgage = () => {
        if (balanceRemaining <= 0) return;

        const now = new Date();
        const mortgageDate = new Date(now);
        mortgageDate.setMonth(now.getMonth() + (parseInt(gracePeriodMonths) || 0));

        const mortgageNode = {
            id: `mortgage-${Date.now()}`,
            stage: t('finance.mortgageTransition'),
            amount: Math.round(balanceRemaining),
            pct: (balanceRemaining / totalPrice * 100).toFixed(1),
            date: mortgageDate.toISOString().split('T')[0],
            status: 'pending',
            isLoan: true,
            interestRate,
            termYears,
            usePct: false
        };

        setMilestones([...milestones, mortgageNode]);
    };

    return (
        <div className="glass-panel animate-slide-up" style={{
            width: '100%',
            maxWidth: '560px',
            padding: '32px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(40px)',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DollarIcon color="var(--accent-primary)" strokeWidth={2.5} />
                    {t('property.financialHub')}
                </h3>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}><CloseIcon size={18} strokeWidth={2} /></button>
            </div>

            {/* Mode Selection */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '16px' }}>
                {[
                    { id: 'milestone', label: t('finance.milestones'), icon: <BuildingIcon size={20} /> },
                    { id: 'installment', label: t('finance.fixedPlan'), icon: <CalendarIcon size={20} /> },
                    { id: 'credit', label: t('finance.credit'), icon: <DollarIcon size={20} /> }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setMode(opt.id)}
                        style={{
                            flex: 1,
                            padding: '14px 8px',
                            borderRadius: '12px',
                            border: 'none',
                            background: mode === opt.id ? 'var(--gradient-primary)' : 'transparent',
                            color: mode === opt.id ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: mode === opt.id ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                    >
                        <div style={{ marginBottom: '6px' }}>{opt.icon}</div>
                        {opt.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Total Price (Syncs with Property purchasePrice) */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.totalAssetPrice')}</label>
                    <input
                        type="number"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)',
                            outline: 'none'
                        }}
                    />
                </div>

                {mode === 'milestone' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('finance.milestones')}</label>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: balanceRemaining === 0 ? 'var(--accent-success)' : 'var(--accent-warning)',
                                background: balanceRemaining === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(217, 255, 0, 0.1)',
                                padding: '4px 10px',
                                borderRadius: '8px'
                            }}>
                                {balanceRemaining === 0 ? `✓ ${t('finance.balanced')}` : `${t('finance.gap')}: $${balanceRemaining.toLocaleString()}`}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {milestones.map((m) => (
                                <div key={m.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 100px 120px 30px',
                                    gap: '12px',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: m.isLoan ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--glass-border)',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            placeholder={t('common.title')}
                                            value={m.stage}
                                            onChange={(e) => updateMilestone(m.id, 'stage', e.target.value)}
                                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }}
                                        />
                                        {m.isLoan && (
                                            <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <BuildingIcon size={10} />
                                                {t('finance.bankMortgage').toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            value={m.usePct ? m.pct : m.amount}
                                            onChange={(e) => updateMilestone(m.id, m.usePct ? 'pct' : 'amount', e.target.value)}
                                            style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, padding: '8px', borderRadius: '8px', width: '100%', paddingRight: '22px', outline: 'none' }}
                                        />
                                        <button
                                            onClick={() => updateMilestone(m.id, 'usePct', !m.usePct)}
                                            style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 900 }}
                                        >
                                            {m.usePct ? '%' : '$'}
                                        </button>
                                    </div>
                                    <input
                                        type="date"
                                        value={m.date}
                                        onChange={(e) => updateMilestone(m.id, 'date', e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '0.75rem', padding: '8px', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <button onClick={() => removeMilestone(m.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
                                        <CloseIcon size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={addMilestone}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                + {t('finance.addStage')}
                            </button>
                            {balanceRemaining > 0 && (
                                <button
                                    onClick={convertGapToMortgage}
                                    style={{ flex: 1.2, padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase' }}
                                >
                                    <BuildingIcon size={14} /> {t('finance.convertGap')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {mode === 'installment' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.planDuration')}</label>
                                <input
                                    type="number"
                                    value={installmentMonths}
                                    onChange={(e) => setInstallmentMonths(parseInt(e.target.value) || 1)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.downPayment')}</label>
                                <input
                                    type="number"
                                    value={downPaymentPct}
                                    onChange={(e) => setDownPaymentPct(parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)', lineHeight: 1.6 }}>
                            💡 <b>Post-Handover Plan</b>: Pay for a ready property over time. Usually interest-free. Common in Dubai and other investment hubs.
                        </div>
                    </div>
                )}

                {mode === 'credit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.interestRate')}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.mortgageTerm')}</label>
                                <input
                                    type="number"
                                    value={termYears}
                                    onChange={(e) => setTermYears(parseInt(e.target.value) || 1)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('finance.gracePeriod')}</label>
                            <input
                                type="number"
                                value={gracePeriodMonths}
                                onChange={(e) => setGracePeriodMonths(parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)', lineHeight: 1.6 }}>
                            🏦 <b>Bank Financing</b>: Standard property loan. Grace period defines months before principal payments start.
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                <button
                    onClick={onClose}
                    style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    {t('common.cancel')}
                </button>
                <button
                    onClick={handleSave}
                    style={{ flex: 1.5, padding: '16px', borderRadius: '14px', border: 'none', background: 'var(--gradient-primary)', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                    {t('finance.updateHub')}
                </button>
            </div>
        </div>
    );
};

export default FinancialPlanner;
