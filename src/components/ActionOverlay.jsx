import React, { useEffect } from 'react';
import { DollarIcon, HomeIcon, ReceiptIcon, FileIcon, BellIcon } from './Icons';

const ActionOverlay = ({ isOpen, onClose, onAddTransaction, onAddProperty, onUploadReceipt, onScanLease, onAction }) => {

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const actions = [
        { label: 'Добавить Транзакцию', icon: <DollarIcon size={20} />, handler: onAddTransaction, color: 'var(--accent-success)' },
        { label: 'Создать задачу', icon: <BellIcon size={20} />, handler: () => onAction('createTask'), color: 'var(--accent-warning)' },
        { label: 'Добавить Объект', icon: <HomeIcon size={20} />, handler: onAddProperty, color: 'var(--accent-primary)' },
        { label: 'Загрузить Чек', icon: <ReceiptIcon size={20} />, handler: onUploadReceipt, color: 'var(--accent-warning)' },
        { label: 'Перевыставить КУ', icon: <DollarIcon size={20} />, handler: () => onAction('utilityChargeback'), color: '#10B981' },
        { label: 'Сканировать Договор', icon: <FileIcon size={20} />, handler: onScanLease, color: '#F43F5E' }
    ];

    const handleActionClick = (handler) => {
        handler();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(2, 6, 23, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2500,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            {/* Action Menu */}
            <div style={{
                position: 'fixed',
                bottom: '100px', // Above bottom nav
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2600,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: 'calc(100% - 40px)',
                maxWidth: '360px'
            }}>
                {actions.map((action, index) => (
                    <div
                        key={index}
                        onClick={() => handleActionClick(action.handler)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px 24px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${action.color}40`,
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 8px 24px ${action.color}15`,
                            animation: `slideUpAction 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: `${action.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: action.color
                        }}>
                            {action.icon}
                        </div>
                        <span style={{ flex: 1 }}>{action.label}</span>
                    </div>
                ))}

                {/* Close Button Inside Overlay */}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        color: 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer'
                    }}
                >
                    Закрыть
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpAction {
                    from { 
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default ActionOverlay;
