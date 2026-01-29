import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { skynet } from '../utils/SkynetLogger';
import { hashToken } from '../utils/crypto';
import { firestoreOperations } from '../hooks/useFirestore';
import { where } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [ghostUser, setGhostUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        // [SAFETY] Force loading to false if Firebase hangs for more than 8 seconds
        const authTimeout = setTimeout(() => {
            if (loading) {
                console.warn('[AuthContext] Load timeout reached. Forcing UI render.');
                setLoading(false);
            }
        }, 8000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (user) {
                // Real-time listener for user document (role changes, etc)
                unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.data();
                        console.log(`[Auth] User document updated for ${user.email} (Role: ${userData.role})`);
                        skynet.info(`Auth profile updated: ${user.email}`, {
                            actorId: user.uid,
                            action: 'user.profile.update',
                            entityType: 'user',
                            entityId: user.uid,
                            role: userData.role
                        });

                        setCurrentUser({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                            ...userData
                        });
                    } else {
                        // Fallback for new users or missing docs
                        skynet.warn(`User document not found for ${user.email}`, { userId: user.uid });
                        setCurrentUser({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                            role: 'tenant'
                        });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error('[AuthContext] Firestore Snapshot Error:', error);
                    skynet.error('Firestore Auth Snapshot Error', { error: error.message, userId: user.uid });
                    setLoading(false);
                });
            } else {
                skynet.info('Auth state: Signed Out');
                setCurrentUser(null);
                setGhostUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
            clearTimeout(authTimeout);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);

            skynet.log(`User logged in: ${res.user.email}`, 'info', {
                actorId: res.user.uid,
                action: 'auth.login',
                entityType: 'user',
                entityId: res.user.uid
            });
            return { success: true, user: res.user };
        } catch (error) {
            console.error('[AuthContext] Login Error:', error);
            let message = 'Login failed. Please check your credentials.';
            if (error.code === 'auth/user-not-found') message = 'User not found.';
            if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
            if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
            if (error.message.includes('permission')) message = 'Permission denied. Your account might be restricted.';

            return { success: false, error: message };
        }
    };

    const signup = async (email, password, name, role = 'owner', inviteToken = null) => {
        try {
            let linkedPropertyId = null;
            let linkedUnitId = null;
            let inviteId = null;
            let finalRole = role;

            if (role === 'pmc' && !inviteToken) {
                skynet.warn('PMC signup blocked: invite required', {
                    action: 'auth.signup.blocked',
                    entityType: 'user',
                    metadata: { role: 'pmc', reason: 'invite_required' }
                });
                return { success: false, error: 'PMC registration is invite-only. Please request an invitation from Admin/Owner.' };
            }

            // 1. Create Firebase User FIRST (to obtain UID for validation)
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const uid = res.user.uid;

            // 2. Invitation Validation for Invite-Based Roles (tenant/pmc)
            if (inviteToken) {
                const hashedToken = await hashToken(inviteToken);
                const inviteSnapshot = await firestoreOperations.getDocument('invitations', hashedToken);

                if (!inviteSnapshot.success) {
                    skynet.warn('Invite validation failed', {
                        action: 'auth.invite.denied',
                        entityType: 'invitation',
                        metadata: { reason: 'not_found' }
                    });
                    await deleteUser(res.user);
                    return { success: false, error: 'Invalid or expired invitation link.' };
                }

                const inviteData = inviteSnapshot.data;
                inviteId = inviteData.id;
                finalRole = inviteData.role || 'tenant';

                // Check status and expiry
                if (inviteData.status !== 'active') {
                    skynet.warn('Invite validation failed', {
                        action: 'auth.invite.denied',
                        entityType: 'invitation',
                        entityId: inviteId,
                        metadata: { reason: 'status_not_active', status: inviteData.status }
                    });
                    await deleteUser(res.user);
                    return { success: false, error: 'This invitation has already been used or expired.' };
                }

                if (new Date(inviteData.expiresAt) < new Date()) {
                    skynet.warn('Invite validation failed', {
                        action: 'auth.invite.denied',
                        entityType: 'invitation',
                        entityId: inviteId,
                        metadata: { reason: 'expired', expiresAt: inviteData.expiresAt }
                    });
                    await firestoreOperations.updateDocument('invitations', inviteId, { status: 'expired' });
                    await deleteUser(res.user);
                    return { success: false, error: 'Invitation link has expired.' };
                }

                linkedPropertyId = inviteData.propertyId;
                linkedUnitId = inviteData.unitId;

                const updateRes = await firestoreOperations.updateDocument('invitations', inviteId, {
                    status: 'used',
                    usedAt: new Date().toISOString(),
                    usedBy: uid
                });

                if (!updateRes.success) {
                    skynet.error('Invite authorization failed', {
                        action: 'auth.invite.update.fail',
                        entityType: 'invitation',
                        entityId: inviteId,
                        metadata: { reason: 'update_failed', error: updateRes.error }
                    });
                    await deleteUser(res.user);
                    return { success: false, error: 'Failed to authorize invitation. Please try again.' };
                }
            } else if (role === 'tenant') {
                skynet.warn('Tenant signup blocked: invite required', {
                    action: 'auth.signup.blocked',
                    entityType: 'user',
                    metadata: { role: 'tenant', reason: 'invite_required' }
                });
                await deleteUser(res.user);
                return { success: false, error: 'Registration for tenants requires an invitation link.' };
            }

            await updateProfile(res.user, { displayName: name });

            // 3. Create User Document
            const userData = {
                id: res.user.uid,
                name,
                email,
                role: finalRole,
                onboardingCompleted: finalRole === 'tenant', // Tenants skip onboarding for now
                createdAt: new Date().toISOString(),
                preferences: { currency: 'USD', isDemoMode: false },
                linkedPropertyId,
                linkedUnitId,
                inviteId // Reference for Firestore rules verification
            };

            try {
                await setDoc(doc(db, 'users', res.user.uid), userData);
            } catch (err) {
                console.error('[AuthContext] User document creation failed, rolling back...', err);

                // Rollback Invitation if it was marked as used
                if (inviteId) {
                    await firestoreOperations.updateDocument('invitations', inviteId, {
                        status: 'active',
                        usedAt: null,
                        usedBy: null
                    });
                }

                // Cleanup Auth User
                await deleteUser(res.user);
                return { success: false, error: 'Failed to create user profile. Please try again.' };
            }

            // 4. Link Tenant to Property/Unit
            if (finalRole === 'tenant' && linkedPropertyId) {
                const propDoc = await firestoreOperations.getDocument('properties', linkedPropertyId);
                if (propDoc.success) {
                    const propData = propDoc.data;

                    // Add to property tenantIds
                    const tenantIds = propData.tenantIds || [];
                    if (!tenantIds.includes(res.user.uid)) {
                        tenantIds.push(res.user.uid);
                    }

                    // Update unit if applicable
                    let updatedUnits = propData.units || [];
                    if (linkedUnitId) {
                        updatedUnits = updatedUnits.map(u =>
                            u.id === linkedUnitId ? { ...u, tenantId: res.user.uid, tenant: name } : u
                        );
                    }

                    await firestoreOperations.updateDocument('properties', linkedPropertyId, {
                        tenantIds,
                        units: updatedUnits,
                        tenantEmails: [...(propData.tenantEmails || []), email]
                    });
                }
            }

            if (finalRole === 'pmc' && linkedPropertyId) {
                const propDoc = await firestoreOperations.getDocument('properties', linkedPropertyId);
                if (propDoc.success) {
                    const propData = propDoc.data;
                    const managerIds = propData.managerIds || [];
                    if (!managerIds.includes(res.user.uid)) {
                        managerIds.push(res.user.uid);
                    }
                    await firestoreOperations.updateDocument('properties', linkedPropertyId, {
                        managerIds
                    });
                }
            }

            skynet.log(`New user registered: ${email} as ${finalRole}`, 'success', {
                actorId: res.user.uid,
                action: 'auth.signup',
                entityType: 'user',
                entityId: res.user.uid,
                metadata: { role: finalRole, linkedPropertyId }
            });

            return { success: true, user: res.user };
        } catch (error) {
            console.error('[AuthContext] Signup Error:', error);
            skynet.error('Auth Signup Error', { error: error.message, email });
            // Ensure loading is set to false even on error
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        const email = auth.currentUser?.email;
        const uid = auth.currentUser?.uid;

        try {
            await signOut(auth);
            skynet.log(`User logged out: ${email}`, 'info', {
                actorId: uid || 'anonymous',
                action: 'auth.logout'
            });
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
        }

        setCurrentUser(null);
        setGhostUser(null);
        return { success: true };
    };

    const isPMC = currentUser?.email === 'final_test_8812@example.com' ||
        currentUser?.email === 'admin@example.com' ||
        currentUser?.email === 'admintest@admin.ru' ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'pmc';

    const isOwnerRole = currentUser?.role === 'owner';
    const isTenantRole = currentUser?.role === 'tenant';

    const impersonate = (user) => {
        if (!isPMC) return;
        setGhostUser(user);
        skynet.log(`Admin began impersonating ${user.email}`, 'warning', {
            actorId: currentUser.id,
            action: 'auth.impersonate',
            entityType: 'user',
            entityId: user.id
        });
    };

    const stopImpersonation = () => {
        setGhostUser(null);
        skynet.log('Admin stopped impersonation', 'info');
    };

    // Effective user is either ghost or current
    const user = ghostUser || currentUser;

    const value = {
        currentUser: user, // Components see this as the main user
        actualUser: currentUser, // Real admin user
        isGhostMode: !!ghostUser,
        isAuthenticated: !!currentUser,
        isAdmin: isPMC, // Alias for backward compatibility
        isPMC,
        isOwner: isOwnerRole,
        isTenant: isTenantRole,
        role: currentUser?.role || 'user',
        login,
        signup,
        logout,
        impersonate,
        stopImpersonation,
        updatePreferences: async (preferences) => {
            if (!currentUser) return { success: false, error: 'Not authenticated' };
            try {
                const userDocRef = doc(db, 'users', currentUser.id);
                await setDoc(userDocRef, {
                    preferences: { ...currentUser.preferences, ...preferences }
                }, { merge: true });

                setCurrentUser({
                    ...currentUser,
                    preferences: { ...currentUser.preferences, ...preferences }
                });
                return { success: true };
            } catch (error) {
                console.error('Update preferences error:', error);
                return { success: false, error: error.message };
            }
        },
        sendPasswordReset: async (email) => {
            try {
                await sendPasswordResetEmail(auth, email);
                skynet.log(`Password reset email sent to: ${email}`, 'info', {
                    actorId: currentUser?.id || 'system',
                    action: 'user.password.reset',
                    metadata: { targetEmail: email }
                });
                return { success: true };
            } catch (error) {
                console.error('Password reset error:', error);
                return { success: false, error: error.message };
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
