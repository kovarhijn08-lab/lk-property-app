import { useState, useMemo } from 'react';
import { useFirestoreCollection, firestoreOperations } from './useFirestore';
import { where, orderBy } from 'firebase/firestore';
import { skynet } from '../utils/SkynetLogger';

/**
 * Хук для работы с заявками на обслуживание в Firestore
 * 
 * @param {string} propertyId - ID объекта недвижимости
 * @param {string} userId - ID текущего пользователя
 */
export const useMaintenance = (propertyId, userId) => {
    // Формируем условия запроса
    const queryConstraints = useMemo(() => [
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
    ], [propertyId]);

    // Получаем заявки в реальном времени
    const { data: requests, loading, error } = useFirestoreCollection(
        propertyId ? 'maintenance_requests' : null,
        queryConstraints
    );

    /**
     * Создать новую заявку
     */
    const createRequest = async (requestData) => {
        if (!userId || !propertyId) {
            return { success: false, error: 'User or Property not identified' };
        }

        const fullRequest = {
            ...requestData,
            propertyId,
            userId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const response = await firestoreOperations.setDocument('maintenance_requests', requestId, fullRequest);

        if (response.success) {
            skynet.log(`Maintenance request created: ${requestData.title}`, 'info', {
                actorId: userId,
                action: 'maintenance_request.create',
                entityType: 'property',
                entityId: propertyId,
                metadata: { requestId, title: requestData.title }
            });
        }

        return response;
    };

    /**
     * Обновить статус заявки
     */
    const updateRequestStatus = async (requestId, newStatus) => {
        const response = await firestoreOperations.updateDocument('maintenance_requests', requestId, {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        if (response.success) {
            skynet.log(`Maintenance request status updated: ${requestId} -> ${newStatus}`, 'info', {
                actorId: userId,
                action: 'maintenance_request.update',
                entityType: 'maintenance_request',
                entityId: requestId,
                metadata: { newStatus }
            });
        }

        return response;
    };

    return {
        requests: requests || [],
        loading,
        error,
        createRequest,
        updateRequestStatus
    };
};
