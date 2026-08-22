// Auth Controller for Login, Registration, and Session check
import bcrypt from 'bcryptjs'
import { execute, getOne } from '../db/index.js'
import { generateToken } from '../middleware/auth.js'

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error during login' })
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'customer', phone } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const existing = await getOne('SELECT id FROM users WHERE email = ?', [email])
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await execute(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || null]
    )

    // If role is agent, also create an agents table entry
    if (role === 'agent') {
      await execute(
        'INSERT INTO agents (user_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?)',
        [result.id, 40.7128, -74.0060, 'available']
      )
    }

    const newUser = { id: result.id, name, email, role, phone }
    const token = generateToken(newUser)
    return res.status(201).json({ token, user: newUser })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ error: 'Internal server error during registration' })
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await getOne(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json({ user })
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching profile' })
  }
}
