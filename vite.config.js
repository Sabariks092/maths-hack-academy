import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const pages = ['register', 'certificate', 'admin']

// Vite only serves /register/ (trailing slash) as the page; /register would fall
// back to the home page. Redirect the slash-less URL in dev and preview.
function trailingSlashRedirect() {
  const middleware = (req, res, next) => {
    const [path, query = ''] = (req.url || '').split('?')
    const page = path.replace(/^\/|\/$/g, '')
    if (pages.includes(page) && !path.endsWith('/')) {
      res.statusCode = 301
      res.setHeader('Location', `/${page}/${query ? `?${query}` : ''}`)
      res.end()
      return
    }
    next()
  }
  return {
    name: 'trailing-slash-redirect',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

// https://vite.dev/config/
// Multi-page build: the landing page plus the two standalone form pages.
export default defineConfig({
  plugins: [trailingSlashRedirect(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}/index.html`)])),
      },
    },
  },
})
