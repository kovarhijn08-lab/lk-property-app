import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreOperations } from '../hooks/useFirestore';
import { useLanguage } from '../context/LanguageContext';
import { skynet } from '../utils/SkynetLogger';

const Onboarding = ({ onComplete }) => {
    const { currentUser, updatePreferences, logout } = useAuth();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null); // 'pmc', 'owner', 'tenant'
    const [loading, setLoading] = useState(false);

    // Step 2 Form States
    const [propertyName, setPropertyName] = useState('');
    const [propertyPrice, setPropertyPrice] = useState('');
    const [ownerEmail, setOwnerEmail] = useState(''); // [NEW] For PMC linking
    const [tenantCode, setTenantCode] = useState('');
    const [propertyId, setPropertyId] = useState(null);

    // Step 1 Profile States
    const [userName, setUserName] = useState(currentUser?.name || '');
    const [userPhone, setUserPhone] = useState('');
    const [userLang, setUserLang] = useState('en');

    // Step 3 Form States
    const [transactionAmount, setTransactionAmount] = useState(''); // For PMC
    const [managementType, setManagementType] = useState('self'); // For Owner: 'self' or 'pmc'
    const [maintenanceDesc, setMaintenanceDesc] = useState(''); // For Tenant

    const { setLanguage } = useLanguage();

    const handleRoleSelect = async (selectedRole) => {
        setLoading(true);
        try {
            // Save initial profile data
            await firestoreOperations.updateDocument('users', currentUser.id, {
                name: userName,
                phone: userPhone,
                language: userLang
            });
            if (userLang) setLanguage(userLang);

            setRole(selectedRole);
            setStep(2);
        } catch (e) {
            console.error('Step 1 save error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteStep2 = async () => {
        if (loading) return;
        setLoading(true);
        try {
            let generatedPropId = `prop-${Date.now()}`;
            setPropertyId(generatedPropId);

            // Persist role and setup data
            const userUpdate = {
                role: role,
                onboardingStep: 3
            };

            if (role !== 'tenant' && propertyName) {
                // Determine IDs based on role
                const managerIds = role === 'pmc' ? [currentUser.id] : [];
                const ownerIds = role === 'owner' ? [currentUser.id] : [];

                // If PMC provides owner email, we'd normally look up the UID, 
                // but for MVP/Onboarding, we'll store the email to link later or just as metadata
                const metadata = ownerEmail ? { targetOwnerEmail: ownerEmail } : {};

                // Create the first property with role-based ownership
                await firestoreOperations.setDocument('properties', generatedPropId, {
                    name: propertyName,
                    ownerIds: ownerIds,
                    managerIds: managerIds,
                    type: 'rental',
                    purchasePrice: parseFloat(propertyPrice) || 0,
                    marketValue: parseFloat(propertyPrice) || 0,
                    units: [{ id: `unit-${Date.now()}`, name: 'Main Unit', status: 'vacant', tenant: '' }],
                    occupancy: { occupied: 0, total: 1 },
                    transactions: [],
                    createdAt: new Date().toISOString(),
                    ...metadata
                });
                skynet.success(`Onboarding: Created first property "${propertyName}" for ${currentUser.email} with persistence logic.`);
            }

            const result = await firestoreOperations.updateDocument('users', currentUser.id, userUpdate);

            if (result.success) {
                setStep(3);
                skynet.info(`User ${currentUser.email} progressed to onboarding step 3 as ${role}`);
            }
        } catch (error) {
            console.error('Onboarding update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteStep3 = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (role === 'pmc' && transactionAmount) {
                // Add first transaction
                const txId = `tx-${Date.now()}`;
                await firestoreOperations.setDocument('transactions', txId, {
                    id: txId,
                    propertyId: propertyId,
                    amount: parseFloat(transactionAmount),
                    type: 'income',
                    category: 'rent',
                    date: new Date().toISOString().split('T')[0],
                    description: 'Initial Onboarding Rent',
                    userId: currentUser.id
                });
                skynet.success(`Onboarding: Created first transaction for PMC ${currentUser.email}`);
            } else if (role === 'tenant' && maintenanceDesc) {
                // Add first maintenance request
                const reqId = `maint-${Date.now()}`;
                await firestoreOperations.setDocument('maintenance_requests', reqId, {
                    id: reqId,
                    description: maintenanceDesc,
                    status: 'open',
                    priority: 'medium',
                    propertyId: 'pending_link', // Tenants might not have a property yet
                    userId: currentUser.id,
                    createdAt: new Date().toISOString()
                });
                skynet.success(`Onboarding: Created first maintenance request for Tenant ${currentUser.email}`);
            } else if (role === 'owner') {
                // Update owner management preference
                await firestoreOperations.updateDocument('users', currentUser.id, {
                    managementPreference: managementType
                });
            }

            const isSkip = userName === 'Admin' || userName === 'Администратор';

            // Finalize Onboarding
            await firestoreOperations.updateDocument('users', currentUser.id, {
                onboardingCompleted: true,
                onboardingAt: new Date().toISOString(),
                // If they skipped, don't force a role if they didn't pick one
                ...(role ? { role } : {})
            });

            skynet.log(`User ${currentUser.email} completed onboarding (skipped: ${isSkip})`, 'success');
            onComplete();
        } catch (error) {
            console.error('Onboarding step 3 error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '20px',
            color: 'white',
            fontFamily: 'var(--font-main)'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '600px',
                width: '100%',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Progress Bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${(step / 3) * 100}%`,
                    height: '4px',
                    background: 'var(--gradient-primary)',
                    transition: 'width 0.5s ease-out'
                }} />

                <button
                    onClick={logout}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #333',
                        color: 'var(--text-secondary)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    Logout / Logout
                </button>

                {step === 1 && (
                    <div className="step-content animate-fade-in">
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>Welcome to Skynet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Choose your role to get started</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                                <input
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Full Name"
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: 'white' }}
                                />
                                <input
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    placeholder="Phone Number"
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Preferred Language:</span>
                                {['en', 'ru'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setUserLang(l)}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: userLang === l ? '1px solid var(--accent-primary)' : '1px solid #333', background: userLang === l ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        {l === 'en' ? '🇬🇧 English' : '🇷🇺 Русский'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { id: 'pmc', icon: '🏢', title: 'Property Manager', desc: 'Portfolios & Teams' },
                                { id: 'owner', icon: '🔑', title: 'Property Owner', desc: 'Yield & Performance' },
                                { id: 'tenant', icon: '🏠', title: 'Tenant', desc: 'Payments & Support' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleRoleSelect(item.id)}
                                    disabled={loading || !userName}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        cursor: (loading || !userName) ? 'not-allowed' : 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        color: 'white',
                                        opacity: !userName ? 0.5 : 1
                                    }}
                                    className="role-card-hover"
                                >
                                    <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content animate-fade-in">
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800 }}>
                            {role === 'tenant' ? 'Link your Home' : 'Set up your Portfolio'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                            {role === 'tenant'
                                ? 'Enter the property code provided by your manager'
                                : 'Add your first property to see the dashboard in action'}
                        </p>

                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '32px' }}>
                            {role === 'tenant' ? (
                                <input
                                    value={tenantCode}
                                    onChange={(e) => setTenantCode(e.target.value)}
                                    placeholder="Enter Code (e.g. SKY-123)"
                                    style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1.1rem' }}
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <input
                                        value={propertyName}
                                        onChange={(e) => setPropertyName(e.target.value)}
                                        placeholder="Property Name (e.g. Marina View)"
                                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white' }}
                                    />
                                    <input
                                        type="number"
                                        value={propertyPrice}
                                        onChange={(e) => setPropertyPrice(e.target.value)}
                                        placeholder="Purchase Price ($)"
                                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white' }}
                                    />
                                    {role === 'pmc' && (
                                        <div style={{ marginTop: '8px' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>OWNER LINKING (OPTIONAL)</label>
                                            <input
                                                value={ownerEmail}
                                                onChange={(e) => setOwnerEmail(e.target.value)}
                                                placeholder="Owner Email Address"
                                                style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCompleteStep2}
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
                        >
                            {loading ? 'Processing...' : 'Continue'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('common.confirmAction')}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Let's achieve your "First Success" right now.</p>
                        </div>

                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '32px' }}>
                            {role === 'pmc' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-success)', fontWeight: 700 }}>ADD FIRST INCOME TRANSACTION</div>
                                    <input
                                        type="number"
                                        value={transactionAmount}
                                        onChange={(e) => setTransactionAmount(e.target.value)}
                                        placeholder="Rent Amount (e.g. 2500)"
                                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This will be recorded as your first rental income for {propertyName}.</p>
                                </div>
                            )}

                            {role === 'owner' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estimated Yield</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-success)' }}>
                                                {propertyPrice ? '8.4%' : '--'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Aha! moment</div>
                                            <div style={{ fontSize: '0.9rem', color: 'white' }}>Data Transparency</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>WHO MANAGES THIS PROPERTY?</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <button
                                                onClick={() => setManagementType('self')}
                                                style={{ padding: '12px', borderRadius: '8px', border: managementType === 'self' ? '1px solid var(--accent-primary)' : '1px solid #333', background: managementType === 'self' ? 'rgba(99, 102, 2 INDIGO, 0.2)' : 'transparent', color: 'white' }}
                                            >
                                                Independent
                                            </button>
                                            <button
                                                onClick={() => setManagementType('pmc')}
                                                style={{ padding: '12px', borderRadius: '8px', border: managementType === 'pmc' ? '1px solid var(--accent-primary)' : '1px solid #333', background: managementType === 'pmc' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: 'white' }}
                                            >
                                                Through PMC
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {role === 'tenant' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-warning)', fontWeight: 700 }}>SUBMIT MAINTENANCE REQUEST</div>
                                    <textarea
                                        value={maintenanceDesc}
                                        onChange={(e) => setMaintenanceDesc(e.target.value)}
                                        placeholder="Describe the issue (e.g. Broken AC in Bedroom)"
                                        style={{ width: '100%', height: '100px', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '12px', color: 'white', resize: 'none' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>We'll notify the manager as soon as you finish onboarding.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCompleteStep3}
                            disabled={loading || (role === 'pmc' && !transactionAmount) || (role === 'tenant' && !maintenanceDesc)}
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
                        >
                            {loading ? 'Processing...' : 'Complete Onboarding & Explore Dashboard'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .role-card-hover:hover {
                    background: rgba(255,255,255,0.08) !important;
                    border-color: var(--accent-primary) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default Onboarding;
