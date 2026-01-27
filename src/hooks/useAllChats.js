import { useMemo } from 'react';
import { useFirestoreCollection } from './useFirestore';
import { orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../utils/NotificationManager';
import { useEffect, useRef } from 'react';

/**
 * Хук для получения списка всех чатов
 * Агрегирует сообщения и группирует их по объектам/юнитам
 */
export const useAllChats = () => {
    const { currentUser, isAdmin } = useAuth();

    // Получаем последние 100 сообщений
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
            let key;
            if (msg.propertyId === 'support') {
                // Техподдержка: админ видит чаты по пользователям, 
                // обычный пользователь видит только свой чат.
                key = isAdmin ? `support_${msg.userId}` : 'support_global';
            } else {
                key = msg.unitId ? `${msg.propertyId}_${msg.unitId}` : msg.propertyId;
            }

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    propertyId: msg.propertyId,
                    unitId: msg.unitId,
                    userId: msg.userId, // Важно для поддержки
                    lastMessage: msg,
                    unreadCount: 0,
                    isSupport: msg.propertyId === 'support'
                };
            }

            // [NEW] Увеличиваем счетчик непрочитанных
            // Сообщение считается непрочитанным, если:
            // 1. Оно не прочитано (read: false)
            // 2. Его отправил НЕ текущий пользователь
            const isManager = isAdmin;
            const messageFromOthers = isManager ? msg.sender !== 'manager' : msg.sender === 'manager';

            if (msg.read === false && messageFromOthers) {
                groups[key].unreadCount++;
            }
        });

        return Object.values(groups).sort((a, b) => {
            const timeA = a.lastMessage.timestamp?.seconds ? a.lastMessage.timestamp.seconds * 1000 : new Date(a.lastMessage.timestamp || 0).getTime();
            const timeB = b.lastMessage.timestamp?.seconds ? b.lastMessage.timestamp.seconds * 1000 : new Date(b.lastMessage.timestamp || 0).getTime();
            return timeB - timeA;
        });
    }, [messages, isAdmin]);

    // [NEW] Notification Logic
    const lastNotifiedMsgId = useRef(null);

    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const latestMsg = messages[0]; // messages are sorted by desc in hook
        if (lastNotifiedMsgId.current === latestMsg.id) return;

        // Check if we should notify
        const isManager = isAdmin;
        const fromOthers = isManager ? latestMsg.sender !== 'manager' : latestMsg.sender === 'manager';

        if (fromOthers && lastNotifiedMsgId.current !== null) {
            notifications.notify(
                `New Message`,
                latestMsg.text.length > 50 ? latestMsg.text.substring(0, 47) + '...' : latestMsg.text
            );
        }

        lastNotifiedMsgId.current = latestMsg.id;
    }, [messages, isAdmin]);

    return {
        chats: chatList,
        loading,
        error
    };
};
