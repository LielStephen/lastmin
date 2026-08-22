// JWT Authentication and Role-Based Access Control Middleware
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'lastmin-secret-key-2026'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: '401 Unauthorized: Missing access token' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '403 Forbidden: Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `403 Forbidden: Access denied. Required role: [${roles.join(', ')}], Current role: '${req.user?.role}'`
      })
    }
    next()
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}
