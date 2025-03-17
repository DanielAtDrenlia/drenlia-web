import { useEffect, useRef } from 'react';
import { i18n as i18nInstance } from 'i18next';

export const usePreserveScroll = (i18n: typeof i18nInstance) => {
  const isLanguageChanging = useRef(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      const currentPosition = window.scrollY;
      isLanguageChanging.current = true;

      // Use requestAnimationFrame to ensure we run this after the DOM updates
      requestAnimationFrame(() => {
        window.scrollTo(0, currentPosition);
        // Reset the flag after a short delay to ensure scroll is complete
        setTimeout(() => {
          isLanguageChanging.current = false;
        }, 100);
      });
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Prevent scroll restoration on mount if language is changing
  useEffect(() => {
    if (isLanguageChanging.current) {
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      window.history.scrollRestoration = 'auto';
    };
  }, []);
}; 