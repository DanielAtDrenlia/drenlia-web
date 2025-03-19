import { useEffect, useRef } from 'react';
import type { i18n } from 'i18next';

export const usePreserveScroll = (i18n: i18n) => {
  const scrollPosition = useRef(0);
  const isLanguageChanging = useRef(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      isLanguageChanging.current = true;
      scrollPosition.current = window.scrollY;
    };

    const handleLanguageChanged = () => {
      // Wait for the next render cycle to ensure the new content is rendered
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition.current,
          behavior: 'auto'
        });
        isLanguageChanging.current = false;
      });
    };

    // Store the current scroll position when language change starts
    i18n.on('languageChanged', handleLanguageChange);
    
    // Restore scroll position after language change is complete
    i18n.on('languageChanged', handleLanguageChanged);

    // Prevent scroll restoration on mount if we're changing language
    if (isLanguageChanging.current) {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleLanguageChanged);
      
      // Reset scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [i18n]);
}; 