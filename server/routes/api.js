// API Routes Definition for Anti-Gravity Delivery Tracker
import { Router } from 'express'
import { getAgents, updateAgentLocation } from '../controllers/agentController.js'
import { getCurrentUser, login, register } from '../controllers/authController.js'
import {
  assignAgent,
  calculateOrderRate,
  createOrder,
  getOrderById,
  getOrders,
  rescheduleOrder,
  updateOrderStatus
} from '../controllers/orderController.js'
import { getRateCards, updateRateCard } from '../controllers/rateCardController.js'
import { createZone, getZones } from '../controllers/zoneController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { getNotificationLogs } from '../services/notificationService.js'

const router = Router()

// Public Auth Endpoints
router.post('/auth/login', login)
router.post('/auth/register', register)

// Protected Endpoints
router.use(authenticateToken)

// User Profile
router.get('/auth/me', getCurrentUser)

// Notification Stream Logs
router.get('/notifications', (req, res) => {
  return res.json({ logs: getNotificationLogs() })
})

// Orders Engine
router.post('/orders/calculate-rate', calculateOrderRate)
router.post('/orders', createOrder)
router.get('/orders', getOrders)
router.get('/orders/:id', getOrderById)
router.patch('/orders/:id/status', updateOrderStatus)
router.post('/orders/:id/reschedule', rescheduleOrder)
router.post('/orders/:id/assign', requireRole('admin'), assignAgent)

// Rate Cards Admin
router.get('/rate-cards', getRateCards)
router.put('/rate-cards/:id', requireRole('admin'), updateRateCard)

// Agents
router.get('/agents', getAgents)
router.patch('/agents/location', requireRole('agent'), updateAgentLocation)

// Zones
router.get('/zones', getZones)
router.post('/zones', requireRole('admin'), createZone)

export default router
