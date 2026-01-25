import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized (< 768px)
 * @returns {boolean} isMobile
 */
export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResize = (e) => setIsMobile(e.matches);

        // Modern browsers
        mediaQuery.addEventListener('change', handleResize);

        return () => {
            mediaQuery.removeEventListener('change', handleResize);
        };
    }, []);

    return isMobile;
};
