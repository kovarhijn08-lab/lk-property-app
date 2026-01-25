import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'ru' as requested, otherwise check localStorage
    const [lang, setLang] = useState(localStorage.getItem('pocket_ledger_lang') || 'ru');

    useEffect(() => {
        localStorage.setItem('pocket_ledger_lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => {
        const keys = key.split('.');
        let val = translations[lang];

        for (const k of keys) {
            if (val && val[k]) {
                val = val[k];
            } else {
                return key; // Return the key itself if translation is missing
            }
        }
        return val;
    };

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'ru' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
