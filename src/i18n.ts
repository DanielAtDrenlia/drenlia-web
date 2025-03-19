import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { InitOptions } from 'i18next';

const config: InitOptions = {
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en'],
  defaultNS: 'common',
  ns: ['common', 'about', 'home', 'contact', 'projects', 'services'],

  detection: {
    order: ['navigator', 'htmlTag', 'path', 'subdomain'],
    lookupFromPathIndex: 0,
  },

  interpolation: {
    escapeValue: false, // React already safes from xss
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  react: {
    useSuspense: true,
  },
};

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init(config);

export default i18n; 