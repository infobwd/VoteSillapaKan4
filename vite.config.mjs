import { defineConfig } from 'vite';

const base = process.env.APP_BASE || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
  throw new Error('APP_BASE must be an absolute path ending in / (example: /vote-staging/)');
}
export default defineConfig({
  base,
  build: { outDir: 'dist', emptyOutDir: true },
  server: { host: '127.0.0.1' }
});
