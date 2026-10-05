import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === 'production'
      ? process.env.GITHUB_REPOSITORY
        ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
        : '/studyhub/'
      : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
