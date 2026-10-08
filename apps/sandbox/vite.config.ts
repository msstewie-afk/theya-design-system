import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The DS is imported from source, and its files resolve `react` from
    // their own package. Dedupe keeps a single React instance either way
    // (two copies break hooks and context).
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      // Theya components carry 'use client' (for Next.js); Vite ignores it
      // and Rollup would warn once per file.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
        warn(warning);
      },
    },
  },
});
