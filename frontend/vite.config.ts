import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/** SPA fallback for site routes. No disk, RAG, or inbox. */
function siteSpa(): Plugin {
  return {
    name: 'site-spa',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        const spa =
          path === '/site' ||
          path.startsWith('/site/') ||
          path === '/demo' ||
          path.startsWith('/demo/') ||
          path === '/projects' ||
          path.startsWith('/projects/')
        if (spa) req.url = '/index.html'
        next()
      })
    },
  }
}

const apiTarget = process.env.VITE_API_ORIGIN || 'http://127.0.0.1:5175'

export default defineConfig({
  plugins: [react(), siteSpa()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
