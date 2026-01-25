import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook for real-time Firestore document
 * Automatically syncs data with Firebase
 */
export const useFirestoreDoc = (collectionName, docId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!docId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, collectionName, docId);

        // Real-time listener
        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Firestore error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, docId]);

    return { data, loading, error };
};

/**
 * Hook for real-time Firestore collection
 * Supports queries and real-time updates
 */
export const useFirestoreCollection = (collectionName, queryConstraints = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!collectionName) {
            setLoading(false);
            return;
        }

        const collectionRef = collection(db, collectionName);
        const q = queryConstraints.length > 0
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;

        // Real-time listener
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error('Firestore collection error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName]); // Remove userId dependency as it's not in scope

    return { data, loading, error };
};

/**
 * CRUD operations for Firestore
 */
export const firestoreOperations = {
    // Create or update document
    async setDocument(collectionName, docId, data, merge = false) {
        try {
            const docRef = doc(db, collectionName, docId);
            await setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge });
            return { success: true, id: docId };
        } catch (error) {
            console.error('Set document error:', error);
            return { success: false, error: error.message };
        }
    },

    // Update document
    async updateDocument(collectionName, docId, data) {
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Update document error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete document
    async deleteDocument(collectionName, docId) {
        try {
            const docRef = doc(db, collectionName, docId);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error) {
            console.error('Delete document error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get single document (one-time read)
    async getDocument(collectionName, docId) {
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    data: { id: docSnap.id, ...docSnap.data() }
                };
            } else {
                return { success: false, error: 'Document not found' };
            }
        } catch (error) {
            console.error('Get document error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get collection (one-time read)
    async getCollection(collectionName, queryConstraints = []) {
        try {
            const collectionRef = collection(db, collectionName);
            const q = queryConstraints.length > 0
                ? query(collectionRef, ...queryConstraints)
                : collectionRef;

            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, data: items };
        } catch (error) {
            console.error('Get collection error:', error);
            return { success: false, error: error.message };
        }
    }
};
