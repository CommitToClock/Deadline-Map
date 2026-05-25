import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: '/deadline_map.html'
  },
  preview: {
    open: '/deadline_map.html'
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
