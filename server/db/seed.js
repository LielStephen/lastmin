import bcrypt from 'bcryptjs'
import { execute, getOne, initDbSchema, query } from './index.js'

export async function seedDatabase() {
  await initDbSchema()

  const existingUser = await getOne('SELECT id FROM users LIMIT 1')
  if (existingUser) {
    console.log('[SEED] Database already populated.')
    return
  }

  console.log('[SEED] Seeding database with demo data...')
  const passwordHash = await bcrypt.hash('password123', 10)

  const adminRes = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['System Administrator', 'admin@lastmin.com', passwordHash, 'admin', '+15550001111']
  )

  const cust1Res = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Alice Johnson (B2C)', 'customer@lastmin.com', passwordHash, 'customer', '+15552223333']
  )

  const cust2Res = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Acme Corp (B2B)', 'b2b@company.com', passwordHash, 'customer', '+15554445555']
  )

  const agent1User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['David Courier (Agent 1)', 'agent1@lastmin.com', passwordHash, 'agent', '+15556667777']
  )

  const agent2User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Sarah Rider (Agent 2)', 'agent2@lastmin.com', passwordHash, 'agent', '+15558889999']
  )

  const agent3User = await execute(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Michael Express (Agent 3)', 'agent3@lastmin.com', passwordHash, 'agent', '+15550009999']
  )

  const z1 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['Downtown Central', 'DT', 'Metropolitan central business district']
  )
  const z2 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['North Suburbs', 'NS', 'Northern residential and commercial area']
  )
  const z3 = await execute(
    'INSERT INTO zones (name, code, description) VALUES (?, ?, ?)',
    ['West Industrial', 'WI', 'Western logistics and warehousing hub']
  )

  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z1.id, '10001', 'Manhattan Downtown', 'New York', 'NY']
  )
  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z2.id, '10024', 'Upper West Side', 'New York', 'NY']
  )
  await execute(
    'INSERT INTO zone_areas (zone_id, postal_code, area_name, city, state) VALUES (?, ?, ?, ?, ?)',
    [z3.id, '07102', 'Newark Hub', 'Newark', 'NJ']
  )

  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2C', 1, 10.00, 2.50, 3.00]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2C', 0, 18.00, 4.00, 3.00]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2B', 1, 8.00, 1.80, 2.00]
  )
  await execute(
    'INSERT INTO rate_cards (client_type, is_intra_zone, base_rate, per_kg_rate, cod_surcharge_percent) VALUES (?, ?, ?, ?, ?)',
    ['B2B', 0, 15.00, 3.20, 2.00]
  )

  const ag1 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent1User.id, z1.id, 40.7128, -74.0060, 'available']
  )
  const ag2 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent2User.id, z2.id, 40.8500, -73.9500, 'available']
  )
  const ag3 = await execute(
    'INSERT INTO agents (user_id, zone_id, current_lat, current_lng, status) VALUES (?, ?, ?, ?, ?)',
    [agent3User.id, z3.id, 40.7300, -74.1500, 'busy']
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
      '123 Wall St, New York, NY', 40.7074, -74.0113,
      '456 Broadway, New York, NY', 40.7191, -74.0002,
      z1.id, z1.id, 1, 'B2C',
      3.5, 30, 20, 15, 1.8, 3.5, 10.00, 8.75, 0.56, 19.31, 'COD'
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
      '789 Fifth Ave, New York, NY', 40.7645, -73.9731,
      '101 125th St, New York, NY', 40.8080, -73.9450,
      z1.id, z2.id, 0, 'B2C',
      5.0, 50, 40, 30, 12.0, 12.0, 18.00, 48.00, 0.00, 66.00, 'PREPAID', 'Customer address unreachable (security gate locked)'
    ]
  )

  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, null, ?, ?, ?, datetime(\'now\', \'-2 days\'))',
    [ord1.id, 'Created', cust1Res.id, 'Order created via customer portal']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-1 days\'))',
    [ord1.id, 'Created', 'Assigned', adminRes.id, 'Assigned via Haversine auto-assignment algorithm']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-18 hours\'))',
    [ord1.id, 'Assigned', 'Picked Up', agent1User.id, 'Package scanned and picked up']
  )
  await execute(
    'INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, notes, timestamp) VALUES (?, ?, ?, ?, ?, datetime(\'now\', \'-6 hours\'))',
    [ord1.id, 'Picked Up', 'In Transit', agent1User.id, 'Package dispatched to transit center']
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
    [ord2.id, 'Assigned', 'Picked Up', agent2User.id, 'Picked up from merchant']
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
    [ord2.id, 'Out for Delivery', 'Failed', agent2User.id, 'Customer address unreachable (security gate locked)']
  )

  console.log('[SEED] Database seed completed successfully.')
}

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(console.error)
}
