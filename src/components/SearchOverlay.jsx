import React, { useState, useEffect, useRef } from 'react';

/**
 * SearchOverlay Component (P3.2)
 * A Vercel-style command palette for global search.
 */
export const SearchOverlay = ({ isOpen, onClose, results, onQueryChange, onSelect }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (results.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            onSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh'
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWeight: '600px',
                maxWidth: '600px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '1.2rem', color: '#666' }}>🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search properties, tenants, contracts..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            onQueryChange(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.1rem',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div style={{
                        fontSize: '0.7rem',
                        background: '#222',
                        color: '#888',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #333'
                    }}>
                        ESC
                    </div>
                </div>

                {/* Results List */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                    {results.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#555' }}>
                            {query.length < 2 ? 'Type at least 2 characters...' : 'No results found.'}
                        </div>
                    ) : (
                        results.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => onSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedIndex === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'background 0.1s'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    background: item.type === 'property' ? 'rgba(59, 130, 246, 0.2)' :
                                        item.type === 'user' ? 'rgba(16, 185, 129, 0.2)' :
                                            item.type === 'contract' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem'
                                }}>
                                    {item.type === 'property' ? '🏠' :
                                        item.type === 'user' ? '👤' :
                                            item.type === 'contract' ? '📜' : '💸'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: selectedIndex === index ? 'white' : '#ccc'
                                    }}>{item.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{item.secondary}</div>
                                </div>
                                {selectedIndex === index && (
                                    <div style={{ fontSize: '0.8rem', color: '#555' }}>⏎</div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '8px 16px',
                    background: '#0a0a0a',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    gap: '16px',
                    fontSize: '0.7rem',
                    color: '#555'
                }}>
                    <span><b style={{ color: '#888' }}>↑↓</b> Navigate</span>
                    <span><b style={{ color: '#888' }}>Enter</b> Select</span>
                    <span><b style={{ color: '#888' }}>Esc</b> Close</span>
                </div>
            </div>
        </div>
    );
};
