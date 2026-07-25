import express  from 'express'
import cors     from 'cors'
import dotenv   from 'dotenv'
import path     from 'path'
import fs       from 'fs'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app  = express()
const PORT = process.env.PORT || 3000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes)

// ─── Serve Built Frontend (Production / Full-Stack mode) ─────────────────────
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA Client-Side Routing Fallback: serve index.html for any non-API route
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ─── 404 Fallback for API / Unmatched Routes ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎓 Mentora AI server running at http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  if (fs.existsSync(distPath)) {
    console.log(`   Frontend UI available at http://localhost:${PORT}\n`)
  } else {
    console.log(`   Vite Dev Server can be run with: npm run dev\n`)
  }
})
