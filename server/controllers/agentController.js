// Agent Controller for managing agent status and real-time GPS coordinates
import { execute, getOne, query } from '../db/index.js'

export async function getAgents(req, res) {
  try {
    const agents = await query(
      `SELECT a.*, u.name, u.email, u.phone, z.name as zone_name, z.code as zone_code
       FROM agents a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN zones z ON a.zone_id = z.id
       ORDER BY a.id ASC`
    )
    return res.json({ agents })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch agents' })
  }
}

export async function updateAgentLocation(req, res) {
  try {
    const { lat, lng, status } = req.body
    const userId = req.user.id

    const agent = await getOne('SELECT id FROM agents WHERE user_id = ?', [userId])
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' })
    }

    let sql = 'UPDATE agents SET updated_at = datetime("now")'
    const params = []

    if (lat !== undefined && lng !== undefined) {
      sql += ', current_lat = ?, current_lng = ?'
      params.push(lat, lng)
    }

    if (status) {
      sql += ', status = ?'
      params.push(status)
    }

    sql += ' WHERE id = ?'
    params.push(agent.id)

    await execute(sql, params)
    const updated = await getOne('SELECT * FROM agents WHERE id = ?', [agent.id])

    return res.json({ agent: updated, message: 'Agent location and status updated' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update agent position' })
  }
}
