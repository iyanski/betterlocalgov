import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { DEFAULT_LANGUAGE, LANGUAGES } from './i18n/languages';

export const i18nReady = i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    // Only enabled languages; scaffolded ones (fil, ilo, ibg) are rejected.
    supportedLngs: Object.keys(LANGUAGES),
    // An empty string in a locale file falls back to English.
    returnEmptyString: false,
    load: 'languageOnly',
    debug: import.meta.env.DEV,
    defaultNS: 'common',
    ns: ['common'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
