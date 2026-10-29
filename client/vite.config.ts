import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://neutron-g9b0.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

