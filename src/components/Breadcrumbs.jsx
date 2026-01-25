import React from 'react';
import { HomeIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';

const Breadcrumbs = ({ paths = [], onNavigate }) => {
    const { t, language } = useLanguage();

    const homeLabel = language === 'ru' ? 'Весь Портфель' : 'Full Portfolio';

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--text-secondary)'
        }}>
            <div
                onClick={() => onNavigate('all')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    color: paths.length === 0 ? 'white' : 'var(--text-secondary)',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = paths.length === 0 ? 'white' : 'var(--text-secondary)'}
            >
                <HomeIcon size={14} fill={paths.length === 0 ? 'var(--accent-primary)' : 'currentColor'} />
                <span>{homeLabel}</span>
            </div>

            {paths.map((path, index) => (
                <React.Fragment key={index}>
                    <span style={{ opacity: 0.3 }}>/</span>
                    <span
                        onClick={() => path.id && onNavigate(path.id)}
                        style={{
                            cursor: path.id ? 'pointer' : 'default',
                            color: index === paths.length - 1 ? 'white' : 'var(--text-secondary)',
                            transition: 'color 0.2s',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        onMouseEnter={(e) => path.id && (e.currentTarget.style.color = 'white')}
                        onMouseLeave={(e) => index !== paths.length - 1 && (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        {path.label}
                    </span>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
