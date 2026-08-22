export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

export function findNearestAvailableAgent(pickupLat, pickupLng, agents) {
  const availableAgents = agents.filter(agent => agent.status === 'available')
  
  if (availableAgents.length === 0) {
    return null
  }
  
  const agentsWithDistance = availableAgents.map(agent => {
    const dist = calculateHaversineDistance(
      Number(pickupLat),
      Number(pickupLng),
      Number(agent.current_lat),
      Number(agent.current_lng)
    )
    return { ...agent, distance: dist }
  })
  
  agentsWithDistance.sort((a, b) => a.distance - b.distance)
  return agentsWithDistance[0]
}
