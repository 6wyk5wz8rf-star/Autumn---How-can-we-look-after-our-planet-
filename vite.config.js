import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: ['es2022', 'safari16'],
    sourcemap: true,
    assetsInlineLimit: 4096,
  },
});
