import { useMemo } from 'react';
import { useFirestoreCollection, firestoreOperations } from './useFirestore';
import { where } from 'firebase/firestore';

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

        return await firestoreOperations.setDocument(
            'properties',
            newProperty.id,
            newProperty
        );
    };

    /**
     * Обновить существующий property
     */
    const updateProperty = async (propertyId, updates) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        return await firestoreOperations.updateDocument(
            'properties',
            propertyId,
            {
                ...updates,
                updatedAt: new Date().toISOString()
            }
        );
    };

    /**
     * Удалить property
     */
    const deleteProperty = async (propertyId) => {
        if (!userId) {
            return { success: false, error: 'User not authenticated' };
        }

        return await firestoreOperations.deleteDocument(
            'properties',
            propertyId
        );
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
