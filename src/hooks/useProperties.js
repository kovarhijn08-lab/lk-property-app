import { useMemo, useState, useEffect } from 'react';
import { firestoreOperations } from './useFirestore';
import { where, or, orderBy } from 'firebase/firestore';
import { skynet } from '../utils/SkynetLogger';

/**
 * Хук для работы с properties через Firestore
 * Заменяет useLocalStorage для properties
 * 
 * @param {Object} user - объект авторизованного пользователя из AuthContext
 * @returns {Object} - properties, loading, и CRUD методы
 */
export const useProperties = (user) => {
    const userId = user?.id;
    const role = user?.role;
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Мемоизируем параметры запроса
    const queryConstraints = useMemo(() => {
        if (!userId) return [];

        // Owner/PMC/Admin: see properties they own OR manage
        if (role === 'owner' || role === 'pmc' || role === 'admin') {
            return [
                or(
                    where('ownerIds', 'array-contains', userId),
                    where('managerIds', 'array-contains', userId),
                    where('ownerId', '==', userId), // Direct owner link
                    where('userId', '==', userId) // Fallback for old records
                )
            ];
        }

        // Tenant: see properties where they are registered OR where they are the creator (fallback)
        if (role === 'tenant') {
            return [
                or(
                    where('tenantIds', 'array-contains', userId),
                    where('tenantId', '==', userId), // Direct tenant link
                    where('tenantEmails', 'array-contains', user.email || ''),
                    where('userId', '==', userId)
                )
            ];
        }

        // Default: only their own
        return [
            where('userId', '==', userId)
        ];
    }, [userId, role, user?.email]);

    /**
     * Добавить новый property
     */
    const addProperty = async (propertyData) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        const newProperty = {
            ...propertyData,
            userId, // Creator
            ownerIds: propertyData.ownerIds || (role === 'owner' ? [userId] : []),
            managerIds: propertyData.managerIds || (role === 'pmc' || role === 'admin' ? [userId] : []),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = await firestoreOperations.setDocument(
            'properties',
            newProperty.id,
            newProperty
        );

        if (response.success) {
            skynet.log(`New property created: "${newProperty.name}"`, 'success', {
                actorId: userId,
                action: 'property.create',
                entityType: 'property',
                entityId: newProperty.id
            });
        }

        return response;
    };

    /**
     * Обновить существующий property
     */
    const updateProperty = async (propertyId, updates) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        // Create snapshot for Undo
        try {
            const currentDoc = await firestoreOperations.getDocument('properties', propertyId);
            if (currentDoc.success) {
                await skynet.log(`Snapshot created for "${propertyId}"`, 'info', {
                    actorId: userId,
                    action: 'property.update.snapshot',
                    entityType: 'property',
                    entityId: propertyId,
                    data: currentDoc.data
                });
            }
        } catch (e) {
            console.warn('Undo snapshot failed:', e);
        }

        const response = await firestoreOperations.updateDocument(
            'properties',
            propertyId,
            {
                ...updates,
                updatedAt: new Date().toISOString()
            }
        );

        if (response.success) {
            skynet.log(`Property updated: "${propertyId}"`, 'info', {
                actorId: userId,
                action: 'property.update',
                entityType: 'property',
                entityId: propertyId
            });
        }

        return response;
    };

    /**
     * Удалить property
     */
    const deleteProperty = async (propertyId) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const currentDoc = await firestoreOperations.getDocument('properties', propertyId);
            if (!currentDoc.success) return currentDoc;

            const data = currentDoc.data;
            const updatedOwnerIds = (data.ownerIds || []).filter(id => id !== userId);
            const updatedManagerIds = (data.managerIds || []).filter(id => id !== userId);

            // Snapshot for safety
            await skynet.log(`Safe delete check for "${propertyId}"`, 'warning', {
                actorId: userId,
                action: 'property.delete.check',
                entityType: 'property',
                entityId: propertyId,
                data
            });

            // "Safe Delete" Logic: 
            // If there are other owners or managers, just remove current user's link
            if (updatedOwnerIds.length > 0 || updatedManagerIds.length > 0) {
                skynet.info(`Performing soft-delete (unlinking) for ${userId} on ${propertyId}`);
                const response = await updateProperty(propertyId, {
                    ownerIds: updatedOwnerIds,
                    managerIds: updatedManagerIds,
                    // Wipe legacy userId if it was us
                    ...(data.userId === userId ? { userId: updatedOwnerIds[0] || updatedManagerIds[0] || 'orphaned' } : {})
                });
                return response;
            }

            // If no one else is linked, perform physical delete
            skynet.info(`Performing final physical delete for ${propertyId}`);
            const response = await firestoreOperations.deleteDocument('properties', propertyId);
            if (response.success) {
                skynet.log(`Property physically deleted: "${propertyId}"`, 'warning', {
                    actorId: userId,
                    action: 'property.delete.physical',
                    entityType: 'property',
                    entityId: propertyId
                });
            }
            return response;
        } catch (error) {
            console.error('Delete property error:', error);
            return { success: false, error: error.message };
        }
    };

    const loadProperties = async () => {
        if (!userId) {
            setProperties([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const response = await firestoreOperations.getCollection('properties', queryConstraints);
        if (response.success) {
            setProperties(response.data || []);
            setError(null);
        } else {
            const errorMessage = String(response.error || '');
            const shouldFallback = /failed-precondition|permission|requires an index/i.test(errorMessage);
            const fallbackConstraints = [where('userId', '==', userId)];

            if (shouldFallback && queryConstraints.length > 0) {
                console.warn('[Properties] Falling back to userId query due to query error:', errorMessage);
                const fallbackResponse = await firestoreOperations.getCollection('properties', fallbackConstraints);
                if (fallbackResponse.success) {
                    setProperties(fallbackResponse.data || []);
                    setError(null);
                } else {
                    setError(fallbackResponse.error);
                }
            } else {
                setError(response.error);
            }
        }
        setLoading(false);
    };

    // One-time загрузка properties пользователя из Firestore (без real-time подписок)
    useEffect(() => {
        loadProperties();
    }, [userId, role, user?.email]);

    return {
        properties: properties || [],
        loading,
        error,
        addProperty,
        updateProperty,
        deleteProperty,
        refreshProperties: loadProperties
    };
};
