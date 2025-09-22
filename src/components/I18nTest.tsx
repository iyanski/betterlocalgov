import { useTranslation } from 'react-i18next';

export default function I18nTest() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">i18n Test</h2>
      <p className="mb-2">Current language: {i18n.language}</p>
      <p className="mb-4">Translation test: {t('hero.title')}</p>
      <div className="space-x-2">
        <button
          onClick={() => changeLanguage('en')}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('fil')}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Filipino
        </button>
      </div>
    </div>
  );
}
