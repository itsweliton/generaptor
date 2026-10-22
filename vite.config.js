import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const site = process.env.BUILD_TARGET === 'site';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: site
    ? { outDir: 'site', emptyOutDir: true }
    : {
        lib: {
          entry: 'src/index.js',
          name: 'Generaptor',
          formats: ['es', 'cjs'],
          fileName: (format) => (format === 'es' ? 'generaptor.js' : 'generaptor.cjs'),
        },
        rollupOptions: {
          output: {
            exports: 'named',
          },
          external: (id) =>
            id === 'react' ||
            id === 'react-dom' ||
            id === 'react/jsx-runtime' ||
            id.startsWith('@mui/') ||
            id.startsWith('@emotion/') ||
            id === 'date-fns' ||
            id.startsWith('date-fns/'),
        },
      },
});
