import { useMemo } from 'react';
import { useFirestoreCollection, firestoreOperations } from './useFirestore';
import { where } from 'firebase/firestore';
import { skynet } from '../utils/SkynetLogger';

/**
 * Хук для работы с properties через Firestore
 * Заменяет useLocalStorage для properties
 * 
 * @param {string} userId - ID авторизованного пользователя
 * @returns {Object} - properties, loading, и CRUD методы
 */
export const useProperties = (userId) => {
    // Мемоизируем параметры запроса, чтобы не вызывать бесконечные переподписки
    const queryConstraints = useMemo(() =>
        userId ? [where('userId', '==', userId)] : [],
        [userId]);

    // Загрузка properties пользователя из Firestore с real-time обновлениями
    const { data: properties, loading, error } = useFirestoreCollection(
        userId ? 'properties' : null,
        queryConstraints
    );

    /**
     * Добавить новый property
     */
    const addProperty = async (propertyData) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        const newProperty = {
            ...propertyData,
            userId,
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
                userId,
                propertyId: newProperty.id,
                type: 'property_creation'
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
                    type: 'snapshot',
                    collection: 'properties',
                    docId: propertyId,
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
                userId,
                propertyId,
                type: 'property_update'
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

        // Create snapshot for Undo
        try {
            const currentDoc = await firestoreOperations.getDocument('properties', propertyId);
            if (currentDoc.success) {
                await skynet.log(`Delete snapshot for "${propertyId}"`, 'warning', {
                    type: 'deletion_snapshot',
                    collection: 'properties',
                    docId: propertyId,
                    data: currentDoc.data
                });
            }
        } catch (e) {
            console.warn('Delete snapshot failed:', e);
        }

        const response = await firestoreOperations.deleteDocument(
            'properties',
            propertyId
        );

        if (response.success) {
            skynet.log(`Property deleted: "${propertyId}"`, 'warning', {
                userId,
                propertyId,
                type: 'property_deletion'
            });
        }

        return response;
    };

    return {
        properties: properties || [],
        loading,
        error,
        addProperty,
        updateProperty,
        deleteProperty
    };
};
