/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
