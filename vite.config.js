import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Cargar variables de .env en process.env para el plugin del servidor
try {
  const envPath = resolve(process.cwd(), '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
} catch {
  // Si no existe .env, continuar (las vars pueden venir del sistema)
}

// Plugin que simula las Vercel Serverless Functions en desarrollo local
function vercelApiPlugin() {
  return {
    name: 'vite-plugin-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Solo interceptar rutas /api/*
        if (!req.url?.startsWith('/api/')) return next()

        // Extraer el nombre del endpoint (e.g., /api/generate → generate)
        const endpoint = req.url.replace('/api/', '').split('?')[0]

        // Intentar varias extensiones (Vercel soporta .mjs, .js, .ts)
        const extensions = ['.mjs', '.js', '.ts']
        let mod = null
        for (const ext of extensions) {
          try {
            const modulePath = new URL(`./api/${endpoint}${ext}`, import.meta.url).pathname
            mod = await import(`${modulePath}?t=${Date.now()}`)
            break
          } catch { /* intentar siguiente extensión */ }
        }

        if (!mod) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `No se encontró /api/${endpoint}` }))
          return
        }

        try {
          const handler = mod.default

          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.end(JSON.stringify({ error: `No se encontró handler para /api/${endpoint}` }))
            return
          }

          // Leer el body si es POST/PUT/PATCH
          let body = ''
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            body = await new Promise((resolve) => {
              let data = ''
              req.on('data', (chunk) => (data += chunk))
              req.on('end', () => resolve(data))
            })
          }

          // Crear objetos req/res compatibles con Vercel serverless
          const fakeReq = {
            method: req.method,
            headers: req.headers,
            body: body ? JSON.parse(body) : {},
            query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams),
          }

          const fakeRes = {
            statusCode: 200,
            _headers: {},
            setHeader(key, value) {
              this._headers[key] = value
              res.setHeader(key, value)
            },
            status(code) {
              this.statusCode = code
              return this
            },
            json(data) {
              res.statusCode = this.statusCode
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            },
            end(data) {
              res.statusCode = this.statusCode
              res.end(data)
            },
          }

          await handler(fakeReq, fakeRes)
        } catch (err) {
          console.error(`[vite-api] Error en /api/${endpoint}:`, err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
})
