import { useMemo } from 'react';

/**
 * Хук для функционала глобального поиска (P3.2)
 * @param {Array} properties - Список всех доступных объектов из useProperties
 * @param {Object} currentUser - Текущий пользователь из AuthContext
 */
export const useSearch = (properties, currentUser) => {
    const userId = currentUser?.id;
    const role = currentUser?.role;

    const performSearch = (query) => {
        if (!query || query.length < 2) return [];

        const normalizedQuery = query.toLowerCase().trim();
        const results = [];

        properties.forEach(prop => {
            // 1. Search in Properties
            if (
                prop.name?.toLowerCase().includes(normalizedQuery) ||
                prop.address?.toLowerCase().includes(normalizedQuery)
            ) {
                results.push({
                    id: prop.id,
                    type: 'property',
                    label: prop.name,
                    secondary: prop.address || 'No address',
                    linkTarget: 'dashboard',
                    propertyId: prop.id
                });
            }

            // 2. Search in Tenants (if any)
            if (prop.units) {
                prop.units.forEach(unit => {
                    if (unit.tenant?.toLowerCase().includes(normalizedQuery)) {
                        results.push({
                            id: `unit-${unit.id}-${prop.id}`,
                            type: 'user',
                            label: unit.tenant,
                            secondary: `Resident at ${prop.name} (Unit ${unit.name || unit.id})`,
                            linkTarget: 'dashboard',
                            propertyId: prop.id,
                            unitId: unit.id
                        });
                    }
                });
            }

            // 3. Search in Contracts
            if (prop.contracts) {
                prop.contracts.forEach(contract => {
                    if (
                        contract.tenantName?.toLowerCase().includes(normalizedQuery) ||
                        contract.id?.toLowerCase().includes(normalizedQuery)
                    ) {
                        results.push({
                            id: contract.id,
                            type: 'contract',
                            label: `Lease: ${contract.tenantName}`,
                            secondary: `${prop.name} | Ends: ${contract.endDate}`,
                            linkTarget: 'legal',
                            propertyId: prop.id
                        });
                    }
                });
            }

            // 4. Search in Transactions
            if (prop.transactions) {
                prop.transactions.forEach((tx, idx) => {
                    if (
                        tx.description?.toLowerCase().includes(normalizedQuery) ||
                        tx.category?.toLowerCase().includes(normalizedQuery) ||
                        tx.amount?.toString().includes(normalizedQuery)
                    ) {
                        results.push({
                            id: `tx-${idx}-${prop.id}`,
                            type: 'transaction',
                            label: `${tx.category}: ${tx.amount}`,
                            secondary: `${prop.name} | ${tx.description || 'No description'}`,
                            linkTarget: 'dashboard',
                            propertyId: prop.id
                        });
                    }
                });
            }
        });

        // Limit results to top 10
        return results.slice(0, 10);
    };

    return { performSearch };
};
