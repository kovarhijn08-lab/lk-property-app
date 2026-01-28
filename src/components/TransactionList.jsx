import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrashIcon, EditIcon, DollarIcon, ExportIcon } from './Icons';
import EmptyState from './EmptyState';
import FilterBar from './FilterBar'; // [NEW]
import { getUniqueTags, getTagColor, matchTags } from '../utils/tagUtils'; // [NEW]

const TransactionList = ({ transactions, onUpdate, onDelete }) => {
    const { t } = useLanguage();
    const [editingTx, setEditingTx] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
    const [dateRange, setDateRange] = useState('all'); // 'all', 'month', 'ytd'
    const [selectedTags, setSelectedTags] = useState([]); // [NEW]

    const handleEdit = (tx) => {
        setEditingTx(tx.id);
        setEditAmount(tx.amount.toString());
    };

    const handleSave = (tx) => {
        onUpdate({ ...tx, amount: parseFloat(editAmount) || tx.amount });
        setEditingTx(null);
    };

    // Filter by type
    let filtered = transactions;
    if (filter === 'income') {
        filtered = filtered.filter(t => t.category === 'Rent');
    } else if (filter === 'expense') {
        filtered = filtered.filter(t => t.category !== 'Rent');
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
    } else if (dateRange === 'ytd') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(t => new Date(t.date) >= startOfYear);
    }

    // [NEW] Filter by tags
    filtered = filtered.filter(t => matchTags(t, selectedTags));

    const availableTags = getUniqueTags(transactions);

    const getTypeColor = (category) => category === 'Rent' ? 'var(--accent-success)' : 'var(--accent-danger)';

    if (!transactions || transactions.length === 0) {
        return (
            <EmptyState
                icon="💰"
                title={t('finance.noTransactions') || 'No Financial History'}
                description="Add transactions to start tracking your performance and calculating ROI."
                variant="glass"
            />
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>{t('finance.milestones') || 'Ledger'}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + ["Date", "Category", "Amount"].join(",") + "\n"
                                + transactions.map(t => [t.date, t.category, t.amount].join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "transactions.csv");
                            document.body.appendChild(link);
                            link.click();
                        }}
                        style={{
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        title="Export CSV"
                    >
                        📥 CSV
                    </button>
                    {/* Type Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">{t('finance.allTypes')}</option>
                        <option value="income">{t('finance.income')}</option>
                        <option value="expense">{t('finance.capex')}</option>
                    </select>
                    {/* Date Filter */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">{t('finance.allTime')}</option>
                        <option value="month">{t('finance.lastMonth')}</option>
                        <option value="ytd">{t('finance.ytd')}</option>
                    </select>
                </div>
            </div>

            {/* [NEW] Filter Bar Integration */}
            <FilterBar
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagToggle={(tag) => {
                    setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map(tx => (
                    <div key={tx.id} className="tx-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)',
                        borderLeft: `4px solid ${getTypeColor(tx.category)}`,
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '140px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: tx.category === 'Rent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getTypeColor(tx.category)
                            }}>
                                {tx.category === 'Rent' ? <DollarIcon size={20} /> : <ExportIcon size={20} style={{ transform: 'rotate(180deg)' }} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', letterSpacing: '-0.3px' }}>{tx.category === 'Rent' ? t('finance.rentIncome') : tx.category}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600, opacity: 0.8 }}>{tx.date}</div>

                                {/* [NEW] Tags Display */}
                                {tx.tags && tx.tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                        {tx.tags.map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    background: getTagColor(tag),
                                                    fontSize: '0.6rem',
                                                    padding: '1px 6px',
                                                    borderRadius: '4px',
                                                    color: 'white',
                                                    fontWeight: 700
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'flex-end', flex: 1 }}>
                            {editingTx === tx.id ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        autoFocus
                                        style={{
                                            width: '90px',
                                            padding: '8px 12px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid var(--accent-primary)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            outline: 'none',
                                            fontFamily: 'var(--font-display)'
                                        }}
                                    />
                                    <button onClick={() => handleSave(tx)} style={{ background: 'var(--accent-success)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>✓</button>
                                    <button onClick={() => setEditingTx(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '4px' }}>×</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 950, color: getTypeColor(tx.category), fontSize: '1.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                                        {tx.category === 'Rent' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(tx)}
                                            className="action-btn"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        >
                                            <EditIcon size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(tx.id)}
                                            className="action-btn-danger"
                                            style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)', color: 'var(--accent-danger)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        >
                                            <TrashIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '24px', fontSize: '0.9rem' }}>{t('common.searchFail') || 'No transactions match your filters.'}</p>
            )}
        </div>
    );
};

export default TransactionList;
