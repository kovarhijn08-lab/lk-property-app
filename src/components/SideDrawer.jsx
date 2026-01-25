import React, { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

const SideDrawer = ({ isOpen, onClose, title, subtitle, children, width = '500px' }) => {
    const [render, setRender] = useState(isOpen);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance in pixels
    const minSwipeDistance = 100;

    useEffect(() => {
        if (isOpen) setRender(true);
    }, [isOpen]);

    const handleTransitionEnd = () => {
        if (!isOpen) setRender(false);
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchEnd - touchStart;
        const isRightSwipe = distance > minSwipeDistance;
        if (isRightSwipe) {
            onClose();
        }
    };

    if (!render) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'visibility 0.4s'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                }}
            />

            {/* Panel */}
            <div
                onTransitionEnd={handleTransitionEnd}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: width,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderLeft: '1px solid var(--glass-border)',
                    boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    touchAction: 'pan-y' // Allow vertical scrolling, but catch horizontal swipes
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '32px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.5px'
                        }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginTop: '4px',
                                letterSpacing: '1px'
                            }}>
                                {subtitle}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <CloseIcon size={18} strokeWidth={2} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '32px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;
