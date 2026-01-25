import React from 'react';

const InstallmentTracker = ({ installments }) => {
    // Calculate totals
    const totalAmount = installments.reduce((acc, i) => acc + i.amount, 0);
    const paidAmount = installments
        .filter(i => i.status === 'paid')
        .reduce((acc, i) => acc + i.amount, 0);

    const progressPercent = Math.round((paidAmount / totalAmount) * 100);

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Payment Schedule</h2>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {progressPercent}% Paid of ${totalAmount.toLocaleString()}
                    </span>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                }}>
                    Off-Plan
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                marginBottom: '24px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'var(--accent-primary)',
                    transition: 'width 0.5s ease'
                }} />
            </div>

            {/* Timeline Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {installments.map((inst, index) => {
                    const isLast = index === installments.length - 1;
                    const isPaid = inst.status === 'paid';
                    const isDue = inst.status === 'due';

                    let statusColor = 'var(--text-secondary)';
                    if (isPaid) statusColor = 'var(--accent-success)';
                    if (isDue) statusColor = 'var(--accent-warning)';

                    return (
                        <div key={index} style={{ display: 'flex', minHeight: '60px' }}>
                            {/* Timeline Line */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px' }}>
                                <div style={{
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    background: isPaid ? 'var(--accent-success)' : (isDue ? 'var(--accent-warning)' : 'var(--bg-secondary)'),
                                    border: isDue ? '2px solid var(--accent-warning)' : (isPaid ? 'none' : '2px solid var(--text-secondary)'),
                                    zIndex: 2
                                }} />
                                {!isLast && <div style={{
                                    width: '2px', flex: 1,
                                    background: isPaid ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
                                    margin: '-2px 0'
                                }} />}
                            </div>

                            {/* Content */}
                            <div style={{ paddingBottom: '24px', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, color: isPaid ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {inst.stage}
                                    </span>
                                    <span style={{ fontWeight: 700 }}>${inst.amount.toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: statusColor }}>
                                    {isPaid ? 'Paid on ' : 'Due '} {inst.date}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InstallmentTracker;
