import { defineConfig } from 'astro/config';

// Static-only: no adapter, no SSR. `astro build` emits plain files into dist/
// that can be served by any static host (or opened straight off disk).
export default defineConfig({
  // По умолчанию сайт в корне своего домена.
  // Для проверки на github.io: BASE_PATH=/food_bot npm run deploy
  site: process.env.BASE_PATH ? 'https://selyvin911.github.io' : 'https://ymaxim.com',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  compressHTML: true,
  build: {
    // index.html at the root instead of nested directories — friendlier for
    // dumb static hosts and file:// previews.
    format: 'file',
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
