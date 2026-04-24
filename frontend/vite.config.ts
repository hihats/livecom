import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/sessions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
      '/healthz': 'http://localhost:8000',
    },
  },
})
