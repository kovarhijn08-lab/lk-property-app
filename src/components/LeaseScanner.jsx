import React, { useState } from 'react';

const LeaseScanner = ({ onScanComplete, onClose }) => {
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
            const filename = file.name.toLowerCase();
            let tenantName = 'John Doe';
            let monthlyRent = 2500;
            let deposit = 2500;
            let startDate = '2025-01-01';
            let endDate = '2026-01-01';

            // Mock Intelligence based on keywords
            if (filename.includes('jane') || filename.includes('smith')) {
                tenantName = 'Jane Smith';
                monthlyRent = 1800;
                deposit = 1800;
            } else if (filename.includes('commercial') || filename.includes('office')) {
                tenantName = 'Global Tech Corp';
                monthlyRent = 12000;
                deposit = 24000;
            }

            const result = {
                tenantName,
                monthlyRent,
                deposit,
                startDate,
                endDate,
                status: 'active'
            };

            setScannedData(result);
            setIsScanning(false);
        }, 2500);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) processFile(files[0]);
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) processFile(e.target.files[0]);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>📄 AI Lease Scanner</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
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
                            textAlign: 'center',
                            background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('lease-upload').click()}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 500 }}>Drop your Lease PDF here</p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>or click to browse</p>
                        <input id="lease-upload" type="file" hidden onChange={handleFileSelect} accept=".pdf,.doc,.docx" />
                    </div>
                )}

                {isScanning && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="scanning-animation" style={{
                            width: '60px',
                            height: '60px',
                            border: '3px solid var(--accent-primary)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Analyzing Lease Agreement...</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Extracting tenant and payment terms...</p>
                    </div>
                )}

                {scannedData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Extracted Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tenant</div>
                                    <div style={{ fontWeight: 600 }}>{scannedData.tenantName}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rent</div>
                                    <div style={{ fontWeight: 600, color: '#10B981' }}>${scannedData.monthlyRent}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Deposit</div>
                                    <div style={{ fontWeight: 600 }}>${scannedData.deposit}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expiry</div>
                                    <div style={{ fontWeight: 600 }}>{scannedData.endDate}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button onClick={() => setScannedData(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Rescan</button>
                            <button onClick={() => onScanComplete(scannedData)} style={{ flex: 1.5, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--glass-shadow)' }}>Add to Legal Hub</button>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

export default LeaseScanner;
