import { useState, useEffect, useMemo } from 'react';
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
import { skynet } from '../utils/SkynetLogger';

const RETRYABLE_ERRORS = new Set([
    'unavailable',
    'aborted',
    'deadline-exceeded',
    'resource-exhausted'
]);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (fn, context, attempts = 3, baseDelayMs = 300) => {
    let lastError = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const code = error?.code?.replace('firestore/', '') || error?.code || 'unknown';
            const isRetryable = RETRYABLE_ERRORS.has(code);

            if (!isRetryable || attempt === attempts - 1) {
                throw error;
            }

            const jitter = Math.floor(Math.random() * 100);
            const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
            skynet.warn('Firestore transient error, retrying', {
                ...context,
                action: 'db.retry',
                entityType: context.collection,
                entityId: context.docId,
                metadata: {
                    error: error?.message,
                    code,
                    attempt: attempt + 1,
                    delay
                }
            });
            await sleep(delay);
        }
    }

    throw lastError;
};

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
export const useFirestoreCollection = (collectionName, queryConstraints = [], dependencies = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Composite key for situations where explicit dependencies aren't provided
    const queryKey = useMemo(() => {
        if (dependencies.length > 0) return JSON.stringify(dependencies);

        return JSON.stringify(queryConstraints.map(c => {
            if (c._query) return c._query.path.segments.join('/');
            return 'constraint';
        }));
    }, [collectionName, ...dependencies, queryConstraints]);

    useEffect(() => {
        if (!collectionName) {
            setLoading(false);
            return;
        }

        const collectionRef = collection(db, collectionName);
        const q = queryConstraints.length > 0
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;

        setLoading(true);
        console.log(`[Firestore] Subscribing to ${collectionName}...`, { dependencies });

        // Real-time listener
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log(`[Firestore] ${collectionName} update: ${items.length} items found.`);
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Firestore collection error (${collectionName}):`, err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            console.log(`[Firestore] Unsubscribing from ${collectionName}.`);
            unsubscribe();
        };
    }, [collectionName, queryKey]);

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
            await withRetry(() => setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge }), { action: 'set', collection: collectionName, docId });

            skynet.success(`Document SET in ${collectionName}: ${docId}`, {
                action: 'db.set',
                entityType: collectionName,
                entityId: docId
            });
            return { success: true, id: docId };
        } catch (error) {
            console.error('Set document error:', error);
            skynet.error(`FAILED SET in ${collectionName}: ${docId}`, {
                error: error.message,
                action: 'db.set.fail',
                entityType: collectionName,
                entityId: docId
            });
            return { success: false, error: error.message };
        }
    },

    // Update document
    async updateDocument(collectionName, docId, data) {
        try {
            const docRef = doc(db, collectionName, docId);
            await withRetry(() => updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }), { action: 'update', collection: collectionName, docId });

            skynet.success(`Document UPDATED in ${collectionName}: ${docId}`, {
                action: 'db.update',
                entityType: collectionName,
                entityId: docId
            });
            return { success: true };
        } catch (error) {
            console.error('Update document error:', error);
            skynet.error(`FAILED UPDATE in ${collectionName}: ${docId}`, {
                error: error.message,
                action: 'db.update.fail',
                entityType: collectionName,
                entityId: docId
            });
            return { success: false, error: error.message };
        }
    },

    // Delete document
    async deleteDocument(collectionName, docId) {
        try {
            const docRef = doc(db, collectionName, docId);
            await withRetry(() => deleteDoc(docRef), { action: 'delete', collection: collectionName, docId });

            skynet.success(`Document DELETED in ${collectionName}: ${docId}`, {
                action: 'db.delete',
                entityType: collectionName,
                entityId: docId
            });
            return { success: true };
        } catch (error) {
            console.error('Delete document error:', error);
            skynet.error(`FAILED DELETE in ${collectionName}: ${docId}`, {
                error: error.message,
                action: 'db.delete.fail',
                entityType: collectionName,
                entityId: docId
            });
            return { success: false, error: error.message };
        }
    },

    // Get single document (one-time read)
    async getDocument(collectionName, docId) {
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await withRetry(() => getDoc(docRef), { action: 'get', collection: collectionName, docId });

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

            const querySnapshot = await withRetry(() => getDocs(q), { action: 'list', collection: collectionName });
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
