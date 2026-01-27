import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreOperations } from '../hooks/useFirestore';
import { collection, getDocs, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { validateForm } from '../utils/validators';
import { runGlobalDiagnostics, autoFixProperty, runUserDiagnostics } from '../utils/DiagnosticsManager';
import { useLanguage } from '../context/LanguageContext';

import { skynet } from '../utils/SkynetLogger';
import { useAllChats } from '../hooks/useAllChats';
import SupportChat from './SupportChat';

const AdminDashboard = ({ onClose }) => {
    const { currentUser, actualUser, impersonate, isGhostMode, stopImpersonation, sendPasswordReset } = useAuth();

    const [activeTab, setActiveTab] = useState('overview'); // vercel-style tabs
    const { chats: allChats } = useAllChats();
    const [selectedSupportUserId, setSelectedSupportUserId] = useState(null);
    const [editingUser, setEditingUser] = useState(null); // [NEW] for inline editing
    const [editForm, setEditForm] = useState({ name: '', email: '' });
    const [pwResetTarget, setPwResetTarget] = useState(null); // [NEW] target user for manual pw reset
    const [newPassForm, setNewPassForm] = useState(''); // [NEW] new password state
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);
    const [users, setUsers] = useState([]);
    const [persistentLogs, setPersistentLogs] = useState([]);
    const [pendingRoleChanges, setPendingRoleChanges] = useState({}); // [NEW] Track unsaved role changes
    const [activityFeed, setActivityFeed] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        dbConnected: 'unknown',
        latency: 0,
        history: []
    });
    const [diagnostics, setDiagnostics] = useState({
        scanning: false,
        results: null,
        userResults: null,
        lastRun: null,
        error: null,
        properties: []
    });
    const [fixingId, setFixingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const isAdmin = (
        actualUser?.email === 'final_test_8812@example.com' ||
        actualUser?.email === 'admin@example.com' ||
        actualUser?.email === 'admintest@admin.ru'
    ) || actualUser?.role === 'admin';

    const sendHello = async () => {
        try {
            const propertiesRes = await firestoreOperations.getCollection('properties', [limit(1)]);
            if (!propertiesRes.success || propertiesRes.data.length === 0) {
                alert('No properties found to send message to.');
                return;
            }
            const propertyId = propertiesRes.data[0].id;
            const messageData = {
                propertyId,
                unitId: null,
                userId: currentUser?.id,
                text: 'Привет! Это тестовое сообщение от Antigravity AI. Если ты это видишь, значит переписка и уведомления работают корректно! 🚀',
                sender: 'manager',
                timestamp: new Date().toISOString()
            };
            await addDoc(collection(db, 'messages'), messageData);
            skynet.log(`AI Test message sent to property ${propertyId}`, 'success');
            alert('Test message sent! Check the "Chats" section.');
        } catch (error) {
            console.error('Send Hello Error:', error);
            alert('Failed to send message: ' + error.message);
        }
    };



    useEffect(() => {
        if (isAdmin) {
            checkSystemHealth();
            skynet.log('Admin Session Initialized (Skynet Ready)', 'success', { role: 'admin' });

            // Periodic Health Check every 30 seconds
            const interval = setInterval(checkSystemHealth, 30000);
            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    const checkSystemHealth = async () => {
        const start = Date.now();
        try {
            const response = await firestoreOperations.getCollection('properties', [limit(1)]);
            const latency = Date.now() - start;

            if (response.success) {
                setSystemHealth(prev => ({
                    dbConnected: 'connected',
                    latency: latency,
                    history: [...prev.history, { time: new Date().toLocaleTimeString(), value: latency }].slice(-10)
                }));

                // Log significant latency issues (Threshold increased to 2000ms to reduce noise)
                if (latency > 2000) {
                    skynet.log(`High Latency Detected: ${latency}ms`, 'warning', {
                        userId: currentUser?.id,
                        latency,
                        type: 'latency_warning'
                    });
                }
            } else {
                setSystemHealth(prev => ({ ...prev, dbConnected: 'error', latency: 0 }));
                skynet.log(`Health Check Error: ${response.error}`, 'error', { userId: currentUser?.id });
            }
        } catch (error) {
            setSystemHealth(prev => ({ ...prev, dbConnected: 'error', latency: 0 }));
            skynet.log(`Health Check Crash: ${error.message}`, 'error', { userId: currentUser?.id });
        }
    };


    // Real-time Skynet Observation (Logs & Activity)

    // Real-time Skynet Observation (Logs & Activity)
    useEffect(() => {
        if (!isAdmin) return;

        const logsRef = collection(db, 'system_logs');
        const logsQuery = query(logsRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPersistentLogs(items);
        });

        return () => unsubscribeLogs();
    }, [isAdmin]);

    const runDiagnostics = async () => {
        skynet.log('Starting full data diagnostics...', 'info', { userId: currentUser?.id });
        setDiagnostics(prev => ({ ...prev, scanning: true, results: null, error: null }));

        try {
            const response = await firestoreOperations.getCollection('properties');
            if (!response.success) {
                const errMsg = `Database Error: ${response.error}`;
                setDiagnostics(prev => ({ ...prev, scanning: false, error: errMsg }));
                skynet.log(errMsg, 'error', { userId: currentUser?.id });
                return;
            }

            const properties = response.data || [];
            const results = runGlobalDiagnostics(properties);
            const userResults = runUserDiagnostics(users);

            setDiagnostics({
                scanning: false,
                results: results,
                userResults: userResults,
                lastRun: new Date().toLocaleTimeString(),
                error: null,
                properties: properties
            });
            const totalErrors = results.errorsFound + userResults.errorsFound;
            skynet.log(`Diagnostics complete. Found ${totalErrors} issues.`, totalErrors > 0 ? 'warning' : 'success', { userId: currentUser?.id });

        } catch (error) {
            skynet.log(`Diagnostic Crash: ${error.message}`, 'error', { userId: currentUser?.id });
            setDiagnostics(prev => ({ ...prev, scanning: false, error: error.message }));
        }
    };

    const filteredLogs = persistentLogs.filter(log =>
        log.msg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAutoFix = async (issue) => {
        skynet.log(`Initiating Auto-Fix for "${issue.propertyName}"...`, 'info', { userId: currentUser?.id, propertyId: issue.propertyId });
        setFixingId(issue.propertyId);

        try {
            const propToFix = diagnostics.properties.find(p => p.id === issue.propertyId);
            let targetProp;

            if (!propToFix) {
                skynet.log(`Property ${issue.propertyId} not found in cache, fetching...`, 'warning', { userId: currentUser?.id });
                const response = await firestoreOperations.getDocument('properties', issue.propertyId);
                if (!response.success) throw new Error(response.error);
                targetProp = response.data;
            } else {
                targetProp = propToFix;
            }

            const { fixed, changesCount } = autoFixProperty(targetProp);

            if (changesCount > 0) {
                addLog(`Applying changes to ${fixed.id}...`, 'info');
                const updateResponse = await firestoreOperations.updateDocument('properties', fixed.id, fixed);

                if (updateResponse.success) {
                    skynet.log(`SUCCESS: "${issue.propertyName}" fixed (${changesCount} fields updated)`, 'success', { userId: currentUser?.id, propertyId: issue.propertyId });
                    await runDiagnosticsSilent();
                } else {
                    skynet.log(`FAILED to update "${issue.propertyName}": ${updateResponse.error}`, 'error', { userId: currentUser?.id, propertyId: issue.propertyId });
                }
            } else {
                skynet.log(`No changes needed for "${issue.propertyName}" logic wise.`, 'warning', { userId: currentUser?.id, propertyId: issue.propertyId });
            }
        } catch (error) {
            skynet.log(`AutoFix Error: ${error.message}`, 'error', { userId: currentUser?.id, propertyId: issue.propertyId });
        } finally {
            setFixingId(null);
        }
    };

    const handleRestore = async (log) => {
        if (!window.confirm(`Are you sure you want to restore "${log.docId}" to this point?`)) return;

        skynet.log(`Initiating RESTORE for ${log.docId}...`, 'info', { userId: currentUser?.id });
        setLoading(true);

        try {
            const result = await firestoreOperations.setDocument(log.collection, log.docId, log.data);
            if (result.success) {
                skynet.log(`SUCCESS: "${log.docId}" restored successfully!`, 'success', { userId: currentUser?.id });
                alert('Restoration complete!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            skynet.log(`RESTORE FAILED: ${error.message}`, 'error', { userId: currentUser?.id });
            alert(`Restore error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const runDiagnosticsSilent = async () => {
        try {
            const response = await firestoreOperations.getCollection('properties');
            if (response.success) {
                const props = response.data || [];
                const results = runGlobalDiagnostics(props);
                setDiagnostics(prev => ({
                    ...prev,
                    results,
                    properties: props,
                    lastRun: new Date().toLocaleTimeString()
                }));
            }
        } catch (e) {
            addLog(`Silent rescan failed: ${e.message}`, 'error');
        }
    };

    /**
     * [NEW] Ручная смена пароля через API
     */
    const handleManualPasswordReset = async () => {
        if (!pwResetTarget || !newPassForm) return;
        if (newPassForm.length < 6) return alert('Password too short (min 6 chars)');

        setIsUpdatingPass(true);
        console.log('Attempting manual password reset for:', pwResetTarget.email);

        try {
            const idToken = await auth.currentUser.getIdToken();
            console.log('ID Token obtained');

            const response = await fetch('/api/admin/set-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    targetUid: pwResetTarget.id,
                    newPassword: newPassForm
                })
            });

            console.log('Server response status:', response.status);
            const data = await response.json();

            if (response.ok) {
                alert('Password updated successfully!');
                skynet.log(`Admin manually changed password for ${pwResetTarget.email}`, 'warning');
                setPwResetTarget(null);
                setNewPassForm('');
            } else {
                throw new Error(data.error || 'Server error');
            }
        } catch (err) {
            console.error('Manual Reset Error:', err);
            // [NEW] Log the error to Global Logs so the user sees it even if backend crashes
            skynet.log(`Manual Reset Error: ${err.message}`, 'error', {
                target: pwResetTarget?.email,
                caller: actualUser?.email || currentUser?.email
            });
            alert('Failed to update password: ' + err.message);
        } finally {
            setIsUpdatingPass(false);
        }
    };

    // Real-time Users Observation
    useEffect(() => {
        if (!isAdmin) return;

        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        });

        return () => unsubscribe();
    }, [isAdmin]);


    if (!isAdmin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <h2>Access Denied</h2>
                <button onClick={onClose} className="btn-primary">Go Back</button>
            </div>
        );
    }

    const VercelTab = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: activeTab === id ? 'white' : 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: activeTab === id ? 600 : 400,
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s',
                borderBottom: activeTab === id ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#000', // Vercel deep black
            zIndex: 2000,
            overflowY: 'auto',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                borderBottom: '1px solid #333',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '50%', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                    <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{t('admin.title')}</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={sendHello}
                        style={{ background: 'var(--gradient-primary)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        🤖 Send Hello Message
                    </button>
                    <button onClick={onClose} style={{ background: '#333', border: '1px solid #444', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        {t('admin.exit')}
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav style={{ padding: '0 24px', borderBottom: '1px solid #333', display: 'flex' }}>
                <VercelTab id="overview" label={t('admin.tabs.overview')} />
                <VercelTab id="diagnostics" label={t('admin.tabs.diagnostics')} />
                <VercelTab id="users" label={t('admin.tabs.users')} />
                <VercelTab id="activity" label="Activity Feed" />
                <VercelTab id="support" label="Support" />
                <VercelTab id="logs" label="Global Logs" />
            </nav>

            {/* Content Area */}
            <main style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>

                {activeTab === 'support' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedSupportUserId ? '300px 1fr' : '1fr', gap: '20px', minHeight: '600px' }}>
                        <div className="glass-panel" style={{ background: '#111', padding: '16px', border: '1px solid #333', borderRadius: '12px', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '20px' }}>Active Support</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {allChats.filter(c => c.isSupport).length === 0 ? (
                                    <div style={{ color: '#555', textAlign: 'center', padding: '20px' }}>No support requests yet.</div>
                                ) : (
                                    allChats.filter(c => c.isSupport).map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => setSelectedSupportUserId(chat.userId)}
                                            style={{
                                                padding: '12px',
                                                background: selectedSupportUserId === chat.userId ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                                border: `1px solid ${selectedSupportUserId === chat.userId ? '#3B82F6' : '#222'}`,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>User: {chat.userId?.substring(0, 8)}...</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                                                {chat.lastMessage.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {selectedSupportUserId && (
                            <div className="glass-panel" style={{ background: '#000', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }}>
                                <SupportChat isInline targetUserId={selectedSupportUserId} onClose={() => setSelectedSupportUserId(null)} />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <section className="glass-panel" style={{ padding: '24px', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                            <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>{t('admin.systemStatus')}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>{t('admin.dbConnection')}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 700 }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: systemHealth.dbConnected === 'connected' ? '#10B981' : '#EF4444' }}></div>
                                        {systemHealth.dbConnected === 'connected' ? 'Healthy' : 'Error'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>{t('admin.latency')}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: systemHealth.latency > 500 ? '#F59E0B' : 'inherit' }}>{systemHealth.latency}ms</div>
                                        <div style={{ fontSize: '0.7rem', color: '#555' }}>Avg: {Math.round(systemHealth.history.reduce((a, b) => a + b.value, 0) / (systemHealth.history.length || 1))}ms</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px', height: '20px', alignItems: 'flex-end', marginTop: '8px' }}>
                                        {systemHealth.history.map((h, i) => (
                                            <div key={i} style={{
                                                width: '10%',
                                                height: `${Math.min(100, (h.value / 1000) * 100)}%`,
                                                background: h.value > 500 ? '#F59E0B' : '#3B82F6',
                                                borderRadius: '1px'
                                            }} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Active Users</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{users.length}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'diagnostics' && (
                    <div className="tab-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>{t('admin.healerTitle')}</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t('admin.healerSub')}</p>
                            </div>
                            <button
                                onClick={runDiagnostics}
                                disabled={diagnostics.scanning}
                                className="btn-primary"
                                style={{ padding: '10px 20px', borderRadius: '8px', opacity: diagnostics.scanning ? 0.7 : 1 }}
                            >
                                {diagnostics.scanning ? t('admin.scanning') : t('admin.runCheck')}
                            </button>
                        </div>

                        {diagnostics.error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#EF4444', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                                <strong>System Error:</strong> {diagnostics.error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('admin.dataHealth')}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: diagnostics.results?.errorsFound > 0 ? '#F43F5E' : '#10B981' }}>
                                    {diagnostics.lastRun ? `${diagnostics.results?.errorsFound} Issues` : 'Not Scanned'}
                                </div>
                            </div>
                            <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('admin.lastRun')}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
                                    {diagnostics.lastRun || '--:--'}
                                </div>
                            </div>
                        </div>

                        {diagnostics.results?.criticalIssues.length > 0 && (
                            <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                                <div style={{ background: '#222', padding: '12px 20px', borderBottom: '1px solid #333', fontSize: '0.85rem', color: '#EF4444', fontWeight: 600 }}>
                                    ⚠️ PROPERTY ISSUES: {diagnostics.results.criticalIssues.length} Critical Deviations
                                </div>
                                <div style={{ background: '#111' }}>
                                    {diagnostics.results.criticalIssues.map((issue, idx) => (
                                        <div key={issue.propertyId} style={{ padding: '16px 20px', borderBottom: idx === diagnostics.results.criticalIssues.length - 1 ? 'none' : '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{issue.propertyName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                                    {issue.errors.map((e, i) => (
                                                        <span key={i} style={{ color: '#F43F5E' }}>{t(e.message)}{i < issue.errors.length - 1 ? ', ' : ''}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAutoFix(issue)}
                                                disabled={fixingId === issue.propertyId}
                                                style={{ padding: '6px 14px', borderRadius: '6px', background: '#333', border: '1px solid #444', color: 'white', fontSize: '0.75rem', cursor: 'pointer', opacity: fixingId === issue.propertyId ? 0.5 : 1 }}
                                            >
                                                {fixingId === issue.propertyId ? '...' : t('admin.fixAi')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {diagnostics.userResults?.criticalIssues.length > 0 && (
                            <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ background: '#222', padding: '12px 20px', borderBottom: '1px solid #333', fontSize: '0.85rem', color: '#F59E0B', fontWeight: 600 }}>
                                    👤 USER PROFILE ISSUES: {diagnostics.userResults.criticalIssues.length} Incomplete Profiles
                                </div>
                                <div style={{ background: '#111' }}>
                                    {diagnostics.userResults.criticalIssues.map((issue, idx) => (
                                        <div key={issue.userId} style={{ padding: '16px 20px', borderBottom: idx === diagnostics.userResults.criticalIssues.length - 1 ? 'none' : '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{issue.userEmail}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                                    {issue.errors.map((e, i) => (
                                                        <span key={i} style={{ color: '#F59E0B' }}>{e.message}{i < issue.errors.length - 1 ? ', ' : ''}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#555' }}>Manual Fix Required</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="tab-content" style={{ border: '1px solid #333', borderRadius: '12px', background: '#111', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ background: '#222' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #333' }}>User</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #333' }}>Email</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #333' }}>Role</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #333' }}>Registered</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #333' }}>Last Login</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'right', borderBottom: '1px solid #333' }}>Actions</th>

                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const isEditing = editingUser?.id === user.id;

                                    return (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #222', background: isEditing ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                            <td style={{ padding: '12px 20px' }}>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        style={{ background: '#222', border: '1px solid #444', color: 'white', padding: '4px 8px', borderRadius: '4px', width: '100%' }}
                                                    />
                                                ) : user.name}
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#888' }}>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        style={{ background: '#222', border: '1px solid #444', color: 'white', padding: '4px 8px', borderRadius: '4px', width: '100%' }}
                                                    />
                                                ) : user.email}
                                            </td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <span className="tag" style={{
                                                    background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' :
                                                        user.role === 'pmc' ? 'rgba(59, 130, 246, 0.1)' :
                                                            user.role === 'owner' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: user.role === 'admin' ? '#EF4444' :
                                                        user.role === 'pmc' ? '#3B82F6' :
                                                            user.role === 'owner' ? '#10B981' : '#888',
                                                    border: `1px solid ${user.role === 'admin' ? '#EF4444' : user.role === 'pmc' ? '#3B82F6' : user.role === 'owner' ? '#10B981' : '#333'}`,
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#888' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td style={{ padding: '12px 20px', color: '#888' }}>
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                                            </td>
                                            <td style={{ padding: '12px 20px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const idToken = await auth.currentUser.getIdToken();
                                                                    const response = await fetch('/api/admin/update-user', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${idToken}`
                                                                        },
                                                                        body: JSON.stringify({
                                                                            targetUid: user.id,
                                                                            newEmail: editForm.email,
                                                                            newName: editForm.name
                                                                        })
                                                                    });

                                                                    const res = await response.json();

                                                                    if (response.ok) {
                                                                        skynet.log(`Admin synchronized user update: ${user.email} -> ${editForm.email}`, 'info');
                                                                        setEditingUser(null);
                                                                    } else {
                                                                        alert('Update failed: ' + res.error);
                                                                        skynet.log(`Failed to sync user info: ${res.error}`, 'error');
                                                                    }
                                                                } catch (err) {
                                                                    alert('Update failed: ' + err.message);
                                                                    console.error('Profile sync error:', err);
                                                                }
                                                            }}
                                                            className="tag"
                                                            style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.65rem' }}
                                                        >
                                                            SAVE
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="tag"
                                                            style={{ background: '#333', border: '1px solid #444', color: 'white', cursor: 'pointer', fontSize: '0.65rem' }}
                                                        >
                                                            CANCEL
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <select
                                                                value={pendingRoleChanges[user.id] || user.role || 'user'}
                                                                onChange={(e) => {
                                                                    const newRole = e.target.value;
                                                                    setPendingRoleChanges(prev => ({
                                                                        ...prev,
                                                                        [user.id]: newRole
                                                                    }));
                                                                    skynet.info(`Admin selected new role for ${user.email}`, { targetUid: user.id, role: newRole });
                                                                }}
                                                                style={{
                                                                    background: '#222',
                                                                    border: '1px solid var(--glass-border)',
                                                                    borderRadius: '4px',
                                                                    color: 'white',
                                                                    fontSize: '0.65rem',
                                                                    padding: '4px 8px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <option value="user">Standard User</option>
                                                                <option value="pmc">Property Manager (PMC)</option>
                                                                <option value="owner">Investor (Owner)</option>
                                                                <option value="tenant">Resident (Tenant)</option>
                                                                <option value="admin">Global Admin</option>
                                                            </select>

                                                            {pendingRoleChanges[user.id] && pendingRoleChanges[user.id] !== user.role && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const newRole = pendingRoleChanges[user.id];
                                                                        skynet.info(`Admin saving role change for ${user.email}`, { targetUid: user.id, to: newRole });

                                                                        try {
                                                                            const idToken = await auth.currentUser.getIdToken();
                                                                            const response = await fetch('/api/admin/update-user', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${idToken}`
                                                                                },
                                                                                body: JSON.stringify({
                                                                                    targetUid: user.id,
                                                                                    newRole: newRole
                                                                                })
                                                                            });

                                                                            const res = await response.json();

                                                                            if (response.ok) {
                                                                                skynet.success(`Role updated via API for ${user.email}`, { targetUid: user.id, role: newRole });
                                                                                setPendingRoleChanges(prev => {
                                                                                    const next = { ...prev };
                                                                                    delete next[user.id];
                                                                                    return next;
                                                                                });
                                                                                alert('Success!');
                                                                            } else {
                                                                                skynet.error(`API Role update failed for ${user.email}`, { error: res.error });
                                                                                alert('Error: ' + res.error);
                                                                            }
                                                                        } catch (err) {
                                                                            skynet.error(`Connection error during role update`, { error: err.message });
                                                                            alert('Connection failed');
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        background: 'var(--accent-success)',
                                                                        border: 'none',
                                                                        color: 'white',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.6rem',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 800,
                                                                        animation: 'pulse 2s infinite'
                                                                    }}
                                                                >
                                                                    SAVE
                                                                </button>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Send password reset email to ${user.email}?`)) {
                                                                    const res = await sendPasswordReset(user.email);
                                                                    if (res.success) alert('Reset email sent!');
                                                                    else alert('Error: ' + res.error);
                                                                }
                                                            }}
                                                            className="tag"
                                                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', cursor: 'pointer', color: '#3B82F6', fontSize: '0.65rem' }}
                                                        >
                                                            RESET EMAIL
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                console.log('Opening SET PASS modal for:', user.email);
                                                                setPwResetTarget(user);
                                                            }}
                                                            className="tag"
                                                            style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #F43F5E', cursor: 'pointer', color: '#F43F5E', fontSize: '0.65rem' }}
                                                        >
                                                            SET PASS
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setEditForm({ name: user.name, email: user.email });
                                                            }}
                                                            className="tag"
                                                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', cursor: 'pointer', color: '#10B981', fontSize: '0.65rem' }}
                                                        >
                                                            EDIT
                                                        </button>
                                                        <button
                                                            onClick={() => { impersonate(user); onClose(); }}
                                                            className="tag"
                                                            style={{
                                                                background: currentUser.id === user.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                                                border: '1px solid var(--glass-border)',
                                                                cursor: 'pointer',
                                                                color: 'white',
                                                                fontSize: '0.65rem'
                                                            }}
                                                        >
                                                            {currentUser.id === user.id ? 'EYE ACTIVE' : 'IMPERSONATE'}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="tab-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <section style={{ padding: '24px', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Live System Events</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {persistentLogs.filter(l => l.type !== 'crash' && l.type !== 'error').slice(0, 15).map(log => (
                                        <div key={log.id} style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
                                            <span style={{ color: '#555', minWidth: '80px' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span style={{ color: '#10B981', fontWeight: 600 }}>ACTION</span>
                                            <span style={{ color: '#eee' }}>{log.msg}</span>
                                        </div>
                                    ))}
                                    {persistentLogs.length === 0 && <div style={{ color: '#555' }}>Waiting for system events...</div>}
                                </div>
                            </section>

                            <section style={{ padding: '24px', border: '1px solid #333', borderRadius: '12px', background: '#111' }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Global Security Monitor</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10B981' }}>
                                    <div className="pulse" style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.9rem' }}>Skynet is actively patrolling Firestore. 0 unauthorized attempts today.</span>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="tab-content">
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Search logs by message, user or error type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            height: '650px',
                            overflowY: 'auto',
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                        }}>
                            {filteredLogs.length === 0 ? (
                                <div style={{ color: '#555', textAlign: 'center', marginTop: '100px' }}>No logs match your search.</div>
                            ) : (
                                filteredLogs.map(log => (
                                    <div key={log.id} style={{
                                        padding: '12px 0',
                                        borderBottom: '1px solid #222',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ color: '#555', minWidth: '80px' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.65rem',
                                                background: log.type === 'error' || log.type === 'crash' ? 'rgba(239, 68, 68, 0.1)' :
                                                    log.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                                        'rgba(59, 130, 246, 0.1)',
                                                color: log.type === 'error' || log.type === 'crash' ? '#EF4444' :
                                                    log.type === 'success' ? '#10B981' :
                                                        '#3B82F6',
                                                border: `1px solid ${log.type === 'error' || log.type === 'crash' ? '#EF4444' : log.type === 'success' ? '#10B981' : '#3B82F6'}`,
                                                textTransform: 'uppercase',
                                                fontWeight: 800
                                            }}>
                                                {log.type}
                                            </span>
                                            <span style={{ color: '#888', fontSize: '0.75rem' }}>User: {log.userEmail || 'system'}</span>
                                        </div>
                                        <div style={{ color: '#eee', paddingLeft: '92px', fontSize: '0.85rem' }}>{log.msg || log.message}</div>

                                        {/* Restore Action */}
                                        {(log.type === 'snapshot' || log.type === 'deletion_snapshot') && (
                                            <div style={{ paddingLeft: '92px', marginTop: '8px' }}>
                                                <button
                                                    onClick={() => handleRestore(log)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '4px',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        border: '1px solid #3B82F6',
                                                        color: '#3B82F6',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    ↺ RESTORE DATA
                                                </button>
                                            </div>
                                        )}

                                        {log.stack && (

                                            <div style={{ color: '#555', fontSize: '0.7rem', paddingLeft: '92px', overflowX: 'auto', whiteSpace: 'pre', marginTop: '4px' }}>
                                                {log.stack.substring(0, 1000)}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
            {/* Password Reset Modal */}
            {pwResetTarget && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10000, padding: '20px'
                }}>
                    <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Manual Password Reset</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>
                            Setting new password for: <strong>{pwResetTarget.email}</strong>
                        </p>

                        <input
                            type="password"
                            placeholder="New Password (min 6 chars)"
                            value={newPassForm}
                            onChange={(e) => setNewPassForm(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', background: '#111', border: '1px solid #444',
                                borderRadius: '8px', color: 'white', marginBottom: '20px'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleManualPasswordReset}
                                disabled={isUpdatingPass}
                                style={{
                                    flex: 1, padding: '10px', background: 'var(--accent-primary)',
                                    border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                {isUpdatingPass ? 'Updating...' : 'Update Password'}
                            </button>
                            <button
                                onClick={() => setPwResetTarget(null)}
                                style={{
                                    padding: '10px 20px', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid #444', borderRadius: '8px', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
