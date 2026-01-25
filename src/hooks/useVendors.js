import { useState, useEffect } from 'react';
import { firestoreOperations } from './useFirestore';

export const useVendors = (userId) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setVendors([]);
            setLoading(false);
            return;
        }

        const fetchVendors = async () => {
            try {
                // Fetch from the User Profile document instead of a separate collection
                // This ensures we rely on existing security rules for 'users'
                const response = await firestoreOperations.getDocument('users', userId);
                if (response.success && response.data) {
                    setVendors(response.data.vendors || []);
                }
            } catch (error) {
                console.error("Error fetching vendors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [userId]);

    const addVendor = async (newVendor) => {
        const id = Date.now().toString();
        const vendorToAdd = { ...newVendor, id, createdAt: new Date().toISOString() };

        const updatedVendors = [...vendors, vendorToAdd];

        // Optimistic update
        setVendors(updatedVendors);

        // Save to User Profile
        await firestoreOperations.updateDocument('users', userId, {
            vendors: updatedVendors
        });
    };

    const deleteVendor = async (vendorId) => {
        const updatedVendors = vendors.filter(v => v.id !== vendorId);

        // Optimistic update
        setVendors(updatedVendors);

        // Save to User Profile
        await firestoreOperations.updateDocument('users', userId, {
            vendors: updatedVendors
        });
    };

    return { vendors, loading, addVendor, deleteVendor };
};
