import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExportIcon, FileTextIcon, InfoIcon } from './Icons';

const ReceiptScanner = ({ onScanComplete }) => {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (file) => {
        setIsScanning(true);
        setScannedData(null);

        // Simulate AI Processing Delay
        setTimeout(() => {
            // Mock Intelligence Logic based on filename
            const filename = file.name.toLowerCase();
            let category = 'Expense';
            let amount = (Math.random() * 100).toFixed(2);
            let date = new Date().toISOString().split('T')[0];
            let merchant = 'Unknown Merchant';

            if (filename.includes('homedepot') || filename.includes('hardware')) {
                category = 'Repair';
                merchant = 'Home Depot';
                amount = '45.67';
            } else if (filename.includes('starbucks') || filename.includes('coffee')) {
                category = 'Expense';
                merchant = 'Starbucks';
                amount = '8.50';
            } else if (filename.includes('rent')) {
                category = 'Rent';
                amount = '1500.00';
            }

            const result = {
                amount,
                category,
                date,
                description: `Receipt from ${merchant}`
            };

            setScannedData(result);
            setIsScanning(false);
        }, 2000);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <FileTextIcon size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>
                    {t('finance.receiptScanner') || 'AI Receipt Scanner'}
                </h3>
            </div>

            {!scannedData && !isScanning && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        padding: '40px 20px',
                        background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ marginBottom: '16px', color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        <ExportIcon size={40} strokeWidth={1.5} style={{ transform: 'rotate(180deg)' }} />
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                        {t('finance.dragReceipt') || 'Drag receipt here or'} <br />
                        <label style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 800 }}>
                            {t('common.browse') || 'browse files'}
                            <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                        </label>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                        <InfoIcon size={12} />
                        <span>PNG, JPG or PDF up to 10MB</span>
                    </div>
                </div>
            )}

            {isScanning && (
                <div style={{ padding: '40px 20px' }}>
                    <div className="scanner-line"></div>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 20px',
                        border: '3px solid rgba(99, 102, 241, 0.1)',
                        borderTopColor: 'var(--accent-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{t('finance.analyzing') || 'Analyzing receipt...'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>AI Neural Network decoding data</p>
                </div>
            )}

            {scannedData && (
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        {t('finance.extractedData') || 'Extracted Successfully'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Merchant</span>
                            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 800 }}>{scannedData.description.replace('Receipt from ', '')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</span>
                            <span style={{ fontSize: '1rem', color: 'var(--accent-success)', fontWeight: 900 }}>${scannedData.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</span>
                            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 800, textTransform: 'capitalize' }}>{scannedData.category}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            onClick={() => onScanComplete(scannedData)}
                            style={{
                                flex: 1.5,
                                padding: '14px',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {t('finance.confirmData') || 'Confirm'}
                        </button>
                        <button
                            onClick={() => setScannedData(null)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-secondary)',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            {t('common.retry') || 'Retry'}
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .scanner-line {
                    position: absolute;
                    left: 24px;
                    right: 24px;
                    height: 2px;
                    background: var(--accent-primary);
                    box-shadow: 0 0 15px var(--accent-primary);
                    opacity: 0.5;
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ReceiptScanner;
