import { useEffect, useRef } from 'react';
import { i18n } from 'i18next';

export const usePreserveScroll = (i18n: i18n) => {
  const isLanguageChanging = useRef(false);

  useEffect(() => {
    const scrollPosition = window.scrollY;

    const handleLanguageChange = () => {
      isLanguageChanging.current = true;
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        isLanguageChanging.current = false;
      }, 0);
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