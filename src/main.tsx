import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './fonts.css';
import './index.css';
import { i18nReady } from './i18n';
import { startApplication } from './lib/startApplication';

void startApplication(i18nReady, () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
