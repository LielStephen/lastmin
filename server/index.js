// Express Server Entry Point for LastMin Delivery Tracker
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { seedDatabase } from './db/seed.js'
import apiRoutes from './routes/api.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Mount API Routes
app.use('/api', apiRoutes)

// Serve Frontend in Production Build
const clientDist = path.join(__dirname, '../dist')
app.use(express.static(clientDist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next()
  })
})

// Initialize Database & Start Server
seedDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`)
      console.log(`🚀 LastMin Logistics API running on port ${PORT}`)
      console.log(`   Health Check: http://localhost:${PORT}/api/zones`)
      console.log(`=================================================`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err)
  })
