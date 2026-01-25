// Mock data for multiple properties
export const initialProperties = [
    {
        id: 'prop-1',
        name: 'Apartment A',
        type: 'rental', // 'rental' | 'construction' | 'commercial' | 'str'
        address: '123 Main St, Downtown',
        purchasePrice: 150000,
        marketValue: 180000,
        transactions: [
            { id: 1, category: 'Rent', amount: 1500, date: '2024-01-01' },
            { id: 2, category: 'Rent', amount: 1500, date: '2024-02-01' },
            { id: 3, category: 'Repair', amount: 500, date: '2024-02-15' },
            { id: 4, category: 'Rent', amount: 1500, date: '2024-03-01' }
        ],
        occupancy: { occupied: 1, total: 1 },
        contracts: [
            { id: 'c1', tenantName: 'Michael Johnson', startDate: '2025-06-01', endDate: '2026-05-31', monthlyRent: 1500, depositAmount: 3000, status: 'active' }
        ]
    },
    {
        id: 'prop-2',
        name: 'Project Alpha',
        type: 'construction',
        address: 'Lot 45, New Development Zone',
        purchasePrice: 200000,
        marketValue: 250000,
        progress: 35,
        statusMessage: "Foundation Complete. Structural framing in progress.",
        installments: [
            { date: '2023-11-01', amount: 20000, stage: 'Down Payment (10%)', status: 'paid' },
            { date: '2024-01-15', amount: 20000, stage: 'Foundation (10%)', status: 'paid' },
            { date: '2024-05-01', amount: 30000, stage: 'Structure (15%)', status: 'due' },
            { date: '2024-09-01', amount: 30000, stage: 'Cladding (15%)', status: 'upcoming' },
            { date: '2025-01-01', amount: 100000, stage: 'Completion (50%)', status: 'upcoming' },
        ]
    },
    {
        id: 'prop-3',
        name: 'Retail Space B',
        type: 'commercial',
        address: '500 Commerce Blvd, Suite 101',
        purchasePrice: 300000,
        marketValue: 320000,
        transactions: [
            { id: 1, category: 'Rent', amount: 3500, date: '2024-01-01' },
            { id: 2, category: 'CAM', amount: 200, date: '2024-01-05' },
            { id: 3, category: 'Rent', amount: 3500, date: '2024-02-01' },
        ],
        occupancy: { occupied: 1, total: 1 },
        leaseType: 'NNN'
    },
    {
        id: 'prop-4',
        name: 'Beach House STR',
        type: 'str', // Short-Term Rental
        address: '88 Oceanview Dr, Coastal City',
        purchasePrice: 400000,
        marketValue: 450000,
        bookings: [
            { id: 'b1', checkIn: '2026-01-01', checkOut: '2026-01-05', guestName: 'Historical Guest', totalPrice: 800, type: 'guest', status: 'confirmed' },
            { id: 'b-m1', checkIn: '2026-01-10', checkOut: '2026-01-12', guestName: '🔧 HVAC Repair', type: 'maintenance', status: 'blocked' },
            { id: 'b2', checkIn: '2026-01-15', checkOut: '2026-01-20', guestName: 'Sarah M.', totalPrice: 1000, type: 'guest', status: 'confirmed' },
            { id: 'b3', checkIn: '2026-01-25', checkOut: '2026-01-28', guestName: 'Owner Block', totalPrice: 0, type: 'guest', status: 'blocked' },
        ],
        occupancy: { occupied: 1, total: 1 }
    }
];
