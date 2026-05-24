import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Updated for GitHub Pages deployment. 
  // This must match your repository name exactly!
  base: '/twinkly-nails/', 
})