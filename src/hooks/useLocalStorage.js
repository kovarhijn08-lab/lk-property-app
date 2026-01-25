import { useState, useEffect } from 'react';

/**
 * A custom hook that persists state to localStorage.
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if nothing is stored
 */
export function useLocalStorage(key, initialValue) {
    // Get stored value or use initial
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error writing localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
