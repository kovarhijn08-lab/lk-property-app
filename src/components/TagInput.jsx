import React, { useState } from 'react';
import { getTagColor } from '../utils/tagUtils';
import { useLanguage } from '../context/LanguageContext';

/**
 * TagInput Component (P3.3)
 * @param {Array} tags - Current tags
 * @param {Function} onChange - Callback for tag list changes
 * @param {Array} suggestions - Optional list of existing tags for autocomplete
 */
const TagInput = ({ tags = [], onChange, suggestions = [] }) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = inputValue.trim().replace(/^#/, '');
            if (val && !tags.includes(val)) {
                onChange([...tags, val]);
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            alignItems: 'center',
            minHeight: '44px'
        }}>
            {tags.map(tag => (
                <span
                    key={tag}
                    style={{
                        background: getTagColor(tag),
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    #{tag}
                    <button
                        onClick={() => removeTag(tag)}
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                        }}
                    >
                        ×
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? t('filters.addTag') : ""}
                style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem',
                    minWidth: '120px'
                }}
            />
        </div>
    );
};

export default TagInput;
