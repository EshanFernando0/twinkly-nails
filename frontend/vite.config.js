import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          calendar: ['react-big-calendar', 'moment'],
        }
      }
    }
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  }
})
