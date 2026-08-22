import assert from 'assert'
import { calculateHaversineDistance, findNearestAvailableAgent } from '../services/geospatialService.js'
import { calculateShippingCost } from '../services/rateEngine.js'
import { validateStateTransition } from '../services/stateMachine.js'

function runTests() {
  console.log('--------------------------------------------------')
  console.log('🧪 RUNNING LASTMIN LOGISTICS AUTOMATED TESTS (INR)')
  console.log('--------------------------------------------------')

  console.log('[TEST 1] Rate Engine Strategy Pattern (₹)...')
  const rateCard = { base_rate: 50.00, per_kg_rate: 15.00, cod_surcharge_percent: 3.00 }
  
  const calc1 = calculateShippingCost({ length: 50, width: 40, height: 30, actualWeight: 8 }, rateCard, 'COD')
  
  assert.strictEqual(calc1.volumetricWeight, 12, 'Volumetric weight should be 12 kg')
  assert.strictEqual(calc1.billableWeight, 12, 'Billable weight should be 12 kg')
  assert.strictEqual(calc1.basePrice, 50.00, 'Base price should be ₹50.00')
  assert.strictEqual(calc1.weightCharge, 180.00, 'Weight charge should be 12 * ₹15.00 = ₹180.00')
  assert.strictEqual(calc1.finalPrice, 236.90, 'Final price should be ₹236.90')
  console.log('  ✅ Rate Calculation Engine Passed!')

  console.log('[TEST 2] Haversine Geospatial Distance & Auto-Assignment...')
  const agents = [
    { id: 1, current_lat: 13.0827, current_lng: 80.2707, status: 'available', name: 'Far Agent (Chennai)' },
    { id: 2, current_lat: 12.9716, current_lng: 77.5946, status: 'available', name: 'Close Agent (Bengaluru)' },
    { id: 3, current_lat: 12.9784, current_lng: 77.6408, status: 'busy', name: 'Busy Nearby Agent' }
  ]

  const nearest = findNearestAvailableAgent(12.9716, 77.5946, agents)
  assert.ok(nearest, 'Should find an available agent')
  assert.strictEqual(nearest.id, 2, 'Should pick Agent 2 as closest available agent')
  console.log(`  ✅ Haversine Auto-Assignment Passed! Closest agent distance: ${nearest.distance} km`)

  console.log('[TEST 3] Strict State Machine Lifecycle Matrix...')
  
  assert.strictEqual(validateStateTransition('Created', 'Assigned').valid, true)
  assert.strictEqual(validateStateTransition('Assigned', 'Picked Up').valid, true)
  assert.strictEqual(validateStateTransition('Picked Up', 'In Transit').valid, true)
  assert.strictEqual(validateStateTransition('In Transit', 'Out for Delivery').valid, true)
  assert.strictEqual(validateStateTransition('Out for Delivery', 'Delivered').valid, true)
  assert.strictEqual(validateStateTransition('Out for Delivery', 'Failed').valid, true)
  assert.strictEqual(validateStateTransition('Failed', 'Rescheduled').valid, true)

  const invalidJump = validateStateTransition('Created', 'In Transit', 'agent')
  assert.strictEqual(invalidJump.valid, false, 'Created -> In Transit should be rejected')
  assert.ok(invalidJump.error.includes('400 Bad Request'), 'Should return 400 Bad Request')

  const adminOverride = validateStateTransition('Created', 'In Transit', 'admin', true)
  assert.strictEqual(adminOverride.valid, true, 'Admin with override flag should be allowed')

  console.log('  ✅ State Machine Enforcement Passed!')

  console.log('--------------------------------------------------')
  console.log('🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY!')
  console.log('--------------------------------------------------')
}

runTests()
