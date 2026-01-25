import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { skynet } from '../utils/SkynetLogger';

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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    setCurrentUser({
                        id: user.uid,
                        email: user.email,
                        name: user.displayName,
                        ...userData
                    });
                } else {
                    setCurrentUser(null);
                    setGhostUser(null);
                }
            } catch (error) {
                console.error('[AuthContext] Subscribe Error:', error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        const res = await signInWithEmailAndPassword(auth, email, password);
        skynet.log(`User logged in: ${res.user.email}`, 'info', { userId: res.user.uid, type: 'auth_login' });
        return { success: true, user: res.user };
    };

    const signup = async (email, password, name) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, 'users', res.user.uid), {
            name,
            email,
            createdAt: new Date().toISOString(),
            preferences: { currency: 'USD', isDemoMode: false }
        });
        skynet.log(`New user registered: ${email}`, 'success', { userId: res.user.uid, type: 'auth_signup' });
        return { success: true, user: res.user };
    };

    const logout = async () => {
        const email = auth.currentUser?.email;
        await signOut(auth);
        skynet.log(`User logged out: ${email}`, 'info', { type: 'auth_logout' });
        setGhostUser(null);
        return { success: true };
    };

    const impersonate = (user) => {
        if (!isAdmin) return;
        setGhostUser(user);
        skynet.log(`Admin began impersonating ${user.email}`, 'warning', { adminId: currentUser.id, targetUserId: user.id });
    };

    const stopImpersonation = () => {
        setGhostUser(null);
        skynet.log('Admin stopped impersonation', 'info');
    };

    const isAdmin = currentUser?.email === 'final_test_8812@example.com' ||
        currentUser?.email === 'admin@example.com' ||
        currentUser?.role === 'admin';

    // Effective user is either ghost or current
    const user = ghostUser || currentUser;

    const value = {
        currentUser: user, // Components see this as the main user
        actualUser: currentUser, // Real admin user
        isGhostMode: !!ghostUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        loading,
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
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
