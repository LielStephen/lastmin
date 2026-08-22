import { execute, getOne, query } from '../db/index.js'
import { findNearestAvailableAgent } from '../services/geospatialService.js'
import { sendDeliveryNotification } from '../services/notificationService.js'
import { calculateShippingCost } from '../services/rateEngine.js'
import { validateStateTransition } from '../services/stateMachine.js'

async function getRateCard(clientType, isIntraZone) {
  const card = await getOne(
    'SELECT * FROM rate_cards WHERE client_type = ? AND is_intra_zone = ?',
    [clientType, isIntraZone ? 1 : 0]
  )
  if (card) return card
  
  return {
    base_rate: clientType === 'B2B' ? (isIntraZone ? 40 : 75) : (isIntraZone ? 50 : 90),
    per_kg_rate: clientType === 'B2B' ? (isIntraZone ? 10 : 20) : (isIntraZone ? 15 : 25),
    cod_surcharge_percent: clientType === 'B2B' ? 1.5 : 2.5
  }
}

export async function calculateOrderRate(req, res) {
  try {
    const {
      length, width, height, actualWeight,
      clientType = 'B2C', pickupZoneId, dropZoneId, paymentMethod = 'PREPAID'
    } = req.body

    if (!length || !width || !height || !actualWeight) {
      return res.status(400).json({ error: 'Package dimensions (L, W, H) and actual weight are required' })
    }

    const isIntraZone = pickupZoneId && dropZoneId ? String(pickupZoneId) === String(dropZoneId) : true
    const rateCard = await getRateCard(clientType, isIntraZone)
    
    const calculation = calculateShippingCost(
      { length: Number(length), width: Number(width), height: Number(height), actualWeight: Number(actualWeight) },
      rateCard,
      paymentMethod
    )

    return res.json({
      isIntraZone,
      clientType,
      rateCard,
      calculation
    })
  } catch (err) {
    console.error('Rate calculation error:', err)
    return res.status(500).json({ error: 'Error calculating shipping rate' })
  }
}

export async function createOrder(req, res) {
  try {
    const {
      pickupAddress, pickupLat = 12.9716, pickupLng = 77.5946,
      dropAddress, dropLat = 12.9784, dropLng = 77.6408,
      pickupZoneId = 1, dropZoneId = 1,
      length, width, height, actualWeight,
      clientType = 'B2C', paymentMethod = 'PREPAID',
      scheduledDeliveryTime
    } = req.body

    const customerId = req.user.role === 'admin' && req.body.customerId ? req.body.customerId : req.user.id

    if (!pickupAddress || !dropAddress || !length || !width || !height || !actualWeight) {
      return res.status(400).json({ error: 'All order fields are required' })
    }

    const isIntraZone = String(pickupZoneId) === String(dropZoneId) ? 1 : 0
    const rateCard = await getRateCard(clientType, isIntraZone === 1)
    
    const calc = calculateShippingCost(
      { length: Number(length), width: Number(width), height: Number(height), actualWeight: Number(actualWeight) },
      rateCard,
      paymentMethod
    )

    const trackingNumber = 'TRK-' + Math.floor(100000 + Math.random() * 900000)

    const result = await execute(
      `INSERT INTO orders (
        tracking_number, customer_id, status, pickup_address, pickup_lat, pickup_lng,
        drop_address, drop_lat, drop_lng, pickup_zone_id, drop_zone_id, is_intra_zone, client_type,
        actual_weight, length, width, height, volumetric_weight, billable_weight, base_price, weight_charge,
        cod_surcharge, final_price, payment_method, scheduled_delivery_time
      ) VALUES (?, ?, 'Created', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingNumber, customerId, pickupAddress, pickupLat, pickupLng,
        dropAddress, dropLat, dropLng, pickupZoneId, dropZoneId, isIntraZone, clientType,
        actualWeight, length, width, height, calc.volumetricWeight, calc.billableWeight,
        calc.basePrice, calc.weightCharge, calc.codSurcharge, calc.finalPrice, paymentMethod,
        scheduledDeliveryTime || null
      ]
    )

    const orderId = result.id

    await execute(
      'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes) VALUES (?, null, ?, ?, ?)',
      [orderId, 'Created', req.user.id, 'Order created and registered in ledger']
    )

    const createdOrder = await getOne('SELECT * FROM orders WHERE id = ?', [orderId])
    
    const customer = await getOne('SELECT * FROM users WHERE id = ?', [customerId])
    sendDeliveryNotification({ order: createdOrder, toStatus: 'Created', user: customer })

    return res.status(201).json({ order: createdOrder })
  } catch (err) {
    console.error('Order creation error:', err)
    return res.status(500).json({ error: 'Failed to create order' })
  }
}

export async function getOrders(req, res) {
  try {
    const { role, id: userId } = req.user
    const { status, zoneId, agentId } = req.query

    let sql = `
      SELECT o.*, 
             c.name as customer_name, c.email as customer_email,
             au.name as agent_name, au.phone as agent_phone,
             a.current_lat as agent_lat, a.current_lng as agent_lng
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN agents a ON o.agent_id = a.id
      LEFT JOIN users au ON a.user_id = au.id
      WHERE 1=1
    `
    const params = []

    if (role === 'customer') {
      sql += ' AND o.customer_id = ?'
      params.push(userId)
    } else if (role === 'agent') {
      const agent = await getOne('SELECT id FROM agents WHERE user_id = ?', [userId])
      if (!agent) {
        return res.json({ orders: [] })
      }
      sql += ' AND o.agent_id = ?'
      params.push(agent.id)
    }

    if (status) {
      sql += ' AND o.status = ?'
      params.push(status)
    }

    if (zoneId) {
      sql += ' AND (o.pickup_zone_id = ? OR o.drop_zone_id = ?)'
      params.push(zoneId, zoneId)
    }

    if (agentId) {
      sql += ' AND o.agent_id = ?'
      params.push(agentId)
    }

    sql += ' ORDER BY o.created_at DESC'

    const orders = await query(sql, params)
    return res.json({ orders })
  } catch (err) {
    console.error('Fetch orders error:', err)
    return res.status(500).json({ error: 'Error fetching orders' })
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params
    const order = await getOne(
      `SELECT o.*, 
              c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              au.name as agent_name, au.phone as agent_phone,
              a.current_lat as agent_lat, a.current_lng as agent_lng
       FROM orders o
       LEFT JOIN users c ON o.customer_id = c.id
       LEFT JOIN agents a ON o.agent_id = a.id
       LEFT JOIN users au ON a.user_id = au.id
       WHERE o.id = ? OR o.tracking_number = ?`,
      [id, id]
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const logs = await query(
      `SELECT l.*, u.name as actor_name, u.role as actor_role
       FROM order_status_logs l
       LEFT JOIN users u ON l.changed_by = u.id
       WHERE l.order_id = ?
       ORDER BY l.timestamp ASC`,
      [order.id]
    )

    return res.json({ order, logs })
  } catch (err) {
    console.error('Fetch order detail error:', err)
    return res.status(500).json({ error: 'Error fetching order details' })
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params
    const { status: targetStatus, failureReason, notes, isOverride = false } = req.body

    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id])
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const check = validateStateTransition(order.status, targetStatus, req.user.role, isOverride)
    if (!check.valid) {
      return res.status(check.statusCode || 400).json({ error: check.error })
    }

    const currentStatus = order.status
    let updateSql = 'UPDATE orders SET status = ?, updated_at = datetime("now")'
    const updateParams = [targetStatus]

    if (targetStatus === 'Failed' && failureReason) {
      updateSql += ', failure_reason = ?'
      updateParams.push(failureReason)
    }

    updateSql += ' WHERE id = ?'
    updateParams.push(order.id)

    await execute(updateSql, updateParams)

    await execute(
      'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
      [order.id, currentStatus, targetStatus, req.user.id, notes || failureReason || `Status transition by ${req.user.role}`]
    )

    const updatedOrder = await getOne('SELECT * FROM orders WHERE id = ?', [order.id])
    const customer = await getOne('SELECT * FROM users WHERE id = ?', [updatedOrder.customer_id])

    sendDeliveryNotification({
      order: updatedOrder,
      toStatus: targetStatus,
      user: customer,
      notes: notes || failureReason
    })

    return res.json({ order: updatedOrder, message: `Status updated to ${targetStatus}` })
  } catch (err) {
    console.error('Update status error:', err)
    return res.status(500).json({ error: 'Failed to update order status' })
  }
}

export async function rescheduleOrder(req, res) {
  try {
    const { id } = req.params
    const { rescheduledDate, notes } = req.body

    if (!rescheduledDate) {
      return res.status(400).json({ error: 'Rescheduled date is required' })
    }

    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id])
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status !== 'Failed') {
      return res.status(400).json({ error: 'Only failed orders can be rescheduled' })
    }

    await execute(
      'UPDATE orders SET status = "Rescheduled", rescheduled_date = ?, updated_at = datetime("now") WHERE id = ?',
      [rescheduledDate, order.id]
    )

    await execute(
      'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes) VALUES (?, "Failed", "Rescheduled", ?, ?)',
      [order.id, req.user.id, `Rescheduled by customer for ${rescheduledDate}. Notes: ${notes || 'None'}`]
    )

    const agents = await query(
      `SELECT a.*, u.name as agent_name 
       FROM agents a 
       JOIN users u ON a.user_id = u.id`
    )
    const nearestAgent = findNearestAvailableAgent(order.pickup_lat, order.pickup_lng, agents)

    if (nearestAgent) {
      await execute(
        'UPDATE orders SET agent_id = ?, status = "Assigned", updated_at = datetime("now") WHERE id = ?',
        [nearestAgent.id, order.id]
      )
      await execute(
        'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes) VALUES (?, "Rescheduled", "Assigned", ?, ?)',
        [order.id, req.user.id, `Automatically reassigned to nearest agent ${nearestAgent.agent_name} (${nearestAgent.distance} km away)`]
      )
    }

    const finalOrder = await getOne('SELECT * FROM orders WHERE id = ?', [order.id])
    const customer = await getOne('SELECT * FROM users WHERE id = ?', [finalOrder.customer_id])

    sendDeliveryNotification({
      order: finalOrder,
      toStatus: 'Rescheduled',
      user: customer,
      notes: `Rescheduled for ${rescheduledDate}`
    })

    return res.json({ order: finalOrder, message: 'Delivery successfully rescheduled and reassigned.' })
  } catch (err) {
    console.error('Reschedule error:', err)
    return res.status(500).json({ error: 'Error rescheduling order' })
  }
}

export async function assignAgent(req, res) {
  try {
    const { id } = req.params
    const { agentId, autoAssign = false } = req.body

    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id])
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    let selectedAgentId = agentId

    if (autoAssign || !agentId) {
      const agents = await query(
        `SELECT a.*, u.name as agent_name 
         FROM agents a 
         JOIN users u ON a.user_id = u.id`
      )
      const nearest = findNearestAvailableAgent(order.pickup_lat, order.pickup_lng, agents)
      if (!nearest) {
        return res.status(404).json({ error: 'No available delivery agents found for dispatch' })
      }
      selectedAgentId = nearest.id
    }

    const currentStatus = order.status
    await execute(
      'UPDATE orders SET agent_id = ?, status = "Assigned", updated_at = datetime("now") WHERE id = ?',
      [selectedAgentId, order.id]
    )

    await execute(
      'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes) VALUES (?, ?, "Assigned", ?, ?)',
      [order.id, currentStatus, req.user.id, `Agent ${selectedAgentId} assigned via ${autoAssign ? 'Haversine Auto-Assignment' : 'Manual Dispatch'}`]
    )

    const updatedOrder = await getOne('SELECT * FROM orders WHERE id = ?', [order.id])
    return res.json({ order: updatedOrder, message: 'Agent assigned successfully' })
  } catch (err) {
    console.error('Agent assignment error:', err)
    return res.status(500).json({ error: 'Error assigning agent' })
  }
}
