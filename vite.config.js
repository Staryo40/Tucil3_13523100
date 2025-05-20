import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'src/ui',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  base: './', // ✅ THIS is the fix (use relative paths for Electron)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/ui'),
    },
  },
});
