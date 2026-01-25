import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, BellIcon, PlusIcon, FolderIcon, CalendarIcon } from './Icons';

const MobileNav = ({ activeView, onViewChange, onActionClick, onOpenNotifications, notificationCount = 0 }) => {
    const { t } = useLanguage();

    const navItems = [
        { id: 'dashboard', label: 'ОБЩИЙ', icon: (color) => <HomeIcon size={20} color={color} /> },
        { id: 'agenda', label: 'ГРАФИК', icon: (color) => <CalendarIcon size={20} color={color} /> },
        { id: 'action', isAction: true },
        { id: 'chats', label: 'ЧАТЫ', icon: (color) => <FolderIcon size={20} color={color} /> }, // Using Folder for Portfolio/Files for now
        { id: 'notifications', label: 'АЛЕРТЫ', icon: (color) => <BellIcon size={20} color={color} />, hasNotifications: true },
    ];

    return (
        <nav className="bottom-nav" style={{
            height: '80px',
            padding: '0 12px 14px',
            background: 'rgba(2, 6, 23, 0.9)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            {navItems.map(item => {
                if (item.isAction) {
                    return (
                        <div key="plus-container" style={{ position: 'relative', width: '60px', height: '100%' }}>
                            <button
                                onClick={onActionClick}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '24px',
                                    background: 'var(--gradient-primary)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
                                    position: 'absolute',
                                    top: '-36px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 10
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(-50%) scale(1.1) translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(99, 102, 241, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(-50%) scale(1) translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.4)';
                                }}
                            >
                                <PlusIcon size={36} strokeWidth={3} />
                            </button>
                        </div>
                    );
                }

                const isActive = activeView === item.id;
                const iconColor = isActive ? 'var(--accent-success)' : 'var(--text-secondary)';

                return (
                    <button
                        key={item.id}
                        onClick={() => item.hasNotifications ? onOpenNotifications() : onViewChange(item.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            color: iconColor,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            padding: '12px 4px',
                            flex: 1,
                            cursor: 'pointer',
                            opacity: isActive ? 1 : 0.6,
                            position: 'relative'
                        }}
                    >
                        <span style={{
                            display: 'flex',
                            transform: isActive ? 'translateY(-2px)' : 'none',
                            transition: 'transform 0.3s ease',
                            filter: isActive ? 'drop-shadow(0 0 10px var(--accent-success)40)' : 'none'
                        }}>
                            {item.icon(iconColor)}
                            {item.hasNotifications && notificationCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-8px',
                                    background: 'var(--accent-danger)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    padding: '1px 5px',
                                    fontSize: '0.55rem',
                                    fontWeight: 900,
                                    minWidth: '14px',
                                    textAlign: 'center',
                                    boxShadow: '0 0 10px var(--accent-danger)'
                                }}>
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </span>
                        <span style={{
                            fontSize: '0.55rem',
                            fontWeight: 900,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginTop: '2px'
                        }}>
                            {item.label}
                        </span>
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                bottom: '6px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: 'var(--accent-success)',
                                boxShadow: '0 0 8px var(--accent-success)'
                            }}></div>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileNav;
