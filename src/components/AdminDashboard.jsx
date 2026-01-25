import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { firestoreOperations } from '../hooks/useFirestore';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminDashboard = ({ onClose }) => {
    const { currentUser } = useFirebaseAuth();
    const [users, setUsers] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        dbConnected: 'unknown', // 'connected', 'error'
        latency: 0
    });
    const [loading, setLoading] = useState(false);

    // Only allow specific admin users (for now, simplistic check or hardcoded email)
    // Ideally this should be a role in the user document
    const isAdmin = currentUser?.email === 'final_test_8812@example.com' || currentUser?.email === 'admin@example.com' || currentUser?.email === 'admintest@admin.ru';

    useEffect(() => {
        if (isAdmin) {
            checkSystemHealth();
            fetchUsers();
        }
    }, [isAdmin]);

    const checkSystemHealth = async () => {
        const start = Date.now();
        try {
            await firestoreOperations.getCollection('properties', [limit(1)]);
            setSystemHealth({
                dbConnected: 'connected',
                latency: Date.now() - start
            });
        } catch (error) {
            console.error('Health check failed:', error);
            setSystemHealth({
                dbConnected: 'error',
                latency: 0
            });
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Note: Listing all users requires admin privileges in Firestore rules or a cloud function usually.
            // For now, we'll try to list the 'users' collection if it exists and is readable.
            const usersRef = collection(db, 'users');
            const q = query(usersRef, limit(50));
            const snapshot = await getDocs(q);
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
                <button onClick={onClose} className="btn-primary">Go Back</button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary)',
            zIndex: 2000,
            overflowY: 'auto',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ margin: 0 }}>🛡️ Admin Control Center</h1>
                    <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                        Exit Admin
                    </button>
                </div>

                {/* System Health Widget */}
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ marginTop: 0 }}>System Health</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: systemHealth.dbConnected === 'connected' ? '#10B981' : systemHealth.dbConnected === 'error' ? '#EF4444' : '#F59E0B'
                            }}></div>
                            <span>Database Connection</span>
                        </div>
                        <div>
                            Latency: <span style={{ fontWeight: 700 }}>{systemHealth.latency}ms</span>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Registered Users ({users.length})</h3>
                        <button onClick={fetchUsers} style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Refresh</button>
                    </div>

                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>User ID</th>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Email</th>
                                        <th style={{ padding: '12px' }}>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>{user.id.substring(0, 8)}...</td>
                                            <td style={{ padding: '12px' }}>{user.name}</td>
                                            <td style={{ padding: '12px' }}>{user.email}</td>
                                            <td style={{ padding: '12px' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
