
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../hooks/useMessaging';
import { useLanguage } from '../context/LanguageContext';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { SendIcon, CloseIcon, InfoIcon } from './Icons';

/**
 * Global Support Chat Component
 * Connects users directly to admins via a special 'support' propertyId
 */
const SupportChat = ({ onClose, isInline = false, targetUserId = null }) => {
    const { currentUser, isAdmin } = useAuth();
    const { t } = useLanguage();
    const [messageText, setMessageText] = useState('');
    const scrollRef = useRef(null);

    // Техподдержка использует 'support' как propertyId. 
    // В поле unitId мы храним UID пользователя, которому нужна помощь (для группировки).
    const conversationId = isAdmin ? (targetUserId || currentUser?.id) : currentUser?.id;
    const { messages, sendMessage, sendFile, markAsRead, setTypingStatus, loading, error, formatMessageDate } = useMessaging('support', conversationId, currentUser?.id);

    // [NEW] Typing Status Listener
    const { data: typingData } = useFirestoreCollection('typing', []);
    const otherMemberTyping = typingData?.find(t =>
        t.propertyId === 'support' &&
        t.userId !== currentUser?.id &&
        t.isTyping &&
        (new Date() - new Date(t.timestamp) < 5000)
    );

    // [NEW] Mark as read when active or new messages arrive
    useEffect(() => {
        const hasUnread = messages.some(m => !m.read && m.userId !== currentUser?.id);
        if (hasUnread) {
            markAsRead();
        }
    }, [messages, currentUser?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const textToSend = messageText.trim();
        if (!textToSend) return;

        setMessageText(''); // [OPTIMISTIC] Clear immediately
        setTypingStatus(false);

        const role = isAdmin ? 'manager' : 'tenant';
        const res = await sendMessage(textToSend, role);
        if (!res.success) {
            setMessageText(textToSend); // Restore on failure
            alert('Failed to send: ' + res.error);
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

    return (
        <div style={isInline ? {
            width: '100%',
            height: '100%',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-main)',
            borderRadius: '12px',
            overflow: 'hidden',
        } : {
            position: 'fixed',
            bottom: '80px',
            right: '25px',
            width: '320px',
            height: '450px',
            background: 'var(--bg-main)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            zIndex: 3000,
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                padding: '16px',
                background: 'var(--gradient-primary)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Support Center</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                            {isAdmin ? `Chat with ${targetUserId?.substring(0, 8) || 'User'}` : 'We usually reply instantly'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <CloseIcon size={20} />
                </button>
            </header>

            {/* Warning for admins */}
            {isAdmin && (
                <div style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    🛠️ ADMIN VIEW: General Support Channel
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}
            >
                {error ? (
                    <div style={{ textAlign: 'center', color: '#EF4444', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', margin: '16px', fontSize: '0.8rem' }}>
                        <div>⚠️ {error}</div>
                        <div style={{ marginTop: '8px', opacity: 0.8 }}>This might be due to missing database indexes or connection issues.</div>
                    </div>
                ) : loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '20px' }}>Connecting...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✉️</div>
                        <div style={{ fontSize: '0.8rem' }}>Have a problem or a feature request? Drop us a line!</div>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.userId === currentUser?.id;
                        return (
                            <div
                                key={msg.id || i}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}
                            >
                                {!isMe && isAdmin && (
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                        User: {msg.userId?.substring(0, 6)}
                                    </div>
                                )}
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
                                    {/* Handle legacy imageUrl or new fileUrl */}
                                    {(msg.fileUrl || msg.imageUrl) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(msg.fileType?.startsWith('image/') || (!msg.fileType && (msg.imageUrl || msg.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i)))) ? (
                                                <img src={msg.fileUrl || msg.imageUrl} alt="chat attachment" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(msg.fileUrl || msg.imageUrl, '_blank')} />
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
                                    ) : msg.text}
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
                {otherMemberTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                        typing...
                    </div>
                )}
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const res = await sendFile(e.target.files[0], isAdmin ? 'manager' : 'tenant');
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
                    placeholder="Describe your issue..."
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--gradient-primary)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <SendIcon size={18} color="white" />
                </button>
            </form>
        </div>
    );
};

export default SupportChat;
