import { useAuth } from '../context/AuthContext';

/**
 * Compatibility wrapper for legacy useFirebaseAuth
 * Redirects to the centralized AuthContext
 */
export const useFirebaseAuth = () => {
    const auth = useAuth();
    return {
        currentUser: auth.currentUser,
        loading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
        signup: auth.signup,
        login: auth.login,
        logout: auth.logout,
        updatePreferences: auth.updatePreferences
    };
};
