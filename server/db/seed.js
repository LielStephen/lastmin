import bcrypt from 'bcryptjs'
import { execute, getOne, initDbSchema } from './index.js'

export async function seedDatabase() {
  await initDbSchema()

  const existingUser = await getOne('SELECT id FROM users LIMIT 1')
  if (existingUser) {
    console.log('[SEED] Database already populated.')
    return
  }

  console.log('[SEED] Seeding database with Indian demo data...')
  const passwordHash = await bcrypt.hash('password123', 10)

  const adminRes = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['System Administrator', 'admin@lastmin.com', passwordHash, 'admin', '+919876543210']
  )

  const cust1Res = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Rajesh Kumar (B2C)', 'customer@lastmin.com', passwordHash, 'customer', '+919811223344']
  )

  const cust2Res = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['TechCorp India (B2B)', 'b2b@company.com', passwordHash, 'customer', '+919855667788']
  )

  const agent1User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Vikram Singh (Agent 1)', 'agent1@lastmin.com', passwordHash, 'agent', '+919899001122']
  )

  const agent2User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Ananya Rao (Agent 2)', 'agent2@lastmin.com', passwordHash, 'agent', '+919833445566']
  )

  const agent3User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Suresh Sharma (Agent 3)', 'agent3@lastmin.com', passwordHash, 'agent', '+919877889900']
  )

  const z1 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['Bengaluru Central', 'BLR', 'Central business and tech hub']
  )
  const z2 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['Mumbai Suburbs', 'BOM', 'Western commercial area']
  )
  const z3 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['Delhi NCR', 'DEL', 'Capital logistics region']
  )

  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z1.id, '560001', 'MG Road', 'Bengaluru', 'Karnataka']
  )
  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z2.id, '400050', 'Bandra West', 'Mumbai', 'Maharashtra']
  )
  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z3.id, '110001', 'Connaught Place', 'New Delhi', 'Delhi']
  )

  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2C', 1, 50.00, 15.00, 2.50]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2C', 0, 90.00, 25.00, 2.50]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2B', 1, 40.00, 10.00, 1.50]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2B', 0, 75.00, 20.00, 1.50]
  )

  const ag1 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent1User.id, z1.id, 12.9716, 77.5946, 'available']
  )
  const ag2 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent2User.id, z2.id, 19.0760, 72.8777, 'available']
  )
  const ag3 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent3User.id, z3.id, 28.6139, 77.2090, 'busy']
  )

  const ord1 = await execute(
    `INSERT INTO orders (
      tracking_number, customer_id, agent_id, status, pickup_address, pickup_lat, pickup_lng,
      drop_address, drop_lat, drop_lng, pickup_zone_id, drop_zone_id, is_intra_zone, client_type,
      actual_weight, length, width, height, volumetric_weight, billable_weight, base_price, weight_charge,
      cod_surcharge, final_price, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))`,
    [
      'TRK-982341', cust1Res.id, ag1.id, 'In Transit',
      '100 MG Road, Bengaluru, KA', 12.9716, 77.5946,
      '45 Indiranagar, Bengaluru, KA', 12.9784, 77.6408,
      z1.id, z1.id, 1, 'B2C',
      3.5, 30, 20, 15, 1.8, 3.5, 50.00, 52.50, 2.56, 105.06, 'COD'
    ]
  )

  const ord2 = await execute(
    `INSERT INTO orders (
      tracking_number, customer_id, agent_id, status, pickup_address, pickup_lat, pickup_lng,
      drop_address, drop_lat, drop_lng, pickup_zone_id, drop_zone_id, is_intra_zone, client_type,
      actual_weight, length, width, height, volumetric_weight, billable_weight, base_price, weight_charge,
      cod_surcharge, final_price, payment_method, failure_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 days'))`,
    [
      'TRK-741290', cust1Res.id, ag2.id, 'Failed',
      '12 Linking Road, Mumbai, MH', 19.0600, 72.8300,
      '88 Powai Lake Rd, Mumbai, MH', 19.1170, 72.9050,
      z2.id, z2.id, 1, 'B2C',
      5.0, 50, 40, 30, 12.0, 12.0, 50.00, 180.00, 0.00, 230.00, 'PREPAID', 'Customer phone unreachable'
    ]
  )

  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, null, ?, ?, ?, datetime(\'now\', \'-2 days\'))',
    [ord1.id, 'Created', cust1Res.id, 'Order created via customer portal']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-1 days\'))',
    [ord1.id, 'Created', 'Assigned', adminRes.id, 'Assigned to nearest courier']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-18 hours\'))',
    [ord1.id, 'Assigned', 'Picked Up', agent1User.id, 'Package picked up']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-6 hours\'))',
    [ord1.id, 'Picked Up', 'In Transit', agent1User.id, 'Package in transit']
  )

  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, null, ?, ?, ?, datetime(\'now\', \'-1 days\'))',
    [ord2.id, 'Created', cust1Res.id, 'Order created']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-20 hours\'))',
    [ord2.id, 'Created', 'Assigned', adminRes.id, 'Agent assigned']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-12 hours\'))',
    [ord2.id, 'Assigned', 'Picked Up', agent2User.id, 'Picked up from sender']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-8 hours\'))',
    [ord2.id, 'Picked Up', 'In Transit', agent2User.id, 'En route']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-4 hours\'))',
    [ord2.id, 'In Transit', 'Out for Delivery', agent2User.id, 'Out for delivery']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-1 hour\'))',
    [ord2.id, 'Out for Delivery', 'Failed', agent2User.id, 'Customer phone unreachable']
  )

  console.log('[SEED] Database seed completed with Indian delivery data.')
}

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(console.error)
}
