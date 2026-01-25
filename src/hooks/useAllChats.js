import { useMemo } from 'react';
import { useFirestoreCollection } from './useFirestore';
import { orderBy, limit } from 'firebase/firestore';

/**
 * Хук для получения списка всех чатов
 * Агрегирует сообщения и группирует их по объектам/юнитам
 */
export const useAllChats = () => {
    // Получаем последние 100 сообщений (для MVP достаточно, в будущем нужна пагинация)
    const queryConstraints = useMemo(() => [
        orderBy('timestamp', 'desc'),
        limit(100)
    ], []);

    const { data: messages, loading, error } = useFirestoreCollection('messages', queryConstraints);

    // Группируем сообщения по propertyId (и unitId, если есть)
    // чтобы создать список "чатов"
    const chatList = useMemo(() => {
        if (!messages) return [];

        const groups = {};

        messages.forEach(msg => {
            const key = msg.unitId ? `${msg.propertyId}_${msg.unitId}` : msg.propertyId;

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    propertyId: msg.propertyId,
                    unitId: msg.unitId,
                    lastMessage: msg,
                    unreadCount: 0 // Пока нет статуса прочитанности
                };
            }
        });

        return Object.values(groups).sort((a, b) =>
            new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
    }, [messages]);

    return {
        chats: chatList,
        loading,
        error
    };
};
