import React, { useEffect, useRef } from 'react';
import { firestoreOperations } from '../hooks/useFirestore';

/**
 * Silent Migration Helper - воркер для фонового переноса данных.
 * Не имеет собственного UI. Общается с App.jsx через onComplete и onError.
 */
const MigrationHelper = ({ userId, onComplete, onError, propertiesInCloudCount = 0 }) => {
    const migrationStarted = useRef(false);

    useEffect(() => {
        // Запускаем миграцию только один раз при монтировании
        if (migrationStarted.current || !userId) return;

        const performMigration = async () => {
            migrationStarted.current = true;
            console.log('[Silent Sync] Starting background check...');

            try {
                // 1. Проверяем локальные данные по разным ключам
                let localPropertiesStr = localStorage.getItem('pocketLedger_properties');
                if (!localPropertiesStr) {
                    localPropertiesStr = localStorage.getItem('properties');
                }

                if (!localPropertiesStr) {
                    console.log('[Silent Sync] No local data found. Skipping.');
                    localStorage.setItem('pocketLedger_migrated', 'no_data');
                    onComplete(0, false);
                    return;
                }

                const localProperties = JSON.parse(localPropertiesStr);
                if (!Array.isArray(localProperties) || localProperties.length === 0) {
                    localStorage.setItem('pocketLedger_migrated', 'no_data');
                    onComplete(0, false);
                    return;
                }

                // 2. Логика разрешения конфликтов
                // Если в облаке уже есть данные, мы не переносим их молча, 
                // чтобы не создать дублей или не перезаписать важное.
                if (propertiesInCloudCount > 0) {
                    console.log('[Silent Sync] Conflict detected: Cloud not empty.');
                    onError('conflict', localProperties);
                    return;
                }

                console.log(`[Silent Sync] Migrating ${localProperties.length} items to cloud...`);

                // 3. Перенос данных
                let migratedCount = 0;
                for (const property of localProperties) {
                    await firestoreOperations.setDocument(
                        'properties',
                        property.id,
                        {
                            ...property,
                            userId,
                            migratedAt: new Date().toISOString(),
                            syncStatus: 'synced'
                        }
                    );
                    migratedCount++;
                }

                // 4. Успех
                localStorage.setItem('pocketLedger_migrated', 'true');
                console.log(`[Silent Sync] Successfully migrated ${migratedCount} items.`);
                onComplete(migratedCount, true);

            } catch (error) {
                console.error('[Silent Sync] Migration error:', error);
                onError('error', error.message);
            }
        };

        performMigration();
    }, [userId, propertiesInCloudCount]);

    return null; // Компонент ничего не рендерит
};

export default MigrationHelper;
