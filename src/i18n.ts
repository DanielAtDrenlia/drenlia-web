import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS: 'common',
    ns: ['common', 'about', 'home', 'contact', 'projects', 'services'],
    
    // Language detection options
    detection: {
      order: ['path', 'navigator'],
      lookupFromPathIndex: 0,
      checkWhitelist: true
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n; 