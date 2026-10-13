import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { contentVisibilityPlugin } from './scripts/lib/content-visibility-plugin.mjs';
import { allowSourcedFromEnv } from './scripts/lib/visibility.mjs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root, 'VITE_');
  return {
    plugins: [
      // Keeps draft, archived and other non-public content out of the
      // production bundle. Build only; `vite` dev still shows drafts locally.
      contentVisibilityPlugin({
        root,
        allowSourced: allowSourcedFromEnv(env.VITE_ALLOW_SOURCED_CONTENT),
      }),
      react(),
      tailwindcss(),
    ],
    assetsInclude: ['**/*.md'],
  };
});
