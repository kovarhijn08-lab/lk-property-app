import React, { useState } from 'react';
import { firestoreOperations } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';
import { skynet } from '../utils/SkynetLogger';
import { hashToken } from '../utils/crypto';

const InviteManager = ({ propertyId, unitId, onInviteSent, inviteRole = 'tenant' }) => {
    const { currentUser, isPMC, isOwner, isGhostMode } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const isAdminRole = currentUser?.role === 'admin';
    const canInvite = inviteRole === 'pmc'
        ? !!(isOwner || isAdminRole) && !isGhostMode
        : !!(isPMC || isOwner) && !isGhostMode;

    const generateInvite = async () => {
        if (loading) return;
        setErrorMsg('');
        if (!canInvite) {
            const reason = isGhostMode
                ? 'Нельзя создавать инвайт в Ghost Mode.'
                : (inviteRole === 'pmc'
                    ? 'Недостаточно прав для создания инвайта. Нужна роль Owner/Admin.'
                    : 'Недостаточно прав для создания инвайта. Нужна роль Owner/PMC/Admin.');
            skynet.warn('Invite creation blocked', {
                action: 'invite.create.blocked',
                entityType: 'invitation',
                metadata: { role: inviteRole, reason, ghostMode: isGhostMode }
            });
            setErrorMsg(reason);
            return;
        }
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
                role: inviteRole,
                propertyId: propertyId,
                unitId: unitId || null,
                targetEmail: email.toLowerCase() || null,
                status: 'active',
                expiresAt: expiresAt.toISOString(),
                createdBy: currentUser?.id || 'unknown',
                createdAt: new Date().toISOString()
            };

            let timeoutId;
            const inviteResultPromise = firestoreOperations.setDocument('invitations', inviteId, inviteData);
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error('Invite creation timed out. Check Firestore connectivity and rules.'));
                }, 8000);
            });
            const result = await Promise.race([inviteResultPromise, timeoutPromise]).finally(() => {
                clearTimeout(timeoutId);
            });

            if (result.success) {
                const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
                const link = inviteRole === 'pmc'
                    ? `${baseUrl}/app/signup?invite=${rawToken}&role=pmc`
                    : `${baseUrl}/tenant/signup?invite=${rawToken}`;
                setInviteLink(link);

                skynet.log(`Invite generated for ${email || `anonymous ${inviteRole}`}`, 'info', {
                    actorId: currentUser?.id || 'unknown',
                    action: 'invite.create',
                    entityType: 'invitation',
                    entityId: inviteId,
                    metadata: { propertyId, unitId, role: inviteRole }
                });

                if (onInviteSent) onInviteSent(inviteData);
            } else {
                const permissionHint = result.error?.toLowerCase().includes('permission')
                    ? 'Проверьте, что ваш пользователь имеет роль Owner/PMC/Admin и существует в коллекции users.'
                    : '';
                skynet.error('Invite creation failed', {
                    action: 'invite.create.fail',
                    actorId: currentUser?.id,
                    entityType: 'invitation',
                    entityId: inviteId,
                    metadata: { propertyId, unitId, role: inviteRole, error: result.error }
                });
                setErrorMsg(`Ошибка сохранения инвайта: ${result.error || 'unknown'}. ${permissionHint}`.trim());
            }
        } catch (error) {
            console.error('Failed to generate invite:', error);
            skynet.error('Invite generation crashed', {
                action: 'invite.create.crash',
                actorId: currentUser?.id,
                metadata: { propertyId, unitId, role: inviteRole, error: error.message }
            });
            setErrorMsg(`Ошибка генерации инвайта: ${error.message}`);
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
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                {inviteRole === 'pmc' ? 'Invite PMC' : 'Invite Tenant'}
            </h4>

            {!inviteLink ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {inviteRole === 'pmc'
                            ? 'Create a one-time registration link for a Property Manager (PMC).'
                            : `Create a one-time registration link for this ${unitId ? 'unit' : 'property'}.`}
                    </p>
                    {!canInvite && !errorMsg && (
                        <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#F59E0B', fontSize: '0.8rem' }}>
                            {isGhostMode
                                ? 'Ghost Mode активен. Выйдите из режима, чтобы создавать инвайты.'
                                : (inviteRole === 'pmc'
                                    ? 'Нет прав на создание инвайта PMC. Нужна роль Owner/Admin.'
                                    : 'Нет прав на создание инвайтов. Нужна роль Owner/PMC/Admin.')}
                        </div>
                    )}
                    {errorMsg && (
                        <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.8rem' }}>
                            {errorMsg}
                        </div>
                    )}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={inviteRole === 'pmc' ? 'PMC Email (Optional)' : 'Tenant Email (Optional)'}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <button
                        onClick={generateInvite}
                        disabled={loading || !canInvite}
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
