// Vitest config — separate from vite.config.ts so the Vite build never
// sees the `test` block and the two tools resolve their own copies of
// Vite without colliding.
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // No plugins — vitest uses esbuild internally which handles TS + JSX.
  // Adding @vitejs/plugin-react here trips a duplicate-Vite type clash
  // because the plugin resolves Vite from the top-level node_modules
  // while vitest bundles its own copy. Tests have run fine without it.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    // jsdom defaults to http://localhost/, but our referral and SEO helpers
    // read window.location. Ground them in our real origin so test output
    // is predictable and replaceState() doesn't trip the cross-origin guard.
    environmentOptions: {
      jsdom: { url: 'https://mensaproducts.com/' },
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
