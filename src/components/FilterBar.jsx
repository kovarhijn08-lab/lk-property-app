import React from 'react';
import { getTagColor } from '../utils/tagUtils';
import { useLanguage } from '../context/LanguageContext';

/**
 * FilterBar Component (P3.3)
 * @param {Array} availableTags - All unique tags present in the dataset
 * @param {Array} selectedTags - Currently active tag filters
 * @param {Function} onTagToggle - Callback when a tag is clicked
 * @param {Object} extraFilters - Other filters (type, status, etc)
 * @param {Function} onExtraFilterChange
 */
const FilterBar = ({
    availableTags = [],
    selectedTags = [],
    onTagToggle,
    types = [],
    selectedType = 'all',
    onTypeChange,
    statuses = [],
    selectedStatus = 'all',
    onStatusChange
}) => {
    const { t } = useLanguage();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '24px'
        }}>
            {/* Tag Chips */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '8px' }}>{t('filters.title')}:</span>
                {availableTags.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>{t('filters.noTags')}</span>
                )}
                {availableTags.map(tag => {
                    const isActive = selectedTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onTagToggle(tag)}
                            style={{
                                background: isActive ? getTagColor(tag) : 'rgba(255,255,255,0.03)',
                                border: isActive ? `1px solid ${getTagColor(tag)}` : '1px solid var(--glass-border)',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: isActive ? 700 : 400
                            }}
                        >
                            #{tag}
                        </button>
                    );
                })}
                {selectedTags.length > 0 && (
                    <button
                        onClick={() => selectedTags.forEach(t => onTagToggle(t))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-danger)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {t('common.cancel')}
                    </button>
                )}
            </div>

            {/* Basic Filters (Type/Status) */}
            <div style={{ display: 'flex', gap: '12px' }}>
                {onTypeChange && (
                    <select
                        value={selectedType}
                        onChange={(e) => onTypeChange(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    >
                        <option value="all">{t('filters.propertyType')}</option>
                        {types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                )}

                {onStatusChange && (
                    <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    >
                        <option value="all">{t('filters.status')}</option>
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
