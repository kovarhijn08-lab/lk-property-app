import { useState, useMemo } from 'react';
import { useFirestoreCollection, firestoreOperations } from './useFirestore';
import { where, orderBy } from 'firebase/firestore';
import { skynet } from '../utils/SkynetLogger';

/**
 * Хук для работы с сообщениями (чатом) через Firestore
 * 
 * @param {string} propertyId - ID объекта недвижимости
 * @param {string} unitId - ID юнита (опционально)
 * @param {string} userId - ID текущего пользователя
 */
export const useMessaging = (propertyId, unitId, userId) => {
    // Формируем условия запроса
    const queryConstraints = useMemo(() => {
        const constraints = [
            where('propertyId', '==', propertyId),
            orderBy('timestamp', 'asc')
        ];
        if (unitId) {
            constraints.push(where('unitId', '==', unitId));
        }
        return constraints;
    }, [propertyId, unitId]);

    // Получаем сообщения в реальном времени
    const { data: messages, loading, error } = useFirestoreCollection(
        propertyId ? 'messages' : null,
        queryConstraints
    );

    /**
     * Отправить сообщение
     */
    const sendMessage = async (text, senderRole = 'manager') => {
        if (!userId || !propertyId) {
            return { success: false, error: 'User or Property not identified' };
        }

        const messageData = {
            propertyId,
            unitId: unitId || null,
            userId,
            text,
            sender: senderRole,
            timestamp: new Date().toISOString()
        };

        // В Firestore используем авто-ID для сообщений
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const response = await firestoreOperations.setDocument('messages', messageId, messageData);

        if (response.success) {
            skynet.log(`Message sent in property ${propertyId}`, 'info', {
                userId,
                propertyId,
                type: 'chat_message'
            });
        }

        return response;
    };

    return {
        messages: messages || [],
        loading,
        error,
        sendMessage
    };
};
