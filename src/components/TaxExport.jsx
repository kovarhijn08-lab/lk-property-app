import React from 'react';

const TaxExport = ({ properties }) => {
    const generateCSV = () => {
        // Flatten all transactions from all properties
        let allTransactions = [];
        properties.forEach(p => {
            if (p.transactions && p.transactions.length > 0) {
                const propertyTransactions = p.transactions.map(t => ({
                    ...t,
                    propertyName: p.name,
                    propertyType: p.type
                }));
                allTransactions = [...allTransactions, ...propertyTransactions];
            }
        });

        // Sort by date descending
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Define CSV Headers
        const headers = [
            'Date',
            'Property Name',
            'Type',
            'Category',
            'Expense Type',
            'Amount',
            'Vendor',
            'Description'
        ];

        // Format Rows
        const rows = allTransactions.map(t => [
            t.date ? new Date(t.date).toLocaleDateString() : '',
            `"${t.propertyName.replace(/"/g, '""')}"`, // Escape quotes
            t.propertyType,
            t.category,
            t.category === 'Rent' ? 'Income' : (t.expenseType === 'capex' ? 'CapEx' : 'OpEx'),
            t.amount,
            t.vendorId || '',
            `"${(t.description || '').replace(/"/g, '""')}"`
        ]);

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Create Blob and Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `smart_ledger_tax_pack_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={generateCSV}
            style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px'
            }}
        >
            📄 Download Tax Pack (CSV)
        </button>
    );
};

export default TaxExport;
