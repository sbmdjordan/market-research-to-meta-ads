import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, the Vite server (5173) proxies /api/* to the Express backend (8787)
// that holds the API keys. In prod, Express serves the built app and the API
// from one process, so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
