import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BellIcon, InfoIcon } from './Icons';
import { useMobile } from '../hooks/useMobile';

const Layout = ({ children, onOpenSettings, user, onLogout, onOpenDrawer, onOpenNotifications, onOpenSearch, notificationCount = 0 }) => {
  const { t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const isMobile = useMobile();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="layout-root" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Sidebar Placeholder for Desktop (NavigationDrawer will occupy a fixed slot if needed) */}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0, // Prevent flex item overflow
        position: 'relative'
      }}>
        <header style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t('common.manage')}
              >
                ☰
              </button>
            )}
            <h1 style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Pocket Ledger
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search Button */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                title="Search (Cmd+K)"
              >
                🔍
                {!isMobile && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>⌘K</span>}
              </button>
            )}

            {/* Notification Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                title="Важные напоминания"
              >
                <BellIcon size={18} strokeWidth={2.5} />
                {notificationCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--accent-danger)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    minWidth: '18px',
                    textAlign: 'center',
                    boxShadow: '0 0 12px var(--accent-danger)'
                  }}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        <main style={{
          flex: 1,
          padding: isMobile ? '16px 16px var(--bottom-nav-height)' : '20px 24px',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {children}
        </main>

        <footer style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '40px 0',
          opacity: 0.5
        }}>
          &copy; 2026 Obsidian Ledger • {t('common.ready')}
        </footer>
      </div>
    </div>
  );
};

export default Layout;
