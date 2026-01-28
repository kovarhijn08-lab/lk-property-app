import React from 'react';

const StatusTimeline = ({ stages, currentStatus, color = 'var(--accent-warning)' }) => {
    const currentStageIdx = stages.indexOf(currentStatus) !== -1 ? stages.indexOf(currentStatus) : 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '12px 0' }}>
            {stages.map((stage, idx) => (
                <React.Fragment key={stage}>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        background: idx <= currentStageIdx ? color : 'rgba(255,255,255,0.05)',
                        borderRadius: '2px',
                        transition: 'background 0.3s ease'
                    }} />
                    {idx < stages.length - 1 && (
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: idx < currentStageIdx ? color : 'rgba(255,255,255,0.1)'
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StatusTimeline;
