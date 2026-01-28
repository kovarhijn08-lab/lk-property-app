import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../hooks/useMessaging';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import TenantDashboard from './TenantDashboard';
import TenantMaintenance from './TenantMaintenance';
import TenantDocuments from './TenantDocuments';
import TenantProfile from './TenantProfile';
import { SendIcon } from '../../components/Icons';

const TenantPortal = ({ property, embedded = false }) => {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [messageText, setMessageText] = useState('');

    // Messaging for the footer/quick-access
    const tenantUnit = property.units?.find(u => u.tenant === currentUser?.email || u.tenantUid === currentUser?.uid) || property.units?.[0];
    const {
        messages,
        sendMessage,
        sendFile,
        markAsRead,
        setTypingStatus,
        loading: messagesLoading,
        error: messagesError,
        formatMessageDate
    } = useMessaging(property.id, tenantUnit?.id, currentUser?.id);

    const { data: typingData } = useFirestoreCollection('typing', []);
    const otherTyping = typingData?.find(t =>
        t.propertyId === property.id &&
        t.userId !== currentUser?.id &&
        t.isTyping &&
        (new Date() - new Date(t.timestamp) < 5000)
    );

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: '🏠' },
        { id: 'maintenance', label: 'Fix', icon: '🛠️' },
        { id: 'messages', label: 'Chat', icon: '💬' },
        { id: 'docs', label: 'Docs', icon: '📄' },
        { id: 'profile', label: 'Profile', icon: '👤' }
    ];

    useEffect(() => {
        if (activeTab === 'messages') {
            const hasUnread = messages.some(m => !m.read && m.userId !== currentUser?.id);
            if (hasUnread) {
                markAsRead();
            }
        } else {
            setTypingStatus(false);
        }
    }, [activeTab, messages, currentUser?.id, markAsRead, setTypingStatus]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const textToSend = messageText.trim();
        if (!textToSend) return;

        setMessageText('');
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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <TenantDashboard property={property} onNavigate={setActiveTab} />;
            case 'maintenance': return <TenantMaintenance property={property} />;
            case 'docs': return <TenantDocuments property={property} />;
            case 'messages': return (
                <div className="glass-panel" style={{ padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {messagesError ? (
                            <div style={{ textAlign: 'center', color: '#EF4444', padding: '10px', fontSize: '0.8rem' }}>⚠️ {messagesError}</div>
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
                                                        <img
                                                            src={msg.fileUrl || msg.imageUrl}
                                                            alt="attachment"
                                                            style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }}
                                                            onClick={() => window.open(msg.fileUrl || msg.imageUrl, '_blank')}
                                                        />
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
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const role = currentUser?.id === property.userId ? 'manager' : 'tenant';
                                        const res = await sendFile(e.target.files[0], role);
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
                            placeholder="Type a message..."
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '12px' }}
                        />
                        <button className="btn-primary" type="submit" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SendIcon size={20} />
                        </button>
                    </form>
                </div>
            );
            case 'profile': return <TenantProfile />;
            default: return <TenantDashboard property={property} />;
        }
    };

    return (
        <div style={{
            minHeight: embedded ? 'auto' : '100vh',
            background: 'var(--bg-primary)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: embedded ? '100%' : '600px',
            margin: embedded ? '0' : '0 auto',
            position: 'relative',
            paddingBottom: embedded ? '0' : '80px' // Space for bottom nav
        }}>
            {/* Header */}
            <header style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: embedded ? 'relative' : 'sticky',
                top: embedded ? 'auto' : 0,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900
                    }}>
                        {property.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{property.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 700 }}>VERIFIED TENANT</div>
                    </div>
                </div>
                {!embedded && (
                    <button
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        🚪
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main style={{ padding: '20px' }}>
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav style={{
                position: embedded ? 'relative' : 'fixed',
                bottom: embedded ? 'auto' : '20px',
                left: embedded ? 'auto' : '50%',
                transform: embedded ? 'none' : 'translateX(-50%)',
                width: embedded ? '100%' : 'calc(100% - 40px)',
                maxWidth: embedded ? 'none' : '400px',
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                display: 'flex',
                padding: '8px',
                gap: '4px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                zIndex: 100,
                marginTop: embedded ? '16px' : '0'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '12px 4px',
                            background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '18px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
                            {tab.icon}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default TenantPortal;
