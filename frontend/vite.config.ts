import { Agent } from 'node:http'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

const apiAgent = new Agent({ keepAlive: false, maxSockets: 8 })

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
          path === '/docs' ||
          path.startsWith('/docs/') ||
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
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    // Do not watch board rasters / PDFs — they are disk, not HMR sources.
    watch: {
      ignored: ['**/data/boards/**', '**/data/papers/pdf/**', '**/data/index/**', '**/inbox/latest.png'],
    },
    // Tailscale CGNAT (e.g. 100.107.135.79) and LAN names; do not block 100.64/10.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        timeout: 12_000,
        proxyTimeout: 12_000,
        agent: apiAgent,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            if (proxyReq.headersSent) return
            try {
              proxyReq.setHeader('Connection', 'close')
            } catch {
              // headers already flushed — keep-alive is already off via agent
            }
          })
          proxy.on('error', (_err, _req, res) => {
            try {
              if (!res || res.headersSent || res.writableEnded) return
              res.writeHead(502, { 'Content-Type': 'application/json', Connection: 'close' })
              res.end(JSON.stringify({ ok: false, error: 'api proxy' }))
            } catch {
              // never crash Vite over a dead proxy socket
            }
          })
        },
      },
    },
  },
})
