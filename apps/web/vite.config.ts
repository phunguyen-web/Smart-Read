import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { mobiConvertPlugin } from './vite-plugin-mobi.ts'

export default defineConfig({
  plugins: [react(), mobiConvertPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs'
          }
          if (id.includes('node_modules/docx')) {
            return 'docx'
          }
          if (id.includes('node_modules/pdf-lib')) {
            return 'pdf-lib'
          }
          if (id.includes('node_modules/@pdf-lib')) {
            return 'fontkit'
          }
          if (id.includes('node_modules/jszip')) {
            return 'jszip'
          }
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
})
