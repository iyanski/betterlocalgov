import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Introduced in eslint-plugin-react-hooks 7. Existing data-loading
      // effects trip it; kept as a warning until they are refactored.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Build-time renderer: never loaded in the browser, so Fast Refresh
    // constraints do not apply.
    files: ['src/prerender/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
