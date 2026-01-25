import React, { useState } from 'react';

const terms = [
    { term: 'Cap Rate', definition: 'Capitalization Rate. Annual net operating income divided by property price. Higher = better returns, but often higher risk.' },
    { term: 'Cash Flow', definition: 'Money left after all expenses (mortgage, taxes, repairs) are paid. Positive cash flow = profit.' },
    { term: 'NOI', definition: 'Net Operating Income. Gross income minus operating expenses (not including mortgage). Used to calculate Cap Rate.' },
    { term: 'Cash-on-Cash', definition: 'Annual cash flow divided by total cash invested. Measures return on your actual out-of-pocket investment.' },
    { term: 'Equity', definition: 'The portion of the property you own. Market Value minus Loan Balance.' },
    { term: 'LTV', definition: 'Loan-to-Value ratio. Loan amount divided by property value. Lower LTV = more equity, less risk.' },
    { term: 'DSCR', definition: 'Debt Service Coverage Ratio. NOI divided by debt payments. Above 1.0 means income covers debt.' },
    { term: 'ADR', definition: 'Average Daily Rate. Total rental income divided by nights rented. Key metric for short-term rentals.' },
    { term: 'RevPAR', definition: 'Revenue Per Available Room. ADR × Occupancy Rate. Combines rate and occupancy for true performance.' },
    { term: 'NNN Lease', definition: 'Triple Net Lease. Tenant pays rent plus taxes, insurance, and maintenance. Common in commercial real estate.' },
    { term: 'CAM', definition: 'Common Area Maintenance. Fees for shared spaces in commercial properties (lobbies, parking, landscaping).' },
    { term: 'Off-Plan', definition: 'Property purchased before construction is complete. Often at discount, but carries developer risk.' },
    { term: 'Appreciation', definition: 'Increase in property value over time. Can be "forced" (renovations) or "market" (area growth).' },
    { term: 'Vacancy Rate', definition: 'Percentage of time a unit is empty. Lower is better. Budget 5-10% for most markets.' },
];

const TermDictionary = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTerms = terms.filter(t =>
        t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 200,
            padding: '0'
        }}>
            <div className="glass-panel" style={{
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                borderRadius: '24px 24px 0 0',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>📚 Real Estate Dictionary</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        border: 'var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        marginBottom: '16px'
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredTerms.map(t => (
                        <div key={t.term} style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>{t.term}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.definition}</div>
                        </div>
                    ))}
                </div>

                {filteredTerms.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No terms found.</p>
                )}
            </div>
        </div>
    );
};

export default TermDictionary;
