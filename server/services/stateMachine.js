export const ALLOWED_TRANSITIONS = {
  Created: ['Assigned'],
  Assigned: ['Picked Up'],
  'Picked Up': ['In Transit'],
  'In Transit': ['Out for Delivery'],
  'Out for Delivery': ['Delivered', 'Failed'],
  Failed: ['Rescheduled'],
  Rescheduled: ['Assigned', 'Picked Up', 'Out for Delivery']
}

export function validateStateTransition(currentStatus, targetStatus, role = 'agent', isOverride = false) {
  if (role === 'admin' && isOverride) {
    return { valid: true, isOverride: true }
  }

  if (currentStatus === targetStatus) {
    return { valid: true, isNoOp: true }
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || []
  if (!allowedNext.includes(targetStatus)) {
    return {
      valid: false,
      statusCode: 400,
      error: `400 Bad Request: Invalid State Transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${allowedNext.join(', ')}]`
    }
  }

  return { valid: true }
}
