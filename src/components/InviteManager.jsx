import React, { useState } from 'react';
import { firestoreOperations } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import { skynet } from '../utils/SkynetLogger';
import { hashToken } from '../utils/crypto';

const InviteManager = ({ propertyId, unitId, onInviteSent }) => {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    const generateInvite = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const rawToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const hashedToken = await hashToken(rawToken);
            const inviteId = hashedToken; // Use the HASH as the document ID
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

            const inviteData = {
                id: inviteId,
                token: hashedToken, // Save the HASH, not the raw token
                propertyId: propertyId,
                unitId: unitId || null,
                targetEmail: email.toLowerCase() || null,
                status: 'active',
                expiresAt: expiresAt.toISOString(),
                createdBy: currentUser?.id || 'unknown',
                createdAt: new Date().toISOString()
            };

            const result = await firestoreOperations.setDocument('invitations', inviteId, inviteData);

            if (result.success) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/signup?invite=${rawToken}`;
                setInviteLink(link);

                skynet.log(`Invite generated for ${email || 'anonymous tenant'}`, 'info', {
                    actorId: currentUser?.id || 'unknown',
                    action: 'invite.create',
                    entityType: 'invitation',
                    entityId: inviteId,
                    metadata: { propertyId, unitId }
                });

                if (onInviteSent) onInviteSent(inviteData);
            } else {
                alert('Error saving invite to database');
            }
        } catch (error) {
            console.error('Failed to generate invite:', error);
            alert('Error generating invite');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Invite Tenant</h4>

            {!inviteLink ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Create a one-time registration link for this {unitId ? 'unit' : 'property'}.
                    </p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Tenant Email (Optional)"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <button
                        onClick={generateInvite}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    >
                        {loading ? 'Generating...' : 'Generate Invite Link'}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.85rem' }}>
                        ✅ Invite generated! Link expires in 7 days.
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input
                            readOnly
                            value={inviteLink}
                            style={{ width: '100%', padding: '12px', paddingRight: '80px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.8rem' }}
                        />
                        <button
                            onClick={copyToClipboard}
                            style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 12px', borderRadius: '6px', border: 'none', background: copied ? 'var(--accent-success)' : 'var(--accent-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <button
                        onClick={() => { setInviteLink(''); setEmail(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Create another invite
                    </button>
                </div>
            )}
        </div>
    );
};

export default InviteManager;
