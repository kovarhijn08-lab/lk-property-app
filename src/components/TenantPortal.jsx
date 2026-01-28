import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../hooks/useMessaging';
import { useMaintenance } from '../hooks/useMaintenance';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { SendIcon, InfoIcon, ToolIcon, DollarIcon, ChevronDownIcon } from './Icons';

const TenantPortal = ({ property, transactions = [] }) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [selectedUnitId, setSelectedUnitId] = useState(property.units && property.units.length > 0 ? property.units[0].id : null);
    const [messageText, setMessageText] = useState('');

    // Hooks for Firestore data
    const { messages, sendMessage, sendFile, markAsRead, setTypingStatus, loading: messagesLoading, error, formatMessageDate } = useMessaging(property.id, selectedUnitId, currentUser?.id);
    const { requests, createRequest, loading: requestsLoading } = useMaintenance(property.id, currentUser?.id);

    // [NEW] Typing Status Listener
    const { data: typingData } = useFirestoreCollection('typing', []);
    const otherTyping = typingData?.find(t =>
        t.propertyId === property.id &&
        t.userId !== currentUser?.id &&
        t.isTyping &&
        (new Date() - new Date(t.timestamp) < 5000)
    );

    // [NEW] Mark as read when active
    useEffect(() => {
        if (activeSection === 'messaging') {
            const hasUnread = messages.some(m => !m.read && m.userId !== currentUser?.id);
            if (hasUnread) {
                markAsRead();
            }
        }
    }, [activeSection, messages, currentUser?.id]);

    const selectedUnit = property.units?.find(u => u.id === selectedUnitId);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const textToSend = messageText.trim();
        if (!textToSend) return;

        setMessageText(''); // [OPTIMISTIC]
        setTypingStatus(false);
        const role = currentUser?.id === property.userId ? 'manager' : 'tenant';
        const res = await sendMessage(textToSend, role);
        if (!res.success) {
            setMessageText(textToSend);
        }
    };

    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        if (e.target.value.length > 0) {
            setTypingStatus(true);
        } else {
            setTypingStatus(false);
        }
    };

    const renderDashboard = () => {
        const hasUnread = messages.some(m => !m.read && m.userId !== currentUser?.id);
        const openRequests = requests.filter(r => r.status !== 'Completed');

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Next Action Card */}
                <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            ⚡
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('property.tenantPortal.nextAction')}</div>
                            <h4 style={{ margin: '4px 0', fontSize: '1.1rem', fontWeight: 800 }}>
                                {hasUnread ? 'You have unread messages' : openRequests.length > 0 ? 'Maintenance in progress' : t('property.tenantPortal.allSet')}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {hasUnread ? 'Manager replied to your message.' : openRequests.length > 0 ? `Your request "${openRequests[0].title}" is being handled.` : t('property.tenantPortal.noPendingActions')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveSection(hasUnread ? 'messaging' : openRequests.length > 0 ? 'maintenance' : 'payments')}
                        style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        {hasUnread ? 'Read Messages' : 'View Status'}
                    </button>
                </div>

                {/* Quick Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={() => setActiveSection('messaging')}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>💬</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 0 }}>Support</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('maintenance')}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🛠️</span>
                        <span style={{ fontSize: '0.75rem' }}>Fix request</span>
                    </button>
                </div>

                {/* Property Snapshot */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('property.tenantPortal.propertySnapshot')}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 800 }}>{property.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{property.address}</div>
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                                <span>🔑</span> Unit {selectedUnit?.name}
                            </div>
                        </div>
                        <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2rem' }}>📱</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMessaging = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '350px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {error ? (
                    <div style={{ textAlign: 'center', color: '#EF4444', padding: '10px', fontSize: '0.8rem' }}>⚠️ {error}</div>
                ) : messagesLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No messages yet. Start a conversation!</div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.userId === currentUser?.id;
                        return (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}
                            >
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                    background: isMe ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    lineHeight: 1.4,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {(msg.fileUrl || msg.imageUrl) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(msg.fileType?.startsWith('image/') || (!msg.fileType && (msg.imageUrl || msg.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i)))) ? (
                                                <img src={msg.fileUrl || msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(msg.fileUrl || msg.imageUrl, '_blank')} />
                                            ) : (
                                                <div
                                                    onClick={() => window.open(msg.fileUrl, '_blank')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>Document</div>
                                                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{msg.text.includes('[FILE]') ? msg.text.replace('[FILE]', '').trim() : 'View Attachment'}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {msg.text !== '[IMAGE]' && !msg.text.startsWith('[FILE]') && <span>{msg.text}</span>}
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.5, display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '4px' }}>
                                    {formatMessageDate(msg.timestamp)}
                                    {isMe && (
                                        <span style={{ color: msg.read ? '#3B82F6' : 'inherit', fontSize: '0.8rem' }}>
                                            {msg.read ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                {otherTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                        typing...
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--glass-border)', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const res = await sendFile(e.target.files[0], currentUser?.id === property.userId ? 'manager' : 'tenant');
                                if (res && !res.success) {
                                    alert('Upload failed: ' + res.error);
                                }
                            }
                        }}
                    />
                    📎
                </label>
                <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder={t('property.tenantPortal.typeMessage')}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '12px', outline: 'none' }}
                />
                <button
                    type="submit"
                    style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <SendIcon size={20} color="white" />
                </button>
            </form>
        </div>
    );

    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePayment = async () => {
        setPaymentLoading(true);
        try {
            const response = await fetch('/api/payments/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1500,
                    propertyId: property.id,
                    tenantEmail: currentUser?.email
                })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create payment session');
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed: ' + err.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const renderPayments = () => {
        const rentPayments = (property.transactions || []).filter(tx => tx.category === 'Rent' || tx.type === 'income');
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Next Payment Due</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>$1,500.00</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due on Feb 1st, 2026</div>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={paymentLoading}
                            style={{
                                background: 'var(--accent-success)',
                                border: 'none',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                opacity: paymentLoading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            {paymentLoading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>

                    {/* Simple Payment Progress */}
                    <div style={{ marginTop: '20px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '75%', height: '100%', background: 'var(--accent-success)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        <span>Jan 1st</span>
                        <span>Rent Cycle</span>
                        <span>Feb 1st</span>
                    </div>
                </div>
                <h4 style={{ margin: '8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('property.tenantPortal.paymentHistory')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rentPayments.length > 0 ? rentPayments.slice(0, 5).map(py => (
                        <div key={py.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{py.category || 'Rent Payment'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{py.date}</div>
                            </div>
                            <div style={{ color: 'var(--accent-success)', fontWeight: 800 }}>+${py.amount}</div>
                        </div>
                    )) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No payment records found.</p>}
                </div>
            </div>
        );
    };

    const renderMaintenance = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Requests</h4>
                <button
                    onClick={() => createRequest({ title: 'New Maintenance Request', description: 'Sample issue report', unitId: selectedUnitId })}
                    className="tag"
                    style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                >
                    + New
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requestsLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No active requests.</div>
                ) : (
                    requests.map(req => {
                        const stages = ['New', 'Assigned', 'In Progress', 'Resolved'];
                        const currentStageIdx = stages.indexOf(req.status) !== -1 ? stages.indexOf(req.status) : 0;

                        return (
                            <div key={req.id} className="glass-panel" style={{ padding: '16px', borderLeft: req.priority === 'High' ? '4px solid #F43F5E' : '4px solid var(--accent-warning)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{req.title}</div>
                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontWeight: 800 }}>{req.status}</span>
                                </div>

                                {/* Maintenance Pipeline Visual */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                    {stages.map((stage, idx) => (
                                        <React.Fragment key={stage}>
                                            <div style={{
                                                flex: 1,
                                                height: '4px',
                                                background: idx <= currentStageIdx ? 'var(--accent-warning)' : 'rgba(255,255,255,0.05)',
                                                borderRadius: '2px'
                                            }} />
                                            {idx < stages.length - 1 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: idx < currentStageIdx ? 'var(--accent-warning)' : 'rgba(255,255,255,0.1)' }} />}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Reported: {new Date(req.createdAt).toLocaleDateString()}</span>
                                    <span>{stages[currentStageIdx]}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '2rem' }}>📜</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>Lease Agreement</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: Active • Signed on {property.createdAt?.split('T')[0]}</div>
                    </div>
                    <button className="tag" style={{ border: '1px solid var(--glass-border)', background: 'none', color: 'var(--accent-primary)', fontSize: '0.7rem', cursor: 'pointer' }}>
                        View
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['House Rules.pdf', 'Emergency Contacts.pdf', 'Appliance Manuals.pdf'].map(doc => (
                        <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer' }}>
                            <span>📄</span>
                            <span style={{ fontSize: '0.8rem', flex: 1 }}>{doc}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)' }}>Download</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Tenant Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            👤
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{selectedUnit?.tenant || 'No Active Tenant'}</h3>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>{t('property.tenantPortal.activeLease')}</div>
                        </div>
                    </div>
                    {property.units && property.units.length > 1 && (
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedUnitId}
                                onChange={(e) => setSelectedUnitId(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                            >
                                {property.units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Portal Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { id: 'dashboard', label: t('property.tenantPortal.dashboard'), icon: '🏠' },
                        { id: 'messaging', label: t('property.tenantPortal.messaging'), icon: '💬' },
                        { id: 'payments', label: t('property.tenantPortal.payments'), icon: '💵' },
                        { id: 'maintenance', label: t('property.tenantPortal.maintenance'), icon: '🛠️' },
                        { id: 'documents', label: 'Docs', icon: '📄' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            style={{
                                flex: 1,
                                padding: '10px 4px',
                                borderRadius: '10px',
                                background: activeSection === tab.id ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                color: activeSection === tab.id ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: '20px' }}>
                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'messaging' && renderMessaging()}
                {activeSection === 'payments' && renderPayments()}
                {activeSection === 'maintenance' && renderMaintenance()}
                {activeSection === 'documents' && renderDocuments()}
            </div>
        </div>
    );
};

export default TenantPortal;
