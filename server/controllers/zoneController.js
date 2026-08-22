// Zone Controller for managing zones and coverage areas
import { execute, query } from '../db/index.js'

export async function getZones(req, res) {
  try {
    const zones = await query('SELECT * FROM zones ORDER BY name ASC')
    const areas = await query('SELECT * FROM zone_areas')

    const zonesWithAreas = zones.map(zone => ({
      ...zone,
      areas: areas.filter(a => a.zone_id === zone.id)
    }))

    return res.json({ zones: zonesWithAreas })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch zones' })
  }
}

export async function createZone(req, res) {
  try {
    const { name, code, description } = req.body
    if (!name || !code) {
      return res.status(400).json({ error: 'Zone name and code are required' })
    }

    const result = await execute(
      'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
      [name, code, description || '']
    )

    return res.status(201).json({ zone: { id: result.id, name, code, description } })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create zone' })
  }
}
