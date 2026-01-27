import { useState, useMemo, useEffect } from 'react';
import { useFirestoreCollection, firestoreOperations } from './useFirestore';
import { where, orderBy, doc, updateDoc, writeBatch, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { skynet } from '../utils/SkynetLogger';

/**
 * Хук для работы с сообщениями (чатом) через Firestore
 */
export const useMessaging = (propertyId, unitId, userId) => {
    // [NEW] Local state for optimistic updates
    const [localMessages, setLocalMessages] = useState([]);

    // Формируем условия запроса (memoize to avoid re-subscription loop)
    const queryConstraints = useMemo(() => {
        const constraints = [
            where('propertyId', '==', propertyId)
        ];
        if (unitId) {
            constraints.push(where('unitId', '==', unitId));
        }
        // [REMOVED] orderBy('timestamp') to avoid composite index requirements
        return constraints;
    }, [propertyId, unitId]);

    // Получаем сообщения в реальном времени
    const { data: firestoreMessages, loading, error } = useFirestoreCollection(
        propertyId ? 'messages' : null,
        queryConstraints
    );

    // Merge logic: prefer firestore messages, but keep pending local ones
    const messages = useMemo(() => {
        if (!firestoreMessages) return localMessages;

        const firestoreIds = new Set(firestoreMessages.map(m => m.id));
        const pending = localMessages.filter(m => !firestoreIds.has(m.id));

        const combined = [...firestoreMessages, ...pending];
        return combined.sort((a, b) => {
            const getTime = (m) => {
                if (m.timestamp?.seconds) return m.timestamp.seconds * 1000;
                if (!m.timestamp) return Date.now(); // Fallback for null serverTimestamp during sync
                return new Date(m.timestamp).getTime();
            };
            return getTime(a) - getTime(b);
        });
    }, [firestoreMessages, localMessages]);

    /**
     * Отправить сообщение
     */
    const sendMessage = async (text, senderRole = 'manager', fileUrl = null, fileType = null) => {
        if (!userId || !propertyId) return { success: false, error: 'Missing IDs' };

        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const optimisticMsg = {
            id: messageId,
            propertyId,
            unitId: unitId || null,
            userId,
            text,
            fileUrl, // [NEW] Универсальное поле для URL (вместо imageUrl)
            fileType, // [NEW] Тип файла (image, pdf, etc)
            sender: senderRole,
            timestamp: new Date().toISOString(),
            read: false,
            isPending: true
        };

        setLocalMessages(prev => [...prev, optimisticMsg]);

        const messageData = {
            ...optimisticMsg,
            timestamp: serverTimestamp(),
        };
        delete messageData.isPending;

        const response = await firestoreOperations.setDocument('messages', messageId, messageData);

        if (response.success) {
            skynet.log(`Message sent in property ${propertyId}`, 'info', { userId, propertyId, type: 'chat_message' });
        } else {
            setLocalMessages(prev => prev.filter(m => m.id !== messageId));
        }

        return response;
    };

    /**
     * Отправить файл (изображение или документ)
     */
    const sendFile = async (file, senderRole = 'manager') => {
        if (!userId || !propertyId || !file) return { success: false, error: 'Missing data' };

        try {
            const isImage = file.type.startsWith('image/');
            const fileExt = file.name.split('.').pop() || 'file';
            const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
            const storageRef = ref(storage, fileName);

            console.log(`Uploading ${file.type}: ${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Сохраняем информацию о типе файла в сообщении
            const messageText = isImage ? '[IMAGE]' : `[FILE] ${file.name}`;
            return await sendMessage(messageText, senderRole, downloadURL, file.type);
        } catch (error) {
            console.error('File upload error:', error);
            let userError = error.message;
            if (error.code === 'storage/unauthorized') userError = 'Permission Denied: Configure Storage rules in Firebase Console.';
            return { success: false, error: userError };
        }
    };

    /**
     * Отметить все сообщения как прочитанные
     */
    const markAsRead = async () => {
        if (!messages.length || !userId) return;

        try {
            const batch = writeBatch(db);
            let updatedCount = 0;

            messages.forEach(msg => {
                if (msg.userId !== userId && !msg.read) {
                    const msgRef = doc(db, 'messages', msg.id);
                    batch.update(msgRef, { read: true });
                    updatedCount++;
                }
            });

            if (updatedCount > 0) {
                await batch.commit();
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    /**
     * Установить статус "печатает"
     */
    const setTypingStatus = async (isTyping) => {
        if (!userId || !propertyId) return;
        const typingId = `typing-${propertyId}-${userId}`;
        try {
            await firestoreOperations.setDocument('typing', typingId, {
                userId,
                propertyId,
                isTyping,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error setting typing status:', error);
        }
    };

    /**
     * Форматирует дату/время сообщения
     */
    const formatMessageDate = (timestamp) => {
        if (!timestamp) return '';

        let date;
        if (timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return timeStr;
        } else {
            const dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            return `${dateStr} ${timeStr}`;
        }
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        sendFile, // [RENAMED]
        markAsRead,
        setTypingStatus,
        formatMessageDate
    };
};
