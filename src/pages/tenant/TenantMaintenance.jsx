import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMaintenance } from '../../hooks/useMaintenance';
import StatusTimeline from '../../components/ui/StatusTimeline';

const TenantMaintenance = ({ property }) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { requests, createRequest, loading } = useMaintenance(property.id, currentUser?.id);

    const [showForm, setShowForm] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'Medium' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createRequest({
                ...newRequest,
                unitId: property.units?.[0]?.id || 'main'
            });
            if (res.success) {
                setShowForm(false);
                setNewRequest({ title: '', description: '', priority: 'Medium' });
            } else {
                alert(res.error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const stages = ['New', 'Assigned', 'In Progress', 'Resolved'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Maintenance</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: showForm ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                    }}
                >
                    {showForm ? 'Cancel' : '+ New Request'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel" style={{ padding: '24px', animation: 'fadeIn 0.3s' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Issue Title</label>
                            <input
                                type="text"
                                value={newRequest.title}
                                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                required
                                placeholder="e.g. Leaking faucet"
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Description</label>
                            <textarea
                                value={newRequest.description}
                                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                required
                                placeholder="Describe the problem in detail..."
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '100px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '14px', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', mt: '8px' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛠️</div>
                        <div>No active requests</div>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="glass-panel" style={{ padding: '20px', borderLeft: req.priority === 'High' ? '4px solid #F43F5E' : '4px solid var(--accent-warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{req.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(req.createdAt).toLocaleDateString()} • {req.priority} Priority
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: '#F59E0B',
                                    fontWeight: 800,
                                    height: 'fit-content'
                                }}>
                                    {req.status?.toUpperCase()}
                                </span>
                            </div>

                            <StatusTimeline
                                stages={stages}
                                currentStatus={req.status}
                                color={req.status === 'Resolved' ? 'var(--accent-success)' : 'var(--accent-warning)'}
                            />

                            <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                {req.description}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TenantMaintenance;
