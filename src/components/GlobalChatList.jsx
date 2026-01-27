import React, { useState, useMemo, useEffect } from 'react';
import { useAllChats } from '../hooks/useAllChats';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../utils/NotificationManager';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { where } from 'firebase/firestore';


const GlobalChatList = ({ properties, onNavigateToChat }) => {
    const { chats, loading, error } = useAllChats();
    const { isAdmin, currentUser } = useAuth();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    // [NEW] Notification permission request
    useEffect(() => {
        notifications.requestPermission();
    }, []);

    // [NEW] Typing indicators listener (for all active properties)
    const { data: typingUsers } = useFirestoreCollection('typing', []);

    // Determine mode based on property count
    const isMultiPropertyMode = properties.length >= 5;

    // Filter chats if a property is selected in multi-mode, or show all in simple mode
    const filteredChats = useMemo(() => {
        if (isMultiPropertyMode && selectedPropertyId) {
            return chats.filter(c => c.propertyId === selectedPropertyId);
        }
        return chats;
    }, [chats, isMultiPropertyMode, selectedPropertyId]);

    const handleChatClick = (chat) => {
        onNavigateToChat(chat.propertyId, chat.unitId, chat.userId);
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                Loading conversations...
            </div>
        );
    }

    // MODE 1: Property Selection (if >= 5 properties and none selected)
    if (isMultiPropertyMode && !selectedPropertyId) {
        return (
            <div style={{ padding: '16px', paddingBottom: '100px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', padding: '0 4px' }}>Select Property</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {properties.map(prop => (
                        <div
                            key={prop.id}
                            onClick={() => setSelectedPropertyId(prop.id)}
                            className="glass-panel"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{prop.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prop.address}</div>
                            </div>
                            <div style={{ fontSize: '1.2rem' }}>❯</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // MODE 2: Chat List (Inbox)
    return (
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                {isMultiPropertyMode && selectedPropertyId && (
                    <button
                        onClick={() => setSelectedPropertyId(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        ❮
                    </button>
                )}
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
                    {selectedPropertyId
                        ? properties.find(p => p.id === selectedPropertyId)?.name
                        : 'All Messages'}
                </h2>
            </div>

            {filteredChats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
                    <div>No active conversations found.</div>
                    {selectedPropertyId && <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>Start a chat from the Tenant Portal.</div>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredChats.map(chat => {
                        let title;
                        let icon = '💬';
                        let isSupport = chat.propertyId === 'support';

                        if (isSupport) {
                            icon = '🛠️';
                            title = isAdmin ? `Support: User ${chat.userId?.substring(0, 6)}` : 'Technical Support';
                        } else {
                            const property = properties.find(p => p.id === chat.propertyId);
                            const unit = property?.units?.find(u => u.id === chat.unitId);
                            title = unit ? `${property?.name} - ${unit.name}` : property?.name;
                        }

                        return (
                            <div
                                key={chat.id}
                                onClick={() => handleChatClick(chat)}
                                className="glass-panel"
                                style={{
                                    padding: '16px',
                                    cursor: 'pointer',
                                    borderLeft: isSupport ? '4px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSupport ? 'var(--accent-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>{icon}</span> {title || 'Unknown Property'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {chat.unreadCount > 0 && (
                                            <span style={{
                                                background: '#EF4444',
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontWeight: 800,
                                                minWidth: '18px',
                                                textAlign: 'center'
                                            }}>
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                        {(() => {
                                            const ts = chat.lastMessage.timestamp;
                                            if (!ts) return '';
                                            const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
                                            if (isNaN(date.getTime())) return '';
                                            const now = new Date();
                                            if (date.toDateString() === now.toDateString()) {
                                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            }
                                            return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                                        })()}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {chat.lastMessage.sender === 'manager' && 'You: '}
                                        {chat.lastMessage.text}
                                    </div>

                                    {/* Typing indicator check */}
                                    {typingUsers?.some(t =>
                                        t.propertyId === chat.propertyId &&
                                        t.userId !== currentUser.id &&
                                        t.isTyping &&
                                        (new Date() - new Date(t.timestamp) < 10000) // valid for 10s
                                    ) && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontStyle: 'italic', marginLeft: '8px', flexShrink: 0 }}>
                                                typing...
                                            </div>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GlobalChatList;
