// Rate Card Controller for Dynamic Price Configuration
import { execute, getOne, query } from '../db/index.js'

export async function getRateCards(req, res) {
  try {
    const cards = await query('SELECT * FROM rate_cards ORDER BY client_type, is_intra_zone DESC')
    return res.json({ rateCards: cards })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch rate cards' })
  }
}

export async function updateRateCard(req, res) {
  try {
    const { id } = req.params
    const { baseRate, perKgRate, codSurchargePercent } = req.body

    const card = await getOne('SELECT * FROM rate_cards WHERE id = ?', [id])
    if (!card) {
      return res.status(404).json({ error: 'Rate card not found' })
    }

    await execute(
      'UPDATE rate_cards SET base_rate = ?, per_kg_rate = ?, cod_surcharge_percent = ? WHERE id = ?',
      [baseRate, perKgRate, codSurchargePercent, id]
    )

    const updated = await getOne('SELECT * FROM rate_cards WHERE id = ?', [id])
    return res.json({ rateCard: updated, message: 'Rate card updated successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update rate card' })
  }
}
