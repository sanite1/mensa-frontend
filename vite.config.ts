// Vite build / dev config only. The Vitest config lives in vitest.config.ts
// alongside this file — keeping them split avoids a type clash between Vite
// at the top level and the copy of Vite that vitest bundles internally.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
