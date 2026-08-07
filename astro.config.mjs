import { defineConfig } from 'astro/config';

// Static-only: no adapter, no SSR. `astro build` emits plain files into dist/
// that can be served by any static host (or opened straight off disk).
export default defineConfig({
  // Собственный домен, поэтому сайт живёт в корне и `base` не нужен.
  site: 'https://ymaxim.com',
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
