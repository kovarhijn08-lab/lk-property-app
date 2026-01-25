import { useState, useEffect } from 'react';

/**
 * Custom hook for managing mock authentication
 * Stores user data in localStorage (NOT production-ready)
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const authData = localStorage.getItem('smartLedger_auth');
        if (authData) {
            try {
                const user = JSON.parse(authData);
                setCurrentUser(user);
            } catch (e) {
                console.error('Failed to parse auth data:', e);
                localStorage.removeItem('smartLedger_auth');
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Get users from localStorage
        const usersData = localStorage.getItem('smartLedger_users');
        const users = usersData ? JSON.parse(usersData) : [];

        // Find user with matching credentials
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Don't store password in auth state
            const { password: _, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            localStorage.setItem('smartLedger_auth', JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, error: 'Invalid email or password' };
    };

    const signup = (email, password, name) => {
        // Validate input
        if (!email || !password || !name) {
            return { success: false, error: 'All fields are required' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Get existing users
        const usersData = localStorage.getItem('smartLedger_users');
        const users = usersData ? JSON.parse(usersData) : [];

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password, // In real app, this would be hashed
            name,
            createdAt: new Date().toISOString(),
            preferences: {
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY'
            }
        };

        // Save to users list
        users.push(newUser);
        localStorage.setItem('smartLedger_users', JSON.stringify(users));

        // Auto-login
        const { password: _, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('smartLedger_auth', JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('smartLedger_auth');
    };

    const updatePreferences = (preferences) => {
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        const updatedUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...preferences }
        };

        // Update in users list
        const usersData = localStorage.getItem('smartLedger_users');
        const users = usersData ? JSON.parse(usersData) : [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], preferences: updatedUser.preferences };
            localStorage.setItem('smartLedger_users', JSON.stringify(users));
        }

        // Update current user
        setCurrentUser(updatedUser);
        localStorage.setItem('smartLedger_auth', JSON.stringify(updatedUser));

        return { success: true, user: updatedUser };
    };

    return {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        updatePreferences
    };
};
