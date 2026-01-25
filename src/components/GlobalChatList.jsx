import React, { useState, useMemo } from 'react';
import { useAllChats } from '../hooks/useAllChats';
import { getPropertyMetrics } from '../utils/metrics'; // Assuming we might need this or just use prop data

const GlobalChatList = ({ properties, onNavigateToChat }) => {
    const { chats, loading, error } = useAllChats();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

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
        onNavigateToChat(chat.propertyId, chat.unitId);
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
                        const property = properties.find(p => p.id === chat.propertyId);
                        const unit = property?.units?.find(u => u.id === chat.unitId);
                        const title = unit ? `${property?.name} - ${unit.name}` : property?.name;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => handleChatClick(chat)}
                                className="glass-panel"
                                style={{ padding: '16px', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                                        {title || 'Unknown Property'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                        {new Date(chat.lastMessage.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {chat.lastMessage.sender === 'manager' && 'You: '}
                                    {chat.lastMessage.text}
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
