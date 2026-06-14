import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti 'ekas-nu' dengan nama repository GitHub yang baru saja Anda buat
export default defineConfig({
  plugins: [react()],
  base: '/ekas-nu/',
})
