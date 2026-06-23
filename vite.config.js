import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.20.148:8082',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://192.168.20.148:8082',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
