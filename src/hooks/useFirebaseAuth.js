import { useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * Custom hook for Firebase authentication
 * This replaces the mock localStorage-based authentication
 */
export const useFirebaseAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[Auth] Listening for auth state changes...');

        // Timeout fallback to prevent infinite loading if Firebase hangs
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('[Auth] Auth check timed out. Setting loading to false.');
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('[Auth] State changed:', user ? `User: ${user.email}` : 'No user');
            clearTimeout(timeoutId);
            try {
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        console.log('[Auth] User profile found in Firestore');
                        setCurrentUser({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                            ...userDoc.data()
                        });
                    } else {
                        console.log('[Auth] No Firestore profile found, using Auth data');
                        setCurrentUser({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName
                        });
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('[Auth] Error in onAuthStateChanged:', error);
                if (user) {
                    setCurrentUser({
                        id: user.uid,
                        email: user.email,
                        name: user.displayName
                    });
                } else {
                    setCurrentUser(null);
                }
            } finally {
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    const signup = async (email, password, name) => {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with name
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                createdAt: new Date().toISOString(),
                preferences: {
                    currency: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                    isDemoMode: true // Start in demo mode by default
                }
            });

            return {
                success: true,
                user: {
                    id: user.uid,
                    email: user.email,
                    name
                }
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: getFirebaseErrorMessage(error.code)
            };
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            return {
                success: true,
                user: {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: getFirebaseErrorMessage(error.code)
            };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    };

    const updatePreferences = async (preferences) => {
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
    };

    return {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        signup,
        login,
        logout,
        updatePreferences
    };
};

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'Email already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Please check your connection'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again';
}
