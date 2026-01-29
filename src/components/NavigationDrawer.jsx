import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, BuildingIcon, OfficeIcon, HotelIcon, CalendarIcon, TrendUpIcon, MapIcon, InfoIcon, EditIcon } from './Icons';

const NavigationDrawer = ({
    isOpen,
    onClose,
    properties,
    selectedPropertyId,
    onSelectProperty,
    onOpenSettings,
    onAddProperty,
    onOpenCalendar,
    onOpenChats,
    user,
    onLogout
}) => {
    const { t } = useLanguage();
    const [propertiesExpanded, setPropertiesExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeProperties = filteredProperties.filter(p => p.status !== 'sold');
    const soldProperties = filteredProperties.filter(p => p.status === 'sold');

    const getTypeIcon = (type) => {
        switch (type) {
            case 'rental': return <HomeIcon size={18} />;
            case 'construction': return <BuildingIcon size={18} />;
            case 'commercial': return <OfficeIcon size={18} />;
            case 'str': return <HotelIcon size={18} />;
            default: return <MapIcon size={18} />;
        }
    };

    const isTenant = user?.role === 'tenant';
    const isOwner = user?.role === 'owner';
    const isPMC = user?.role === 'pmc' || user?.role === 'admin' || user?.email === 'admin@example.com';

    const menuItems = [
        {
            id: 'all',
            icon: <TrendUpIcon size={20} />,
            label: isTenant ? 'Dashboard' : (isOwner ? 'Portfolio' : t('common.allProperties')),
            action: () => onSelectProperty('all')
        },
        // Only show calendar to PMC/Owners
        ...(!isTenant ? [{ id: 'calendar', icon: <CalendarIcon size={20} />, label: t('common.calendar'), action: () => onOpenCalendar() }] : []),
        ...(!isTenant ? [{ id: 'chats', icon: <InfoIcon size={20} />, label: t('common.chats') || 'Chats', action: () => onOpenChats && onOpenChats() }] : []),
    ];

    // Swipe to close handler
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchCurrentX.current;
        if (diff > 50) { // Swipe left threshold
            onClose();
        }
    };

    return (
        <div className="navigation-container">
            <style>
                {`
                    @media (min-width: 1024px) {
                        .drawer-overlay { display: none !important; }
                        .navigation-drawer { 
                            position: sticky !important; 
                            transform: none !important; 
                            width: 280px !important; 
                            box-shadow: none !important;
                            border-right: 1px solid rgba(255,255,255,0.05) !important;
                        }
                    }
                `}
            </style>

            {/* Overlay (Mobile Only) */}
            {isOpen && (
                <div
                    className="drawer-overlay"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1999,
                        backdropFilter: 'blur(4px)',
                        transition: 'opacity 0.3s'
                    }}
                />
            )}

            {/* Drawer / Sidebar */}
            <aside
                className="navigation-drawer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 'min(300px, 85vw)',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 2000,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none',
                    overflow: 'hidden'
                }}>

                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--gradient-primary)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 12px rgba(99, 102, 241, 0.2)'
                        }}>
                            <BuildingIcon size={20} color="white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'white', fontFamily: 'var(--font-display)' }}>OBSIDIAN</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 700, letterSpacing: '2px' }}>LEDGER</div>
                        </div>
                    </div>

                    {/* User Profile */}
                    {user && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                fontWeight: 900,
                                color: 'white'
                            }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {user.name || 'Пользователь'}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Scroll Area */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

                    {/* Search */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 40px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}><MapIcon size={16} /></span>
                        </div>
                    </div>

                    {/* Main Menu */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { item.action(); onClose(); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    background: selectedPropertyId === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: selectedPropertyId === item.id ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.95rem',
                                    fontWeight: selectedPropertyId === item.id ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', opacity: selectedPropertyId === item.id ? 1 : 0.7 }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Properties Section */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 16px 12px',
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase'
                        }}>
                            <span>{t('dashboard.activeProperties')}</span>
                            <span>{activeProperties.length}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {activeProperties.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { onSelectProperty(p.id); onClose(); }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: selectedPropertyId === p.id ? 'rgba(217, 255, 0, 0.05)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: selectedPropertyId === p.id ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{getTypeIcon(p.type)}</span>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{t(`common.${p.type === 'construction' ? 'construction' : 'ready'}`)}</div>
                                    </div>
                                    {selectedPropertyId === p.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-success)' }}></div>}
                                </button>
                            ))}
                        </div>

                        {!isTenant && (
                            <button
                                onClick={() => { onAddProperty(); onClose(); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    marginTop: '16px',
                                    background: 'transparent',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'var(--accent-primary)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                <span style={{ display: 'flex' }}><EditIcon size={16} /></span>
                                {t('common.add')} {t('common.ready')}
                            </button>
                        )}
                    </div>
                </nav>

                {/* Footer Controls */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => { onOpenSettings(); onClose(); }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                        <InfoIcon size={18} />
                        {t('common.settings')}
                    </button>
                    {onLogout && (
                        <button
                            onClick={() => { onLogout(); onClose(); }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                color: 'var(--accent-danger)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontSize: '1.1rem' }}>🚪</span>
                            Выход
                        </button>
                    )}
                </div>
            </aside>
        </div>
    );
};
export default NavigationDrawer;
