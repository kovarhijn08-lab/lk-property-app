
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../hooks/useMessaging';
import { useLanguage } from '../context/LanguageContext';
import { SendIcon, CloseIcon, InfoIcon } from './Icons';

/**
 * Global Support Chat Component
 * Connects users directly to admins via a special 'support' propertyId
 */
const SupportChat = ({ onClose }) => {
    const { currentUser, isAdmin } = useAuth();
    const { t } = useLanguage();
    const [messageText, setMessageText] = useState('');
    const scrollRef = useRef(null);

    // Using 'support' as a special global propertyId
    // and userId as the unitId to separate different user chats in the eyes of admin
    const { messages, sendMessage, loading } = useMessaging('support', isAdmin ? null : currentUser?.id, currentUser?.id);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        const role = isAdmin ? 'manager' : 'tenant';
        const res = await sendMessage(messageText, role);
        if (res.success) {
            setMessageText('');
        } else {
            alert('Failed to send: ' + res.error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
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
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>We usually reply instantly</div>
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
                {loading ? (
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
                                    background: isMe ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    border: isMe ? 'none' : '1px solid var(--glass-border)',
                                    lineHeight: 1.4
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: isMe ? 'right' : 'left' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
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
