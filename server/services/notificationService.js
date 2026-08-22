const notificationLogs = []

export function sendDeliveryNotification({ order, toStatus, user, notes }) {
  const timestamp = new Date().toISOString()
  const trackingNo = order.tracking_number || order.id
  
  let subject = ''
  let message = ''
  
  switch (toStatus) {
    case 'Assigned':
      subject = `Order ${trackingNo} - Delivery Agent Assigned`
      message = `Your order ${trackingNo} has been assigned to a delivery agent and is scheduled for pickup.`
      break
    case 'Picked Up':
      subject = `Order ${trackingNo} - Picked Up`
      message = `Great news! Your package ${trackingNo} has been picked up by our courier agent.`
      break
    case 'In Transit':
      subject = `Order ${trackingNo} - In Transit`
      message = `Package ${trackingNo} is currently in transit to your local distribution zone.`
      break
    case 'Out for Delivery':
      subject = `Order ${trackingNo} - Out for Delivery`
      message = `Heads up! Order ${trackingNo} is out for delivery and will arrive today.`
      break
    case 'Delivered':
      subject = `Order ${trackingNo} - Successfully Delivered`
      message = `Package ${trackingNo} was delivered successfully. Thank you for choosing LastMin Logistics!`
      break
    case 'Failed':
      subject = `ALERT: Delivery Attempt Failed for Order ${trackingNo}`
      message = `We attempted delivery for order ${trackingNo} but were unsuccessful (${notes || 'Customer unavailable'}). Please log into your portal to reschedule.`
      break
    case 'Rescheduled':
      subject = `Order ${trackingNo} - Delivery Rescheduled`
      message = `Your delivery for order ${trackingNo} has been successfully rescheduled for ${notes || 'a new date'}.`
      break
    default:
      subject = `Order ${trackingNo} Status Update`
      message = `Status updated to ${toStatus}.`
  }

  const emailRecord = {
    id: 'EML-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    channel: 'EMAIL',
    recipientEmail: user?.email || 'customer@example.com',
    recipientName: user?.name || 'Valued Customer',
    subject,
    body: message,
    status: 'SENT',
    timestamp
  }

  const smsRecord = {
    id: 'SMS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    channel: 'SMS',
    recipientPhone: user?.phone || '+15550192834',
    body: `[LastMin Logi] ${message}`,
    status: 'DELIVERED',
    timestamp
  }

  notificationLogs.unshift(emailRecord, smsRecord)

  console.log(`[NOTIFICATION DISPATCH] ${emailRecord.channel} to ${emailRecord.recipientEmail}: ${emailRecord.subject}`)
  console.log(`[NOTIFICATION DISPATCH] ${smsRecord.channel} to ${smsRecord.recipientPhone}: ${smsRecord.body}`)

  return { emailRecord, smsRecord }
}

export function getNotificationLogs() {
  return notificationLogs
}
